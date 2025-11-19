// tasks/weekend-plans.js
import cron from 'node-cron';
import { notify } from '../utils/notify.js';

export const weekendPlansTask = () => {
  cron.schedule('0 18 * * 5', async () => {  // Friday 6 PM
    const ideas = [
      "New OTT releases this week",
      "Top 5 rooftop cafes open now",
      "Drive to Lonavala?",
      "Board game night with friends",
      "Try that new biryani place"
    ];
    const idea = ideas[Math.floor(Math.random() * ideas.length)];
    await notify(`*Weekend Loading...* \n\nRandom idea: ${idea}\n\nWhat are we doing this weekend? Reply!`);
  }, { timezone: "Asia/Kolkata" }).start();
};