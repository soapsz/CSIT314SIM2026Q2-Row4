import ViewAllCompletedFRAService from '../../services/fra/viewAllCompletedFRAService.js'

class ViewAllCompletedFRAController {
  async viewAllCompletedFRA(req, res) {
    try {
      const fras = await ViewAllCompletedFRAService.viewAllCompletedFRA(req.query)
      res.status(200).json({ success: true, data: fras })
    } catch (error) {
      res.status(500).json({ success: false, message: error.message })
    }
  }
}
export default new ViewAllCompletedFRAController()