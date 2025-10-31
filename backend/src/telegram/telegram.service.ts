// backend/src/telegram/telegram.service.ts
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class TelegramService {
  private readonly logger = new Logger(TelegramService.name);
  private readonly botToken: string;
  private readonly apiBase: string;

  constructor() {
    // Токен бота нужно добавить в .env
    this.botToken = process.env.TELEGRAM_BOT_TOKEN || '';
    this.apiBase = `https://api.telegram.org/bot${this.botToken}`;
  }

  async sendMessage(chatId: string, text: string): Promise<void> {
    if (!this.botToken) {
      this.logger.warn('⚠️ Telegram Bot Token не указан');
      return;
    }

    try {
      const response = await fetch(`${this.apiBase}/sendMessage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: chatId,
          text,
          parse_mode: 'HTML',
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Ошибка Telegram API: ${errorText}`);
      }

      this.logger.log(`✅ Сообщение отправлено в Telegram: ${chatId}`);
    } catch (error) {
      this.logger.error('❌ Ошибка отправки Telegram-сообщения', error);
    }
  }
}
