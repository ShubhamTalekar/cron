// tasks/renderWakeup.js
import cron from 'node-cron';
import { notify } from '../utils/notify.js';

const RENDER_URL = 'https://cron-sw51.onrender.com/';

const pingRenderSite = async () => {
  try {
    const response = await fetch(RENDER_URL, {
      method: 'GET',
      headers: {
        'User-Agent': 'Render-Wakeup-Bot'
      }
    });
    
    if (response.ok) {
      console.log(`✅ Successfully pinged ${RENDER_URL} at ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}`);
      await notify(`Render site pinged successfully - Status: ${response.status}`);
    } else {
      console.log(`⚠️ Ping returned status ${response.status}`);
      await notify(`Render site ping returned status: ${response.status}`);
    }
  } catch (error) {
    console.error(`❌ Failed to ping ${RENDER_URL}:`, error.message);
    await notify(`Failed to ping Render site: ${error.message}`);
  }
};

export const renderWakeup = () => {
  // 8:00 AM
  cron.schedule('0 8 * * *', pingRenderSite, {
    scheduled: true,
    timezone: "Asia/Kolkata"
  }).start();

  // 8:15 AM
  cron.schedule('15 8 * * *', pingRenderSite, {
    scheduled: true,
    timezone: "Asia/Kolkata"
  }).start();

  // 9:00 AM
  cron.schedule('0 9 * * *', pingRenderSite, {
    scheduled: true,
    timezone: "Asia/Kolkata"
  }).start();

  // 10:00 AM
  cron.schedule('0 10 * * *', pingRenderSite, {
    scheduled: true,
    timezone: "Asia/Kolkata"
  }).start();

  // 10:45 AM
  cron.schedule('45 10 * * *', pingRenderSite, {
    scheduled: true,
    timezone: "Asia/Kolkata"
  }).start();

  // 11:00 AM
  cron.schedule('0 11 * * *', pingRenderSite, {
    scheduled: true,
    timezone: "Asia/Kolkata"
  }).start();

  // 3:00 PM
  cron.schedule('0 15 * * *', pingRenderSite, {
    scheduled: true,
    timezone: "Asia/Kolkata"
  }).start();

  // 5:30 PM
  cron.schedule('30 17 * * *', pingRenderSite, {
    scheduled: true,
    timezone: "Asia/Kolkata"
  }).start();

  // 6:00 PM
  cron.schedule('0 18 * * *', pingRenderSite, {
    scheduled: true,
    timezone: "Asia/Kolkata"
  }).start();

  // 7:30 PM
  cron.schedule('30 19 * * *', pingRenderSite, {
    scheduled: true,
    timezone: "Asia/Kolkata"
  }).start();

  // 9:00 PM
  cron.schedule('0 21 * * *', pingRenderSite, {
    scheduled: true,
    timezone: "Asia/Kolkata"
  }).start();

  console.log("✅ Render wakeup task scheduled for:");
  console.log("   8:00 AM, 8:15 AM, 9:00 AM, 10:00 AM, 10:45 AM, 11:00 AM");
  console.log("   3:00 PM, 5:30 PM, 6:00 PM, 7:30 PM, 9:00 PM (Asia/Kolkata)");
};