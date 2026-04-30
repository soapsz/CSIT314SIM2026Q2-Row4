import SearchFRACategoryService from '../../services/fraCategory/searchFRACategoryService.js'

class SearchFRACategoryController {
  async searchFRACategory(req, res) {
    try {
      const { query } = req.query
      const categories = await SearchFRACategoryService.searchFRACategory(query)
      res.status(200).json({ success: true, data: categories })
    } catch (error) {
      res.status(500).json({ success: false, message: error.message })
    }
  }
}

export default new SearchFRACategoryController()