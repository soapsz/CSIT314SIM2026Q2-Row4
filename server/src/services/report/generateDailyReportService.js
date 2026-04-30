import FundraisingActivityRepository from '../../repositories/FundraisingActivityRepository.js'

class GenerateDailyReportService {
  async generateDailyReport() {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    return await FundraisingActivityRepository.findByDateRange(today, tomorrow)
  }
}

export default new GenerateDailyReportService()