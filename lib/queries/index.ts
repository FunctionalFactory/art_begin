// Re-export all query functions for easy import
export {
  getArtistById,
  getArtistByUsername,
} from './artists';

export {
  getArtworkById,
  getArtworksByArtist,
  getFeaturedArtworks,
  getEndingSoonArtworks,
  getAllArtworks,
} from './artworks';
