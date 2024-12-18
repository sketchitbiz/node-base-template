import cors from 'cors';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone.js';
import utc from 'dayjs/plugin/utc.js';
import { config } from 'dotenv';
import express from 'express';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import passport from "passport";
import { collectDefaultMetrics, register } from 'prom-client';
import { DatabaseManager } from "./database/DatabaseManager.js";
import { RedisManager } from './database/RedisManager.js';
import { UserRoutes } from "./routes/UserRoutes.js";
import { sendErrorResponse, sendResponse } from "./util/Functions.js";
import { jwtStrategy } from "./util/Jwt.js";
import { logger } from "./util/Logger.js";
import { BaseError } from "./util/types/Error.js";
import { ServerResponse } from "./util/types/ServerResponse.js";

// dotenv 설정
config();

// timezone 설정
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault('Asia/Seoul');

// 매트릭 수집기 생성
collectDefaultMetrics();

// Express 앱 생성
const app = express();

// 메트릭 엔드포인트
app.get('/metrics', async (req, res) => {
  try {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  }
  catch (e) {
    res.status(500).end();
  }
});

// static file
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export const parent = path.join(__dirname, 'public');

// 이미지 정적 파일 서빙
app.use(express.static(path.join(parent, 'images')));


// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
/** @type {import('cors').CorsOptions} */
const corsOption = { origin: '*' };
app.use(cors(corsOption));
app.use(express.static(parent));

// passport 설정
passport.initialize();
passport.use('jwt', jwtStrategy);

// 라우팅
const apiRouter = express.Router();
new UserRoutes(apiRouter);
app.use('/api', apiRouter);

// 그외 정적 파일 서빙 ================================================================================
app.get('/img/:path', async (req, res) => {
  let filePath = req.params['path'];

  try {
    const file = readFileSync(path.join(parent, 'assets/assets/images', filePath));
    res.status(200).send(file);
  } catch (error) {
    sendResponse(res, ServerResponse.noData());
  }
});

// 에러 페이지
app.get('/errorPage', (req, res) => {
  try {
    res.sendFile(path.join(parent, 'index.html'));
  } catch (e) {
    res.status(500).send('Internal Server Error');
  }
});

// Flutter 라우팅 ================================================================================
app.get('*', (req, res) => {
  res.sendFile(path.join(parent, 'index.html'));
});


app.use((err, req, res) => {
  logger.error('Error:', err);

  if (err instanceof BaseError) {
    sendErrorResponse(res, err);
    return;
  }

  if (req.url !== '/errorPage') {
    res.redirect('/errorPage');

  } else {
    res.sendFile(path.join(parent, 'index.html'));
  }
});

app.listen(80, async () => {
  await DatabaseManager.instance.connect();
  RedisManager.getInstance();
  logger.info('Server is running on port 80');
});