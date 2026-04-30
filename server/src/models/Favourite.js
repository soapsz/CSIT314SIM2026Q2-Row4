import mongoose from 'mongoose'

const favouriteSchema = new mongoose.Schema({
  donee: { type: mongoose.Schema.Types.ObjectId, ref: 'UserAccount', required: true },
  fra: { type: mongoose.Schema.Types.ObjectId, ref: 'FundraisingActivity', required: true }
}, { timestamps: true })

export default mongoose.model('Favourite', favouriteSchema)