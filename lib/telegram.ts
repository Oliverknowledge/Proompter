interface TelegramNotification {
  teamCode: string;
  userName: string;
  experimentName: string;
  promptCount: number;
  bestScore?: number;
  bestPrompt?: object;
}

export class TelegramBot {
  private botToken: string;
  private teamChatId: string;
  private baseUrl: string;

  constructor() {
    this.botToken = process.env.TELEGRAM_BOT_TOKEN || '';
    this.teamChatId = process.env.TELEGRAM_CHAT_ID_TEAM || '';
    this.baseUrl = `https://api.telegram.org/bot${this.botToken}`;
  }

  async checkChat(): Promise<boolean> {
    if (!this.botToken || !this.teamChatId) {
      console.warn('Telegram bot token or team chat ID not configured');
      return false;
    }

    try {
      console.log('Checking chat with ID:', this.teamChatId);
      
      const response = await fetch(`${this.baseUrl}/getChat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: this.teamChatId,
        }),
      });

      const responseData = await response.json();
      console.log('Chat info response:', responseData);

      if (response.ok) {
        console.log('✅ Chat found!');
        console.log('Chat title:', responseData.result.title);
        console.log('Chat type:', responseData.result.type);
        console.log('Chat ID:', responseData.result.id);
        return true;
      } else {
        console.error('❌ Chat not found:', responseData);
        
        // Try different chat ID formats
        await this.tryDifferentChatFormats();
        return false;
      }
    } catch (error) {
      console.error('Failed to check chat:', error);
      return false;
    }
  }

  private async tryDifferentChatFormats(): Promise<void> {
    console.log('Trying different chat ID formats...');
    
    const chatId = this.teamChatId;
    const possibleFormats = [
      chatId, // Original format
      chatId.replace('-100', '-'), // Try without -100 prefix
      chatId.replace('-100', ''), // Try without any prefix
      `-${chatId.replace('-', '')}`, // Try with single minus
    ];

    for (const format of possibleFormats) {
      if (format === chatId) continue; // Skip the original
      
      console.log(`Trying format: ${format}`);
      try {
        const response = await fetch(`${this.baseUrl}/getChat`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            chat_id: format,
          }),
        });

        const responseData = await response.json();
        if (response.ok) {
          console.log(`✅ Found chat with format: ${format}`);
          console.log('Chat title:', responseData.result.title);
          console.log('Chat type:', responseData.result.type);
          console.log('Chat ID:', responseData.result.id);
          console.log('Use this chat ID in your .env.local file');
          return;
        }
      } catch (error) {
        console.log(`Format ${format} failed`);
      }
    }
    
    console.log('❌ No working chat ID format found');
  }

  async sendNotification(notification: TelegramNotification): Promise<boolean> {
    if (!this.botToken || !this.teamChatId) {
      console.warn('Telegram bot token or team chat ID not configured');
      console.log('Bot token:', this.botToken ? 'Set' : 'Not set');
      console.log('Team chat ID:', this.teamChatId || 'Not set');
      return false;
    }

    // First check if the chat exists
    const chatExists = await this.checkChat();
    if (!chatExists) {
      console.error('Chat not found, cannot send notification');
      return false;
    }

    try {
      const message = this.formatNotificationMessage(notification);
      console.log('Sending Telegram message to chat ID:', this.teamChatId);
      
      const requestBody = {
        chat_id: this.teamChatId,
        text: message,
        parse_mode: 'HTML',
      };
      
      const response = await fetch(`${this.baseUrl}/sendMessage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const responseData = await response.json();
      console.log('Telegram API response:', responseData);

      if (!response.ok) {
        console.error('Telegram API error:', responseData);
        return false;
      }

      console.log(`Telegram notification sent to team ${notification.teamCode}`);
      return true;
    } catch (error) {
      console.error('Failed to send Telegram notification:', error);
      return false;
    }
  }

  private formatNotificationMessage(notification: TelegramNotification): string {
    const { userName, experimentName, promptCount, bestScore, bestPrompt } = notification;
    console.log("best prompt is this ", bestPrompt)
    let message = `🚀 <b>New Prompt Experiment Completed!</b>\n\n`;
    message += ` <b>Team Member:</b> ${userName}\n`;
    message += ` <b>Experiment:</b> ${experimentName}\n`;
    message += `📝 <b>Prompts Tested:</b> ${promptCount}\n`;
    message += "\n";
    message += `<b>Best prompt that</b> ${userName} gave was: `;
    message += `${bestPrompt?.prompt}`
    
    if (bestScore !== undefined) {
      message += `⭐ <b>Best Score:</b> ${bestScore.toFixed(2)}\n`;
    }
    
    message += `\n⏰ <i>Completed at ${new Date().toLocaleString()}</i>`;
    
    return message;
  }
}

export const telegramBot = new TelegramBot(); 