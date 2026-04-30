import DonationRepository from '../../repositories/DonationRepository.js'
import FundraisingActivityRepository from '../../repositories/FundraisingActivityRepository.js'

class SearchDonationHistoryService {
  async searchDonationHistory(doneeId, filters = {}) {
    const donations = await DonationRepository.searchByDonee(doneeId, filters)

    const fras = donations.map(d => d.fra).filter(Boolean)
    const withProgress = await FundraisingActivityRepository._attachProgress(fras)

    const progressMap = {}
    withProgress.forEach(f => { progressMap[f._id.toString()] = f.totalRaised })

    return donations.map(d => {
      const plain = d.toObject ? d.toObject() : d
      if (plain.fra) plain.fra.totalRaised = progressMap[plain.fra._id.toString()] ?? 0
      return plain
    })
  }
}
export default new SearchDonationHistoryService()