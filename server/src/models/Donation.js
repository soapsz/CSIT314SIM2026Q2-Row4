import mongoose from 'mongoose'

const donationSchema = new mongoose.Schema({
  donee:    { type: mongoose.Schema.Types.ObjectId, ref: 'UserAccount',          required: true },
  fra:      { type: mongoose.Schema.Types.ObjectId, ref: 'FundraisingActivity',  required: true },
  amount:   { type: Number, required: true, min: 1 },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'FRACategory', default: null },
  donatedAt:{ type: Date, default: Date.now },
}, { timestamps: true })

export default mongoose.model('Donation', donationSchema)