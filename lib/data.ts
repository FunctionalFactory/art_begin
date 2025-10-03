export interface Artist {
  id: string;
  name: string;
  username: string;
  bio: string;
  profileImage: string;
  totalArtworks: number;
  soldArtworks: number;
}

export interface Artwork {
  id: string;
  title: string;
  artistId: string;
  artistName: string;
  artistUsername: string;
  imageUrl: string;
  description: string;
  category: string;
  currentPrice?: number;
  fixedPrice?: number;
  saleType: "auction" | "fixed";
  auctionEndTime?: Date;
  highestBidder?: string;
  bidCount?: number;
  views: number;
  likes: number;
  isLiked?: boolean;
  status: "active" | "sold" | "upcoming";
  createdAt: Date;
}

export const artists: Artist[] = [
  {
    id: "1",
    name: "김아제",
    username: "aze-kim",
    bio: "빛과 어둠의 경계를 탐구하는 추상화가입니다. 일상 속에서 발견하는 작은 감정들을 캔버스에 담습니다.",
    profileImage: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400",
    totalArtworks: 24,
    soldArtworks: 18,
  },
  {
    id: "2",
    name: "박도시",
    username: "Urbanist",
    bio: "도시의 기하학적 구조와 인간의 삶이 만나는 지점을 그립니다. 건축과 미술의 경계를 넘나드는 작업을 합니다.",
    profileImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400",
    totalArtworks: 31,
    soldArtworks: 22,
  },
  {
    id: "3",
    name: "이모지",
    username: "emoji_lee",
    bio: "따뜻한 색감과 미니멀한 구성으로 일상의 평온함을 표현합니다. 작은 것들의 소중함을 그립니다.",
    profileImage: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400",
    totalArtworks: 19,
    soldArtworks: 12,
  },
  {
    id: "4",
    name: "최자연",
    username: "nature_choi",
    bio: "자연의 순환과 생명력을 주제로 작업합니다. 유기적인 형태와 자연스러운 색채를 추구합니다.",
    profileImage: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400",
    totalArtworks: 27,
    soldArtworks: 19,
  },
  {
    id: "5",
    name: "정감성",
    username: "emotion_jung",
    bio: "인간의 복잡한 감정을 색과 형태로 표현하는 것에 관심이 많습니다. 추상과 구상의 경계에서 작업합니다.",
    profileImage: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400",
    totalArtworks: 22,
    soldArtworks: 15,
  },
];

export const artworks: Artwork[] = [
  {
    id: "1",
    title: "새벽의 눈동자",
    artistId: "1",
    artistName: "김아제",
    artistUsername: "aze-kim",
    imageUrl: "https://images.unsplash.com/photo-1549887534-1541e9326642?w=800",
    description: "새벽의 첫 빛이 눈동자에 반사되는 순간을 포착한 작품입니다. 빛과 어둠의 경계에서 피어나는 희망을 표현했습니다.",
    category: "추상화",
    currentPrice: 150000,
    saleType: "auction",
    auctionEndTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    bidCount: 12,
    views: 342,
    likes: 89,
    status: "active",
    createdAt: new Date("2025-09-15"),
  },
  {
    id: "2",
    title: "도시의 격자",
    artistId: "2",
    artistName: "박도시",
    artistUsername: "Urbanist",
    imageUrl: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800",
    description: "현대 도시의 건축적 구조를 기하학적으로 재해석한 작품입니다. 차가운 콘크리트 속에서도 살아 숨쉬는 인간의 온기를 담았습니다.",
    category: "기하학",
    currentPrice: 225000,
    saleType: "auction",
    auctionEndTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    bidCount: 8,
    views: 521,
    likes: 134,
    status: "active",
    createdAt: new Date("2025-09-20"),
  },
  {
    id: "3",
    title: "나의 작은 집",
    artistId: "3",
    artistName: "이모지",
    artistUsername: "emoji_lee",
    imageUrl: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800",
    description: "마음속 안식처를 상징하는 작은 집. 미니멀한 선과 따뜻한 색감으로 평온함을 표현했습니다.",
    category: "미니멀",
    fixedPrice: 90000,
    saleType: "fixed",
    views: 198,
    likes: 56,
    status: "active",
    createdAt: new Date("2025-09-25"),
  },
  {
    id: "4",
    title: "봄의 숨결",
    artistId: "4",
    artistName: "최자연",
    artistUsername: "nature_choi",
    imageUrl: "https://images.unsplash.com/photo-1515405295579-ba7b45403062?w=800",
    description: "봄이 오는 소리를 시각화한 작품입니다. 생명이 깨어나는 순간의 에너지와 설렘을 담았습니다.",
    category: "자연",
    currentPrice: 180000,
    saleType: "auction",
    auctionEndTime: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
    bidCount: 15,
    views: 687,
    likes: 201,
    status: "active",
    createdAt: new Date("2025-09-10"),
  },
  {
    id: "5",
    title: "감정의 파편",
    artistId: "5",
    artistName: "정감성",
    artistUsername: "emotion_jung",
    imageUrl: "https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?w=800",
    description: "복잡하게 얽힌 감정들을 색의 파편으로 표현했습니다. 각자만의 방식으로 해석할 수 있는 여지를 남겼습니다.",
    category: "추상화",
    fixedPrice: 120000,
    saleType: "fixed",
    views: 234,
    likes: 78,
    status: "active",
    createdAt: new Date("2025-09-28"),
  },
  {
    id: "6",
    title: "고요한 밤",
    artistId: "1",
    artistName: "김아제",
    artistUsername: "aze-kim",
    imageUrl: "https://images.unsplash.com/photo-1533158326339-7f3cf2404354?w=800",
    description: "밤의 정적 속에서 느끼는 고요함과 평화를 표현한 작품입니다.",
    category: "추상화",
    currentPrice: 195000,
    saleType: "auction",
    auctionEndTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    bidCount: 10,
    views: 412,
    likes: 112,
    status: "active",
    createdAt: new Date("2025-09-18"),
  },
  {
    id: "7",
    title: "메트로폴리스",
    artistId: "2",
    artistName: "박도시",
    artistUsername: "Urbanist",
    imageUrl: "https://images.unsplash.com/photo-1536924940846-227afb31e2a5?w=800",
    description: "대도시의 복잡함과 역동성을 기하학적 패턴으로 재구성했습니다.",
    category: "기하학",
    fixedPrice: 260000,
    saleType: "fixed",
    views: 589,
    likes: 167,
    status: "active",
    createdAt: new Date("2025-09-22"),
  },
  {
    id: "8",
    title: "오후의 차",
    artistId: "3",
    artistName: "이모지",
    artistUsername: "emoji_lee",
    imageUrl: "https://images.unsplash.com/photo-1561214115-f2f134cc4912?w=800",
    description: "조용한 오후, 차 한 잔의 여유를 그림으로 담았습니다.",
    category: "미니멀",
    currentPrice: 105000,
    saleType: "auction",
    auctionEndTime: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
    bidCount: 6,
    views: 276,
    likes: 92,
    status: "active",
    createdAt: new Date("2025-09-26"),
  },
  {
    id: "9",
    title: "숲의 교향곡",
    artistId: "4",
    artistName: "최자연",
    artistUsername: "nature_choi",
    imageUrl: "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=800",
    description: "숲 속에서 들리는 자연의 소리를 시각적으로 표현한 작품입니다.",
    category: "자연",
    fixedPrice: 210000,
    saleType: "fixed",
    views: 445,
    likes: 156,
    status: "active",
    createdAt: new Date("2025-09-12"),
  },
  {
    id: "10",
    title: "내면의 여정",
    artistId: "5",
    artistName: "정감성",
    artistUsername: "emotion_jung",
    imageUrl: "https://images.unsplash.com/photo-1549887534-1541e9326642?w=800",
    description: "자기 자신을 찾아가는 여정을 추상적으로 표현했습니다.",
    category: "추상화",
    currentPrice: 175000,
    saleType: "auction",
    auctionEndTime: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
    bidCount: 9,
    views: 321,
    likes: 98,
    status: "active",
    createdAt: new Date("2025-09-30"),
  },
];

export function getArtworkById(id: string): Artwork | undefined {
  return artworks.find((artwork) => artwork.id === id);
}

export function getArtworksByArtist(artistId: string): Artwork[] {
  return artworks.filter((artwork) => artwork.artistId === artistId);
}

export function getArtistById(id: string): Artist | undefined {
  return artists.find((artist) => artist.id === id);
}

export function getFeaturedArtworks(): Artwork[] {
  return artworks.filter((artwork) => artwork.status === "active").slice(0, 6);
}

export function getEndingSoonArtworks(): Artwork[] {
  return artworks
    .filter(
      (artwork) =>
        artwork.saleType === "auction" &&
        artwork.status === "active" &&
        artwork.auctionEndTime
    )
    .sort((a, b) => {
      if (!a.auctionEndTime || !b.auctionEndTime) return 0;
      return a.auctionEndTime.getTime() - b.auctionEndTime.getTime();
    })
    .slice(0, 4);
}
