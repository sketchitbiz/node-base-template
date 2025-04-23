export enum FileStatus {
  TEMP = 'TEMP',
  COMFIRMED = 'COMFIRMED',
  DELETED = 'DELETED'
}

export interface FileInfo {
  index: number

  originalName: string

  fileName: string

  filePath: string

  mimeType: string

  size: number

  status: FileStatus
}