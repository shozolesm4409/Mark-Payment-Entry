import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ status: 'error', message: 'Method Not Allowed' });
  }

  const scriptUrl = process.env.VITE_GAS_SCRIPT_URL || "https://script.google.com/macros/s/AKfycbxWf6SHtri1peGaWUtz7Kuyh0brfeT4n6QCsgero9Ejnz1lnXIIgq8a3Y5fwyLG447TfA/exec";

  if (!scriptUrl) {
    return res.status(500).json({ 
      status: "error", 
      message: "VITE_GAS_SCRIPT_URL is not configured." 
    });
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 60000);

  try {
    const response = await fetch(scriptUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(req.body),
      redirect: "follow",
      signal: controller.signal
    });

    const contentType = response.headers.get("content-type");
    const text = await response.text();
    clearTimeout(timeoutId);

    if (contentType && contentType.includes("application/json")) {
      try {
        const data = JSON.parse(text);
        res.status(200).json(data);
      } catch (e) {
        res.status(500).json({ 
          status: "error", 
          message: "Google Apps Script থেকে অসম্পূর্ণ তথ্য পাওয়া গেছে।" 
        });
      }
    } else {
      let userMessage = "Google Apps Script থেকে সঠিক রেসপন্স পাওয়া যায়নি।";
      if (text.includes("Google Accounts") || text.includes("login")) {
        userMessage = "Google Apps Script-এ এক্সেস পারমিশন নেই। Anyone এক্সেস দিয়ে পুনরায় ডেপ্লয় করুন।";
      } else if (response.status === 404) {
        userMessage = "Google Apps Script URL টি সঠিক নয়।";
      }
      
      res.status(500).json({ 
        status: "error", 
        message: userMessage,
        debug: `HTTP ${response.status}`
      });
    }
  } catch (error: any) {
    clearTimeout(timeoutId);
    res.status(500).json({ 
      status: "error", 
      message: "সার্ভারের সাথে যোগাযোগ করা যাচ্ছে না।" 
    });
  }
}
