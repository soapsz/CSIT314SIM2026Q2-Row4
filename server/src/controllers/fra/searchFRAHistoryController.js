import SearchFRAHistoryService from '../../services/fra/searchFRAHistoryService.js'
 
class SearchFRAHistoryController {
  async searchFRAHistory(req, res) {
    try {
      const fras = await SearchFRAHistoryService.searchFRAHistory(req.query.query)
      res.status(200).json({ success: true, data: fras })
    } catch (error) {
      res.status(400).json({ success: false, message: error.message })
    }
  }
}
 
export default new SearchFRAHistoryController()