import { useState, useEffect, useCallback } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../components/firebase';

const STORAGE_KEY = 'htlvn_completed_lessons_v1';

function readLocalCompleted() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeLocalCompleted(ids) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch {
    // Ignore storage quota errors
  }
}

/**
 * Tracks completed lessons across E-learning courses with localStorage + Firestore sync.
 */
export function useLearningProgress() {
  const [completedIds, setCompletedIds] = useState(readLocalCompleted);
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
        const cloudIds = snap.exists() && Array.isArray(snap.data().completedLessons)
          ? snap.data().completedLessons
          : [];
        const localIds = readLocalCompleted();
        const merged = Array.from(new Set([...localIds, ...cloudIds]));
        setCompletedIds(merged);
        writeLocalCompleted(merged);
        if (merged.length !== cloudIds.length) {
          await setDoc(userRef, { completedLessons: merged }, { merge: true });
        }
      } catch (err) {
        console.error('Failed to sync learning progress:', err);
      }
    });
    return () => unsubscribe();
  }, []);

  const toggleLesson = useCallback(
    (lessonId) => {
      let nowDone = false;
      setCompletedIds((prev) => {
        const exists = prev.includes(lessonId);
        nowDone = !exists;
        const next = exists ? prev.filter((id) => id !== lessonId) : [...prev, lessonId];
        writeLocalCompleted(next);
        if (uid) {
          setDoc(doc(db, 'users', uid), { completedLessons: next }, { merge: true }).catch((err) =>
            console.error('Failed to update completed lessons:', err),
          );
        }
        return next;
      });
      return nowDone;
    },
    [uid],
  );

  const isCompleted = useCallback((lessonId) => completedIds.includes(lessonId), [completedIds]);

  const getCourseProgress = useCallback(
    (course) => {
      const lessons = (course?.chapters || []).flatMap((ch) => ch.lessons || []);
      const total = lessons.length;
      const done = lessons.filter((l) => completedIds.includes(l.id)).length;
      return {
        total,
        done,
        percent: total > 0 ? Math.round((done / total) * 100) : 0,
      };
    },
    [completedIds],
  );

  return {
    completedIds,
    toggleLesson,
    isCompleted,
    getCourseProgress,
  };
}

export default useLearningProgress;
