import FundraisingActivityRepository from '../../repositories/FundraisingActivityRepository.js'

class GenerateMonthlyReportService {
  async generateMonthlyReport() {
    const today = new Date()
    const monthAgo = new Date(today)
    monthAgo.setMonth(monthAgo.getMonth() - 1)
    return await FundraisingActivityRepository.findByDateRange(monthAgo, today)
  }
}

export default new GenerateMonthlyReportService()