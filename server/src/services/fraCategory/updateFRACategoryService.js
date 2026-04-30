import FRACategoryRepository from '../../repositories/FRACategoryRepository.js'

class UpdateFRACategoryService {
  async updateFRACategory(id, data) {
    const existing = await FRACategoryRepository.findById(id)
    if (!existing) throw new Error('Category not found')
    if (data.name && data.name.trim() === '') throw new Error('Category name cannot be empty')
    if (data.name) {
      const duplicate = await FRACategoryRepository.findByName(data.name)
      if (duplicate && duplicate._id.toString() !== id) throw new Error('Category name already exists')
    }
    return await FRACategoryRepository.update(id, data)
  }
}

export default new UpdateFRACategoryService()