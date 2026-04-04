import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // Proxy for Google Apps Script to bypass CORS
  app.post("/api/gas", async (req, res) => {
    const scriptUrl = process.env.VITE_GAS_SCRIPT_URL || "https://script.google.com/macros/s/AKfycbxWf6SHtri1peGaWUtz7Kuyh0brfeT4n6QCsgero9Ejnz1lnXIIgq8a3Y5fwyLG447TfA/exec";
    
    if (!scriptUrl) {
      return res.status(500).json({ 
        status: "error", 
        message: "VITE_GAS_SCRIPT_URL is not configured in the server environment." 
      });
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60s timeout

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
          res.json(data);
        } catch (e) {
          console.error("Failed to parse GAS JSON response:", text.substring(0, 200));
          res.status(500).json({ 
            status: "error", 
            message: "Google Apps Script থেকে অসম্পূর্ণ তথ্য পাওয়া গেছে।" 
          });
        }
      } else {
        // Log only a snippet to avoid cluttering logs with full HTML
        console.warn("GAS returned non-JSON response (Status: " + response.status + "):", text.substring(0, 100) + "...");
        
        let userMessage = "Google Apps Script থেকে সঠিক রেসপন্স পাওয়া যায়নি।";
        const trimmedText = text.trim().toLowerCase();
        const isHtml = trimmedText.startsWith("<!doctype html") || trimmedText.startsWith("<html");
        
        if (text.includes("Google Accounts") || text.includes("login") || text.includes("Service Login")) {
          userMessage = "Google Apps Script-এ এক্সেস পারমিশন নেই। অনুগ্রহ করে স্ক্রিপ্টটি 'Anyone' এক্সেস দিয়ে পুনরায় ডেপ্লয় করুন।";
        } else if (response.status === 404) {
          userMessage = "Google Apps Script URL টি সঠিক নয়। অনুগ্রহ করে ডেপ্লয়মেন্ট URL টি চেক করুন।";
        } else if (isHtml) {
          if (text.includes("ScriptError") || text.includes("Error has occurred")) {
            userMessage = "Google Apps Script-এ একটি ইন্টারনাল এরর হয়েছে। স্ক্রিপ্টের কোডটি চেক করুন।";
          } else {
            userMessage = "Google Apps Script একটি এরর পেজ রিটার্ন করেছে। এটি সাধারণত স্ক্রিপ্ট ডেপ্লয়মেন্ট বা পারমিশন সমস্যার কারণে হয়।";
          }
        }

        res.status(500).json({ 
          status: "error", 
          message: userMessage,
          debug: `HTTP ${response.status}`
        });
      }
    } catch (error: any) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        res.status(504).json({ 
          status: "error", 
          message: "Google Apps Script থেকে রেসপন্স পেতে দেরি হচ্ছে (Timeout)।" 
        });
      } else {
        console.error("GAS Proxy Error:", error);
        res.status(500).json({ 
          status: "error", 
          message: "সার্ভারের সাথে যোগাযোগ করা যাচ্ছে না। আপনার ইন্টারনেট কানেকশন চেক করুন।" 
        });
      }
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
