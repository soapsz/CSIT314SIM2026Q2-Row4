import FundraisingActivityRepository from '../../repositories/FundraisingActivityRepository.js'

class ViewFRAViewCountService {
  async viewFRAViewCount(id, userId) {
    const fra = await FundraisingActivityRepository.findById(id)
    if (!fra) throw new Error('Fundraising activity not found')
    return await FundraisingActivityRepository.incrementViewCount(id, userId)
  }
}
export default new ViewFRAViewCountService()