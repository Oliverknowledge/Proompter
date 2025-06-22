import { NextRequest, NextResponse } from 'next/server';
import { telegramBot } from '@/lib/telegram';

export async function GET(req: NextRequest) {
  try {
    console.log('Testing Telegram bot...');
    
    const chatExists = await telegramBot.checkChat();
    
    if (chatExists) {
      return NextResponse.json({ 
        success: true, 
        message: 'Chat found and bot is working correctly' 
      });
    } else {
      return NextResponse.json({ 
        success: false, 
        message: 'Chat not found. Check the console for alternative chat ID formats.' 
      });
    }
  } catch (error) {
    console.error('Test failed:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Test failed', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
}