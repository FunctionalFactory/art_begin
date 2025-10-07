export const GENRE_CONFIG = {
  painting: {
    slug: "painting",
    name: "회화",
    nameEn: "Painting",
    description: "캔버스, 수채화, 아크릴, 유화 등 다양한 회화 작품",
    icon: "🎨",
  },
  sculpture: {
    slug: "sculpture",
    name: "조각",
    nameEn: "Sculpture",
    description: "3D 작품과 설치미술",
    icon: "🗿",
  },
  photography: {
    slug: "photography",
    name: "사진",
    nameEn: "Photography",
    description: "순수 사진 예술 작품",
    icon: "📷",
  },
  "digital-art": {
    slug: "digital-art",
    name: "디지털 아트",
    nameEn: "Digital Art",
    description: "디지털 페인팅, 3D 렌더링, NFT",
    icon: "💻",
  },
  "mixed-media": {
    slug: "mixed-media",
    name: "혼합 매체",
    nameEn: "Mixed Media",
    description: "여러 재료를 혼합한 작품",
    icon: "🎭",
  },
  printmaking: {
    slug: "printmaking",
    name: "판화",
    nameEn: "Printmaking",
    description: "실크스크린, 리토그래프 등",
    icon: "🖨️",
  },
  drawing: {
    slug: "drawing",
    name: "드로잉",
    nameEn: "Drawing",
    description: "소묘, 스케치, 펜화",
    icon: "✏️",
  },
  furniture: {
    slug: "furniture",
    name: "가구",
    nameEn: "Furniture",
    description: "아트 가구, 디자인 가구",
    icon: "🪑",
  },
  ceramics: {
    slug: "ceramics",
    name: "도자기",
    nameEn: "Ceramics",
    description: "도예, 세라믹 아트",
    icon: "🏺",
  },
  textile: {
    slug: "textile",
    name: "섬유",
    nameEn: "Textile",
    description: "직물 예술, 태피스트리",
    icon: "🧵",
  },
} as const;

export type GenreSlug = keyof typeof GENRE_CONFIG;

/**
 * URL slug를 데이터베이스 category로 변환
 * @param slug - URL slug (예: "digital-art")
 * @returns DB category (예: "Digital Art")
 */
export function slugToCategory(slug: string): string {
  const genre = GENRE_CONFIG[slug as GenreSlug];
  return genre?.nameEn || slug;
}

/**
 * 데이터베이스 category를 URL slug로 변환
 * @param category - DB category (예: "Digital Art")
 * @returns URL slug (예: "digital-art")
 */
export function categoryToSlug(category: string): string {
  const entry = Object.entries(GENRE_CONFIG).find(
    ([_, config]) =>
      config.nameEn.toLowerCase() === category.toLowerCase() ||
      config.name === category
  );
  return entry?.[0] || category.toLowerCase().replace(/\s+/g, "-");
}

/**
 * 모든 장르 slug 배열 반환
 */
export function getAllGenreSlugs(): string[] {
  return Object.keys(GENRE_CONFIG);
}

/**
 * slug로 장르 설정 가져오기
 */
export function getGenreConfig(slug: string) {
  return GENRE_CONFIG[slug as GenreSlug] || null;
}
