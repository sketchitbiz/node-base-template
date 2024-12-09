import cors from 'cors';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone.js';
import utc from 'dayjs/plugin/utc.js';
import { config } from 'dotenv';
import express from 'express';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { DatabaseManager } from "./database/DatabaseManager.js";
import { sendResponse } from "./util/Functions.js";
import { logger } from "./util/Logger.js";
import { ServerResponse } from "./util/types/ServerResponse.js";
import { UserRoutes } from "./routes/UserRoutes.js";
import { errorHandlingMiddleware } from "./util/Middlewares.js";

// dotenv 설정
config();

// timezone 설정
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault('Asia/Seoul');

const app = express();

// static file
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export const parent = path.join(__dirname, 'public');

// 이미지 정적 파일 서빙
app.use(express.static(path.join(parent, 'images')));


// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended : true }));
/** @type {import('cors').CorsOptions} */
const corsOption = { origin : '*' };
app.use(cors(corsOption));
app.use(express.static(parent));

// 라우팅
const apiRouter = express.Router();
new UserRoutes(apiRouter);
app.use('/api', apiRouter);


// Flutter 라우팅 ================================================================================
app.get('*', (req, res) => {
  res.sendFile(path.join(parent, 'index.html'));
});

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
  res.sendFile(path.join(parent, 'index.html'));
});

// 에러 핸들러
app.use(errorHandlingMiddleware);

app.listen(80, async () => {
  await DatabaseManager.instance.connect();
  logger.info('Server is running on port 80');
});