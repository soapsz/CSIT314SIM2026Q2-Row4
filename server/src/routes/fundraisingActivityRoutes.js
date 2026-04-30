import express from 'express'
import CreateFRAController from '../controllers/fra/createFRAController.js'
import ViewMyFRAController from '../controllers/fra/viewMyFRAController.js'
import ViewFRAController from '../controllers/fra/viewFRAController.js'
import ViewAllActiveFRAController from '../controllers/fra/viewAllActiveFRAController.js'
import ViewCompletedFRAController from '../controllers/fra/viewCompletedFRAController.js'
import UpdateFRAController from '../controllers/fra/updateFRAController.js'
import SuspendFRAController from '../controllers/fra/suspendFRAController.js'
import CompleteFRAController from '../controllers/fra/completeFRAController.js'
import SearchFRAController from '../controllers/fra/searchFRAController.js'
import SearchFRAHistoryController from '../controllers/fra/searchFRAHistoryController.js'
import ViewFRAViewCountController from '../controllers/fra/viewFRAViewCountController.js'
import { requireAuth, requirePermission } from '../middleware/authMiddleware.js'
import SearchDonationHistoryController from '../controllers/donation/searchDonationHistoryController.js'
import CreateDonationController from '../controllers/donation/createDonationController.js'
import ViewAllCompletedFRAController from '../controllers/fra/viewAllCompletedFRAController.js'

const router = express.Router()

router.post('/', requireAuth, requirePermission('fundraising'), (req, res) => CreateFRAController.createFRA(req, res))
router.get('/mine', requireAuth, requirePermission('fundraising'), (req, res) => ViewMyFRAController.viewMyFRA(req, res))
router.get('/search', requireAuth, requirePermission('fundraising'), (req, res) => SearchFRAController.searchFRA(req, res))
router.get('/completed', requireAuth, requirePermission('fundraising'), (req, res) => ViewCompletedFRAController.viewCompletedFRA(req, res))
router.get('/all', requireAuth, requirePermission('donating', 'fundraising'), (req, res) => ViewAllActiveFRAController.viewAllActiveFRA(req, res))
router.get('/all/completed', requireAuth, requirePermission('donating', 'fundraising'), (req, res) => ViewAllCompletedFRAController.viewAllCompletedFRA(req, res))
router.get('/all/search', requireAuth, requirePermission('donating', 'fundraising'), (req, res) => SearchFRAHistoryController.searchFRAHistory(req, res))
router.post('/donations', requireAuth, requirePermission('donating'), (req, res) => CreateDonationController.createDonation(req, res))
router.get('/donations', requireAuth, requirePermission('donating'), (req, res) => SearchDonationHistoryController.searchDonationHistory(req, res))
router.patch('/:id/complete', requireAuth, requirePermission('fundraising'), (req, res) => CompleteFRAController.completeFRA(req, res))
router.post('/:id/view', requireAuth, requirePermission('donating', 'fundraising'), (req, res) => ViewFRAViewCountController.viewFRAViewCount(req, res))
router.get('/:id', requireAuth, requirePermission('fundraising','donating'), (req, res) => ViewFRAController.viewFRA(req, res))
router.put('/:id', requireAuth, requirePermission('fundraising'), (req, res) => UpdateFRAController.updateFRA(req, res))
router.patch('/:id/suspend', requireAuth, requirePermission('fundraising'), (req, res) => SuspendFRAController.suspendFRA(req, res))

export default router