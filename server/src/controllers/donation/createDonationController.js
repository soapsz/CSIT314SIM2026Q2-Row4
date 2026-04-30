import CreateDonationService from '../../services/donation/createDonationService.js'

class CreateDonationController {
  async createDonation(req, res) {
    try {
      const { fraId, amount } = req.body
      if (!fraId || !amount)
        return res.status(400).json({ success: false, message: 'fraId and amount are required' })

      const donation = await CreateDonationService.createDonation(
        req.user._id.toString(),
        { fraId, amount: Number(amount) }
      )
      res.status(201).json({ success: true, data: donation })
    } catch (error) {
      res.status(500).json({ success: false, message: error.message })
    }
  }
}
export default new CreateDonationController()