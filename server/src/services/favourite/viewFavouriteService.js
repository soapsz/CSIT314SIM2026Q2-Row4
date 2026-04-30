import FavouriteRepository from '../../repositories/FavouriteRepository.js'
import FundraisingActivityRepository from '../../repositories/FundraisingActivityRepository.js'

class ViewFavouriteService {
  async viewFavourite(doneeId) {
    const favourites = await FavouriteRepository.findByDonee(doneeId)

    const fras = favourites.map(fav => fav.fra).filter(Boolean)
    const withProgress = await FundraisingActivityRepository._attachProgress(fras)

    const progressMap = {}
    withProgress.forEach(f => { progressMap[f._id.toString()] = f.totalRaised })

    return favourites.map(fav => {
      const plain = fav.toObject ? fav.toObject() : fav
      if (plain.fra) plain.fra.totalRaised = progressMap[plain.fra._id.toString()] ?? 0
      return plain
    })
  }
}
export default new ViewFavouriteService()