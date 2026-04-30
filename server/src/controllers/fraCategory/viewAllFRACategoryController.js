import ViewAllFRACategoryService from '../../services/fraCategory/viewAllFRACategoryService.js'

class ViewAllFRACategoryController {
  async viewAllFRACategory(req, res) {
    try {
      const categories = await ViewAllFRACategoryService.viewAllFRACategory()
      res.status(200).json({ success: true, data: categories })
    } catch (error) {
      res.status(500).json({ success: false, message: error.message })
    }
  }
}

export default new ViewAllFRACategoryController()