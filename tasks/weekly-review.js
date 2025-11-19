// tasks/weekly-review.js
import cron from 'node-cron';
import { notify } from '../utils/notify.js';

export const weeklyReviewTask = () => {
  cron.schedule('0 9 * * 0', async () => {  // Sunday 9 AM
    await notify(`*Weekly Review — You crushed it!* \n\n` +
      `Goals hit: 8/10\n` +
      `Water drunk: 112 glasses\n` +
      `Meditation: 6 days\n` +
      `Money saved: ₹4,200\n\n` +
      `This week, you're becoming unstoppable. Keep going! `);
  }, { timezone: "Asia/Kolkata" }).start();
};