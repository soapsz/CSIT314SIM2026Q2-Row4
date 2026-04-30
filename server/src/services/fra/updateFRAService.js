import FundraisingActivityRepository from '../../repositories/FundraisingActivityRepository.js'
import FRACategoryRepository from '../../repositories/FRACategoryRepository.js'

class UpdateFRAService {
  async updateFRA(id, data, userId) {
    const fra = await FundraisingActivityRepository.findById(id)
    if (!fra) throw new Error('Fundraising activity not found')
    if (fra.createdBy._id.toString() !== userId) throw new Error('Unauthorized')
    if (data.title !== undefined && data.title.trim() === '') throw new Error('Title cannot be empty')
    if (data.targetAmount && data.targetAmount <= 0) throw new Error('Target amount must be greater than 0')

    if (data.category) {
      const category = await FRACategoryRepository.findById(data.category)
      if (!category) throw new Error('Category not found')
      if (!category.isActive) throw new Error('Category is suspended')
    }

    return await FundraisingActivityRepository.update(id, data)
  }
}

export default new UpdateFRAService()