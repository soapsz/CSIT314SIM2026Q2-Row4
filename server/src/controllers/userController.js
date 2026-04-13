import UserService from '../services/userService.js'

class UserController {
  async createUser(req, res) {
    try {
      const user = await UserService.createUser(req.body)
      res.status(201).json({ success: true, data: user })
    } catch (error) {
      res.status(400).json({ success: false, message: error.message })
    }
  }

  async getUserById(req, res) {
    try {
      const user = await UserService.getUserById(req.params.id)
      res.status(200).json({ success: true, data: user })
    } catch (error) {
      res.status(404).json({ success: false, message: error.message })
    }
  }
  async updateUserById(req, res) {
    try {
      const user = await UserService.updateUserById(req.params.id, req.body)
      res.status(200).json({ success: true, data: user })
    } catch (error) {
      res.status(404).json({ success: false, message: error.message })
    }
  }


}

export default new UserController()
