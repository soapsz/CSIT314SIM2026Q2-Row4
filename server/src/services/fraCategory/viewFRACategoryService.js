import FRACategoryRepository from '../../repositories/FRACategoryRepository.js'

class ViewFRACategoryService {
  async viewFRACategory(id) {
    const category = await FRACategoryRepository.findById(id)
    if (!category) throw new Error('Category not found')
    return category
  }
}

export default new ViewFRACategoryService()