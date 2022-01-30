import {Router} from 'express'
import { signup, login, logout, current, updateUser, uploadAvatar, verifyUser, repeatEmailForVerifyUser } from '../../../controllers/auth'
import guard from '../../../middlewares/guard'
import {upload} from '../../../middlewares/upload'


import { validateUser } from './validation'

const router = new Router()


router.post('/signup', validateUser, signup)
router.post('/login', validateUser, login)
router.get('/logout', guard, logout)
router.get('/current', guard, current)
router.patch('/', guard, updateUser)
router.patch('/avatar', guard, upload.single('avatar'), uploadAvatar)
router.get('/verify/:verificationToken',verifyUser)
router.post('/verify', repeatEmailForVerifyUser)

export default router
