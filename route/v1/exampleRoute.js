import express from 'express'
import {
  add,
  list,
  detail,
  update,
  remove,
  removeFile,
  createReport,
} from '../../controller/exampleController.js'
import { auth, isAdmin, isPublic } from '../../middleware/authMiddleware.js'

const router = express.Router()

router.post('/add', add)
router.get('/list', isPublic, list)
router.get('/report/create', isPublic, createReport)
router.get('/detail/:example_id', detail)
router.put('/update/:example_id', update)
router.delete('/delete/:example_id', remove)
router.delete('/delete/file/:file_id', removeFile)

export default router
