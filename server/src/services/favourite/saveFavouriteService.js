import FavouriteRepository from '../../repositories/FavouriteRepository.js'
import FundraisingActivityRepository from '../../repositories/FundraisingActivityRepository.js'

class SaveFavouriteService {
  async saveFavourite(doneeId, fraId) {
    const existing = await FavouriteRepository.findByDoneeAndFra(doneeId, fraId)
    if (existing) throw new Error('FRA already in favourites')
    const result = await FavouriteRepository.create(doneeId, fraId)
    await FundraisingActivityRepository.incrementShortlistCount(fraId)
    return result
  }
}
export default new SaveFavouriteService()