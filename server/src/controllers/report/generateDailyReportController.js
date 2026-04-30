import GenerateDailyReportService from '../../services/report/generateDailyReportService.js'

class GenerateDailyReportController {
  async generateDailyReport(req, res) {
    try {
      const report = await GenerateDailyReportService.generateDailyReport()
      res.status(200).json({ success: true, data: report })
    } catch (error) {
      res.status(500).json({ success: false, message: error.message })
    }
  }
}

export default new GenerateDailyReportController()