import { size } from 'es-toolkit/compat'
import firebase from 'firebase-admin'
import jsonCofig from '../config/test.json' with { type: 'json' }
import { snakeToCamel } from './Functions'
import { logger } from './Logger'

const serviceConfig = snakeToCamel(jsonCofig)
firebase.initializeApp({ credential: firebase.credential.cert(serviceConfig) })

// 푸시 타입
// 푸시 타입에 따라 푸시 정보와 푸시 메시지를 결정하기 때문에 기획에 맞춰 푸시 타입을 추가해야 한다.
export const PushType = Object.freeze({
  USER: 1
})


/**
 * 푸시 전송
 * 
 * @param {Object} params 
 * @param {typeof PushType[keyof typeof PushType]} params.type 푸시 타입
 * @param {string} params.title 푸시 제목
 * @param {string} params.content 푸시 내용
 * @param {string[]} params.tokens 푸시 토큰
 */
export async function sendPush(params) {
  try {
    // 푸시 정보 저장할 객체
    let pushInfo = {}

    // 메시지생성
    /** @type {firebase.messaging.MulticastMessage} */
    const message = {
      data: {},
      notification: {},
      android: {
        notification: {
          sound: 'default',
          title: pushInfo.title,
          body: pushInfo.content,

        }
      },
      apns: {
        payload: {
          aps: {
            'mutable-content': 1,
            contentAvailable: true,
            sound: 'default'
          }
        },
      },

      webpush: {
        headers: { TTL: "86400" }
      },

      tokens: []
    }

    let tokens = []

    // 푸시 타입에 따라 푸시 정보 및 토큰 조회
    switch (params.type) {
      case PushType.USER:
        tokens = []
        break
    }


    // 토큰 중복 제거
    tokens = Array.from(new Set(tokens.map(token => token.deviceToken)))
    // 빈 토큰 제거
    tokens = tokens.filter(token => !!token)

    // 비어 있으면 푸시 전송 X
    if (size(tokens) === 0) {
      return
    }

    let pushResult
    if (size(tokens) > 500) {
      for (let i = 0; i < size(tokens); i += 500) {
        message.tokens = tokens.slice(i, i + 500)
        pushResult = await firebase.messaging().sendEachForMulticast(message)
      }
    } else {
      message.tokens = tokens
      pushResult = await firebase.messaging().sendEachForMulticast(message)
    }
    logger.info("Push Result: ", pushResult)

    // 푸시 이력 생성
  } catch (e) {
    logger.error('Error: ', e)
  }
}