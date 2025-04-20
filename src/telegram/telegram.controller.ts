import { Controller, Get } from '@nestjs/common';
import { TelegramService } from './telegram.service';

@Controller('telegram')
export class TelegramController {
  constructor(private readonly telegramService: TelegramService) {}

  @Get('send')
  async sendTestMessage() {
    const message = {
      title: 'Test Notification',
      content: 'This is a test message.',
      error: 'No error',
      payload: { key: 'value' },
    };

    await this.telegramService.sendMessage(message);
    return { message: 'Message sent to Telegram' };
  }
}
