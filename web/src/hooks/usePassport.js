import { useState, useEffect, useCallback, useMemo } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../components/firebase';
import { PROVINCES, PROVINCE_BY_SLUG, SLUG_MIGRATION_MAP } from '../data/provinces';

const STORAGE_KEY = 'htlvn_passport_v1';

function normalizeSlugs(slugs) {
  if (!Array.isArray(slugs)) return [];
  const mapped = [];
  const seen = new Set();
  for (const raw of slugs) {
    const canonical = PROVINCE_BY_SLUG[raw] ? raw : SLUG_MIGRATION_MAP[raw];
    if (canonical && PROVINCE_BY_SLUG[canonical] && !seen.has(canonical)) {
      seen.add(canonical);
      mapped.push(canonical);
    }
  }
  return mapped;
}

function readLocalPassport() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { discoveredSlugs: [], masteredCardIds: [] };
    const parsed = JSON.parse(raw);
    return {
      discoveredSlugs: normalizeSlugs(parsed.discoveredSlugs),
      masteredCardIds: Array.isArray(parsed.masteredCardIds) ? parsed.masteredCardIds : [],
    };
  } catch {
    return { discoveredSlugs: [], masteredCardIds: [] };
  }
}

function writeLocalPassport(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Ignore storage quota errors
  }
}

/**
 * Manages the user's Heritage Passport (34 discovered provinces/cities + mastered flashcards).
 * Automatically migrates any legacy 63-province slugs to the canonical 34-unit dataset.
 */
export function usePassport() {
  const [passport, setPassport] = useState(readLocalPassport);
  const [uid, setUid] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        setUid(null);
        return;
      }
      setUid(user.uid);
      try {
        const userRef = doc(db, 'users', user.uid);
        const snap = await getDoc(userRef);
        const cloudData = snap.exists() ? snap.data() : {};
        const rawCloudProvinces = Array.isArray(cloudData.discoveredProvinces) ? cloudData.discoveredProvinces : [];
        const cloudProvinces = normalizeSlugs(rawCloudProvinces);
        const cloudCards = Array.isArray(cloudData.masteredCards) ? cloudData.masteredCards : [];

        const local = readLocalPassport();
        const mergedProvinces = normalizeSlugs([...local.discoveredSlugs, ...cloudProvinces]);
        const mergedCards = Array.from(new Set([...local.masteredCardIds, ...cloudCards]));

        const merged = { discoveredSlugs: mergedProvinces, masteredCardIds: mergedCards };
        setPassport(merged);
        writeLocalPassport(merged);

        const cloudNeedsMigration =
          rawCloudProvinces.length !== mergedProvinces.length ||
          rawCloudProvinces.some((s, idx) => mergedProvinces[idx] !== s);

        if (cloudNeedsMigration || mergedCards.length !== cloudCards.length) {
          await setDoc(
            userRef,
            {
              discoveredProvinces: mergedProvinces,
              masteredCards: mergedCards,
            },
            { merge: true },
          );
        }
      } catch (err) {
        console.error('Failed to sync Heritage Passport with Firestore:', err);
      }
    });
    return () => unsubscribe();
  }, []);

  const persist = useCallback(
    (updater) => {
      setPassport((prev) => {
        const next = typeof updater === 'function' ? updater(prev) : updater;
        const normalizedNext = {
          ...next,
          discoveredSlugs: normalizeSlugs(next.discoveredSlugs),
        };
        writeLocalPassport(normalizedNext);
        if (uid) {
          setDoc(
            doc(db, 'users', uid),
            {
              discoveredProvinces: normalizedNext.discoveredSlugs,
              masteredCards: normalizedNext.masteredCardIds,
            },
            { merge: true },
          ).catch((err) => console.error('Failed to update passport in Firestore:', err));
        }
        return normalizedNext;
      });
    },
    [uid],
  );

  const discoveredSet = useMemo(() => new Set(passport.discoveredSlugs), [passport.discoveredSlugs]);
  const masteredSet = useMemo(() => new Set(passport.masteredCardIds), [passport.masteredCardIds]);

  const isDiscovered = useCallback((slug) => discoveredSet.has(slug), [discoveredSet]);
  const isCardMastered = useCallback((cardId) => masteredSet.has(cardId), [masteredSet]);

  const toggleDiscovered = useCallback(
    (slug) => {
      const canonical = PROVINCE_BY_SLUG[slug] ? slug : SLUG_MIGRATION_MAP[slug] || slug;
      let nowDiscovered = false;
      persist((prev) => {
        const exists = prev.discoveredSlugs.includes(canonical);
        nowDiscovered = !exists;
        const discoveredSlugs = exists
          ? prev.discoveredSlugs.filter((s) => s !== canonical)
          : [...prev.discoveredSlugs, canonical];
        return { ...prev, discoveredSlugs };
      });
      return nowDiscovered;
    },
    [persist],
  );

  const markDiscovered = useCallback(
    (slug) => {
      const canonical = PROVINCE_BY_SLUG[slug] ? slug : SLUG_MIGRATION_MAP[slug] || slug;
      persist((prev) => {
        if (prev.discoveredSlugs.includes(canonical)) return prev;
        return { ...prev, discoveredSlugs: [...prev.discoveredSlugs, canonical] };
      });
    },
    [persist],
  );

  const setCardMastered = useCallback(
    (cardId, mastered) => {
      persist((prev) => {
        const exists = prev.masteredCardIds.includes(cardId);
        if (mastered && !exists) {
          return { ...prev, masteredCardIds: [...prev.masteredCardIds, cardId] };
        }
        if (!mastered && exists) {
          return { ...prev, masteredCardIds: prev.masteredCardIds.filter((id) => id !== cardId) };
        }
        return prev;
      });
    },
    [persist],
  );

  const stats = useMemo(() => {
    const byRegion = { bac: 0, trung: 0, nam: 0 };
    for (const p of PROVINCES) {
      if (discoveredSet.has(p.slug)) {
        byRegion[p.region] += 1;
      }
    }
    const count = passport.discoveredSlugs.length;
    const total = PROVINCES.length;
    return {
      total,
      count,
      percent: total > 0 ? Math.round((count / total) * 100) : 0,
      byRegion,
      masteredCardsCount: passport.masteredCardIds.length,
    };
  }, [discoveredSet, passport.discoveredSlugs.length, passport.masteredCardIds.length]);

  return {
    discoveredSlugs: passport.discoveredSlugs,
    discoveredSet,
    masteredCardIds: passport.masteredCardIds,
    masteredSet,
    isDiscovered,
    toggleDiscovered,
    markDiscovered,
    isCardMastered,
    setCardMastered,
    stats,
  };
}

export default usePassport;
