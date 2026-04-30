import UpdateFRAService from '../../services/fra/updateFRAService.js'
import mongoose from 'mongoose'

class UpdateFRAController {
  async updateFRA(req, res) {
    try {
      if (!mongoose.Types.ObjectId.isValid(req.params.id))
        return res.status(404).json({ success: false, message: 'Fundraising activity not found' })
      const fra = await UpdateFRAService.updateFRA(req.params.id, req.body, req.user._id.toString())
      res.status(200).json({ success: true, message: 'Fundraising activity successfully updated', data: fra })
    } catch (error) {
      if (error.message === 'Fundraising activity not found') return res.status(404).json({ success: false, message: error.message })
      if (error.message === 'Unauthorized') return res.status(403).json({ success: false, message: error.message })
      if (error.message === 'Category not found') return res.status(400).json({ success: false, message: error.message })
      if (error.message === 'Category is suspended') return res.status(400).json({ success: false, message: error.message })
      if (error.message === 'Title cannot be empty') return res.status(400).json({ success: false, message: error.message })
      if (error.message === 'Target amount must be greater than 0') return res.status(400).json({ success: false, message: error.message })
      res.status(500).json({ success: false, message: error.message })
    }
  }
}

export default new UpdateFRAController()