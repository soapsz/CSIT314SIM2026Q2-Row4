import express from 'express'
import GenerateDailyReportController from '../controllers/report/generateDailyReportController.js'
import GenerateWeeklyReportController from '../controllers/report/generateWeeklyReportController.js'
import GenerateMonthlyReportController from '../controllers/report/generateMonthlyReportController.js'
import { requireAuth, requirePermission } from '../middleware/authMiddleware.js'

const router = express.Router()

router.get('/daily', requireAuth, requirePermission('platform_management'), (req, res) => GenerateDailyReportController.generateDailyReport(req, res))
router.get('/weekly', requireAuth, requirePermission('platform_management'), (req, res) => GenerateWeeklyReportController.generateWeeklyReport(req, res))
router.get('/monthly', requireAuth, requirePermission('platform_management'), (req, res) => GenerateMonthlyReportController.generateMonthlyReport(req, res))

export default router