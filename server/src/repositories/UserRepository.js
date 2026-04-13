import User from '../models/User.js'

class UserRepository {
  async create(data) {
    const user = new User(data)
    return await user.save()
  }

  async findById(id) {
    return await User.findById(id)
  }
  async updateById(id, data) {
    return await User.updateById(
      id,
      data,
      {
        new: true,
        runValidators: true
      }
    )
  }
}

export default new UserRepository()
