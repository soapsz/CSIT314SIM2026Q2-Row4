import mongoose from 'mongoose'
import Donation from '../models/Donation.js'

class DonationRepository {
  async create(data) {
    const donation = new Donation(data)
    return await donation.save()
  }

  async findByDonee(doneeId) {
    return await Donation.find({ donee: doneeId }).populate('fra')
  }

  async searchByDonee(doneeId, filters = {}) {
    const match = { donee: new mongoose.Types.ObjectId(doneeId) }
    if (filters.category) match.category = new mongoose.Types.ObjectId(filters.category)
    if (filters.from) match.donatedAt = { ...match.donatedAt, $gte: new Date(filters.from) }
    if (filters.to) match.donatedAt = { ...match.donatedAt, $lte: new Date(filters.to) }
    return await Donation.find(match).populate('fra')
  }
}

export default new DonationRepository()