import cors, { type CorsOptions } from 'cors'
import dayjs from 'dayjs'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'
import { config } from 'dotenv'
import express, { Router, type NextFunction, type Request, type Response } from 'express'
import passport from 'passport'
import path from 'path'
import { fileURLToPath } from 'url'
import { PgDBManager } from './database/DatabaseManager'
import { initRedisManager } from './database/RedisManager'
import { UserRoutes } from './routes/UserRoutes'
import { sendErrorResponse } from './util/Functions'
import { jwtStategy } from './util/Jwt'
import { localStrategy } from './util/Local'
import { logger } from './util/Logger'
import { BaseError } from './util/types/Error'

// dotenv 설정
config()

// timezone 설정
dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.tz.setDefault('Asia/Seoul')

const app = express()

// static file
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
export const parent = path.join(__dirname, 'public')

// 이미지 정적 파일 서빙
app.use(express.static(path.join(parent, 'images')))

// Middleware
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
const corsOption: CorsOptions = { origin: '*' }
app.use(cors(corsOption))
app.use(express.static(parent))

// passport 설정
passport.initialize()
passport.use('jwt', jwtStategy)
passport.use('local', localStrategy)

// API 라우팅

const apiRouter = Router()
// UserRoutes
UserRoutes(apiRouter)

app.use('/api', apiRouter)


// 에러 해들링
app.use(async (err: Error | BaseError, req: Request, res: Response, next: NextFunction) => {
  logger.error('Error:', err)

  if (err instanceof BaseError) {
    sendErrorResponse(res, err)
    return
  }

  if (req.url !== '/errorPage') {
    res.redirect('/errorPage')

  } else {
    // res.sendFile(path.join(parent, 'index.html'));

  }
})


app.listen(80, async () => {
  const manager = new PgDBManager()
  await manager.connect()
  await initRedisManager()
  logger.info('Server is running on port 80')
})  