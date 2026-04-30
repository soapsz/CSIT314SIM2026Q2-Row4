import UpdateFRACategoryService from '../../services/fraCategory/updateFRACategoryService.js'
import mongoose from 'mongoose'

class UpdateFRACategoryController {
  async updateFRACategory(req, res) {
    try {
      if (!mongoose.Types.ObjectId.isValid(req.params.id))
        return res.status(404).json({ success: false, message: 'Category not found' })
      const category = await UpdateFRACategoryService.updateFRACategory(req.params.id, req.body)
      res.status(200).json({ success: true, message: 'Category successfully updated', data: category })
    } catch (error) {
      if (error.message === 'Category not found')
        return res.status(404).json({ success: false, message: error.message })
      res.status(400).json({ success: false, message: error.message })
    }
  }
}

export default new UpdateFRACategoryController()