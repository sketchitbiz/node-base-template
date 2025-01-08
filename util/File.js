import multer from "multer";
import * as fs from "node:fs";
import { existsSync, mkdirSync, unlink } from "node:fs";
import path from "node:path";
import { parent } from "../app.js";
import { logger } from "./Logger.js";

/**
 * 파일 저장한 디렉토리 존재 확인 및 생성
 * @param {string} filePath
 */
function ensureDirectoryExistence(filePath) {
  if (!existsSync(filePath)) {
    mkdirSync(filePath, { recursive: true });
  }
}

export async function deleteFile(file) {
  let filePath = path.join(parent, file);

  if (existsSync(filePath)) {
    unlink(filePath, err => {
      if (err) {
        logger.error("Error on Delete file: ", err);
      } else {
        logger.info("File deleted successfully");
      }
    });
  }
}

export const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      // 경로 지정
      let uploadPath = path.join(parent, 'tmp');
      uploadPath += path.join('images', file.fieldname);

      // 폴더 존재 확인
      ensureDirectoryExistence(uploadPath);

      // 업로드 경로 설정
      cb(null, uploadPath);
    },

    filename: (req, file, callback) => {
      file.originalname = decodeURIComponent(file.originalname);
      // 파일의 확장자 추출
      const ext = path.extname(file.originalname);
      // 파일명 생성
      const filename = file.fieldname + '_' + file.originalname;
      // 파일 확장자 지정
      //@ts-ignore
      file.ext = ext.substring(1);
      // 파일명 지정
      callback(null, filename);
    }
  }),
});

export const htmlFile = () => {
  return multer({
    storage: multer.diskStorage({
      //폴더위치저장
      destination: (req, file, callback) => {
        let uploadPath = parent + process.env.UPLOAD_PATH + '/htmlImg';
        // 폴더가 존재하지 않으면 생성
        ensureDirectoryExistence(uploadPath);
        callback(null, uploadPath);
      },
      //파일이름생
      filename: (req, files, done) => {
        let ext = path.extname(files.originalname);


        // let filename = req.body.file_nm[req.files.length-1];
        let filename = decodeURI(files.originalname);
        done(null, filename);
        //@ts-ignore
        req.files.at(req.files.length - 1).file_nm = files.originalname;
        //@ts-ignore
        req.files.at(req.files.length - 1).origin_file_nm = files.originalname;
        //@ts-ignore
        req.files.at(req.files.length - 1).ext = ext.substring(1);
      },
    }),
    // fileFilter : fileFilter,
    limits: {
      files: 10,
      fieldNameSize: 200,
      fieldSize: 1000 * 1000 * 1000,
      fileSize: 10 * 1000 * 1000 * 1000
    }
  });
};


/**
 * 임시 폴더에서 파일을 이동
 * @param {Express.Multer.File} file
 * @returns {boolean | Error}
 */
export function moveFile(file) {
  let oldPath = file.path;
  let newPath = path.join(parent, 'images', file.filename);

  /** @type {boolean | Error} */
  let result = false;
  fs.rename(oldPath, newPath, err => {
    if (err) {
      logger.error("Error on move file: ", err);
      result = err;
    } else {
      logger.info("File moved successfully");
      result = true;
    }
  });

  return result;
}
