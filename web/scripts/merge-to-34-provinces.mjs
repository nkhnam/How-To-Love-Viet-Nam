import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const WEB_DIR = path.resolve(__dirname, '..');
const PROVINCES_FILE = path.join(WEB_DIR, 'src/data/provinces.js');
const MAP_PATHS_FILE = path.join(WEB_DIR, 'src/data/vietnamMapPaths.js');

/**
 * Official 34 provincial-level administrative units of Vietnam
 * per National Assembly Resolution 202/2025/QH15 (effective July 1, 2025).
 */
const UNITS_34 = [
  // MIỀN BẮC (15)
  {
    slug: 'ha-noi',
    name: 'TP. Hà Nội',
    unitType: 'Thành phố trực thuộc TW',
    isCity: true,
    region: 'bac',
    regionLabel: 'Miền Bắc',
    sourceSlugs: ['ha-noi'],
    areaKm2: '3.359,84 km²',
    population2025: '8.807.523 người',
    adminCenter: 'Hà Nội',
    resolutionNote: 'Giữ nguyên hiện trạng Thủ đô Hà Nội theo Nghị quyết 202/2025/QH15.',
  },
  {
    slug: 'hai-phong',
    name: 'TP. Hải Phòng',
    unitType: 'Thành phố trực thuộc TW',
    isCity: true,
    region: 'bac',
    regionLabel: 'Miền Bắc',
    sourceSlugs: ['hai-phong', 'hai-duong'],
    areaKm2: '3.194,72 km²',
    population2025: '4.664.124 người',
    adminCenter: 'TP. Hải Phòng',
    resolutionNote: 'Hợp nhất toàn bộ diện tích tự nhiên và quy mô dân số của TP. Hải Phòng và tỉnh Hải Dương.',
  },
  {
    slug: 'cao-bang',
    name: 'Cao Bằng',
    unitType: 'Tỉnh',
    isCity: false,
    region: 'bac',
    regionLabel: 'Miền Bắc',
    sourceSlugs: ['cao-bang'],
    areaKm2: '6.700,39 km²',
    population2025: '573.119 người',
    adminCenter: 'Cao Bằng',
    resolutionNote: 'Giữ nguyên hiện trạng địa giới hành chính theo Nghị quyết 202/2025/QH15.',
  },
  {
    slug: 'dien-bien',
    name: 'Điện Biên',
    unitType: 'Tỉnh',
    isCity: false,
    region: 'bac',
    regionLabel: 'Miền Bắc',
    sourceSlugs: ['dien-bien'],
    areaKm2: '9.539,93 km²',
    population2025: '673.091 người',
    adminCenter: 'Điện Biên Phủ',
    resolutionNote: 'Giữ nguyên hiện trạng địa giới hành chính theo Nghị quyết 202/2025/QH15.',
  },
  {
    slug: 'lai-chau',
    name: 'Lai Châu',
    unitType: 'Tỉnh',
    isCity: false,
    region: 'bac',
    regionLabel: 'Miền Bắc',
    sourceSlugs: ['lai-chau'],
    areaKm2: '9.068,73 km²',
    population2025: '512.601 người',
    adminCenter: 'Lai Châu',
    resolutionNote: 'Giữ nguyên hiện trạng địa giới hành chính theo Nghị quyết 202/2025/QH15.',
  },
  {
    slug: 'lang-son',
    name: 'Lạng Sơn',
    unitType: 'Tỉnh',
    isCity: false,
    region: 'bac',
    regionLabel: 'Miền Bắc',
    sourceSlugs: ['lang-son'],
    areaKm2: '8.310,18 km²',
    population2025: '881.384 người',
    adminCenter: 'Lạng Sơn',
    resolutionNote: 'Giữ nguyên hiện trạng địa giới hành chính theo Nghị quyết 202/2025/QH15.',
  },
  {
    slug: 'quang-ninh',
    name: 'Quảng Ninh',
    unitType: 'Tỉnh',
    isCity: false,
    region: 'bac',
    regionLabel: 'Miền Bắc',
    sourceSlugs: ['quang-ninh'],
    areaKm2: '6.207,95 km²',
    population2025: '1.497.447 người',
    adminCenter: 'Hạ Long',
    resolutionNote: 'Giữ nguyên hiện trạng địa giới hành chính theo Nghị quyết 202/2025/QH15.',
  },
  {
    slug: 'son-la',
    name: 'Sơn La',
    unitType: 'Tỉnh',
    isCity: false,
    region: 'bac',
    regionLabel: 'Miền Bắc',
    sourceSlugs: ['son-la'],
    areaKm2: '14.108,89 km²',
    population2025: '1.404.587 người',
    adminCenter: 'Sơn La',
    resolutionNote: 'Giữ nguyên hiện trạng địa giới hành chính theo Nghị quyết 202/2025/QH15.',
  },
  {
    slug: 'tuyen-quang',
    name: 'Tuyên Quang',
    unitType: 'Tỉnh',
    isCity: false,
    region: 'bac',
    regionLabel: 'Miền Bắc',
    sourceSlugs: ['tuyen-quang', 'ha-giang'],
    areaKm2: '13.795,50 km²',
    population2025: '1.865.270 người',
    adminCenter: 'Tuyên Quang',
    resolutionNote: 'Hợp nhất toàn bộ diện tích tự nhiên và quy mô dân số của tỉnh Hà Giang và tỉnh Tuyên Quang.',
  },
  {
    slug: 'lao-cai',
    name: 'Lào Cai',
    unitType: 'Tỉnh',
    isCity: false,
    region: 'bac',
    regionLabel: 'Miền Bắc',
    sourceSlugs: ['lao-cai', 'yen-bai'],
    areaKm2: '13.256,92 km²',
    population2025: '1.778.785 người',
    adminCenter: 'Yên Bái',
    resolutionNote: 'Hợp nhất toàn bộ diện tích tự nhiên và quy mô dân số của tỉnh Yên Bái và tỉnh Lào Cai.',
  },
  {
    slug: 'thai-nguyen',
    name: 'Thái Nguyên',
    unitType: 'Tỉnh',
    isCity: false,
    region: 'bac',
    regionLabel: 'Miền Bắc',
    sourceSlugs: ['thai-nguyen', 'bac-kan'],
    areaKm2: '8.375,21 km²',
    population2025: '1.799.489 người',
    adminCenter: 'Thái Nguyên',
    resolutionNote: 'Hợp nhất toàn bộ diện tích tự nhiên và quy mô dân số của tỉnh Bắc Kạn và tỉnh Thái Nguyên.',
  },
  {
    slug: 'phu-tho',
    name: 'Phú Thọ',
    unitType: 'Tỉnh',
    isCity: false,
    region: 'bac',
    regionLabel: 'Miền Bắc',
    sourceSlugs: ['phu-tho', 'vinh-phuc', 'hoa-binh'],
    areaKm2: '9.361,38 km²',
    population2025: '4.022.638 người',
    adminCenter: 'Việt Trì',
    resolutionNote: 'Hợp nhất toàn bộ diện tích tự nhiên và quy mô dân số của các tỉnh Vĩnh Phúc, Hòa Bình và Phú Thọ.',
  },
  {
    slug: 'bac-ninh',
    name: 'Bắc Ninh',
    unitType: 'Tỉnh',
    isCity: false,
    region: 'bac',
    regionLabel: 'Miền Bắc',
    sourceSlugs: ['bac-ninh', 'bac-giang'],
    areaKm2: '4.718,60 km²',
    population2025: '3.619.433 người',
    adminCenter: 'Bắc Giang',
    resolutionNote: 'Hợp nhất toàn bộ diện tích tự nhiên và quy mô dân số của tỉnh Bắc Giang và tỉnh Bắc Ninh.',
  },
  {
    slug: 'hung-yen',
    name: 'Hưng Yên',
    unitType: 'Tỉnh',
    isCity: false,
    region: 'bac',
    regionLabel: 'Miền Bắc',
    sourceSlugs: ['hung-yen', 'thai-binh'],
    areaKm2: '2.514,81 km²',
    population2025: '3.567.943 người',
    adminCenter: 'Hưng Yên',
    resolutionNote: 'Hợp nhất toàn bộ diện tích tự nhiên và quy mô dân số của tỉnh Thái Bình và tỉnh Hưng Yên.',
  },
  {
    slug: 'ninh-binh',
    name: 'Ninh Bình',
    unitType: 'Tỉnh',
    isCity: false,
    region: 'bac',
    regionLabel: 'Miền Bắc',
    sourceSlugs: ['ninh-binh', 'ha-nam', 'nam-dinh'],
    areaKm2: '3.942,62 km²',
    population2025: '4.412.264 người',
    adminCenter: 'Hoa Lư',
    resolutionNote: 'Hợp nhất toàn bộ diện tích tự nhiên và quy mô dân số của các tỉnh Hà Nam, Nam Định và Ninh Bình.',
  },

  // MIỀN TRUNG - TÂY NGUYÊN (11)
  {
    slug: 'thanh-hoa',
    name: 'Thanh Hóa',
    unitType: 'Tỉnh',
    isCity: false,
    region: 'trung',
    regionLabel: 'Miền Trung',
    sourceSlugs: ['thanh-hoa'],
    areaKm2: '11.114,71 km²',
    population2025: '4.324.783 người',
    adminCenter: 'Thanh Hóa',
    resolutionNote: 'Giữ nguyên hiện trạng địa giới hành chính theo Nghị quyết 202/2025/QH15.',
  },
  {
    slug: 'nghe-an',
    name: 'Nghệ An',
    unitType: 'Tỉnh',
    isCity: false,
    region: 'trung',
    regionLabel: 'Miền Trung',
    sourceSlugs: ['nghe-an'],
    areaKm2: '16.486,49 km²',
    population2025: '3.831.694 người',
    adminCenter: 'Vinh',
    resolutionNote: 'Giữ nguyên hiện trạng địa giới hành chính theo Nghị quyết 202/2025/QH15.',
  },
  {
    slug: 'ha-tinh',
    name: 'Hà Tĩnh',
    unitType: 'Tỉnh',
    isCity: false,
    region: 'trung',
    regionLabel: 'Miền Trung',
    sourceSlugs: ['ha-tinh'],
    areaKm2: '5.994,45 km²',
    population2025: '1.622.901 người',
    adminCenter: 'Hà Tĩnh',
    resolutionNote: 'Giữ nguyên hiện trạng địa giới hành chính theo Nghị quyết 202/2025/QH15.',
  },
  {
    slug: 'quang-tri',
    name: 'Quảng Trị',
    unitType: 'Tỉnh',
    isCity: false,
    region: 'trung',
    regionLabel: 'Miền Trung',
    sourceSlugs: ['quang-tri', 'quang-binh'],
    areaKm2: '12.700,00 km²',
    population2025: '1.870.845 người',
    adminCenter: 'Đồng Hới',
    resolutionNote: 'Hợp nhất toàn bộ diện tích tự nhiên và quy mô dân số của tỉnh Quảng Bình và tỉnh Quảng Trị.',
  },
  {
    slug: 'hue',
    name: 'TP. Huế',
    unitType: 'Thành phố trực thuộc TW',
    isCity: true,
    region: 'trung',
    regionLabel: 'Miền Trung',
    sourceSlugs: ['thua-thien-hue'],
    areaKm2: '4.947,11 km²',
    population2025: '1.236.393 người',
    adminCenter: 'TP. Huế',
    resolutionNote: 'Giữ nguyên hiện trạng Thành phố trực thuộc Trung ương (trên cơ sở Thừa Thiên Huế trước đây).',
  },
  {
    slug: 'da-nang',
    name: 'TP. Đà Nẵng',
    unitType: 'Thành phố trực thuộc TW',
    isCity: true,
    region: 'trung',
    regionLabel: 'Miền Trung',
    sourceSlugs: ['da-nang', 'quang-nam'],
    areaKm2: '11.859,59 km²',
    population2025: '3.065.628 người',
    adminCenter: 'TP. Đà Nẵng',
    resolutionNote: 'Hợp nhất toàn bộ diện tích tự nhiên và quy mô dân số của tỉnh Quảng Nam và TP. Đà Nẵng.',
  },
  {
    slug: 'quang-ngai',
    name: 'Quảng Ngãi',
    unitType: 'Tỉnh',
    isCity: false,
    region: 'trung',
    regionLabel: 'Miền Trung',
    sourceSlugs: ['quang-ngai', 'kon-tum'],
    areaKm2: '14.832,55 km²',
    population2025: '2.161.755 người',
    adminCenter: 'Quảng Ngãi',
    resolutionNote: 'Hợp nhất toàn bộ diện tích tự nhiên và quy mô dân số của tỉnh Kon Tum và tỉnh Quảng Ngãi.',
  },
  {
    slug: 'gia-lai',
    name: 'Gia Lai',
    unitType: 'Tỉnh',
    isCity: false,
    region: 'trung',
    regionLabel: 'Miền Trung',
    sourceSlugs: ['gia-lai', 'binh-dinh'],
    areaKm2: '21.576,53 km²',
    population2025: '3.583.693 người',
    adminCenter: 'Quy Nhơn',
    resolutionNote: 'Hợp nhất toàn bộ diện tích tự nhiên và quy mô dân số của tỉnh Bình Định và tỉnh Gia Lai.',
  },
  {
    slug: 'dak-lak',
    name: 'Đắk Lắk',
    unitType: 'Tỉnh',
    isCity: false,
    region: 'trung',
    regionLabel: 'Miền Trung',
    sourceSlugs: ['dak-lak', 'phu-yen'],
    areaKm2: '18.096,40 km²',
    population2025: '3.346.853 người',
    adminCenter: 'Buôn Ma Thuột',
    resolutionNote: 'Hợp nhất toàn bộ diện tích tự nhiên và quy mô dân số của tỉnh Phú Yên và tỉnh Đắk Lắk.',
  },
  {
    slug: 'khanh-hoa',
    name: 'Khánh Hòa',
    unitType: 'Tỉnh',
    isCity: false,
    region: 'trung',
    regionLabel: 'Miền Trung',
    sourceSlugs: ['khanh-hoa', 'ninh-thuan'],
    areaKm2: '8.555,86 km²',
    population2025: '2.243.554 người',
    adminCenter: 'Nha Trang',
    resolutionNote: 'Hợp nhất toàn bộ diện tích tự nhiên và quy mô dân số của tỉnh Ninh Thuận và tỉnh Khánh Hòa.',
  },
  {
    slug: 'lam-dong',
    name: 'Lâm Đồng',
    unitType: 'Tỉnh',
    isCity: false,
    region: 'trung',
    regionLabel: 'Miền Trung',
    sourceSlugs: ['lam-dong', 'binh-thuan', 'dak-nong'],
    areaKm2: '24.233,07 km²',
    population2025: '3.872.999 người',
    adminCenter: 'Đà Lạt',
    resolutionNote: 'Hợp nhất toàn bộ diện tích tự nhiên và quy mô dân số của các tỉnh Đắk Nông, Bình Thuận và Lâm Đồng.',
  },

  // MIỀN NAM (8)
  {
    slug: 'tp-hcm',
    name: 'TP. Hồ Chí Minh',
    unitType: 'Thành phố trực thuộc TW',
    isCity: true,
    region: 'nam',
    regionLabel: 'Miền Nam',
    sourceSlugs: ['tp-hcm', 'binh-duong', 'ba-ria-vung-tau'],
    areaKm2: '6.772,59 km²',
    population2025: '14.002.598 người',
    adminCenter: 'TP. Hồ Chí Minh',
    resolutionNote: 'Hợp nhất toàn bộ diện tích tự nhiên và quy mô dân số của Bình Dương, Bà Rịa – Vũng Tàu và TP. Hồ Chí Minh.',
  },
  {
    slug: 'dong-nai',
    name: 'Đồng Nai',
    unitType: 'Tỉnh',
    isCity: false,
    region: 'nam',
    regionLabel: 'Miền Nam',
    sourceSlugs: ['dong-nai', 'binh-phuoc'],
    areaKm2: '12.737,18 km²',
    population2025: '4.491.408 người',
    adminCenter: 'Biên Hòa',
    resolutionNote: 'Hợp nhất toàn bộ diện tích tự nhiên và quy mô dân số của tỉnh Bình Phước và tỉnh Đồng Nai.',
  },
  {
    slug: 'tay-ninh',
    name: 'Tây Ninh',
    unitType: 'Tỉnh',
    isCity: false,
    region: 'nam',
    regionLabel: 'Miền Nam',
    sourceSlugs: ['tay-ninh', 'long-an'],
    areaKm2: '8.536,44 km²',
    population2025: '3.254.170 người',
    adminCenter: 'Tân An',
    resolutionNote: 'Hợp nhất toàn bộ diện tích tự nhiên và quy mô dân số của tỉnh Long An và tỉnh Tây Ninh.',
  },
  {
    slug: 'dong-thap',
    name: 'Đồng Tháp',
    unitType: 'Tỉnh',
    isCity: false,
    region: 'nam',
    regionLabel: 'Miền Nam',
    sourceSlugs: ['dong-thap', 'tien-giang'],
    areaKm2: '5.938,64 km²',
    population2025: '4.370.046 người',
    adminCenter: 'Mỹ Tho',
    resolutionNote: 'Hợp nhất toàn bộ diện tích tự nhiên và quy mô dân số của tỉnh Tiền Giang và tỉnh Đồng Tháp.',
  },
  {
    slug: 'vinh-long',
    name: 'Vĩnh Long',
    unitType: 'Tỉnh',
    isCity: false,
    region: 'nam',
    regionLabel: 'Miền Nam',
    sourceSlugs: ['vinh-long', 'ben-tre', 'tra-vinh'],
    areaKm2: '6.296,20 km²',
    population2025: '4.257.581 người',
    adminCenter: 'Vĩnh Long',
    resolutionNote: 'Hợp nhất toàn bộ diện tích tự nhiên và quy mô dân số của các tỉnh Bến Tre, Trà Vinh và Vĩnh Long.',
  },
  {
    slug: 'can-tho',
    name: 'TP. Cần Thơ',
    unitType: 'Thành phố trực thuộc TW',
    isCity: true,
    region: 'nam',
    regionLabel: 'Miền Nam',
    sourceSlugs: ['can-tho', 'soc-trang', 'hau-giang'],
    areaKm2: '6.360,83 km²',
    population2025: '4.199.824 người',
    adminCenter: 'TP. Cần Thơ',
    resolutionNote: 'Hợp nhất toàn bộ diện tích tự nhiên và quy mô dân số của Sóc Trăng, Hậu Giang và TP. Cần Thơ.',
  },
  {
    slug: 'an-giang',
    name: 'An Giang',
    unitType: 'Tỉnh',
    isCity: false,
    region: 'nam',
    regionLabel: 'Miền Nam',
    sourceSlugs: ['an-giang', 'kien-giang'],
    areaKm2: '9.888,91 km²',
    population2025: '4.952.238 người',
    adminCenter: 'Rạch Giá',
    resolutionNote: 'Hợp nhất toàn bộ diện tích tự nhiên và quy mô dân số của tỉnh Kiên Giang và tỉnh An Giang.',
  },
  {
    slug: 'ca-mau',
    name: 'Cà Mau',
    unitType: 'Tỉnh',
    isCity: false,
    region: 'nam',
    regionLabel: 'Miền Nam',
    sourceSlugs: ['ca-mau', 'bac-lieu'],
    areaKm2: '7.942,39 km²',
    population2025: '2.606.672 người',
    adminCenter: 'Cà Mau',
    resolutionNote: 'Hợp nhất toàn bộ diện tích tự nhiên và quy mô dân số của tỉnh Bạc Liêu và tỉnh Cà Mau.',
  },
];

function cleanEmbedUrl(raw) {
  if (!raw || typeof raw !== 'string') return '';
  const trimmed = raw.trim();
  const dupIdx = trimmed.indexOf('https://', 8);
  return dupIdx > 0 ? trimmed.slice(0, dupIdx) : trimmed;
}

function uniqueStrings(items) {
  return Array.from(new Set(items.filter(Boolean)));
}

async function run() {
  const { PROVINCES: legacyProvinces } = await import(pathToFileURL(PROVINCES_FILE).href);
  const { VIETNAM_MAP_PATHS: legacyMapPaths, REGION_VIEWBOXES } = await import(pathToFileURL(MAP_PATHS_FILE).href);

  if (legacyProvinces.length !== 63) {
    throw new Error(`Expected 63 legacy provinces as input, found ${legacyProvinces.length}. Aborting.`);
  }
  if (UNITS_34.length !== 34) {
    throw new Error(`Expected 34 target units, found ${UNITS_34.length}.`);
  }

  const byLegacySlug = Object.fromEntries(legacyProvinces.map((p) => [p.slug, p]));
  const mapByLegacySlug = Object.fromEntries(legacyMapPaths.map((m) => [m.slug, m]));

  const seenSourceSlugs = new Set();
  const slugMigrationMap = {};
  for (const unit of UNITS_34) {
    for (const srcSlug of unit.sourceSlugs) {
      if (!byLegacySlug[srcSlug]) {
        throw new Error(`Unknown sourceSlug "${srcSlug}" in unit "${unit.slug}"`);
      }
      if (seenSourceSlugs.has(srcSlug)) {
        throw new Error(`Duplicate sourceSlug "${srcSlug}"`);
      }
      seenSourceSlugs.add(srcSlug);
      slugMigrationMap[srcSlug] = unit.slug;
    }
  }
  if (seenSourceSlugs.size !== 63) {
    throw new Error(`Mapped ${seenSourceSlugs.size} source slugs instead of 63!`);
  }

  // Also ensure 'hue' resolves to 'hue' in migration map
  slugMigrationMap.hue = 'hue';

  const provinces34 = UNITS_34.map((unit) => {
    const sources = unit.sourceSlugs.map((s) => byLegacySlug[s]);
    const primary = sources[0];
    const isMerged = sources.length > 1;
    const mergedFrom = sources.map((s) => s.name);

    const aliases = uniqueStrings(
      sources.flatMap((s) => [s.legacyRoute, ...(s.aliases || []), s.slug, unit.slug]),
    );

    const views360 = sources
      .map((s) => ({ label: s.name, url: cleanEmbedUrl(s.view) }))
      .filter((item) => Boolean(item.url));

    const slideshowImages = uniqueStrings(
      sources.flatMap((s) => [s.coverImage, ...(s.slideshowImages || [])]),
    ).slice(0, 8);

    const galleryImages = uniqueStrings(sources.flatMap((s) => s.galleryImages || []));

    const dltcCards = sources.flatMap((s) =>
      (s.dltcCards || []).map((c) => ({ ...c, subRegion: s.name })),
    );
    const dtlsCards = sources.flatMap((s) =>
      (s.dtlsCards || []).map((c) => ({ ...c, subRegion: s.name })),
    );

    const constituents = sources.map((s) => ({
      slug: s.slug,
      name: s.name,
      coverImage: s.coverImage,
      introduction: s.introduction,
      location: s.location,
      popularity: s.popularity,
      cuisine: s.cuisine,
      building: s.building,
      culture: s.culture,
      map: s.map,
      map2: s.map2,
      view: cleanEmbedUrl(s.view),
    }));

    const introText = isMerged
      ? `${unit.resolutionNote} ${primary.introduction}`
      : unit.slug === 'hue'
      ? `${unit.resolutionNote} ${primary.introduction}`
      : primary.introduction;

    const locationText = isMerged
      ? `Địa bàn mở rộng sau hợp nhất từ ${mergedFrom.join(', ')}. Trung tâm hành chính đặt tại ${unit.adminCenter}. ${primary.location}`
      : primary.location;

    const popularityText = `Dân số (sau sắp xếp 2025): ${unit.population2025} · Diện tích tự nhiên: ${unit.areaKm2} · Trung tâm hành chính: ${unit.adminCenter}.`;

    return {
      slug: unit.slug,
      legacyRoute: primary.legacyRoute,
      aliases,
      name: unit.name,
      unitType: unit.unitType,
      isCity: unit.isCity,
      region: unit.region,
      regionLabel: unit.regionLabel,
      isMerged,
      mergedFrom,
      mergedFromSlugs: unit.sourceSlugs,
      areaKm2: unit.areaKm2,
      population2025: unit.population2025,
      adminCenter: unit.adminCenter,
      resolutionNote: unit.resolutionNote,
      coverImage: primary.coverImage,
      introduction: introText,
      popularity: popularityText,
      location: locationText,
      view: views360[0]?.url || '',
      views360,
      cuisine: primary.cuisine,
      building: primary.building,
      culture: primary.culture,
      map: primary.map,
      map2: primary.map2,
      slideshowImages,
      galleryImages,
      dltcCards,
      dtlsCards,
      constituents,
    };
  }).sort((a, b) => a.name.localeCompare(b.name, 'vi'));

  const totalCards = provinces34.reduce((s, p) => s + p.dltcCards.length + p.dtlsCards.length, 0);
  const regionCounts = {
    all: provinces34.length,
    bac: provinces34.filter((p) => p.region === 'bac').length,
    trung: provinces34.filter((p) => p.region === 'trung').length,
    nam: provinces34.filter((p) => p.region === 'nam').length,
  };

  const regionsArr = [
    { id: 'all', label: 'Tất cả', count: regionCounts.all },
    { id: 'bac', label: 'Miền Bắc', count: regionCounts.bac },
    { id: 'trung', label: 'Miền Trung', count: regionCounts.trung },
    { id: 'nam', label: 'Miền Nam', count: regionCounts.nam },
  ];

  const provincesContent = `// Auto-generated 34 official provinces & centrally-governed cities (Resolution 202/2025/QH15)
// Generated by web/scripts/merge-to-34-provinces.mjs preserving all 63 legacy cultural assets & flashcards

export const REGIONS = ${JSON.stringify(regionsArr, null, 2)};

export const SLUG_MIGRATION_MAP = ${JSON.stringify(slugMigrationMap, null, 2)};

export const PROVINCES = ${JSON.stringify(provinces34, null, 2)};

export const PROVINCE_BY_SLUG = Object.fromEntries(PROVINCES.map((p) => [p.slug, p]));

export const PROVINCE_BY_LEGACY_ROUTE = PROVINCES.reduce((acc, p) => {
  acc[p.slug.toLowerCase()] = p;
  if (p.legacyRoute) acc[p.legacyRoute.toLowerCase()] = p;
  for (const alias of p.aliases || []) {
    acc[alias.toLowerCase()] = p;
  }
  return acc;
}, {});
`;

  const mapPaths34 = UNITS_34.map((unit) => {
    const dList = unit.sourceSlugs.flatMap((s) => mapByLegacySlug[s]?.dList || []);
    if (dList.length === 0) {
      throw new Error(`No SVG paths merged for unit "${unit.slug}"`);
    }
    return {
      slug: unit.slug,
      name: unit.name,
      region: unit.region,
      dList,
    };
  }).sort((a, b) => a.name.localeCompare(b.name, 'vi'));

  const mapPathsContent = `// Unified 34-province SVG paths merged from all 63 Vietnam territories in 800x800 coordinate space
export const REGION_VIEWBOXES = ${JSON.stringify(REGION_VIEWBOXES, null, 2)};

export const VIETNAM_MAP_PATHS = ${JSON.stringify(mapPaths34, null, 2)};
`;

  fs.writeFileSync(PROVINCES_FILE, provincesContent, 'utf8');
  fs.writeFileSync(MAP_PATHS_FILE, mapPathsContent, 'utf8');

  console.log('Successfully generated 34-province dataset!');
  console.log('Regions:', regionsArr);
  console.log('Total Flashcards preserved:', totalCards);
  console.log('Total SVG paths objects:', mapPaths34.length);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
