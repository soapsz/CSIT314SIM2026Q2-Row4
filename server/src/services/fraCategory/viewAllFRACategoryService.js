import FRACategoryRepository from '../../repositories/FRACategoryRepository.js'

class ViewAllFRACategoryService {
  async viewAllFRACategory() {
    return await FRACategoryRepository.findAll()
  }
}

export default new ViewAllFRACategoryService()