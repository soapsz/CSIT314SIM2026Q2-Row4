import express from 'express'
import CreateFRACategoryController from '../controllers/fraCategory/createFRACategoryController.js'
import ViewFRACategoryController from '../controllers/fraCategory/viewFRACategoryController.js'
import ViewAllFRACategoryController from '../controllers/fraCategory/viewAllFRACategoryController.js'
import UpdateFRACategoryController from '../controllers/fraCategory/updateFRACategoryController.js'
import SuspendFRACategoryController from '../controllers/fraCategory/suspendFRACategoryController.js'
import SearchFRACategoryController from '../controllers/fraCategory/searchFRACategoryController.js'
import { requireAuth, requirePermission } from '../middleware/authMiddleware.js'

const router = express.Router()

router.post('/', requireAuth, requirePermission('platform_management'), (req, res) => CreateFRACategoryController.createFRACategory(req, res))
router.get('/search', requireAuth, requirePermission('platform_management'), (req, res) => SearchFRACategoryController.searchFRACategory(req, res))
router.get('/', requireAuth, requirePermission('platform_management'), (req, res) => ViewAllFRACategoryController.viewAllFRACategory(req, res))
router.get('/:id', requireAuth, requirePermission('platform_management'), (req, res) => ViewFRACategoryController.viewFRACategory(req, res))
router.put('/:id', requireAuth, requirePermission('platform_management'), (req, res) => UpdateFRACategoryController.updateFRACategory(req, res))
router.patch('/:id/suspend', requireAuth, requirePermission('platform_management'), (req, res) => SuspendFRACategoryController.suspendFRACategory(req, res))

export default router