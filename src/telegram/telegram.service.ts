import { Injectable } from '@nestjs/common';
import axios from 'axios';

interface Message {
  title: string;
  content: string;
  error: string;
  payload: any;
}

@Injectable()
export class TelegramService {
  private readonly botToken: string;
  private readonly chatId: string;

  constructor() {
    this.botToken = process.env.TELEGRAM_BOT_TOKEN;
    this.chatId = process.env.TELEGRAM_CHAT_ID;
  }

  private formatMessage(message: Message): string {
    return (
      `<strong>${message.title}</strong>\n` +
      `<em>${message.content}</em>\n` +
      `<code>${message.error}</code>\n` +
      `Payload:\n<pre>${JSON.stringify(message.payload, null, 2)}</pre>`
    );
  }

  async sendMessage(message: Message): Promise<void> {
    const url = `https://api.telegram.org/bot${this.botToken}/sendMessage`;

    const payload = {
      chat_id: this.chatId,
      text: this.formatMessage(message),
      parse_mode: 'HTML',
    };

    try {
      const response = await axios.post(url, payload, {
        headers: { 'Content-Type': 'application/json' },
      });

      console.log('Telegram response:', response.data);
    } catch (error) {
      console.error(
        'Error sending message to Telegram:',
        error.response?.data || error.message,
      );
    }
  }
}
