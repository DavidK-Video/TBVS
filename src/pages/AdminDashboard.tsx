import { useState, useRef } from "react";
import { motion } from "motion/react";
import { 
  Settings, 
  FileText, 
  Image as ImageIcon, 
  Mic, 
  Save, 
  LogOut, 
  ChevronRight, 
  Database,
  Key,
  Globe,
  Loader2,
  Trash2,
  Sparkles,
  Cpu
} from "lucide-react";
import { SiteConfig } from "../types";
import { logout, googleSignIn } from "../lib/firebase";
import { useAdmin } from "../lib/AdminContext";

export default function AdminDashboard({ config, setConfig }: { 
  config: SiteConfig, 
  setConfig: (c: SiteConfig) => void 
}) {
  const { isEditMode, setIsEditMode, setIsAuthenticated: setIsAdminAuth, customData } = useAdmin();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [activeTab, setActiveTab] = useState("general");
  const [isSaving, setIsSaving] = useState(false);
  const [isConnectingGoogle, setIsConnectingGoogle] = useState(false);
  const [googleToken, setGoogleToken] = useState<string | null>(sessionStorage.getItem("google_access_token"));
  const [isListening, setIsListening] = useState(false);
  const [voiceResult, setVoiceResult] = useState<string | null>(null);
  const [sheetData, setSheetData] = useState<any[][] | null>(null);

  const ADMIN_EMAIL = "yohu.vn@gmail.com";
  const ADMIN_PASS = "Yohu1979@";

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email === ADMIN_EMAIL && password === ADMIN_PASS) {
      setIsAuthenticated(true);
      setIsAdminAuth(true);
    } else {
      alert("Sai thông tin đăng nhập!");
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setIsAdminAuth(false);
    setIsEditMode(false);
    logout();
  };

  const handleConnectGoogle = async () => {
    setIsConnectingGoogle(true);
    try {
      const { accessToken } = await googleSignIn();
      if (accessToken) {
        setGoogleToken(accessToken);
        alert("Kết nối Google thành công!");
      }
    } catch (err) {
      console.error(err);
      alert("Kết nối Google thất bại!");
    } finally {
      setIsConnectingGoogle(false);
    }
  };

  const fetchSheetReport = async (range?: string) => {
    if (!googleToken) return alert("Vui lòng kết nối Google trước!");
    try {
      const resp = await fetch("/api/sheets/fetch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          sheetId: config.sheet_id, 
          range: range || "Bao_cao_XNT!A1:H20",
          accessToken: googleToken 
        }),
      });
      const data = await resp.json();
      if (data.values) {
        setSheetData(data.values);
      }
    } catch (err) {
      console.error(err);
      alert("Lỗi khi tải dữ liệu từ Google Sheets!");
    }
  };

  const startVoiceCommand = () => {
    if (!('webkitSpeechRecognition' in window)) {
      return alert("Trình duyệt không hỗ trợ nhận diện giọng nói!");
    }
    
    // @ts-ignore
    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = 'vi-VN';
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setVoiceResult(transcript);
      processVoiceCommand(transcript);
    };
    recognition.start();
  };

  const processVoiceCommand = (text: string) => {
    const cmd = text.toLowerCase();
    if (cmd.includes("báo cáo") || cmd.includes("tồn kho")) {
      fetchSheetReport("Bao_cao_XNT!A1:H20");
    } else if (cmd.includes("đơn hàng") || cmd.includes("doanh thu")) {
      fetchSheetReport("Don_Hang_Chi_Tiet!A1:N50");
    } else {
      alert("Lệnh không rõ: " + text);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch("/api/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });
      if (response.ok) {
        alert("Đã lưu cấu hình thành công!");
      } else {
        throw new Error("Lỗi khi lưu!");
      }
    } catch (err) {
      console.error(err);
      alert("Lỗi khi lưu!");
    } finally {
      setIsSaving(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-6 bg-slate-50">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-white p-8 rounded-3xl shadow-xl border border-gray-100 space-y-6"
        >
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-slate-900">Admin Portal</h2>
            <p className="text-sm text-slate-500">Vui lòng đăng nhập để tiếp tục</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Email</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-sm"
                placeholder="yohu.vn@gmail.com"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Mật khẩu</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-sm"
                placeholder="••••••••"
                required
              />
            </div>
            <button 
              type="submit"
              className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-100"
            >
              Đăng nhập
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-[90vh] bg-slate-50 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white border-r border-slate-100 p-6 flex flex-col gap-2">
        <div className="mb-8 pl-2">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Dashboard</h3>
          <div className="flex items-center gap-3 p-2 bg-slate-50 rounded-xl">
            <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold">A</div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-slate-900">Admin</p>
              <p className="text-[10px] text-slate-400 truncate w-32">{ADMIN_EMAIL}</p>
            </div>
          </div>
        </div>

        <nav className="space-y-1">
          {[
            { id: "general", icon: <Settings className="w-4 h-4" />, label: "Cấu hình chung" },
            { id: "branding", icon: <ImageIcon className="w-4 h-4" />, label: "Logo & Thương hiệu" },
            { id: "resources", icon: <Database className="w-4 h-4" />, label: "Google IDs" },
            { id: "ai", icon: <Key className="w-4 h-4" />, label: "AI & API" },
            { id: "reports", icon: <Mic className="w-4 h-4" />, label: "Báo cáo giọng nói" },
            { id: "assets", icon: <ImageIcon className="w-4 h-4" />, label: "Hình ảnh & File" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === tab.id 
                  ? "bg-blue-50 text-blue-600 shadow-sm" 
                  : "text-slate-500 hover:bg-slate-50"
              }`}
            >
              {tab.icon}
              {tab.label}
              {activeTab === tab.id && <ChevronRight className="w-4 h-4 ml-auto" />}
            </button>
          ))}
        </nav>

        <div className="mt-8 pt-6 border-t border-slate-100">
          <button 
            onClick={handleConnectGoogle}
            disabled={isConnectingGoogle}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all border ${
              googleToken 
                ? "bg-green-50 text-green-700 border-green-100" 
                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
            }`}
          >
            {isConnectingGoogle ? <Loader2 className="w-4 h-4 animate-spin" /> : <Globe className="w-4 h-4" />}
            {googleToken ? "Đã kết nối Google" : "Kết nối Google"}
          </button>
        </div>

        <div className="mt-3">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl text-sm font-medium transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Đăng xuất
          </button>
        </div>
      </aside>

      {/* Content Area */}
      <main className="flex-grow p-8 max-w-5xl">
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-slate-50 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-900">
              {activeTab === "general" && "Cấu hình công ty"}
              {activeTab === "resources" && "Tài nguyên Google"}
              {activeTab === "ai" && "Trình cấu hình AI"}
              {activeTab === "reports" && "Trung tâm Báo cáo"}
              {activeTab === "assets" && "Kho tư liệu"}
            </h2>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Chế độ sửa nhanh PC/Web</span>
                <button 
                  onClick={() => setIsEditMode(!isEditMode)}
                  className={`relative w-12 h-6 rounded-full transition-colors duration-300 focus:outline-none ${isEditMode ? "bg-green-500" : "bg-slate-300"}`}
                >
                  <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 ${isEditMode ? "translate-x-6" : "translate-x-0"}`} />
                </button>
              </div>
              <button 
                onClick={handleSave}
                disabled={isSaving}
                className="px-6 py-2 bg-blue-600 text-white rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700 disabled:opacity-50 transition-all text-sm"
              >
                <Save className="w-4 h-4" />
                {isSaving ? "Đang lưu..." : "Lưu thay đổi"}
              </button>
            </div>
          </div>

          <div className="p-8">
            {activeTab === "general" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Tên công ty</label>
                  <input className="input-admin" value={config.company_name} onChange={e => setConfig({...config, company_name: e.target.value})} />
                </div>
                <div className="space-y-1 md:col-span-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Địa chỉ</label>
                  <input className="input-admin" value={config.address} onChange={e => setConfig({...config, address: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Hotline</label>
                  <input className="input-admin" value={config.hotline} onChange={e => setConfig({...config, hotline: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Zalo</label>
                  <input className="input-admin" value={config.zalo} onChange={e => setConfig({...config, zalo: e.target.value})} />
                </div>
                <div className="space-y-1 md:col-span-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">URL Ảnh bìa (Hero Image)</label>
                  <input className="input-admin" value={config.hero_image || ""} onChange={e => setConfig({...config, hero_image: e.target.value})} placeholder="https://..." />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">URL File Báo giá (PDF/Link)</label>
                  <input className="input-admin" value={config.price_list_url || ""} onChange={e => setConfig({...config, price_list_url: e.target.value})} placeholder="https://drive.google.com/..." />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">URL File Catalogue (PDF/Link)</label>
                  <input className="input-admin" value={config.catalogue_url || ""} onChange={e => setConfig({...config, catalogue_url: e.target.value})} placeholder="https://drive.google.com/..." />
                </div>

                {/* Banking Information */}
                <div className="col-span-1 md:col-span-2 pt-4 border-t border-slate-100">
                  <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Thông tin tài khoản thanh toán</h4>
                  <p className="text-xs text-slate-400">Hiển thị trong hóa đơn và thông tin thanh toán chuyển khoản của khách hàng.</p>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Tên ngân hàng</label>
                  <input className="input-admin" value={config.bank_name || ""} onChange={e => setConfig({...config, bank_name: e.target.value})} placeholder="Ngân hàng Quân đội - MB Bank" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Số tài khoản</label>
                  <input className="input-admin" value={config.bank_account_number || ""} onChange={e => setConfig({...config, bank_account_number: e.target.value})} placeholder="0339606969" />
                </div>
                <div className="space-y-1 md:col-span-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Tên người thụ hưởng (Chủ tài khoản)</label>
                  <input className="input-admin" value={config.bank_account_name || ""} onChange={e => setConfig({...config, bank_account_name: e.target.value})} placeholder="Phạm Văn Khải" />
                </div>
              </div>
            )}

            {activeTab === "branding" && (
              <div className="space-y-8">
                <div className="p-6 bg-blue-50 rounded-2xl border border-blue-100 flex gap-4 items-center">
                   <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-white">
                      <ImageIcon className="w-6 h-6" />
                   </div>
                   <div>
                      <h3 className="font-bold text-blue-900">Quản lý nhận diện thương hiệu</h3>
                      <p className="text-xs text-blue-600/70">Thay đổi logo và các yếu tố hình ảnh chính của website</p>
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div className="space-y-4">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Logo Đầu trang (Navbar)</label>
                      <div className="p-4 bg-slate-50 border border-slate-200 rounded-3xl aspect-video flex items-center justify-center overflow-hidden">
                         <img src={(customData as any).site_logo || "https://firebasestorage.googleapis.com/v0/b/ai-studio-assets.appspot.com/o/yohu_logo_placeholder.png?alt=media"} className="max-h-full object-contain" alt="Preview Logo" />
                      </div>
                      <p className="text-[10px] text-slate-400 italic">Mẹo: Bạn có thể bật "Chế độ sửa nhanh" ở trên và click trực tiếp vào logo ở đầu trang để thay đổi.</p>
                   </div>

                   <div className="space-y-4">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Logo Chân trang (Footer)</label>
                      <div className="p-4 bg-slate-900 border border-slate-800 rounded-3xl aspect-video flex items-center justify-center overflow-hidden">
                         <img src={(customData as any).footer_logo || "https://firebasestorage.googleapis.com/v0/b/ai-studio-assets.appspot.com/o/yohu_logo_placeholder.png?alt=media"} className="max-h-full object-contain" alt="Preview Logo Footer" />
                      </div>
                   </div>
                </div>

                <div className="p-6 bg-amber-50 rounded-2xl border border-amber-100 space-y-4">
                   <h4 className="text-sm font-bold text-amber-900 flex items-center gap-2">
                     <Settings className="w-4 h-4" />
                     Hướng dẫn thay đổi Logo
                   </h4>
                   <ol className="text-xs text-amber-800 space-y-2 list-decimal pl-4">
                     <li>Bật nút <b>"Chế độ sửa nhanh PC/Web"</b> ở góc trên bên phải màn hình.</li>
                     <li>Di chuyển về trang chủ hoặc bất kỳ trang nào có logo bạn muốn đổi.</li>
                     <li>Nhấp chuột trái vào hình ảnh logo đó.</li>
                     <li>Dán link ảnh logo mới của bạn vào ô hiện ra và nhấn <b>OK</b>.</li>
                   </ol>
                </div>
              </div>
            )}

            {activeTab === "resources" && (
              <div className="grid grid-cols-1 gap-6">
                <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex gap-3 text-amber-700 text-xs shadow-sm">
                  <Database className="w-5 h-5 flex-shrink-0" />
                  <p>Các ID này dùng để liên kết dữ liệu từ Google Sheets và Drive. Vui lòng kiểm tra kỹ trước khi thay đổi.</p>
                </div>
                {[
                  { label: "ID Google Sheet chính", key: "sheet_id" },
                  { label: "ID Google Form đơn hàng", key: "form_id" },
                  { label: "ID Folder chính GG Sheet", key: "folder_main_id" },
                  { label: "ID Báo cáo KQKD", key: "kqkd_report_id" },
                  { label: "ID Báo cáo XNT Năm 2025", key: "xnt_report_id" },
                  { label: "ID Hóa đơn bán hàng PDF", key: "invoice_pdf_id" },
                  { label: "ID các file mẫu", key: "sample_files_id" },
                ].map((item) => (
                  <div key={item.key} className="space-y-1">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">{item.label}</label>
                    <input 
                      className="input-admin font-mono text-xs" 
                      value={(config as any)[item.key] || ""} 
                      onChange={e => setConfig({...config, [item.key]: e.target.value})} 
                    />
                  </div>
                ))}
              </div>
            )}

            {activeTab === "ai" && (
              <div className="space-y-6">
                <div className="p-6 bg-slate-900 rounded-2xl text-white space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400">
                      <Key className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold">Gemini API Key hoặc Danh sách API Key</h3>
                      <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Xoay vòng tự động khi hết quota</p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Dán khóa API của bạn vào đây. Hệ thống hỗ trợ dán <b>nhiều API key phân tách bằng dấu phẩy</b> (ví dụ: <code className="bg-slate-800 text-yellow-400 px-1 py-0.5 rounded font-mono text-[11px]">key1,key2,key3</code>). Khi một key hết hạn mức (quota exceeded), hệ thống sẽ tự động thử các key tiếp theo trong danh sách.
                  </p>
                  <input 
                    type="password" 
                    className="w-full bg-slate-800 border-slate-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500/50 outline-none font-mono tracking-widest text-slate-200" 
                    value={config.gemini_api_key || ""} 
                    onChange={e => setConfig({...config, gemini_api_key: e.target.value})}
                    placeholder="Dán một khóa hoặc nhiều khóa phân cách bằng dấu phẩy..."
                  />
                  <p className="text-[10px] text-slate-400 italic">
                    * Lưu ý: Admin có thể thiết lập thêm biến môi trường <code className="bg-slate-800 text-slate-300 px-1 py-0.5 rounded font-mono">GEMINI_API_KEYS</code> để làm nguồn dự phòng hệ thống.
                  </p>
                </div>

                {/* Model AI Selector */}
                <div className="p-6 bg-white border border-slate-200 rounded-2xl space-y-4 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500/10 to-orange-500/10 flex items-center justify-center text-amber-600 border border-amber-100">
                      <Cpu className="w-5 h-5 animate-pulse" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800">Lựa chọn Mô hình AI (Model)</h3>
                      <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold font-mono">Chọn mô hình miễn phí hoặc trả phí</p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Tùy theo loại tài khoản API của bạn, chọn mô hình AI thích hợp để chatbot hoạt động mượt mà nhất.
                  </p>
                  
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Mô hình hoạt động</label>
                    <select
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500/50 outline-none text-slate-800 font-bold"
                      value={config.gemini_model || "gemini-2.5-flash"}
                      onChange={e => setConfig({...config, gemini_model: e.target.value})}
                    >
                      <optgroup label="Mô hình MIỄN PHÍ - Đề xuất và khuyên dùng">
                        <option value="gemini-2.5-flash">Gemini 2.5 Flash (Đề xuất cao nhất, cực nhanh, thông minh)</option>
                        <option value="gemini-3.5-flash">Gemini 3.5 Flash (Yêu cầu API key hiện đại hơn, miễn phí)</option>
                        <option value="gemini-3.1-flash-lite">Gemini 3.1 Flash Lite (Siêu nhẹ, tốc độ tối ưu)</option>
                        <option value="gemini-1.5-flash-latest">Gemini 1.5 Flash (Bản cũ kế thừa)</option>
                      </optgroup>
                      <optgroup label="Mô hình NÂNG CAO - Yêu cầu API Key trả phí (Paid Tier)">
                        <option value="gemini-2.5-pro">Gemini 2.5 Pro (Lý luận siêu đỉnh, lập luận phức tạp)</option>
                        <option value="gemini-3.1-pro-preview">Gemini 3.1 Pro Preview (Mô hình Pro thế hệ mới)</option>
                        <option value="gemini-1.5-pro-latest">Gemini 1.5 Pro (Kế thừa của dòng cao cấp)</option>
                      </optgroup>
                    </select>
                  </div>
                  
                  <div className="p-4 bg-amber-50/50 rounded-xl border border-amber-100 flex gap-3 text-[11px] text-amber-800">
                    <Sparkles className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold">Mẹo hay tránh lỗi 429 (Hết lượt gọi miễn phí):</p>
                      <p className="mt-1 leading-relaxed">
                        Bạn có thể tạo và sử dụng 2 - 3 API key miễn phí từ Google AI Studio, dán hết vào ô bên trên dạng danh sách, ngăn cách nhau bằng dấu phẩy. Chatbot sẽ tự động chuyển sang key tiếp theo khi một trong số các key bị chạm giới hạn cuộc gọi!
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-600 border border-purple-100">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900">Kiến thức của Bot AI</h3>
                      <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Bot Knowledge Base</p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100 italic">
                    Dán nội dung bảng giá, catalogue hoặc bất kỳ thông tin nào bạn muốn Bot ghi nhớ và trả lời khách hàng.
                  </p>
                  <textarea 
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-sm focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600/20 outline-none transition-all min-h-[300px] font-sans leading-relaxed text-slate-700" 
                    value={config.bot_knowledge || ""} 
                    onChange={e => setConfig({...config, bot_knowledge: e.target.value})}
                    placeholder="Ví dụ: Bảng giá bồn nước Yohu 2025: Bồn nhựa 1000L - 2.500.000đ, Bồn Inox 1000L - 4.500.000đ..."
                  />
                </div>
              </div>
            )}

            {activeTab === "reports" && (
              <div className="space-y-8">
                <div className="flex flex-col items-center justify-center p-12 text-center space-y-6 border-2 border-dashed border-slate-100 rounded-3xl">
                  <motion.div 
                    animate={isListening ? { scale: [1, 1.2, 1] } : {}}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    className={`w-20 h-20 rounded-full flex items-center justify-center shadow-lg transition-colors ${isListening ? "bg-red-100 text-red-600" : "bg-blue-100 text-blue-600"}`}
                  >
                    <Mic className="w-10 h-10" />
                  </motion.div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-slate-900">{isListening ? "Đang lắng nghe..." : "Báo cáo giọng nói"}</h3>
                    <p className="text-slate-500 text-sm max-w-sm">Hé, bạn có thể nói: "Xem báo cáo tồn kho" hoặc "Xem báo cáo đơn hàng".</p>
                  </div>
                  <button 
                    disabled={isListening}
                    onClick={startVoiceCommand}
                    className="px-10 py-5 bg-slate-900 text-white rounded-2xl font-bold text-lg hover:bg-slate-800 transition-all flex items-center gap-3 disabled:opacity-50"
                  >
                    Nhấn để nói
                  </button>
                  {voiceResult && (
                    <div className="bg-slate-50 px-4 py-2 rounded-lg text-xs font-medium text-slate-500">
                      Đã nhận: "{voiceResult}"
                    </div>
                  )}
                </div>

                {sheetData && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-slate-900 uppercase tracking-widest">Dữ liệu từ Google Sheet</h4>
                      <button onClick={() => setSheetData(null)} className="text-xs text-slate-400 hover:text-red-500 underline">Xóa</button>
                    </div>
                    <div className="overflow-x-auto rounded-2xl border border-slate-100 shadow-sm">
                      <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50">
                          <tr>
                            {sheetData[0].map((cell, i) => (
                              <th key={i} className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">{cell}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {sheetData.slice(1).map((row, i) => (
                            <tr key={i} className="hover:bg-slate-50 transition-colors">
                              {row.map((cell, j) => (
                                <td key={j} className="px-4 py-3 text-xs text-slate-600 border-b border-slate-50">{cell}</td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {activeTab === "assets" && (
                <div className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="group p-8 border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center gap-4 hover:border-blue-400 hover:bg-blue-50 transition-all cursor-pointer">
                            <div className="w-16 h-16 rounded-2xl bg-white shadow-sm flex items-center justify-center text-slate-300 group-hover:text-blue-500 transition-colors">
                              <ImageIcon className="w-8 h-8" />
                            </div>
                            <div className="text-center">
                              <span className="block text-xs font-black text-slate-400 group-hover:text-blue-600 uppercase tracking-widest mb-1">Tải ảnh sản phẩm</span>
                              <p className="text-[10px] text-slate-400">JPG, PNG tối đa 5MB</p>
                            </div>
                        </div>
                        <div className="group p-8 border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center gap-4 hover:border-blue-400 hover:bg-blue-50 transition-all cursor-pointer">
                            <div className="w-16 h-16 rounded-2xl bg-white shadow-sm flex items-center justify-center text-slate-300 group-hover:text-blue-500 transition-colors">
                              <FileText className="w-8 h-8" />
                            </div>
                            <div className="text-center">
                              <span className="block text-xs font-black text-slate-400 group-hover:text-blue-600 uppercase tracking-widest mb-1">Tải báo giá PDF</span>
                              <p className="text-[10px] text-slate-400">File tài liệu dự án</p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Thư viện đã tải</h4>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {[1, 2].map((i) => (
                          <div key={i} className="group relative aspect-square rounded-2xl bg-slate-100 overflow-hidden border border-slate-200">
                            <img src={`https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=200`} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <button className="p-2 bg-red-500 text-white rounded-lg shadow-lg hover:bg-red-600 transition-colors">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                </div>
            )}
          </div>
        </div>
      </main>

      <style>{`
        .input-admin {
          width: 100%;
          padding: 0.875rem 1rem;
          background-color: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 1rem;
          font-size: 0.875rem;
          color: #1e293b;
          outline: none;
          transition: all 0.2s;
        }
        .input-admin:focus {
          background-color: white;
          border-color: #3b82f6;
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.05);
        }
      `}</style>
    </div>
  );
}
