import CreateFRAService from '../../services/fra/createFRAService.js'

class CreateFRAController {
  async createFRA(req, res) {
    try {
      const fra = await CreateFRAService.createFRA(req.body, req.user._id.toString())
      res.status(201).json({ success: true, message: 'Fundraising activity successfully created', data: fra })
    } catch (error) {
      if (error.message === 'Title is required') return res.status(400).json({ success: false, message: error.message })
      if (error.message === 'Target amount must be greater than 0') return res.status(400).json({ success: false, message: error.message })
      if (error.message === 'Category not found') return res.status(400).json({ success: false, message: error.message })
      if (error.message === 'Category is suspended') return res.status(400).json({ success: false, message: error.message })
      res.status(500).json({ success: false, message: error.message })
    }
  }
}

export default new CreateFRAController()