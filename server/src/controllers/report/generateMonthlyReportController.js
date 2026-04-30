import GenerateMonthlyReportService from '../../services/report/generateMonthlyReportService.js'

class GenerateMonthlyReportController {
  async generateMonthlyReport(req, res) {
    try {
      const report = await GenerateMonthlyReportService.generateMonthlyReport()
      res.status(200).json({ success: true, data: report })
    } catch (error) {
      res.status(500).json({ success: false, message: error.message })
    }
  }
}

export default new GenerateMonthlyReportController()