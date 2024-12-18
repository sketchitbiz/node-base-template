import { Dayjs } from 'dayjs';
/** @typedef {'Y'|'N'} Yn */
/** @typedef {'C'|'U'} UserType */

import dayjs from "dayjs";
import Joi from "joi";

/** @typedef {'KAKAO' | 'APPLE' | 'ID'} Provider */

/**
 * @abstract
 * @class CreatedUpdateTime
 */
export class CreatedUpdateTime {
  /** @type {Dayjs} */
  createdTime;

  /** @type {Dayjs} */
  updateTime;
}

/**
 * @abstract
 * @class CreatedUpdateId
 */
export class CreatedUpdateId {
  /** @type {string} */
  createId;

  /** @type {string} */
  updateId;
}

/**
 * @abstract
 * @class CreatedUpdateTimeId
 */
export class CreatedUpdateTimeId {
  /** @type {Dayjs} */
  createdTime;

  /** @type {Dayjs} */
  updateTime;

  /** @type {string} */
  createId;

  /** @type {string} */
  updateId;
}

export const Yn = Object.freeze({
  Y: 'Y',
  N: 'N'
});

export const Provider = Object.freeze({
  KAKAO: 'KAKAO',
  APPLE: 'APPLE',
  ID: 'ID'
});

export const JoiDayjs = Joi.custom((value, helper) => {

  try {
    if (dayjs.isDayjs(value)) {
      return value;
    } else {
      return dayjs(value);
    }
  }
  catch (e) {
    return helper.error('날짜 형식이 아닙니다.');
  }
});

export const CreatedUpdateTimeSchema = Joi.object({
  createdTime: JoiDayjs,
  updateTime: JoiDayjs.allow(null)
});

export const CreatedUpdateIdSchema = Joi.object({
  createdId: Joi.string().optional(),
  updateId: Joi.string().optional().allow(null)
});

export const CreatedUpdateTimeAndIdSchema = Joi.object({
  createdTime: JoiDayjs,
  updateTime: JoiDayjs.allow(null),
  createdId: Joi.string().optional(),
  updateId: Joi.string().optional().allow(null)
});