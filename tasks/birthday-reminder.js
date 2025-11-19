// tasks/birthday-reminder.js
import cron from 'node-cron';
import { notify } from '../utils/notify.js';

const birthdays = {
  "01-15": { name: "Mom", emoji: "👑❤️" },
  "03-22": { name: "Best Friend Ankit", emoji: "🦁" },
  "07-08": { name: "Priya", emoji: "🌟" },
  "11-19": { name: "Yourself", emoji: "🎉" },
  // Add unlimited
};

export const birthdayReminderTask = () => {
  cron.schedule('0 8 * * *', async () => {
    const today = new Date().toISOString().slice(5, 10); // MM-DD

    if (birthdays[today]) {
      const b = birthdays[today];
      await notify(`*HAPPY BIRTHDAY ${b.name.toUpperCase()}!!!* ${b.emoji}\n\n` +
        `Make today legendary. Call them now! 📞\n` +
        `https://api.whatsapp.com/send?phone=918850651816`);
    }
  }, { timezone: "Asia/Kolkata" }).start();

  console.log("🎂 Birthday reminders active");
};