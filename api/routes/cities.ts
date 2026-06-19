import { Router, type Request, type Response } from 'express'
import { CITIES } from '../data/cities.js'

const router = Router()

router.get('/', (_req: Request, res: Response): void => {
  res.status(200).json({ cities: CITIES })
})

export default router
