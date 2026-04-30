import FundraisingActivityRepository from '../../repositories/FundraisingActivityRepository.js'

class ViewAllCompletedFRAService {
  async viewAllCompletedFRA(filters) {
    return await FundraisingActivityRepository.findAllCompleted(filters)
  }
}
export default new ViewAllCompletedFRAService()