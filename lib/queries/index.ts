// Re-export all query functions for easy import
export {
  getArtistById,
  getArtistByUsername,
  getArtistByUserId,
  getAllArtists,
  createArtist,
  updateArtist,
} from './artists';

export {
  getArtworkById,
  getArtworksByArtist,
  getFeaturedArtworks,
  getEndingSoonArtworks,
  getAllArtworks,
  getArtworksByArtistUserId,
  createArtwork,
  updateArtwork,
  deleteArtwork,
  searchArtworks,
} from './artworks';

export {
  getFavoritesByUser,
  checkIsFavorited,
  getUserFavoritesMap,
} from './favorites';

export {
  getBidsByUser,
  getHighestBidForArtwork,
  getUserBidForArtwork,
  getUserBidsWithStatus,
  getUserBidArtworks,
} from './bids';

export {
  getProfileByUserId,
  getProfileByUsername,
  updateProfile,
} from './profiles';

export {
  getUserOrders,
  getArtistSales,
  createOrder,
  updateOrderStatus,
  processExpiredAuctions,
} from './orders';
