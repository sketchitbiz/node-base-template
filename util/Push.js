import { size } from 'es-toolkit/compat'
import firebase from 'firebase-admin'
import jsonCofig from '../config/test.json' with { type: 'json' }
import { snakeToCamel } from './Functions'
import { logger } from './Logger'

const serviceConfig = snakeToCamel(jsonCofig)
firebase.initializeApp({ credential: firebase.credential.cert(serviceConfig) })

// 푸시 타입

export async function sendPush(params) {
  try {
    let pushInfo = {} // 푸시 정보 조회하는 쿼리 실행

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

    // 토큰 조회
    let tokens = []

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