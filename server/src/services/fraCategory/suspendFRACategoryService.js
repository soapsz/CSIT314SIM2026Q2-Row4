import FRACategoryRepository from '../../repositories/FRACategoryRepository.js'

class SuspendFRACategoryService {
  async suspendFRACategory(id) {
    const category = await FRACategoryRepository.toggleSuspend(id)
    if (!category) throw new Error('Category not found')
    return category
  }
}

export default new SuspendFRACategoryService()