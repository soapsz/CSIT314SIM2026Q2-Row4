import FundraisingActivityRepository from '../../repositories/FundraisingActivityRepository.js'

class GenerateWeeklyReportService {
  async generateWeeklyReport() {
    const today = new Date()
    const weekAgo = new Date(today)
    weekAgo.setDate(weekAgo.getDate() - 7)
    return await FundraisingActivityRepository.findByDateRange(weekAgo, today)
  }
}

export default new GenerateWeeklyReportService()