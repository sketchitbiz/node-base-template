import { size } from 'es-toolkit/compat'
import firebase from 'firebase-admin'
import type { MulticastMessage } from 'firebase-admin/lib/messaging/messaging-api'
import jsonConfig from '../../config/test.json' with { type: 'json' }
import { snakeToCamel } from './Functions'
import { logger } from './Logger'

const serviceConfig = snakeToCamel(jsonConfig)
firebase.initializeApp({ credential: firebase.credential.cert(serviceConfig) })

export async function sendPush() {
  try {
    const message: MulticastMessage = {
      data: { clickAction: 'FLUTTER_NOTIFICATION_CLICK', keyId: 'KEY_ID' },
      android: { notification: { sound: 'default' } },
      apns: { payload: { aps: { 'mutable-content': 1, contentAvailable: true, sound: 'default' } } },
      webpush: { headers: { TTL: '86400' } },
      tokens: []
    }

    let tokens: any[] = []

    // 토큰 조회 및 notification 설정

    // 토큰 중복제거
    tokens = Array.from(new Set(tokens.map(token => token.deviceToken)))
    // 빈 토큰 제거
    tokens = tokens.filter(token => !!token)

    // 비어 있으면 푸시 전송 X
    if (size(tokens) === 0) {
      return
    }

    let pushResult: any
    if (size(tokens) > 500) {
      for (let i = 0; i < size(tokens); i += 500) {
        message.tokens = tokens.slice(i, i + 500)
        pushResult = await firebase.messaging().sendEachForMulticast(message)
      }
    } else {
      message.tokens = tokens
      pushResult = await firebase.messaging().sendEachForMulticast(message)
    }

    logger.info(`Push Result: `, pushResult)

    // 푸시 이력 생성
  } catch (err) {
    logger.error(`Push Error: `, err)
  }
}