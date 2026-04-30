import ViewFRACategoryService from '../../services/fraCategory/viewFRACategoryService.js'
import mongoose from 'mongoose'

class ViewFRACategoryController {
  async viewFRACategory(req, res) {
    try {
      if (!mongoose.Types.ObjectId.isValid(req.params.id))
        return res.status(404).json({ success: false, message: 'Category not found' })
      const category = await ViewFRACategoryService.viewFRACategory(req.params.id)
      res.status(200).json({ success: true, data: category })
    } catch (error) {
      if (error.message === 'Category not found')
        return res.status(404).json({ success: false, message: error.message })
      res.status(500).json({ success: false, message: error.message })
    }
  }
}

export default new ViewFRACategoryController()