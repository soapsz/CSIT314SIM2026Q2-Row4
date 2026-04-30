import ViewFavouriteService from '../../services/favourite/viewFavouriteService.js'

class ViewFavouriteController {
  async viewFavourite(req, res) {
    try {
      const favourites = await ViewFavouriteService.viewFavourite(req.user._id.toString())
      res.status(200).json({ success: true, data: favourites })
    } catch (error) {
      res.status(500).json({ success: false, message: error.message })
    }
  }
}

export default new ViewFavouriteController()