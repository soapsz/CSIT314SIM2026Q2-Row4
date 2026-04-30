import RemoveFavouriteService from '../../services/favourite/removeFavouriteService.js'

class RemoveFavouriteController {
  async removeFavourite(req, res) {
    try {
      await RemoveFavouriteService.removeFavourite(req.user._id.toString(), req.params.id)
      res.status(200).json({ success: true, message: 'Removed from favourites' })
    } catch (error) {
      res.status(500).json({ success: false, message: error.message })
    }
  }
}

export default new RemoveFavouriteController()