// tasks/latest-verified-news.js
import cron from 'node-cron';
import fetch from 'node-fetch';
import { notify } from '../utils/notify.js';

export const verifiedNewsTask = () => {
  const sendNews = async () => {
    let headlines = [];

    // Option 1: NewsAPI.org (best quality – free forever for personal use)
    if (process.env.NEWSAPI_KEY) {
      try {
        const res = await fetch(
          `https://newsapi.org/v2/top-headlines?country=in&category=general&apiKey=${process.env.NEWSAPI_KEY}`
        );
        const json = await res.json();
        headlines = json.articles.slice(0, 5).map((a, i) => 
          `${i+1}. <a href="${a.url}">${a.title}</a>\n   — ${a.source.name}`
        );
      } catch (e) { /* fallback below */ }
    }

    // Option 2: Completely free & no key needed (Google News RSS → JSON)
    if (headlines.length === 0) {
      try {
        const res = await fetch(
          'https://api.rss2json.com/v1/api.json?rss_url=https://news.google.com/rss/headlines/section/geo/india?hl=en-IN&gl=IN&ceid=IN:en'
        );
        const json = await res.json();
        headlines = json.items.slice(0, 5).map((item, i) => 
          `${i+1}. <a href="${item.link}">${item.title}</a>\n   — ${item.source || 'Google News'}`
        );
      } catch (e) {
        headlines = ["News temporarily unavailable"];
      }
    }

    const message = ` National News Update\n${"─".repeat(25)}\n\n${headlines.join("\n\n")}`;
    await notify(message);
  };

  // Schedule every morning at 7:30 AM
  cron.schedule('30 7 * * *', sendNews, {
    scheduled: true,
    timezone: "Asia/Kolkata"
  }).start();

  // Also export the function so test file can call it directly
  return sendNews;
};

console.log(" Latest Verified News with links → 7:30 AM daily");