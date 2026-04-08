import { Redis } from '@upstash/redis'
import { Client } from "@upstash/qstash"
export const redis = Redis.fromEnv()
export const qstash = new Client({ token: process.env.QSTASH_TOKEN! })

