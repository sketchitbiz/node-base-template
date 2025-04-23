import { parent } from '@/app'
import type { FileInfo } from '@/modules/file/model/FileInfo'
import fs from 'fs/promises'
import multer from 'multer'
import path from 'path'
import { logger } from './Logger'

/**
 * 파일 삭제
 * @param filePath - 파일 경로
 */
export async function deleteFile(filePath: string) {
  if (!fs.access(filePath)) {
    logger.error(`File not found: ${filePath}`)
    return
  }

  await fs.unlink(filePath)
}

/**
 * 디렉토리 존재 확인 및 생성
 * @param filePath - 파일 경로
 */
async function ensureDirectoryExist(filePath: string) {
  if (!fs.access(filePath)) {
    await fs.mkdir(filePath, { recursive: true })
  }
}

export const uploadFile = multer({
  storage: multer.diskStorage({
    destination: async (req, file, cb) => {
      // Set Path
      let uploadPath = path.join(parent, 'tmp')

      // Ensure Directory Exist
      await ensureDirectoryExist(uploadPath)

      // Set Path
      cb(null, uploadPath)
    },
    filename: (req, file, cb) => {
      file.originalname = decodeURIComponent(file.originalname)
      // extract file extension
      const ext = path.extname(file.originalname)
      // repplace spaces with underscores
      let filename = file.originalname.replace(/\s+/g, '_')
      // set filename
      filename = file.fieldname + '_' + filename + ext

      cb(null, filename)
    }
  })
})

export const htmlFile = multer({
  storage: multer.diskStorage({
    destination: async (req, file, cb) => {
      let uploadPath = parent + process.env['UPLOAD_PATH'] + '/htmlImg'

      // Ensure Directory Exist
      await ensureDirectoryExist(uploadPath)

      // Set Path
      cb(null, uploadPath)
    },
    filename: (req, file, cb) => {
      let ext = path.extname(file.originalname)
      let filename = path.basename(file.originalname, ext).replace(/\s+/g, '_')
      filename = filename + ext
      filename = decodeURI(filename)
      cb(null, filename)
    }
  }),
  limits: {
    files: 10,
    fieldNameSize: 200,
    fieldSize: 1024 * 1024 * 1024,
    fileSize: 10 * 1000 * 1000 * 1000
  }
})

enum PathConstants {
  TEMP_DIR = '/tmp',
  FINAL_DIR = '/final'
}

export async function moveFile(file: FileInfo) {
  let oldPath = path.join(parent, file.filePath)
  let newPath = oldPath.replace(PathConstants.TEMP_DIR, PathConstants.FINAL_DIR)

  try {
    const targetDir = path.dirname(newPath)
    await fs.mkdir(targetDir, { recursive: true })

    // 대상 경로에 이미 존재하는 경우 로그만 남기고 진행
    const fileExists = await fs.access(newPath).then(() => true).catch(() => false)

    if (fileExists) {
      logger.warn(`File already exists: ${newPath}`)
      return file
    }

    await fs.rename(oldPath, newPath)
    logger.info(`File moved: ${oldPath} -> ${newPath}`)

    file.filePath = file.filePath.replace(PathConstants.TEMP_DIR, PathConstants.FINAL_DIR)
    return file


  } catch (error) {
    logger.error(`Failed to move file: ${file.originalName}`)
    throw error
  }
}
