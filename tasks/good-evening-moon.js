// tasks/good-evening-moon.js
import cron from 'node-cron';
import { notify } from '../utils/notify.js';

const CITY = 'Mumbai';

const moonIcons = ['🌑', '🌒', '🌓', '🌔', '🌕', '🌖', '🌗', '🌘'];

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

export const goodEveningTask = () => {
  cron.schedule('30 17 * * *', async () => { // 5:30 PM
    try {
      const res = await fetch(`https://wttr.in/${CITY}?format=%t+%m+%M+%s`);
      const text = await res.text();

      const [temp, moonIcon, moonDayStr, sunset] = text.trim().split(' ');
      const moonDay = parseInt(moonDayStr);

      const phaseNames = [
        "New Moon", "Waxing Crescent", "First Quarter", "Waxing Gibbous",
        "Full Moon", "Waning Gibbous", "Last Quarter", "Waning Crescent"
      ];
      const phase = phaseNames[Math.round(moonDay / 29.5 * 8) % 8];

      const aqiText = await getAQI(CITY);

      const sunsetFormatted =
        `${sunset.slice(0,2)}:${sunset.slice(2)}`;

      const message =
        `*Good Evening!* 🌅\n\n` +
        `🌇 Sunset: ${sunsetFormatted}\n` +
        `🌡️ Temperature: ${temp}\n\n` +
        `🌙 Moon: ${moonIcon} ${phase} (day ${moonDay})\n\n` +
        `🫁 ${aqiText}\n\n` +
        `Time to unwind and recharge ✨`;

      await notify(message);

    } catch (e) {
      await notify(
        `Good Evening! 🌅\nThe moon is ${moonIcons[Math.floor(Math.random()*8)]} shining tonight 🌙`
      );
    }
  }, { timezone: "Asia/Kolkata" }).start();

  console.log("Good Evening + Moon Phase → 5:30 PM");
};
