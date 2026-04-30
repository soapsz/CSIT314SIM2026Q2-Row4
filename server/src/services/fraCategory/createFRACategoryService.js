import FRACategoryRepository from '../../repositories/FRACategoryRepository.js'

class CreateFRACategoryService {
  async createFRACategory(data) {
    if (!data.name || data.name.trim() === '') throw new Error('Category name is required')
    const existing = await FRACategoryRepository.findByName(data.name)
    if (existing) throw new Error('Category name already exists')
    return await FRACategoryRepository.create(data)
  }
}

export default new CreateFRACategoryService()