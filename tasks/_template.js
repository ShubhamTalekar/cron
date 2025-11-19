// tasks/_template.js
import cron from 'node-cron';
import { notify } from '../utils/notify.js';

export const newTask = () => {
  cron.schedule('0 8 * * *', async () => {  // change timing
    await notify('New task running!');
    // Your logic here
  }, {
    scheduled: true,
    timezone: "Asia/Kolkata"
  }).start();

  console.log("✅ New task scheduled");
};