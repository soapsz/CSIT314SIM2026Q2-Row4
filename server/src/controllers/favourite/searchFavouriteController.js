import SearchFavouriteService from '../../services/favourite/searchFavouriteService.js'

class SearchFavouriteController {
  async searchFavourite(req, res) {
    try {
      const { query } = req.query
      const favourites = await SearchFavouriteService.searchFavourite(req.user._id.toString(), query)
      res.status(200).json({ success: true, data: favourites })
    } catch (error) {
      res.status(500).json({ success: false, message: error.message })
    }
  }
}

export default new SearchFavouriteController()