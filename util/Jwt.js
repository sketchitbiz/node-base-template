import jwt from 'jsonwebtoken';
import { config } from 'dotenv';

config();

/** @type {import('jsonwebtoken').SignOptions} */
const webTokenOption = {
  algorithm: process.env.JWT_ALGORITHM, // 해싱 알고리즘
  expiresIn: process.env.JWT_ACCESS_EXPIRES_IN, // 토큰 유효 기간
  issuer: process.env.JWT_ISSUER // 발행
};

const appTokenOption = {
  algorithm: process.env.JWT_ALGORITHM, // 해싱 알고리즘
  issuer: process.env.JWT_ISSUER // 발행
}

/**
 * 토큰 발행
 *
 * @param {string} uid
 * @returns {{appToken: string, webToken: string}}
 */
export const generateJwt = (uid) => {
  const payload = { uid };

  const webToken = jwt.sign(payload, process.env.JWT_SECRET_KEY, webTokenOption);
  const appToken = jwt.sign(payload, process.env.JWT_SECRET_KEY, appTokenOption);

  return { webToken, appToken };
}

/**
 * jwt 검증
 * @param {string} token
 * @param {'web' | 'app'} platform
 * @returns {string | null}
 */
export function verifyJwt(token, platform) {
  try {
    let payload;
    if (platform === 'web') {
      payload = jwt.verify(token, process.env.JWT_SECRET_KEY, webTokenOption);
    } else {
      payload = jwt.verify(token, process.env.JWT_SECRET_KEY, appTokenOption);
    }

    return payload.uid;
  } catch (e) {
    return null;
  }
}

export function verifyAppJwt(token) {
}