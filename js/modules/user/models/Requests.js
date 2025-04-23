
import { z } from 'zod'
export const LoginRequest = z.object({
  email: z.string({ required_error: "email을 입력하세요." }).email(),
  password: z.string({ required_error: "password를 입력하세요." })
})