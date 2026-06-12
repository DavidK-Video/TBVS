import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import { google } from "googleapis";
import dotenv from "dotenv";
import fs from "fs/promises";
import multer from "multer";
import { PRODUCTS } from "./src/data/products";

dotenv.config();

const upload = multer({ 
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  storage: multer.memoryStorage()
});

const CONFIG_FILE = path.join(process.cwd(), "data", "config.json");

// ... (previous functions continue)

async function ensureConfigDir() {
  const dir = path.dirname(CONFIG_FILE);
  try {
    await fs.access(dir);
  } catch {
    await fs.mkdir(dir, { recursive: true });
  }
  
  try {
    await fs.access(CONFIG_FILE);
    const content = await fs.readFile(CONFIG_FILE, "utf-8");
    const json = JSON.parse(content);
    let dirty = false;
    if (json.bank_account_name === undefined) {
      json.bank_account_name = "Phạm Văn Khải";
      dirty = true;
    }
    if (json.bank_account_number === undefined) {
      json.bank_account_number = "0339606969";
      dirty = true;
    }
    if (json.bank_name === undefined) {
      json.bank_name = "Ngân hàng Quân đội - MB Bank";
      dirty = true;
    }
    if (dirty) {
      await fs.writeFile(CONFIG_FILE, JSON.stringify(json, null, 2));
    }
  } catch {
    const defaults = {
      company_name: "Công ty TNHH Yohu Việt Nam",
      address: "BT39 Khu Biệt thự Tân Phố Hiến – phường Phố Hiến – tỉnh Hưng Yên",
      hotline: "+84 973 480 488",
      zalo: "+84 339 60 69 69",
      email_primary: "yohu.vn@gmail.com",
      email_secondary: "yohu.com.vn@gmail.com",
      facebook: "https://www.facebook.com/share/18qpLBfAo7/",
      fanpage: "https://www.facebook.com/share/1Dftf3tTeo/",
      sheet_id: "163ZiScOOL2R9YJalt4RiBhPKZvV9yisVosD3lgeu5iQ",
      form_id: "1NhJWil7DYbCmYnvx_3IZrL-vW-I7Q8Q523w1soVU9Io",
      folder_main_id: "17OnO27l8eXYTA-E0fkg9PQnkzk4RB82S",
      kqkd_report_id: "142_X48JtBR6ItQD-gVOV1utUL419mCeQ0W_Q3z3wQDE",
      xnt_report_id: "1JrIPYBjFKsBY7Z5DdtznPdn1E7Z9ZNN76GisFzgHyfs",
      invoice_pdf_id: "14jQmHoH0JeUrMvsujcWj6Bf8YXMNtvXn0CwdHaV4r3k",
      sample_files_id: "1PfP4YOOe1yo5RhUyk28emwIthwe0HagH",
      bank_account_name: "Phạm Văn Khải",
      bank_account_number: "0339606969",
      bank_name: "Ngân hàng Quân đội - MB Bank",
    };
    await fs.writeFile(CONFIG_FILE, JSON.stringify(defaults, null, 2));
  }
}

async function readConfig() {
  try {
    const data = await fs.readFile(CONFIG_FILE, "utf-8");
    const json = JSON.parse(data);
    // Safe fallbacks for bank details
    return {
      bank_account_name: "Phạm Văn Khải",
      bank_account_number: "0339606969",
      bank_name: "Ngân hàng Quân đội - MB Bank",
      ...json
    };
  } catch {
    return {
      bank_account_name: "Phạm Văn Khải",
      bank_account_number: "0339606969",
      bank_name: "Ngân hàng Quân đội - MB Bank",
    };
  }
}

interface SheetCache {
  data: string;
  timestamp: number;
}
const sheetCacheMap = new Map<string, SheetCache>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

async function getCachedSheetContext(sheetId: string): Promise<string> {
  const now = Date.now();
  const cached = sheetCacheMap.get(sheetId);
  if (cached && (now - cached.timestamp < CACHE_TTL)) {
    console.log(`⚡ ChatBot: Serving sheet ${sheetId} context from cache.`);
    return cached.data;
  }

  try {
    console.log(`⚡ ChatBot: Fetching sheet ${sheetId} context via Service Account...`);
    const activeKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
    if (!activeKey) {
      throw new Error("GOOGLE_SERVICE_ACCOUNT_KEY is missing or empty.");
    }

    const credentials = JSON.parse(activeKey.trim());
    const jwtClient = new google.auth.JWT({
      email: credentials.client_email,
      key: credentials.private_key.replace(/\\n/g, '\n'),
      scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
    });

    const sheets = google.sheets({ version: "v4", auth: jwtClient });
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: "San_pham!A:N",
    });

    const rows = response.data.values;
    if (!rows || rows.length === 0) {
      sheetCacheMap.set(sheetId, { data: "", timestamp: now });
      return "";
    }

    let output = "";
    for (const row of rows) {
      if (!row || row.length === 0) continue;
      const rowStr = row.map(cell => String(cell || "").replace(/\s+/g, ' ').trim()).join(" | ");
      if (output.length + rowStr.length > 3000) {
        break;
      }
      output += rowStr + "\n";
    }

    const trimmedOutput = output.trim();
    sheetCacheMap.set(sheetId, { data: trimmedOutput, timestamp: now });
    return trimmedOutput;
  } catch (error: any) {
    console.error("❌ ChatBot: Error fetching Google Sheet via Service Account:", error.message || error);
    if (cached) {
      console.log(`⚡ ChatBot: Fallback to stale sheet cache due to error.`);
      return cached.data;
    }
    return "";
  }
}

async function startServer() {
  await ensureConfigDir();
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Config API
  app.get("/api/config", async (req, res) => {
    const config = await readConfig();
    res.json(config);
  });

  app.post("/api/config", async (req, res) => {
    try {
      await fs.writeFile(CONFIG_FILE, JSON.stringify(req.body, null, 2));
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Chat API
  app.post("/api/chat", upload.single("image"), async (req, res) => {
    try {
      const { message, apiKey, sheetContext } = req.body;
      
      const candidateKeys: string[] = [];

      // Prioritize the custom key entered in Settings
      if (apiKey && apiKey.trim()) {
        const customKeys = apiKey.split(",")
          .map((k: string) => k.trim())
          .filter((k: string) => k.length > 0);
        for (const k of customKeys) {
          if (!candidateKeys.includes(k)) {
            candidateKeys.push(k);
          }
        }
      }

      // Add keys from GEMINI_API_KEYS
      if (process.env.GEMINI_API_KEYS) {
        const envKeys = process.env.GEMINI_API_KEYS.split(",")
          .map(k => k.trim())
          .filter(k => k.length > 0);
        for (const k of envKeys) {
          if (!candidateKeys.includes(k)) {
            candidateKeys.push(k);
          }
        }
      }

      // Add fallback GEMINI_API_KEY
      if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim()) {
        const envKeys = process.env.GEMINI_API_KEY.split(",")
          .map(k => k.trim())
          .filter(k => k.length > 0);
        for (const k of envKeys) {
          if (!candidateKeys.includes(k)) {
            candidateKeys.push(k);
          }
        }
      }

      if (candidateKeys.length === 0) {
        return res.status(400).json({ error: "Vui lòng cấu hình Gemini API Key hoặc dán Key vào ô API." });
      }

      const config = await readConfig();

      // Fetch sheet context using Service Account
      let serverSheetContext = "";
      if (process.env.GOOGLE_SERVICE_ACCOUNT_KEY) {
        const sheetId = config.sheet_id || "163ZiScOOL2R9YJalt4RiBhPKZvV9yisVosD3lgeu5iQ";
        serverSheetContext = await getCachedSheetContext(sheetId);
      }

      const finalSheetContext = [serverSheetContext, sheetContext].filter(Boolean).join("\n\n");

      // Check for generic greetings to instantly reply with the exact requested welcome message
      const msgLower = (message || "").toLowerCase().trim();
      const nonAccentMsg = msgLower.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      
      const generalKeywords = [
        "chao", "xin chao", "hello", "hi", "helo", "ban oi", "admin oi", "ad oi", "co ai ko", "co ai khong", 
        "bat dau", "start", "huong dan", "tro giup", "help", "yohu", "yohu viet nam"
      ];
      
      const inquiryKeywords = [
        "gioi thieu", "thong tin", "ben minh co gi", "ban gi", "cung cap gi", "co san pham gi", "muon mua"
      ];
      
      const productKeywords = [
        "sen", "cay", "voi", "chau", "rua", "bon", "cau", "solar", "dien", "mat", "troi", "pin", "dieu hoa", 
        "panasonic", "daikin", "casper", "lg", "funiki", "gree", "midea", "nagakawa", "samsung", "sumikura", 
        "sharp", "aqua", "bep", "ga", "gas", "say", "chen", "tu", "inox"
      ];

      const isGeneral = !msgLower || 
        generalKeywords.some(keyword => nonAccentMsg === keyword || (nonAccentMsg.startsWith(keyword) && nonAccentMsg.length <= keyword.length + 3)) ||
        (inquiryKeywords.some(keyword => nonAccentMsg.includes(keyword)) && !productKeywords.some(prodKeyword => nonAccentMsg.includes(prodKeyword)));

      if (isGeneral && !req.file) {
        console.log("⚡ ChatBot: Intercepted general inquiry, replying with welcome template.");
        return res.json({ 
          text: `Xin chào! Tôi là Trợ lý tư vấn Yohu Việt Nam 👋
Tôi có thể giúp bạn:

- Tư vấn chọn sản phẩm phù hợp (điều hòa, bồn nước, năng lượng mặt trời, thiết bị vệ sinh, thiết bị bếp...)
- Tra cứu giá, thông số kỹ thuật
- Hướng dẫn đặt hàng và chính sách bảo hành

Bạn có thể gửi ảnh sản phẩm để tôi tư vấn chính xác hơn. Bạn cần hỗ trợ gì hôm nay?` 
        });
      }

      // Create a compact products summary for context
      const productSummary = PRODUCTS.map(p => `- ${p.name}: ${p.price} (${p.category})`).join("\n");

      const prompt = `Bạn là trợ lý AI thông minh cho Công ty TNHH Yohu Việt Nam.
      Thông tin công ty:
      - Tên: ${config.company_name}
      - Địa chỉ: ${config.address}
      - Hotline: ${config.hotline}
      - Zalo: ${config.zalo}
      - Email: ${config.email_primary}, ${config.email_secondary}
      
      QUY TẮC THƯƠNG HIỆU & HÃNG SẢN PHẨM:
      1. Hãy tập trung giới thiệu và trả lời các thương hiệu/hãng lớn chính hãng.
      2. Đối với TOÀN BỘ Thiết bị vệ sinh (bồn cầu, sen vòi, sen cây, bồn tiểu...), thương hiệu bắt buộc phải là "YOHU" (ví dụ: bồn cầu YOHU, sen cây YOHU).
      3. Đối với bồn nước: thương hiệu bắt buộc là "Hwata" (ví dụ: Bồn nước Hwata - bỏ qua thương hiệu YOHU ra khỏi tất cả các nội dung bồn nước này là: "Bồn nước Hwata", không được viết bồn nước YOHU).
      
      QUY TẮC PHẢN HỒI LỜI CHÀO/CÂU HỎI TRONG CHUNG:
      Nếu người dùng chào hỏi chung chung hoặc khởi động hội thoại, bạn cần phản hồi mẫu lời chào sau:
      "Xin chào! Tôi là Trợ lý tư vấn Yohu Việt Nam 👋
      Tôi có thể giúp bạn:
      - Tư vấn chọn sản phẩm phù hợp (điều hòa, bồn nước, năng lượng mặt trời, thiết bị vệ sinh, thiết bị bếp...)
      - Tra cứu giá, thông số kỹ thuật
      - Hướng dẫn đặt hàng và chính sách bảo hành
      
      Bạn có thể gửi ảnh sản phẩm để tôi tư vấn chính xác hơn. Bạn cần hỗ trợ gì hôm nay?"
      
      Công việc: Hỗ trợ giải đáp về các thiết bị vệ sinh YOHU, bồn nước Hwata, điện mặt trời VicSolar, tủ bếp inox, điều hòa và tư vấn khách hàng.
      
      Kiến thức sản phẩm hiện tại:
      ${productSummary}
      
      Kiến thức bổ trợ (Bảng giá/Catalogue):
      ${config.bot_knowledge || "Chưa có dữ liệu bảng giá bổ sung."}
      
      Dữ liệu từ tài chính Google Sheets:
      ${finalSheetContext || "Không có dữ liệu Sheets bổ sung."}
      
      HƯỚNG DẪN:
      1. Hãy trả lời chuyên nghiệp, thân thiện, súc tích bằng tiếng Việt.
      2. Nếu khách hàng hỏi về giá, hãy ưu tiên thông tin từ "Kiến thức sản phẩm hiện tại" hoặc "Kiến thức bổ trợ".
      3. Nếu khách hàng tải ảnh sản phẩm lên, hãy phân tích ảnh và tư vấn dựa trên kiến thức sản phẩm.
      
      Câu hỏi: ${message || "Người dùng đã tải một hình ảnh. Bạn vui lòng phân tích và tư vấn."}`;

      const contents: any[] = [{ role: "user", parts: [{ text: prompt }] }];

      // Add image if present
      if (req.file) {
        contents[0].parts.push({
          inlineData: {
            mimeType: req.file.mimetype,
            data: req.file.buffer.toString("base64")
          }
        });
      }

      let lastError: any = null;
      let generateResult: any = null;

      // Determine candidate models based on user choice & free/paid options
      const chosenModel = config.gemini_model?.trim() || "gemini-2.5-flash";
      const fallbackModels = [
        "gemini-2.5-flash",
        "gemini-3.5-flash",
        "gemini-3.1-flash-lite",
        "gemini-1.5-flash-latest"
      ];

      const modelsToTry = [chosenModel];
      for (const m of fallbackModels) {
        if (!modelsToTry.includes(m)) {
          modelsToTry.push(m);
        }
      }

      for (let i = 0; i < candidateKeys.length; i++) {
        const currentKey = candidateKeys[i];
        let keySucceeded = false;

        for (const currentModel of modelsToTry) {
          try {
            console.log(`🤖 ChatBot: Testing model "${currentModel}" with key index ${i}...`);
            const ai = new GoogleGenAI({
              apiKey: currentKey,
              httpOptions: {
                headers: {
                  'User-Agent': 'aistudio-build',
                }
              }
            });

            const response = await ai.models.generateContent({
              model: currentModel,
              contents: contents
            });

            generateResult = response;
            keySucceeded = true;
            console.log(`✅ ChatBot: Key index ${i} succeeded using model "${currentModel}"`);
            break; // Succeeded with this model, stop testing other models
          } catch (err: any) {
            console.error(`❌ ChatBot: Key index ${i} failed with model "${currentModel}". Error:`, err.message || err);
            lastError = err;

            const errMsg = String(err.message || "").toLowerCase();
            const isQuotaOrRateLimit = errMsg.includes("429") || 
                                       errMsg.includes("quota") || 
                                       errMsg.includes("limit") || 
                                       errMsg.includes("exhausted") || 
                                       errMsg.includes("resource") ||
                                       err.status === 429;

            if (isQuotaOrRateLimit) {
              console.log("➡️ ChatBot: Quota/Rate Limit exceeded. Transitioning to next key...");
              break; // Break the model loop to try the next key immediately
            }

            // For other errors (e.g. invalid model or parameters), we try the next model
            console.log(`➡️ ChatBot: Trying fallback models with same key...`);
          }
        }

        if (keySucceeded) {
          break; // Succeeded! Stop trying other keys
        }
      }

      if (!generateResult) {
        // "Nếu tất cả key đều lỗi, trả về thông báo "Hệ thống đang bận, vui lòng thử lại sau hoặc liên hệ hotline.""
        return res.status(500).json({ error: "Hệ thống đang bận, vui lòng thử lại sau hoặc liên hệ hotline." });
      }

      res.json({ text: generateResult.text });
    } catch (error: any) {
      console.error("General chat error:", error);
      res.status(500).json({ error: "Hệ thống đang bận, vui lòng thử lại sau hoặc liên hệ hotline." });
    }
  });

  // API to receive and append orders to Google Sheets
  app.post("/api/orders", async (req, res) => {
    try {
      const { customer, items } = req.body;

      if (!customer || !customer.name || !customer.phone || !customer.address) {
        return res.status(400).json({ error: "Thông tin khách hàng không đầy đủ" });
      }

      if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: "Giỏ hàng trống" });
      }

      const activeKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
      if (!activeKey) {
        console.error("GOOGLE_SERVICE_ACCOUNT_KEY is empty or missing in environment variables!");
        return res.status(400).json({ 
          error: "Hiện tại, YHU chưa kết nối được hệ thống ghi đơn. Quý khách vui lòng liên hệ Zalo hoặc số Hotline để chốt đơn ngay lập tức!" 
        });
      }

      const config = await readConfig();
      const spreadsheetId = config.sheet_id || "163ZiScOOL2R9YJalt4RiBhPKZvV9yisVosD3lgeu5iQ";

      // Formulate unique Order Code YH-YYYYMMDD-XXX
      const vnDate = new Date();
      const formatter = new Intl.DateTimeFormat('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        timeZone: 'Asia/Ho_Chi_Minh'
      });
      const parts = formatter.formatToParts(vnDate);
      const day = parts.find(p => p.type === 'day')?.value || '01';
      const month = parts.find(p => p.type === 'month')?.value || '01';
      const year = parts.find(p => p.type === 'year')?.value || '2026';
      const dateStr = `${year}${month}${day}`;
      const orderCode = `YH-${dateStr}-${Math.floor(100 + Math.random() * 900)}`;

      const timestamp = new Date().toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" });

      const parsePrice = (priceStr: string): number => {
        const cleanNum = (priceStr || "").replace(/[^0-9]/g, '');
        return cleanNum ? parseInt(cleanNum, 10) : 0;
      };

      const rowsJson = items.map((item: any) => {
        const quantityVal = parseInt(item.quantity, 10) || 1;
        const priceVal = parsePrice(item.price);
        const totalVal = priceVal * quantityVal;
        const formattedTotal = totalVal.toLocaleString('vi-VN') + 'đ';

        return [
          timestamp,                           // Thời gian
          orderCode,                           // Mã đơn hàng
          customer.name,                       // Tên khách hàng
          customer.businessName || "",         // Đơn vị kinh doanh
          customer.taxId || "",                // Mã số thuế
          customer.phone,                      // SĐT
          customer.address,                    // Địa chỉ
          (item.id || "").toUpperCase(),       // Mã sản phẩm (id viết hoa)
          item.name,                           // Tên sản phẩm
          item.unit || "Cái",                  // Đơn vị tính
          quantityVal,                         // Số lượng
          item.price,                          // Giá bán
          formattedTotal                       // Thành tiền
        ];
      });

      // Prepare Google Jwt Authentication Client
      const credentials = JSON.parse(activeKey.trim());
      const jwtClient = new google.auth.JWT({
        email: credentials.client_email,
        key: credentials.private_key.replace(/\\n/g, '\n'),
        scopes: ["https://www.googleapis.com/auth/spreadsheets"],
      });

      const sheets = google.sheets({ version: "v4", auth: jwtClient });

      try {
        // Append row to the sheet Don_Hang_Chi_Tiet
        await sheets.spreadsheets.values.append({
          spreadsheetId,
          range: "Don_Hang_Chi_Tiet!A:M",
          valueInputOption: "USER_ENTERED",
          insertDataOption: "INSERT_ROWS",
          requestBody: {
            values: rowsJson
          }
        });
      } catch (sheetErr: any) {
        console.error("Google Sheets append API failed:", sheetErr);
        if (sheetErr.message?.includes("not found") || sheetErr.status === 404) {
          // Fallback append to Sheet1 if specific sheet not found, or throw descriptive error
          return res.status(400).json({ 
            error: "Hệ thống không tìm thấy tab 'Don_Hang_Chi_Tiet' trong bảng tính của Quý khách. Vui lòng tạo tab này trước." 
          });
        }
        throw sheetErr;
      }

      res.json({ success: true, orderCode });
    } catch (error: any) {
      console.error("Order processing error:", error);
      res.status(500).json({ error: `Có lỗi hệ thống khi lưu đơn hàng: ${error.message}` });
    }
  });

  // Sheets Proxy API for Admin/Voice Reporting
  app.post("/api/sheets/fetch", async (req, res) => {
    const { sheetId, range, accessToken } = req.body;
    if (!accessToken) return res.status(401).json({ error: "Unauthorized" });

    try {
      const auth = new google.auth.OAuth2();
      auth.setCredentials({ access_token: accessToken });
      const sheets = google.sheets({ version: "v4", auth });
      
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: sheetId,
        range: range || "Don_Hang_Chi_Tiet!A1:Z500",
      });
      
      res.json({ values: response.data.values });
    } catch (error: any) {
      console.error("Sheets fetch error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Vite middleware
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
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

startServer();
