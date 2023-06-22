import * as process from 'process';

export const config = {
  port: 8080,
  telegramToken: process.env.TELEGRAM_TOKEN || '',
  telegramApiId: parseInt(process.env.TELEGRAM_API_ID || '0', 10) || 0,
  telegramApiHash: process.env.TELEGRAM_API_HASH || '',
} as const;