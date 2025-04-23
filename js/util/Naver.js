import { createHmac, randomInt } from 'crypto'
import dotenv from 'dotenv'
import axios from 'node_modules/axios'
import dayjs from 'node_modules/dayjs'
import { logger } from './Logger'
import { InternalServerError } from './types/Error'
import { ResponseMessage } from './types/ResponseMessage'

dotenv.config({ path: `../.env.${process.env.NODE_ENV}` })

const { SMS_URL, SERVICE_ID, ACCESS_KEY, SECRET_KEY, CALLER } = process.env

function makeSignature() {
  const space = " "
  const newLine = "\n"
  const method = "POST"
  const url = "/sms/v2/services/" + SERVICE_ID + "/messages"
  const timestamp = dayjs().valueOf().toString()

  const hmac = createHmac('sha256', SECRET_KEY)
  hmac.update(method)
  hmac.update(space)
  hmac.update(url)
  hmac.update(newLine)
  hmac.update(timestamp.toString())
  hmac.update(newLine)
  hmac.update(ACCESS_KEY)

  return hmac.digest("base64")
}


/**
 * 인증번호 생성
 */
function generateAuthNum() {
  return randomInt(100000, 999999)
}

/**
 * 문자 발송
 * @param {string} cellphone
 */
export async function sendSMS(cellphone) {
  const authNum = generateAuthNum()
  const headers = {
    'Content-Type': 'application/json; charset=utf-8',
    'x-ncp-apigw-timestamp': Date.now(),
    'x-ncp-iam-access-key': ACCESS_KEY,
    'x-ncp-apigw-signature-v2': makeSignature()
  }

  /** @type {SMSRequest} */
  const body = {
    type: 'SMS',
    contentType: 'COMM',
    countryCode: '82',
    from: CALLER,
    content: `[리블링] 인증번호는 ${authNum}입니다.`,
    messages: [
      {
        to: cellphone,
        content: `[리블링] 인증번호는 ${authNum}입니다.`,
      }
    ]
  }

  try {
    const response = await axios.post(SMS_URL + '/services/' + SERVICE_ID + '/messages', body, { headers })
    /** @type {NaverResponse} */
    let data = response.data

    if (data.statusCode > 300) {
      logger.error(data)
      throw new InternalServerError({ message: ResponseMessage.fail, customMessage: "문자 전송 실패" })
    }

    //TODO: 인증정보 저장

  }
  catch (error) {
    logger.error(error)
    throw new InternalServerError({ message: ResponseMessage.fail, customMessage: "문자 전송 실패" })
  }
}



/**
 * @typedef {Object} SMSRequest
 * @property {'SMS' | 'LMS' | 'MMS'} type
 * @property {'COMM' | 'AD'} contentType
 * @property {string} countryCode
 * @property {string} from
 * @property {string | null} [subject]
 * @property {string} content
 * @property {NaverMessage[]} messages
 * @property {NaverFile[]} [files]
 * @property {string|null} [reserveTime]
 * @property {string|null} [reserveTimeZone]
 */

/**
 * @typedef {Object} NaverMessage
 * @property {string} to
 * @property {string | null} [subject]
 * @property {string} content
 */

/**
 * @typedef {Object} NaverFile
 * @property {any} file
 * @property {string} fileId
 */


/**
 * @typedef {Object} NaverResponse
 * @property {number} statusCode
 * @property {string} statusName
 * @property {string} requestId
 * @property {string} requestTime
 * @property {NaverMessage[]}  messages
 */
