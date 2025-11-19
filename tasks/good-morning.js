// tasks/good-morning.js
import cron from 'node-cron';
import { notify } from '../utils/notify.js';

const CITY = 'Mumbai';   // Change to your city (Mumbai, Bangalore, Hyderabad, etc.)

// ---------------------- AQI FUNCTION ----------------------
const getAQI = async (city = 'Mumbai') => {
  const res = await fetch(`https://api.waqi.info/feed/${city}/?token=0251f613d3f705e653740e2c4bcd70aae2bb758b`);
  const json = await res.json();
  if (json.status === 'ok') {
    const aqi = json.data.aqi;
    const level =
      aqi <= 50 ? '🟢 Good' :
      aqi <= 100 ? '🟡 Moderate' :
      aqi <= 150 ? '🟠 Unhealthy for sensitive' :
      '🔴 Unhealthy';
    return `Air Quality: ${aqi} ${level}`;
  }
  return "Air Quality: unavailable";
};
// ----------------------------------------------------------

export const goodMorningTask = () => {
  cron.schedule('0 10 * * *', async () => {
    try {
      // Fetch weather data
      const res = await fetch(`https://wttr.in/${CITY}?format=%t+%w+%S+%s+%l`);
      const text = await res.text();

      const parts = text.trim().split(/\s+/);

      let temp = 'N/A';
      let wind = 'N/A';
      let sunrise = 'N/A';
      let sunset = 'N/A';
      let location = CITY;

      if (parts.length >= 4) {
        temp = parts[0];
        wind = parts[1];
        sunrise = parts[2];
        sunset = parts[3];

        if (parts.length > 4) {
          location = parts.slice(4).join(' ');
        }
      }

      const formatTime = (time) => {
        if (!time || time === 'N/A') return 'N/A';
        if (time.includes(':')) return time;
        if (time.length === 4) return `${time.slice(0,2)}:${time.slice(2)}`;
        return time;
      };

      sunrise = formatTime(sunrise);
      sunset = formatTime(sunset);

      const today = new Date().toLocaleDateString('en-IN', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });

      const aqiText = await getAQI(CITY);

      const message =
        `*Good Morning!* ☀️\n\n` +
        `📅 Today: ${today}\n` +
        `📍 Location: ${location}\n\n` +
        `🌡️ Temperature: ${temp}\n` +
        `💨 Wind speed: ${wind}\n` +
        `🌅 Sunrise: ${sunrise} ↑\n` +
        `🌇 Sunset: ${sunset} ↓\n\n` +
        `🫁 ${aqiText}\n\n` +
        `Have an amazing day ahead! ❤️`;

      await notify(message);
      console.log('✅ Good morning message sent!');

    } catch (e) {
      console.error('Weather fetch failed:', e);

      const today = new Date().toLocaleDateString('en-IN', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });

      await notify(`*Good Morning!* ☀️\n\n📅 ${today}\n\nHave an amazing day ahead! ❤️`);
    }
  }, { 
    scheduled: true,
    timezone: "Asia/Kolkata" 
  }).start();

  console.log("✅ Good Morning task scheduled → 10:00 AM IST");
};
