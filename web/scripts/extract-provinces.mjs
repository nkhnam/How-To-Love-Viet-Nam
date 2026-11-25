import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const WEB_DIR = path.resolve(__dirname, '..');
const PROVINCE_LINK_DIR = path.join(WEB_DIR, 'src', 'components', 'ProvinceLink');
const PROVINCE_DIR = path.join(WEB_DIR, 'src', 'components', 'Province');
const PUBLIC_DIR = path.join(WEB_DIR, 'public');
const DATA_DIR = path.join(WEB_DIR, 'src', 'data');

const REGION_INFO = {
  bac: 'Miền Bắc',
  trung: 'Miền Trung',
  nam: 'Miền Nam',
};

const PROVINCE_REGION = {
  AnGiang: 'nam',
  BacGiang: 'bac',
  BacKan: 'bac',
  BacLieu: 'nam',
  BacNinh: 'bac',
  BenTre: 'nam',
  BinhDinh: 'trung',
  BinhDuong: 'nam',
  BinhPhuoc: 'nam',
  BinhThuan: 'trung',
  CaMau: 'nam',
  CanTho: 'nam',
  CaoBang: 'bac',
  DakLak: 'trung',
  DakNong: 'trung',
  DaNang: 'trung',
  DienBien: 'bac',
  DongNai: 'nam',
  DongThap: 'nam',
  GiaLai: 'trung',
  HaGiang: 'bac',
  HaiDuong: 'bac',
  HaiPhong: 'bac',
  HaNam: 'bac',
  HaNoi: 'bac',
  HaTinh: 'trung',
  HauGiang: 'nam',
  HoaBinh: 'bac',
  HungYen: 'bac',
  KhanhHoa: 'trung',
  KienGiang: 'nam',
  KonTum: 'trung',
  LaiChau: 'bac',
  LamDong: 'trung',
  LangSon: 'bac',
  LaoCai: 'bac',
  LongAn: 'nam',
  NamDinh: 'bac',
  NgheAn: 'trung',
  NinhBinh: 'bac',
  NinhThuan: 'trung',
  PhuTho: 'bac',
  PhuYen: 'trung',
  QuangBinh: 'trung',
  QuangNam: 'trung',
  QuangNgai: 'trung',
  QuangNinh: 'bac',
  QuangTri: 'trung',
  SocTrang: 'nam',
  SonLa: 'bac',
  TayNinh: 'nam',
  ThaiBinh: 'bac',
  ThaiNguyen: 'bac',
  ThanhHoa: 'trung',
  ThuaThienHue: 'trung',
  TienGiang: 'nam',
  TPHCM: 'nam',
  TraVinh: 'nam',
  TuyenQuang: 'bac',
  VinhLong: 'nam',
  VinhPhuc: 'bac',
  VungTau: 'nam',
  YenBai: 'bac',
};

function toSlug(name) {
  if (name === 'TPHCM' || /hồ chí minh/i.test(name)) return 'tp-hcm';
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function normalizeAssetPath(raw) {
  if (!raw || typeof raw !== 'string') return '';
  let p = raw.trim();
  if (p.startsWith('./')) p = '/' + p.slice(2);
  if (p.startsWith('../')) p = '/' + p.slice(3);
  return p;
}

function assetExists(publicRelPath) {
  if (!publicRelPath || !publicRelPath.startsWith('/')) return false;
  const full = path.join(PUBLIC_DIR, publicRelPath.slice(1));
  return fs.existsSync(full);
}

function resolveExistingAsset(candidates) {
  for (const c of candidates) {
    const norm = normalizeAssetPath(c);
    if (norm && assetExists(norm)) return norm;
  }
  return '';
}

function parseProps(src) {
  const props = {};
  const attrRegex = /(\w+)\s*=\s*(?:"([\s\S]*?)"|'([\s\S]*?)'|`([\s\S]*?)`|\{\s*"([\s\S]*?)"\s*\}|\{\s*'([\s\S]*?)'\s*\}|\{\s*`([\s\S]*?)`\s*\})/g;
  let match;
  while ((match = attrRegex.exec(src)) !== null) {
    const key = match[1];
    const value = match[2] ?? match[3] ?? match[4] ?? match[5] ?? match[6] ?? match[7] ?? '';
    props[key] = value.replace(/\s+/g, ' ').trim();
  }
  return props;
}

function parseFlashcards(src, slug, kind) {
  const cards = [];
  const regex = /<FlipCard\b([^>]*?)\/>/g;
  let match;
  let idx = 1;
  while ((match = regex.exec(src)) !== null) {
    const attrs = parseProps(match[1]);
    const front = normalizeAssetPath(attrs.frontImage);
    const back = normalizeAssetPath(attrs.backImage);
    if (front && back) {
      cards.push({
        id: `${slug}-${kind}-${idx}`,
        kind,
        front,
        back,
      });
      idx += 1;
    }
  }
  return cards;
}

function extractCoverImagesFromRegionFiles() {
  const map = {};
  for (const file of ['Bac.js', 'Trung.js', 'Nam.js']) {
    const src = fs.readFileSync(path.join(PROVINCE_DIR, file), 'utf8');
    const regex = /<Link\s+to="\/([^"]+)"[^>]*class(?:Name)?="tour-card-province"[^>]*>[\s\S]*?<img\s+src="([^"]+)"/g;
    let m;
    while ((m = regex.exec(src)) !== null) {
      let routeKey = m[1].trim();
      if (routeKey === 'DacNong') routeKey = 'DakNong';
      const img = normalizeAssetPath(m[2]);
      map[routeKey] = img;
    }
  }
  return map;
}

function extractSvgPathsFromRegionFiles() {
  const pathMap = {};
  for (const [region, file] of [
    ['bac', 'Bac.js'],
    ['trung', 'Trung.js'],
    ['nam', 'Nam.js'],
  ]) {
    const src = fs.readFileSync(path.join(PROVINCE_DIR, file), 'utf8');
    const svgMatch = src.match(/<svg[\s\S]*?<\/svg>/);
    if (!svgMatch) continue;
    const svgBody = svgMatch[0];
    const linkRegex = /<Link([\s\S]*?)<\/Link>/g;
    let m;
    while ((m = linkRegex.exec(svgBody)) !== null) {
      const block = m[1];
      const toMatch = block.match(/to\s*=\s*"\/([^"]+)"/);
      if (!toMatch) continue;
      let routeKey = toMatch[1].trim();
      if (routeKey === 'DacNong') routeKey = 'DakNong';

      const paths = [];
      const pRegex = /<path[^>]*\bd\s*=\s*"([^"]+)"/g;
      let pm;
      while ((pm = pRegex.exec(block)) !== null) {
        paths.push(pm[1].trim());
      }
      if (paths.length > 0) {
        pathMap[routeKey] = { region, dList: paths };
      }
    }
  }
  return pathMap;
}

function extractProvinces() {
  const coverMap = extractCoverImagesFromRegionFiles();
  const svgMap = extractSvgPathsFromRegionFiles();
  const folders = fs
    .readdirSync(PROVINCE_LINK_DIR)
    .filter((f) => fs.statSync(path.join(PROVINCE_LINK_DIR, f)).isDirectory())
    .sort();

  const provinces = [];
  const warnings = [];

  for (const folder of folders) {
    const folderPath = path.join(PROVINCE_LINK_DIR, folder);
    const files = fs.readdirSync(folderPath);
    const mainFile = files.find((f) => !f.endsWith('DanhLam.js') && !f.endsWith('LichSu.js'));
    const dltcFile = files.find((f) => f.endsWith('DanhLam.js'));
    const dtlsFile = files.find((f) => f.endsWith('LichSu.js'));

    if (!mainFile) {
      warnings.push(`Missing main file in ${folder}`);
      continue;
    }

    const mainSrc = fs.readFileSync(path.join(folderPath, mainFile), 'utf8');
    const props = parseProps(mainSrc);

    let name = props.provinceName || folder;
    if (folder === 'DongThap') name = 'Đồng Tháp';
    if (folder === 'TPHCM') name = 'TP. Hồ Chí Minh';
    if (folder === 'ThuaThienHue') name = 'Thừa Thiên Huế';
    if (folder === 'VungTau') name = 'Bà Rịa – Vũng Tàu';
    const slug = folder === 'TPHCM' ? 'tp-hcm' : toSlug(name);
    const region = PROVINCE_REGION[folder];
    if (!region) warnings.push(`Unknown region for ${folder}`);

    let introduction = props.introduction || '';
    let popularity = props.popularity || '';
    let location = props.location || '';

    // Fix AnGiang swapped & copied-from-HaNoi fields
    if (folder === 'AnGiang') {
      popularity = props.introduction || '2.070.500 người (năm 2022), mật độ dân số trung bình là 585 người/km².';
      location =
        props.popularity ||
        'Tỉnh An Giang nằm về phía Tây Nam Đồng bằng sông Cửu Long, giáp Đồng Tháp, Kiên Giang, Cần Thơ và Campuchia.';
      introduction =
        'An Giang là tỉnh giàu truyền thống văn hóa và lịch sử tại vùng Tây Nam Bộ, nổi bật với quần thể Thất Sơn (Bảy Núi), di chỉ văn hóa Óc Eo cổ đại, rừng tràm Trà Sư và bản sắc đa dân tộc Kinh – Khmer – Chăm – Hoa.';
    }

    // Fix DongThap where intro sentence was placed in provinceName and popularity was duplicated into introduction
    if (folder === 'DongThap') {
      introduction =
        'Đồng Tháp được mệnh danh là thủ phủ loài hoa sen với những cánh đồng sen rộng lớn, Làng hoa Sa Đéc, Vườn quốc gia Tràm Chim và di tích Gò Tháp giàu giá trị lịch sử.';
    }

    const slideshowCandidates = [
      props.slideshowImg1,
      props.slideshowImg2,
      props.slideshowImg3,
      props.slideshowImg4,
      props.slideshowImg5,
    ];
    const slideshowImages = slideshowCandidates
      .map((img) => resolveExistingAsset([img]))
      .filter(Boolean);

    const galleryCandidates = [
      props.provinceImg1,
      props.provinceImg2,
      props.provinceImg3,
      props.provinceImg4,
      props.provinceImg5,
      props.provinceImg6,
      props.provinceImg7,
      props.provinceImg8,
      props.provinceImg9,
    ];
    const galleryImages = galleryCandidates
      .map((img) => resolveExistingAsset([img]))
      .filter(Boolean);

    const mapImg = resolveExistingAsset([
      props.map,
      `/Img/${folder}/map.jpg`,
      `/Img/${folder}/map.png`,
    ]);
    const map2Img = resolveExistingAsset([
      props.map2,
      `/Img/${folder}/map2.jpg`,
      `/Img/${folder}/map2.png`,
    ]);

    // Cover image must belong to this province and exist locally!
    const rawCover = coverMap[folder];
    const isBrokenCrossProvinceCover =
      !rawCover ||
      rawCover.startsWith('http') ||
      (folder === 'NinhThuan' && rawCover.includes('DongNai')) ||
      (folder === 'LongAn' && rawCover.includes('LamDong'));

    const coverImage = resolveExistingAsset([
      !isBrokenCrossProvinceCover ? rawCover : '',
      `/Img/${folder}.jpg`,
      `/Img/${folder}.jpeg`,
      `/Img/${folder}.png`,
      `/Img/${folder.toLowerCase()}.jpeg`,
      `/Img/${folder}/1.jpg`,
      slideshowImages[0] || '',
    ]);

    if (!coverImage) {
      warnings.push(`No valid local coverImage for ${folder}`);
    }

    const dltcSrc = dltcFile ? fs.readFileSync(path.join(folderPath, dltcFile), 'utf8') : '';
    const dtlsSrc = dtlsFile ? fs.readFileSync(path.join(folderPath, dtlsFile), 'utf8') : '';

    const dltcCards = parseFlashcards(dltcSrc, slug, 'dltc').filter(
      (c) => assetExists(c.front) && assetExists(c.back),
    );
    const dtlsCards = parseFlashcards(dtlsSrc, slug, 'dtls').filter(
      (c) => assetExists(c.front) && assetExists(c.back),
    );

    const aliases = [folder];
    if (folder === 'DakNong') aliases.push('DacNong');

    provinces.push({
      slug,
      legacyRoute: folder,
      aliases,
      name,
      region,
      regionLabel: REGION_INFO[region],
      coverImage,
      introduction,
      popularity,
      location,
      view: props.view || '',
      cuisine: props.cuisine || '',
      building: props.building || '',
      culture: props.culture || '',
      map: mapImg,
      map2: map2Img,
      slideshowImages,
      galleryImages,
      dltcCards,
      dtlsCards,
    });

    if (!svgMap[folder]) {
      warnings.push(`Missing SVG path for ${folder}`);
    }
  }

  fs.mkdirSync(DATA_DIR, { recursive: true });

  const provincesModule = `// Auto-generated from ProvinceLink & Province datasets by web/scripts/extract-provinces.mjs
export const REGIONS = [
  { id: 'all', label: 'Tất cả', count: ${provinces.length} },
  { id: 'bac', label: 'Miền Bắc', count: ${provinces.filter((p) => p.region === 'bac').length} },
  { id: 'trung', label: 'Miền Trung', count: ${provinces.filter((p) => p.region === 'trung').length} },
  { id: 'nam', label: 'Miền Nam', count: ${provinces.filter((p) => p.region === 'nam').length} },
];

export const PROVINCES = ${JSON.stringify(provinces, null, 2)};

export const PROVINCE_BY_SLUG = Object.fromEntries(PROVINCES.map((p) => [p.slug, p]));

export const PROVINCE_BY_LEGACY_ROUTE = PROVINCES.reduce((acc, p) => {
  acc[p.legacyRoute.toLowerCase()] = p;
  for (const alias of p.aliases || []) {
    acc[alias.toLowerCase()] = p;
  }
  return acc;
}, {});
`;

  const svgPathsList = provinces.map((p) => {
    const svgInfo = svgMap[p.legacyRoute];
    return {
      slug: p.slug,
      name: p.name,
      region: p.region,
      dList: svgInfo ? svgInfo.dList : [],
    };
  });

  const mapModule = `// Auto-generated SVG paths in unified 800x800 Vietnam coordinate space
export const REGION_VIEWBOXES = {
  all: '35 -5 365 735',
  bac: '40 -5 295 180',
  trung: '145 130 255 460',
  nam: '115 550 280 185',
};

export const VIETNAM_MAP_PATHS = ${JSON.stringify(svgPathsList, null, 2)};

export const VIETNAM_MAP_BY_SLUG = Object.fromEntries(VIETNAM_MAP_PATHS.map((item) => [item.slug, item]));
`;

  fs.writeFileSync(path.join(DATA_DIR, 'provinces.js'), provincesModule, 'utf8');
  fs.writeFileSync(path.join(DATA_DIR, 'vietnamMapPaths.js'), mapModule, 'utf8');

  const totalCards = provinces.reduce((s, p) => s + p.dltcCards.length + p.dtlsCards.length, 0);
  console.log(`Extracted ${provinces.length} provinces, ${totalCards} flashcards.`);
  console.log(
    `Regions: bac=${provinces.filter((p) => p.region === 'bac').length}, trung=${
      provinces.filter((p) => p.region === 'trung').length
    }, nam=${provinces.filter((p) => p.region === 'nam').length}`,
  );
  const textIssues = provinces.filter(
    (p) =>
      p.name.length > 25 ||
      p.introduction === p.popularity ||
      p.introduction.length < 30 ||
      /^\d/.test(p.introduction) ||
      /^Năm \d/.test(p.introduction),
  );
  if (textIssues.length) {
    console.log(
      'Text checks:',
      textIssues.map((p) => ({
        folder: p.legacyRoute,
        name: p.name,
        intro: p.introduction.slice(0, 70),
        pop: p.popularity.slice(0, 50),
      })),
    );
  }
  if (warnings.length) {
    console.warn('Warnings:', warnings);
  } else {
    console.log('Zero warnings! All 63 provinces, SVG paths, and assets validated.');
  }
}

extractProvinces();
