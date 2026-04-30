import SearchDonationHistoryService from '../../services/donation/searchDonationHistoryService.js'

class SearchDonationHistoryController {
  async searchDonationHistory(req, res) {
    try {
      const donations = await SearchDonationHistoryService.searchDonationHistory(req.user._id.toString(), req.query)
      res.status(200).json({ success: true, data: donations })
    } catch (error) {
      res.status(500).json({ success: false, message: error.message })
    }
  }
}

export default new SearchDonationHistoryController()