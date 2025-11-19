// tasks/stock-alert.js
import cron from 'node-cron';
import { notify } from '../utils/notify.js';

export const stockAlertTask = () => {
  cron.schedule('*/5 9-15 * * 1-5', async () => {  // every 5 min market hours
    try {
      const res = await fetch('https://query1.finance.yahoo.com/v8/finance/chart/^NSEI');
      const json = await res.json();
      const nifty = json.chart.result[0].meta.regularMarketPrice.toFixed(0);

      if (nifty > 25000) {
        await notify(`*NIFTY ALERT!* \nCurrently at ${nifty} \nMarket is pumping! `);
      }
    } catch (e) {}
  }, { timezone: "Asia/Kolkata" }).start();
};