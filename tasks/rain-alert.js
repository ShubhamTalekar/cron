// tasks/rain-alert.js
import cron from 'node-cron';
import { notify } from '../utils/notify.js';

let lastRainCheck = 0;

export const rainAlertTask = () => {
  cron.schedule('*/10 * * * *', async () => {  // every 10 min
    try {
      const res = await fetch('https://api.open-meteo.com/v1/forecast?latitude=28.7041&longitude=77.1025&hourly=precipitation_probability');
      const data = await res.json();
      const now = new Date().getHours();
      const rainChance = data.hourly.precipitation_probability[now];

      if (rainChance > 60 && Date.now() - lastRainCheck > 3600000) {
        await notify(`*Rain Alert!* \n${rainChance}% chance in next hour\nTake umbrella! ☔`);
        lastRainCheck = Date.now();
      }
    } catch (e) {}
  }, { timezone: "Asia/Kolkata" }).start();
};