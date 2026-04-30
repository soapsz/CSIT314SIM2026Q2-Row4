import SaveFavouriteService from '../../services/favourite/saveFavouriteService.js'
import mongoose from 'mongoose'

class SaveFavouriteController {
  async saveFavourite(req, res) {
    try {
      if (!mongoose.Types.ObjectId.isValid(req.params.id))
        return res.status(404).json({ success: false, message: 'FRA not found' })
      const favourite = await SaveFavouriteService.saveFavourite(req.user._id.toString(), req.params.id)
      res.status(201).json({ success: true, message: 'FRA saved to favourites', data: favourite })
    } catch (error) {
      if (error.message === 'FRA already in favourites')
        return res.status(400).json({ success: false, message: error.message })
      res.status(500).json({ success: false, message: error.message })
    }
  }
}

export default new SaveFavouriteController()