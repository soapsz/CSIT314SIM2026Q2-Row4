import FRACategory from '../models/FRACategory.js'

class FRACategoryRepository {
  async create(data) {
    const category = new FRACategory(data)
    return await category.save()
  }

  async findById(id) {
    return await FRACategory.findById(id)
  }

  async findAll() {
    return await FRACategory.find()
  }

  async update(id, data) {
    return await FRACategory.findByIdAndUpdate(id, data, { returnDocument: 'after' })
  }

  async toggleSuspend(id) {
    const category = await FRACategory.findById(id)
    if (!category) return null
    return await FRACategory.findByIdAndUpdate(
      id,
      { isActive: !category.isActive },
      { returnDocument: 'after' }
    )
  }

  async search(query) {
    return await FRACategory.find({
      name: { $regex: query, $options: 'i' }
    })
  }

  async findByName(name) {
    return await FRACategory.findOne({ name })
  }
}

export default new FRACategoryRepository()