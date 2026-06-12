import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Mic, 
  Settings, 
  FileSpreadsheet, 
  Bot, 
  BarChart3, 
  CheckCircle2, 
  Play, 
  Phone, 
  ShieldCheck, 
  Zap,
  ArrowRight,
  X,
  Volume2
} from "lucide-react";
import { SiteConfig } from "../types";

export default function InventorySystem({ config }: { config: SiteConfig }) {
  const [isListening, setIsListening] = useState(false);
  const [voiceResult, setVoiceResult] = useState<string | null>(null);
  const [showCommands, setShowCommands] = useState(false);

  const voiceCommands = [
    "Kết quả Kinh doanh ngày",
    "Kết quả Kinh doanh tháng",
    "Kết quả Kinh doanh năm",
    "So sánh doanh thu ngày",
    "So sánh doanh thu tháng",
    "Chi phí ngày/tháng",
    "Nhập hàng ngày/tháng",
    "Sản phẩm bán chạy/bán chậm",
    "Sản phẩm cần nhập kho"
  ];

  const startVoiceCommand = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert("Trình duyệt không hỗ trợ nhận diện giọng nói!");
      return;
    }
    
    // @ts-ignore
    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = 'vi-VN';
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setVoiceResult(transcript);
      // In a real app, this would call the API. For now we just show the result.
      setTimeout(() => {
         alert(`Đã nhận lệnh: "${transcript}". Hệ thống đang xử lý truy vấn từ Google Sheets...`);
      }, 500);
    };
    recognition.start();
  };

  return (
    <div className="bg-white font-sans overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative pt-12 pb-24 px-6 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-50/50 to-white -z-10" />
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            className="flex-1 space-y-8"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-100 text-blue-700 text-xs font-black uppercase tracking-widest">
              <Zap className="w-3 h-3" /> YOHU PRO 2.0 - New Generation
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-slate-900 leading-[1.1] tracking-tight">
              Quản lý bán hàng <br />
              <span className="text-red-600 italic">Tự động</span> và <span className="text-blue-600">Dễ dùng</span>
            </h1>
            <p className="text-lg text-slate-600 leading-relaxed max-w-xl">
              Giải pháp tích hợp Google Sheets & AI. Nhập liệu bằng giọng nói, xuất đơn PDF tự động, kiểm soát tồn kho và báo cáo KQKD ngay trên điện thoại.
            </p>
            <div className="flex flex-wrap gap-4">
              <button className="px-10 py-5 bg-[#000033] text-white font-black rounded-2xl shadow-xl shadow-blue-100 hover:scale-105 active:scale-95 transition-all uppercase tracking-widest text-sm">
                Dùng thử ngay
              </button>
              <button className="px-10 py-5 bg-white border-2 border-slate-100 text-slate-900 font-black rounded-2xl hover:bg-slate-50 transition-all uppercase tracking-widest text-sm flex items-center gap-2">
                <Play className="w-4 h-4 fill-current" /> Xem Demo
              </button>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className="flex-1 relative"
          >
            <div className="relative z-10 w-full aspect-square max-w-md mx-auto bg-white rounded-[3rem] shadow-2xl p-4 border-[12px] border-slate-900">
              <div className="w-full h-full bg-slate-50 rounded-[2rem] overflow-hidden flex flex-col items-center justify-center p-8 text-center space-y-6">
                 <div className="w-24 h-24 rounded-full bg-blue-600 flex items-center justify-center text-white shadow-lg">
                    <Mic className="w-12 h-12" />
                 </div>
                 <div className="space-y-2">
                    <h3 className="font-black text-slate-900 uppercase tracking-widest">Voice Command</h3>
                    <p className="text-xs text-slate-400">"Hệ thống, báo cáo doanh thu hôm nay"</p>
                 </div>
                 <div className="w-full h-1 bg-slate-200 rounded-full overflow-hidden">
                    <motion.div 
                      animate={{ x: [-100, 100] }}
                      transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                      className="w-1/3 h-full bg-blue-600 rounded-full"
                    />
                 </div>
              </div>
            </div>
            {/* Background blobs */}
            <div className="absolute -top-10 -right-10 w-64 h-64 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-pulse" />
            <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-red-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-pulse delay-700" />
          </motion.div>
        </div>
      </section>

      {/* Mic Integration Feature */}
      <section className="py-24 px-6 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="order-2 lg:order-1 flex flex-col items-center justify-center p-12 bg-white/5 border border-white/10 rounded-[3rem] backdrop-blur-xl relative overflow-hidden">
             <motion.button
               onClick={startVoiceCommand}
               animate={isListening ? { scale: [1, 1.1, 1] } : {}}
               transition={{ repeat: Infinity, duration: 1 }}
               className={`w-32 h-32 rounded-full flex items-center justify-center shadow-2xl z-10 transition-colors ${isListening ? "bg-red-500" : "bg-blue-600"}`}
             >
                <Mic className="w-14 h-14" />
             </motion.button>
             <div className="mt-8 text-center z-10">
                <h2 className="text-2xl font-black uppercase tracking-widest mb-2">Trải nghiệm giọng nói</h2>
                <p className="text-slate-400 text-sm mb-6">Bấm vào Mic và nói câu lệnh để bắt đầu</p>
                <button 
                  onClick={() => setShowCommands(!showCommands)}
                  className="text-xs font-bold text-blue-400 underline uppercase tracking-widest"
                >
                  {showCommands ? "Ẩn danh sách lệnh" : "Xem danh sách câu lệnh"}
                </button>
             </div>

             <AnimatePresence>
               {showCommands && (
                 <motion.div 
                   initial={{ opacity: 0, height: 0 }}
                   animate={{ opacity: 1, height: "auto" }}
                   exit={{ opacity: 0, height: 0 }}
                   className="w-full mt-6 space-y-2 overflow-hidden"
                 >
                   {voiceCommands.map((cmd, i) => (
                     <div key={i} className="px-4 py-2 bg-white/5 rounded-xl text-xs font-medium text-slate-300 flex items-center gap-3">
                        <div className="w-5 h-5 rounded-full bg-red-600 flex flex-shrink-0 items-center justify-center text-[10px] font-black">{i+1}</div>
                        {cmd}
                     </div>
                   ))}
                 </motion.div>
               )}
             </AnimatePresence>

             {voiceResult && (
               <div className="absolute top-4 right-4 bg-blue-600/20 px-3 py-1 rounded-full text-[10px] font-bold border border-blue-500/30">
                  Phát hiện: "{voiceResult}"
               </div>
             )}
          </div>

          <div className="space-y-8 order-1 lg:order-2">
            <h2 className="text-4xl font-black italic tracking-tight">Tính năng AI-PRO 2.0</h2>
            <p className="text-slate-400 text-lg leading-relaxed">Không còn phải nhập liệu thủ công rườm rà. Tính năng hỗ trợ giọng nói giúp người lớn tuổi hoặc nhân viên tại kho dễ dàng ghi nhận đơn hàng, nhập kho và truy xuất báo cáo ngay lập tức.</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[
                { icon: <Volume2 className="w-5 h-5" />, title: "Voice-to-Sheet", desc: "Tự động chuyển câu nói thành dữ liệu bảng tính." },
                { icon: <ShieldCheck className="w-5 h-5" />, title: "Bảo mật cao", desc: "Dữ liệu lưu trữ an toàn trên Google của chính bạn." },
                { icon: <Bot className="w-5 h-5" />, title: "AI Assistant", desc: "Hỏi đáp thông minh về số liệu kinh doanh." },
                { icon: <FileSpreadsheet className="w-5 h-5" />, title: "Excel Native", desc: "Không phụ thuộc vào phần mềm thứ ba." }
              ].map((item, i) => (
                <div key={i} className="space-y-2">
                  <div className="text-blue-500">{item.icon}</div>
                  <h4 className="font-bold text-sm uppercase tracking-wider">{item.title}</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl font-black text-slate-900 uppercase tracking-widest">Bảng giá dịch vụ</h2>
            <p className="text-slate-500 max-w-xl mx-auto text-sm">Lựa chọn gói giải pháp phù hợp với quy mô kinh doanh của bạn. Thanh toán một lần cho sự ổn định lâu dài.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Lite */}
            <div className="p-8 rounded-[2.5rem] border border-slate-100 bg-slate-50 space-y-8 hover:shadow-xl transition-all">
              <div className="space-y-2">
                <h3 className="font-black text-slate-900 uppercase tracking-widest">Gói Lite</h3>
                <p className="text-3xl font-black text-blue-600">Miễn phí</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase">Hộ kinh doanh nhỏ</p>
              </div>
              <ul className="space-y-4">
                {["Quản lý đơn hàng cơ bản", "Xuất PDF hóa đơn", "Báo cáo kinh doanh cơ bản"].map((feat, i) => (
                  <li key={i} className="flex items-center gap-3 text-xs text-slate-600 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-green-500" /> {feat}
                  </li>
                ))}
              </ul>
              <button className="w-full py-4 bg-white border border-slate-200 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-100 transition-colors">
                Bắt đầu ngay
              </button>
            </div>

            {/* Standard */}
            <div className="p-8 rounded-[2.5rem] border-4 border-blue-600 bg-white space-y-8 shadow-2xl relative">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                Phổ biến nhất
              </div>
              <div className="space-y-2">
                <h3 className="font-black text-slate-900 uppercase tracking-widest">Gói Standard</h3>
                <p className="text-3xl font-black text-blue-600">99.000đ<span className="text-sm font-bold text-slate-400">/tháng</span></p>
                <p className="text-[10px] text-slate-400 font-bold uppercase">Thanh toán theo tháng</p>
              </div>
              <ul className="space-y-4">
                {["Đầy đủ tính năng Pro 2.0", "Nhập liệu giọng nói", "Kết nối Fchat cơ bản", "Hỗ trợ 24/7"].map((feat, i) => (
                  <li key={i} className="flex items-center gap-3 text-xs text-slate-800 font-bold">
                    <CheckCircle2 className="w-4 h-4 text-blue-600" /> {feat}
                  </li>
                ))}
              </ul>
              <button className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:shadow-lg shadow-blue-200 transition-all">
                Đăng ký ngay
              </button>
            </div>

            {/* Pro */}
            <div className="p-8 rounded-[2.5rem] border border-slate-100 bg-[#000033] text-white space-y-8 hover:shadow-xl transition-all">
              <div className="space-y-2">
                <h3 className="font-black uppercase tracking-widest opacity-80">Gói Pro</h3>
                <p className="text-3xl font-black text-red-500">999.000đ</p>
                <p className="text-[10px] opacity-40 font-bold uppercase">Thanh toán vĩnh viễn</p>
              </div>
              <ul className="space-y-4">
                {["Tất cả tính năng Standard", "Phân tích kinh doanh AI", "Cảnh báo kho & nợ tự động", "Tùy chỉnh form & PDF"].map((feat, i) => (
                  <li key={i} className="flex items-center gap-3 text-xs font-medium">
                    <CheckCircle2 className="w-4 h-4 text-red-500" /> {feat}
                  </li>
                ))}
              </ul>
              <button className="w-full py-4 bg-white text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-100 transition-colors">
                Mua ngay
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-24 px-6 bg-slate-50 border-t border-slate-100">
        <div className="max-w-4xl mx-auto text-center space-y-8">
           <h2 className="text-4xl font-black text-slate-900 uppercase">Bạn đã sẵn sàng để <span className="text-red-600">chuyển đổi số?</span></h2>
           <p className="text-slate-500 leading-relaxed font-medium">Đừng để công việc kinh doanh trở nên gánh nặng chỉ vì sổ sách. Hãy trải nghiệm YOHU PRO 2.0 ngay hôm nay và cảm nhận sự khác biệt.</p>
           <div className="pt-4">
             <a href="tel:+84973480488" className="inline-flex items-center gap-4 px-12 py-5 bg-blue-600 text-white font-black rounded-3xl shadow-2xl shadow-blue-200 hover:scale-105 transition-all text-lg tracking-widest uppercase">
                <Phone className="w-6 h-6" /> Hotline: 0973 480 488
             </a>
           </div>
        </div>
      </section>
    </div>
  );
}
