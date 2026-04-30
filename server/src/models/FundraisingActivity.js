import mongoose from 'mongoose'

const fundraisingActivitySchema = new mongoose.Schema({
  title:          { type: String, required: true, trim: true },
  description:    { type: String, trim: true },
  targetAmount:   { type: Number, required: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'FRACategory', default: null },
  status:         { type: String, enum: ['active', 'suspended', 'completed'], default: 'active' },
  createdBy:      { type: mongoose.Schema.Types.ObjectId, ref: 'UserAccount', required: true },
  viewCount:      { type: Number, default: 0 },
  shortlistCount: { type: Number, default: 0 },
  viewedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'UserAccount' }],
  completedAt:    { type: Date },
}, { timestamps: true })

export default mongoose.model('FundraisingActivity', fundraisingActivitySchema)