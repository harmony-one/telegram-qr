import * as process from 'process';
import 'dotenv/config'

export const config = {
  port: 8080,
  telegramToken: process.env.TELEGRAM_TOKEN || '',
  telegramApiId: parseInt(process.env.TELEGRAM_API_ID || '0', 10) || 0,
  telegramApiHash: process.env.TELEGRAM_API_HASH || '',
  sdHost: process.env.SD_HOST || '',
} as const;
