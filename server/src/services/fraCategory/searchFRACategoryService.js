import FRACategoryRepository from '../../repositories/FRACategoryRepository.js'

class SearchFRACategoryService {
  async searchFRACategory(query) {
    if (!query || query.trim() === '') return await FRACategoryRepository.findAll()
    return await FRACategoryRepository.search(query)
  }
}

export default new SearchFRACategoryService()