/**
 * Main Application Entry Point
 * 
 * This file serves as the entry point for the Heredot application, setting up:
 * - Express server configuration
 * - Middleware registration
 * - Route definitions
 * - Error handling
 * - Database connections
 * - Prometheus metrics collection
 */

import cors from 'cors'
import dayjs from 'dayjs'
import locale from 'dayjs/plugin/localeData.js'
import timezone from 'dayjs/plugin/timezone.js'
import utc from 'dayjs/plugin/utc.js'
import { config } from 'dotenv'
import express from 'express'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import passport from "passport"
import { collectDefaultMetrics, register } from 'prom-client'
import { PgDBManager } from './database/DatabaseManager.js'
import { UserRoutes } from "./routes/UserRoutes.js"
import { sendErrorResponse, sendResponse } from "./util/Functions.js"
import { jwtStrategy } from "./util/Jwt.js"
import { localStrategy } from './util/Local.js'
import { logger } from "./util/Logger.js"
import { BaseError } from "./util/types/Error.js"
import { ResponseData } from "./util/types/ResponseData.js"

// 개발 환경에 따라 환경 변수 설정
const env = process.env.NODE_ENV || 'local'
config({ path: `.env.${env}` })

// timezone 설정
// timezone config
dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.extend(locale)
dayjs.locale('ko')
dayjs.tz.setDefault('Asia/Seoul')

// 매트릭 수집기 생성
// metrics collector
collectDefaultMetrics()

// Express 앱 생성
// express app
const app = express()

// 메트릭 엔드포인트
// metrics endpoint
app.get('/metrics', async (req, res) => {
  try {
    res.set('Content-Type', register.contentType)
    res.end(await register.metrics())
  }
  catch (e) {
    res.status(500).end()
  }
})

// static file
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
export const parent = path.join(__dirname, 'public')

// 이미지 정적 파일 서빙
// static file serve
app.use(express.static(path.join(parent, 'images')))


// Middleware
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
/** @type {import('cors').CorsOptions} */
const corsOption = { origin: '*' }
app.use(cors(corsOption))
app.use(express.static(parent))

// passport 설정
// passport config
// jwt strategy and local(id/password) strategy
passport.initialize()
passport.use('jwt', jwtStrategy)
passport.use('local', localStrategy)

// 라우팅
// routing
const apiRouter = express.Router()

// 유저 라우트 등록
// register user routes
UserRoutes(apiRouter)
// use 'api' prefix for all routes
app.use('/api', apiRouter)

// 그외 정적 파일 서빙 ================================================================================
// serve other static files
app.get('/img/:path', async (req, res) => {
  let filePath = req.params['path']

  try {
    // !! Check the file path !!
    const file = readFileSync(path.join(parent, 'assets/assets/images', filePath))
    res.status(200).send(file)
  } catch (error) {
    sendResponse(res, ResponseData.noData())
  }
})

// 에러 페이지
// error page
app.get('/errorPage', (req, res) => {
  try {
    res.sendFile(path.join(parent, 'index.html'))
  } catch (e) {
    res.status(500).send('Internal Server Error')
  }
})

// Flutter 라우팅 ================================================================================
// serve Flutter index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(parent, 'index.html'))
})

// error handler
app.use((err, req, res, next) => {
  logger.error('Error:', err)

  if (err instanceof BaseError) {
    sendErrorResponse(res, err)
    return
  }

  // @ts-ignore
  if (req.url !== '/errorPage') {
    // @ts-ignore
    res.redirect('/errorPage')

  } else {
    // @ts-ignore
    res.sendFile(path.join(parent, 'index.html'))
  }
})

app.listen(80, async () => {
  // DB 연결
  new PgDBManager().connect()
  logger.info('Server is running on port 80')
})