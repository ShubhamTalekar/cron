// utils/notify.js
import 'dotenv/config';
import fetch from 'node-fetch';

export async function notify(message) {
  console.log(`[NOTIFY] ${new Date().toLocaleString('en-IN')} → ${message}`);

  const methods = [];

  if (process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID) {
    methods.push(
      fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: process.env.TELEGRAM_CHAT_ID,
          text: message,
          parse_mode: 'HTML'
        })
      })
    );
  }

  // Add Pushover, Discord, etc. here later if you want

  await Promise.allSettled(methods);
}