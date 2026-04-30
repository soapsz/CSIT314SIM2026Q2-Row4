import FundraisingActivityRepository from '../../repositories/FundraisingActivityRepository.js'
 
class SearchFRAHistoryService {
  async searchFRAHistory(query) {
    if (!query || query.trim() === '') throw new Error('Search query is required')
    return await FundraisingActivityRepository.searchAll(query)
  }
}
 
export default new SearchFRAHistoryService()