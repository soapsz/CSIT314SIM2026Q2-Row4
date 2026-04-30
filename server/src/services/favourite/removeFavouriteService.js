import FavouriteRepository from '../../repositories/FavouriteRepository.js'
import FundraisingActivityRepository from '../../repositories/FundraisingActivityRepository.js'

class RemoveFavouriteService {
  async removeFavourite(doneeId, fraId) {
    const result = await FavouriteRepository.removeByDoneeAndFra(doneeId, fraId)
    if (result) {
      await FundraisingActivityRepository.decrementShortlistCount(fraId)
    }
    return result
  }
}
export default new RemoveFavouriteService()