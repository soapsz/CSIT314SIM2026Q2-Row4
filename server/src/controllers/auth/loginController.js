import LoginService from '../../services/auth/loginService.js'

class LoginController {
  async login(req, res) {
    try {
      const { username, password } = req.body
      const userAccount = await LoginService.login(username, password, req)
      res.json(userAccount)
    } catch (err) {
      res.status(401).json({ message: err.message })
    }
  }
}

export default new LoginController()