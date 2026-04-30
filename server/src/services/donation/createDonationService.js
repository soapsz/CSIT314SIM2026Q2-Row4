import DonationRepository from '../../repositories/DonationRepository.js'
import FundraisingActivityRepository from '../../repositories/FundraisingActivityRepository.js'

class CreateDonationService {
  async createDonation(doneeId, { fraId, amount }) {
    const fra = await FundraisingActivityRepository.findById(fraId)
    if (!fra) throw new Error('Campaign not found')
    if (fra.status !== 'active') throw new Error('Campaign is not active')

    return await DonationRepository.create({
      donee: doneeId,
      fra: fraId,
      amount,
      category: fra.category?._id ?? fra.category ?? null,
    })
  }
}
export default new CreateDonationService()