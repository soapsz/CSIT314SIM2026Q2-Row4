import FavouriteRepository from '../../repositories/FavouriteRepository.js'

class SearchFavouriteService {
  async searchFavourite(doneeId, query) {
    if (!query || query.trim() === '') return await FavouriteRepository.findByDonee(doneeId)
    return await FavouriteRepository.searchByDonee(doneeId, query)
  }
}

export default new SearchFavouriteService()