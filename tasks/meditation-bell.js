// tasks/meditation-bell.js
import cron from 'node-cron';
import { notify } from '../utils/notify.js';

export const meditationBellTask = () => {
  cron.schedule('0 7,13,19 * * *', async () => {  // 7AM, 1PM, 7PM
    const form = new FormData();
    form.append('chat_id', process.env.TELEGRAM_CHAT_ID);
    form.append('document', await fetch('https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3').then(r => r.blob()), { filename: '5-min-meditation-bell.mp3' });
    form.append('caption', `*Time for 5 minutes of silence* \nClose your eyes. Breathe. You are enough.`);

    await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendDocument`, { method: 'POST', body: form });
  }, { timezone: "Asia/Kolkata" }).start();

  console.log("🔔 Meditation bell 3x daily");
};