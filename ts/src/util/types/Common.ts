import type { Dayjs } from 'dayjs'

export interface CreatedUpdateTime {
  createdTime: Dayjs
  updateTime: Dayjs | null
};

export interface CreatedUpdateId {
  createdId: string
  updateId: string | null
};

export interface CreateUpdateInfo extends CreatedUpdateTime, CreatedUpdateId {}

export type Yn = 'Y' | 'N'

export interface MetaData {}
export class PaginationMetaData implements MetaData {
  allCnt: number
  totalCnt: number
  page: number
  pageSize: number
  totalPage: number

  constructor(params: { allCnt: number, totalCnt: number, page: number, pageSize: number, totalPage: number }) {
    this.allCnt = params.allCnt
    this.totalCnt = params.totalCnt
    this.page = params.page
    this.pageSize = params.pageSize
    this.totalPage = params.totalPage
  }
}
