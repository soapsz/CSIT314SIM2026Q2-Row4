import '../models/UserAccount.js'
import mongoose from 'mongoose'
import FundraisingActivity from '../models/FundraisingActivity.js'
import Donation from '../models/Donation.js'

class FundraisingActivityRepository {

  async _attachProgress(fras) {
    if (!fras || fras.length === 0) return fras

    const ids = fras.map(f => f._id)

    const totals = await Donation.aggregate([
      { $match: { fra: { $in: ids } } },
      { $group: { _id: '$fra', totalRaised: { $sum: '$amount' } } },
    ])

    const map = {}
    totals.forEach(t => { map[t._id.toString()] = t.totalRaised })

    return fras.map(f => {
      const plain       = f.toObject ? f.toObject() : f
      plain.totalRaised = map[plain._id.toString()] ?? 0
      return plain
    })
  }

  async create(data) {
    const fra = new FundraisingActivity(data)
    return await fra.save()
  }

  async update(id, data) {
    return await FundraisingActivity
      .findByIdAndUpdate(id, data, { returnDocument: 'after' })
      .populate('category')
  }

  async toggleSuspend(id) {
    const fra = await FundraisingActivity.findById(id)
    if (!fra) return null
    const newStatus = fra.status === 'active' ? 'suspended' : 'active'
    return await FundraisingActivity
      .findByIdAndUpdate(id, { status: newStatus }, { returnDocument: 'after' })
      .populate('category')
  }

  async complete(id) {
    return await FundraisingActivity
      .findByIdAndUpdate(id, { status: 'completed', completedAt: new Date() }, { returnDocument: 'after' })
      .populate('category')
  }

  async incrementViewCount(id, userId) {
    return await FundraisingActivity.findOneAndUpdate(
      { _id: id, viewedBy: { $nin: [userId] }, createdBy: { $ne: userId } },
      { $inc: { viewCount: 1 }, $addToSet: { viewedBy: userId } },
      { new: true }
    )
  }

  async incrementShortlistCount(id) {
    return await FundraisingActivity
      .findByIdAndUpdate(id, { $inc: { shortlistCount: 1 } }, { returnDocument: 'after' })
  }

  async decrementShortlistCount(id) {
    return await FundraisingActivity.findByIdAndUpdate(
      id,
      { $inc: { shortlistCount: -1 } },
      { returnDocument: 'after' }
    )
  }

  async findById(id) {
    const fra = await FundraisingActivity
      .findById(id)
      .populate('createdBy')
      .populate('category')

    if (!fra) return null
    const [result] = await this._attachProgress([fra])
    return result
  }

  async findAllByUser(userId) {
    const fras = await FundraisingActivity
      .find({ createdBy: userId })
      .populate('category')
    return this._attachProgress(fras)
  }

  async findAllActive() {
    const fras = await FundraisingActivity
      .find({ status: 'active' })
      .populate('createdBy')
      .populate('category')
    return this._attachProgress(fras)
  }

  async findCompletedByUser(userId, filters = {}) {
    const match = { createdBy: userId, status: 'completed' }

    if (filters.category && mongoose.Types.ObjectId.isValid(filters.category)) {
      match.category = new mongoose.Types.ObjectId(filters.category)
    }
    if (filters.from) match.completedAt = { ...match.completedAt, $gte: new Date(filters.from) }
    if (filters.to)   match.completedAt = { ...match.completedAt, $lte: new Date(filters.to) }

    const fras = await FundraisingActivity.find(match).populate('category')
    return this._attachProgress(fras)
  }

  async findAllCompleted(filters = {}) {
    const match = { status: 'completed' }
    if (filters.category && mongoose.Types.ObjectId.isValid(filters.category)) {
      match.category = new mongoose.Types.ObjectId(filters.category)
    }
    if (filters.from) match.completedAt = { ...match.completedAt, $gte: new Date(filters.from) }
    if (filters.to)   match.completedAt = { ...match.completedAt, $lte: new Date(filters.to) }

    const fras = await FundraisingActivity.find(match)
      .populate('createdBy')
      .populate('category')
    return this._attachProgress(fras)
  }

  async searchByUser(userId, query) {
    const fras = await FundraisingActivity.find({
      createdBy: userId,
      title: { $regex: query, $options: 'i' },
    }).populate('category')
    return this._attachProgress(fras)
  }

  async searchAll(query) {
    const fras = await FundraisingActivity.find({
      status: 'active',
      title: { $regex: query, $options: 'i' },
    })
      .populate('createdBy')
      .populate('category')
    return this._attachProgress(fras)
  }

  async findByDateRange(from, to) {
    const fras = await FundraisingActivity.find({
      createdAt: { $gte: from, $lte: to },
    })
      .populate('createdBy')
      .populate('category')
    return this._attachProgress(fras)
  }
}

export default new FundraisingActivityRepository()