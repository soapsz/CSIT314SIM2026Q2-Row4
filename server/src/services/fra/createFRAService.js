import FundraisingActivityRepository from '../../repositories/FundraisingActivityRepository.js'
import FRACategoryRepository from '../../repositories/FRACategoryRepository.js'

class CreateFRAService {
  async createFRA(data, userId) {
    if (!data.title || data.title.trim() === '') throw new Error('Title is required')
    if (!data.targetAmount || data.targetAmount <= 0) throw new Error('Target amount must be greater than 0')

    if (data.category) {
      const category = await FRACategoryRepository.findById(data.category)
      if (!category) throw new Error('Category not found')
      if (!category.isActive) throw new Error('Category is suspended')
    }

    return await FundraisingActivityRepository.create({ ...data, createdBy: userId })
  }
}

export default new CreateFRAService()