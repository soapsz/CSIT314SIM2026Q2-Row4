import GenerateWeeklyReportService from '../../services/report/generateWeeklyReportService.js'

class GenerateWeeklyReportController {
  async generateWeeklyReport(req, res) {
    try {
      const report = await GenerateWeeklyReportService.generateWeeklyReport()
      res.status(200).json({ success: true, data: report })
    } catch (error) {
      res.status(500).json({ success: false, message: error.message })
    }
  }
}

export default new GenerateWeeklyReportController()