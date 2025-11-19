// tasks/water-reminder.js  ← fixed version
import cron from 'node-cron';
import { notify } from '../utils/notify.js';

const waterQuotes = [
  "Hydrate or diedrate 💧",
  "Your body is 70% water — refill it!",
  "One more glass = one more win",
  "Future you says thank you",
  "Sip happens — make it water",
  "Stay alive → drink 500 ml now"
];

export const waterReminderTask = () => {
  // Every 2 hours starting at 7 AM until 9 PM
  cron.schedule('0 7-21/2 * * *', async () => {
    const randomQuote = waterQuotes[Math.floor(Math.random() * waterQuotes.length)];
    const hour = new Date().getHours();
    const glasses = Math.ceil((hour - 5) / 2);
    await notify(`💧 *Water Time!*\n${randomQuote}\n\nGlasses today ≈ ${glasses} / 8`);
  }, {
    scheduled: true,
    timezone: "Asia/Kolkata"
  }).start();

  console.log("💧 Water reminder scheduled → every 2 hours 7 AM – 9 PM");
};