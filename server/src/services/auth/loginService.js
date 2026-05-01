import bcrypt from 'bcrypt'
import UserRepository from '../../repositories/UserAccountRepository.js'

class LoginService {
  async login(username, password, req) {
    if (!username || username.trim() === '') {
      throw new Error('Username is required')
    }
    if (!password || password.trim() === '') {
      throw new Error('Password is required')
    }
    const userAccount = await UserRepository.findByUsername(username)
    if (!userAccount) throw new Error('Invalid credentials')
    if (!userAccount.isActive) throw new Error('Account is suspended')
    const passwordMatch = await bcrypt.compare(password, userAccount.password)
    if (!passwordMatch) throw new Error('Invalid credentials')
    req.session.userId = userAccount._id
    return {
      _id: userAccount._id,
      username: userAccount.username,
      email: userAccount.email,
      userProfile: userAccount.userProfile
    }
  }
}

export default new LoginService()