import express from 'express'
import SaveFavouriteController from '../controllers/favourite/saveFavouriteController.js'
import ViewFavouriteController from '../controllers/favourite/viewFavouriteController.js'
import SearchFavouriteController from '../controllers/favourite/searchFavouriteController.js'
import RemoveFavouriteController from '../controllers/favourite/removeFavouriteController.js'

import { requireAuth, requirePermission } from '../middleware/authMiddleware.js'

const router = express.Router()

router.get('/search', requireAuth, requirePermission('donating'), (req, res) => SearchFavouriteController.searchFavourite(req, res))
router.post('/:id', requireAuth, requirePermission('donating'), (req, res) => SaveFavouriteController.saveFavourite(req, res))
router.delete('/:id', requireAuth, requirePermission('donating'), (req, res) => RemoveFavouriteController.removeFavourite(req, res))
router.get('/', requireAuth, requirePermission('donating'), (req, res) => ViewFavouriteController.viewFavourite(req, res))

export default router