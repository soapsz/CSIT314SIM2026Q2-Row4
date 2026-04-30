import CreateFRACategoryService from '../../services/fraCategory/createFRACategoryService.js'

class CreateFRACategoryController {
  async createFRACategory(req, res) {
    try {
      const category = await CreateFRACategoryService.createFRACategory(req.body)
      res.status(201).json({ success: true, message: 'Category successfully created', data: category })
    } catch (error) {
      if (error.message === 'Category name is required' || error.message === 'Category name already exists') {
        return res.status(400).json({ success: false, message: error.message })
      }
      res.status(500).json({ success: false, message: error.message })
    }
  }
}

export default new CreateFRACategoryController()