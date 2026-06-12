import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { SiteConfig } from "../types";
import { ShoppingCart, Star, Phone, Facebook, Mail, MapPin, FileText, Download, ExternalLink, LayoutDashboard, Info, X, Image as ImageIcon } from "lucide-react";
import { PRODUCTS } from "../data/products";
import EditableText from "../components/EditableText";
import EditableImage from "../components/EditableImage";
import { useAdmin } from "../lib/AdminContext";
import { useCart } from "../lib/CartContext";

export default function HomePage({ config }: { config: SiteConfig }) {
  const { isEditMode } = useAdmin();
  const { addToCart } = useCart();
  const [viewerUrl, setViewerUrl] = useState<string | null>(null);

  // Balanced collection of Best Selling Products (reducing solar monopoly, including toilets, showers, and accessories)
  const toiletProducts = PRODUCTS.filter(p => p.category?.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes("bon cau")).slice(0, 2);
  const faucetProducts = PRODUCTS.filter(p => p.category?.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") === "sen voi").slice(0, 2);
  const scProducts = PRODUCTS.filter(p => p.category?.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes("sen cay")).slice(0, 1);
  const pkProducts = PRODUCTS.filter(p => {
    const categoryNormalized = p.category?.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") || "";
    return categoryNormalized.includes("linh kien") || categoryNormalized.includes("phu kien");
  }).slice(0, 1);
  const tankProducts = PRODUCTS.filter(p => p.category?.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") === "bon nuoc hwata").slice(0, 1);
  const solarProducts = PRODUCTS.filter(p => p.category?.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") === "bo nang luong mat troi").slice(0, 1);

  const featuredProducts = [
    ...tankProducts,
    ...solarProducts,
    ...toiletProducts,
    ...faucetProducts,
    ...scProducts,
    ...pkProducts
  ].slice(0, 8);

  const priceListUrl = config.price_list_url || "#";
  const catalogueUrl = config.catalogue_url || "#";

  return (
    <div className="bg-white font-sans">
      {/* ... (Previous sections HERO, Partner, Products remain the same) */}

      <AnimatePresence>
        {viewerUrl && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] bg-black/90 flex flex-col"
          >
            <div className="p-4 flex justify-between items-center bg-slate-900 border-b border-white/10">
              <h3 className="text-white font-bold uppercase tracking-widest text-sm">Xem tài liệu trực tuyến</h3>
              <button 
                onClick={() => setViewerUrl(null)}
                className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
                title="Đóng (Close)"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="flex-grow relative bg-slate-800">
               <iframe 
                 src={viewerUrl} 
                 className="w-full h-full border-none"
                 title="Document Viewer"
               />
               <div className="absolute inset-0 pointer-events-none border-[12px] border-slate-900/50" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Banner Section */}
      <section className="px-6 py-4">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 rounded-2xl overflow-hidden shadow-sm aspect-[16/7] bg-slate-100 relative group">
            <EditableImage 
              id="hero_banner"
              defaultSrc={config.hero_image || "https://images.unsplash.com/photo-1542332213-94582aa20379?auto=format&fit=crop&q=80&w=1200"} 
              alt="Main Banner" 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="hidden md:flex flex-col gap-4">
            <div className="flex-grow rounded-2xl overflow-hidden shadow-sm bg-slate-100 relative group">
              <EditableImage 
                id="banner_side_1"
                defaultSrc="https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=600" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                alt="Sidebar banner" 
              />
              <div className="absolute inset-0 bg-slate-900/10 pointer-events-none" />
            </div>
            <div className="flex-grow rounded-2xl overflow-hidden shadow-sm bg-slate-100 relative group">
              <EditableImage 
                id="banner_side_2"
                defaultSrc="https://images.unsplash.com/photo-1620627812632-2bd169473f7d?auto=format&fit=crop&q=80&w=600" 
                className="w-full h-full object-cover" 
                alt="Sidebar banner" 
              />
            </div>
          </div>
        </div>
      </section>

      {/* Strategic Partner Section */}
      <section className="py-24 px-6 bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16 space-y-4">
             <h2 className="text-3xl md:text-5xl font-black text-slate-900 uppercase tracking-tighter italic">Yohu Việt Nam: Người đồng hành <span className="text-red-700">Tận tâm</span></h2>
             <p className="text-slate-500 font-medium max-w-3xl mx-auto leading-relaxed">
               Không chỉ cung cấp sản phẩm, chúng tôi mang tới giải pháp quản trị toàn diện, hỗ trợ tối đa cho sự thành công của khách hàng và đối tác đại lý.
             </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
             {[
               {
                 title: "Tư vấn giải pháp 24/7",
                 desc: "Đội ngũ chuyên gia sẵn sàng hỗ trợ kỹ thuật và báo giá nhanh chóng nhất.",
                 icon: <Phone className="w-8 h-8 text-blue-600" />
               },
               {
                 title: "Số hóa quản lý",
                 desc: "Hệ thống quản lý kho và bán hàng thông minh, giúp đại lý tối ưu hóa lợi nhuận.",
                 icon: <LayoutDashboard className="w-8 h-8 text-green-600" />
               },
               {
                 title: "Đào tạo kỹ thuật",
                 desc: "Cập nhật kiến thức sản phẩm và công nghệ mới định kỳ cho đối tác kỹ thuật.",
                 icon: <Info className="w-8 h-8 text-red-600" />
               }
             ].map((feature, i) => (
               <div key={i} className="p-10 bg-slate-50 rounded-[2.5rem] border border-slate-100 hover:bg-white hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-500 group">
                  <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center mb-8 shadow-lg group-hover:bg-slate-900 group-hover:text-white transition-all duration-500">
                     {feature.icon}
                  </div>
                  <h3 className="text-xl font-black text-slate-900 mb-4 uppercase tracking-tight">{feature.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{feature.desc}</p>
               </div>
             ))}
          </div>
        </div>
      </section>

      {/* Product Grid Section (replacing old logic) */}
      <section className="py-16 px-6 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-12 border-b-2 border-red-600 pb-4">
             <div className="flex flex-col">
                <EditableText id="featured_title" defaultText="Sản phẩm bán chạy" as="h2" className="text-3xl font-black text-slate-800 uppercase tracking-tighter" />
                <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.3em] mt-1">Best Selling Products</span>
             </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-slate-100 border border-slate-100 rounded-3xl overflow-hidden shadow-sm">
            {featuredProducts.map((product) => (
              <div key={product.id} className="bg-white p-6 flex flex-col group hover:shadow-2xl transition-all duration-500 relative">
                <div className="relative aspect-square mb-8 overflow-hidden rounded-2xl bg-slate-50/50 p-4">
                  <EditableImage 
                    id={`prod_img_${product.id}`}
                    defaultSrc={product.image} 
                    alt={product.name} 
                    className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-700" 
                  />
                  <div className="absolute top-2 right-2 bg-red-600 text-white text-[8px] font-black px-2 py-1 rounded-md uppercase tracking-widest shadow-lg">HOT</div>
                </div>
                
                <h3 className="text-[13px] font-black text-slate-800 text-center uppercase tracking-tight leading-snug min-h-[48px] mb-4 group-hover:text-blue-700 transition-colors">
                  <EditableText id={`prod_name_${product.id}`} defaultText={product.name} />
                </h3>
                
                <div className="flex justify-center gap-1 mb-5">
                  {[...Array(product.rating)].map((_, i) => (
                    <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                
                <div className="text-center mb-8">
                  <div className="inline-flex flex-col items-center">
                    <span className="text-red-600 font-black text-2xl tracking-tighter">
                      <EditableText id={`prod_price_${product.id}`} defaultText={product.price} />
                    </span>
                    {product.oldPrice && (
                      <span className="text-slate-300 text-[11px] line-through italic mt-0.5">
                        <EditableText id={`prod_oldprice_${product.id}`} defaultText={product.oldPrice} />
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-auto space-y-3 px-2">
                   <button onClick={() => addToCart(product)} className="w-full py-4 bg-slate-900 hover:bg-red-700 text-white rounded-2xl flex items-center justify-center gap-3 text-[10px] font-black uppercase transition-all active:scale-95">
                      <ShoppingCart className="w-4 h-4" /> Mua ngay
                   </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* PDF Price List Section */}
      <section className="py-20 px-6 bg-gradient-to-br from-slate-900 to-[#000033] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-blue-600/5 skew-x-12 translate-x-1/2" />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
            <div className="lg:w-1/2 space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-[10px] font-black uppercase tracking-[0.2em]">
                <FileText className="w-3.5 h-3.5" />
                Cập nhật mới nhất 2025
              </div>
              <h2 className="text-4xl lg:text-5xl font-black text-white uppercase tracking-tight leading-tight">
                <EditableText id="pdf_section_title" defaultText="Bảng giá & Catalogue sản phẩm" />
              </h2>
              <p className="text-slate-400 text-lg leading-relaxed">
                <EditableText id="pdf_section_desc" defaultText="Xem trực tiếp hoặc tải về bảng giá chi tiết các sản phẩm bồn nước, thiết bị vệ sinh và máy năng lượng mặt trời mới nhất của Yohu Việt Nam." />
              </p>
              
              <div className="flex flex-wrap gap-4 pt-4">
                <div className="w-full flex flex-col gap-4 mb-4">
                  <div className="p-4 bg-slate-800/50 rounded-2xl border border-white/5 space-y-4">
                    <p className="text-white text-sm font-black uppercase tracking-widest flex items-center gap-2">
                      <FileText className="w-4 h-4 text-blue-500" /> Bảng giá sản phẩm
                    </p>
                    <div className="flex flex-wrap gap-3">
                      <button 
                        onClick={() => setViewerUrl(priceListUrl)}
                        className="px-6 py-3 bg-blue-600 hover:bg-white hover:text-slate-900 text-white rounded-xl font-black uppercase text-[10px] tracking-widest flex items-center gap-2 transition-all active:scale-95 shadow-xl shadow-blue-600/20"
                      >
                        <ExternalLink className="w-3.5 h-3.5" /> Xem trực tuyến
                      </button>
                      <a 
                        href={priceListUrl} 
                        download
                        className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl font-black uppercase text-[10px] tracking-widest flex items-center gap-2 transition-all active:scale-95"
                      >
                        <Download className="w-3.5 h-3.5" /> Tải về bản PDF
                      </a>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-800/50 rounded-2xl border border-white/5 space-y-4">
                    <p className="text-white text-sm font-black uppercase tracking-widest flex items-center gap-2">
                       <ImageIcon className="w-4 h-4 text-green-500" /> Catalogue Yohu 2025
                    </p>
                    <div className="flex flex-wrap gap-3">
                      <button 
                        onClick={() => setViewerUrl(catalogueUrl)}
                        className="px-6 py-3 bg-green-600 hover:bg-white hover:text-slate-900 text-white rounded-xl font-black uppercase text-[10px] tracking-widest flex items-center gap-2 transition-all active:scale-95 shadow-xl shadow-green-600/20"
                      >
                        <ExternalLink className="w-3.5 h-3.5" /> Xem trực tuyến
                      </button>
                      <a 
                        href={catalogueUrl} 
                        download
                        className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl font-black uppercase text-[10px] tracking-widest flex items-center gap-2 transition-all active:scale-95"
                      >
                        <Download className="w-3.5 h-3.5" /> Tải về bản PDF
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="lg:w-5/12">
               <div className="relative group">
                  <div className="absolute inset-0 bg-blue-600 blur-3xl opacity-20 group-hover:opacity-30 transition-opacity" />
                  <div className="relative aspect-[3/4] rounded-3xl overflow-hidden border-8 border-white/10 shadow-2xl rotate-2 group-hover:rotate-0 transition-transform duration-700 bg-slate-800">
                    <EditableImage 
                      id="pdf_preview_img" 
                      defaultSrc="https://firebasestorage.googleapis.com/v0/b/ai-studio-assets.appspot.com/o/pdf_preview_placeholder.png?alt=media" 
                      className="w-full h-full object-cover"
                      alt="Price List Preview"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent" />
                    <div className="absolute bottom-10 left-10 right-10 flex flex-col items-center">
                        <FileText className="w-16 h-16 text-blue-500 mb-4 animate-bounce" />
                        <p className="text-white font-black uppercase tracking-widest text-sm text-center">Catalogue 2025</p>
                        <p className="text-white/40 text-[10px] uppercase mt-1">Yohu Vietnam Industry</p>
                    </div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="bg-slate-50 py-20 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16">
          <div className="space-y-8">
            <div className="inline-block border-b-4 border-blue-600 pb-2">
              <EditableText id="about_title" defaultText="Về chúng tôi" as="h2" className="text-3xl font-black text-slate-900 uppercase" />
            </div>
            <div className="space-y-6 text-slate-600 text-sm leading-relaxed text-justify">
              <EditableText 
                id="about_description" 
                defaultText={`Trung tâm phân phối ${config.company_name} chính hãng là địa chỉ uy tín cung cấp các sản phẩm inox cao cấp như bồn nước inox, chậu rửa inox, bàn ghế inox, được sản xuất với công nghệ tiên tiến từ Đài Loan.`} 
                as="p"
              />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <EditableText id="tphcm_title" defaultText="Khu vực TP.HCM" as="h4" className="font-black text-[#990000] text-sm uppercase mb-4 border-b border-slate-100 pb-2" />
                <address className="not-italic text-xs space-y-2 text-slate-500">
                   <p className="flex items-start gap-2"><MapPin className="w-4 h-4 text-blue-600 flex-shrink-0" /> Lô II-1, Cụm 1, Nhóm CN II, KCN Tân Bình, Q. Tân Phú, Tp. HCM</p>
                   <p className="flex items-center gap-2 font-bold text-slate-900"><Phone className="w-4 h-4 text-red-600" /> {config.hotline}</p>
                </address>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <EditableText id="mb_title" defaultText="Khu vực Miền Bắc" as="h4" className="font-black text-[#990000] text-sm uppercase mb-4 border-b border-slate-100 pb-2" />
                <address className="not-italic text-xs space-y-2 text-slate-500">
                   <p className="flex items-start gap-2"><MapPin className="w-4 h-4 text-blue-600 flex-shrink-0" /> {config.address}</p>
                   <p className="flex items-center gap-2 font-bold text-slate-900"><Phone className="w-4 h-4 text-red-600" /> {config.zalo}</p>
                </address>
              </div>
            </div>
          </div>
          
          <div className="relative">
             <div className="rounded-3xl overflow-hidden shadow-2xl skew-y-3 hover:skew-y-0 transition-transform duration-700 bg-white border-8 border-white">
                <EditableImage 
                  id="about_image"
                  defaultSrc="https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=800"
                  className="w-full h-full object-cover" 
                  alt="Xưởng sản xuất" 
                />
             </div>
             <div className="absolute -bottom-6 -left-6 bg-red-700 text-white p-8 rounded-2xl shadow-xl hidden md:block">
                <p className="text-4xl font-black">
                  <EditableText id="experience_years" defaultText="10+" />
                </p>
                <p className="text-[10px] font-bold uppercase tracking-widest opacity-80">
                  <EditableText id="experience_label" defaultText="Năm phát triển" />
                </p>
             </div>
          </div>
        </div>
      </section>
      {/* Benefits Banner */}
      <section className="bg-[#000033] py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-center gap-12 text-white/90">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center text-xl">👍</div>
            <div>
              <p className="text-xs font-black uppercase tracking-widest">
                <EditableText id="benefit_1_title" defaultText="Chất lượng" />
              </p>
              <p className="text-[10px] opacity-60">
                <EditableText id="benefit_1_desc" defaultText="Sản phẩm 100% chính hãng" />
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center text-xl">🚚</div>
            <div>
              <p className="text-xs font-black uppercase tracking-widest">
                <EditableText id="benefit_2_title" defaultText="Vận chuyển" />
              </p>
              <p className="text-[10px] opacity-60">
                <EditableText id="benefit_2_desc" defaultText="Giao hàng miễn phí toàn quốc" />
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center text-xl">💎</div>
            <div>
              <p className="text-xs font-black uppercase tracking-widest">
                <EditableText id="benefit_3_title" defaultText="Bảo trì" />
              </p>
              <p className="text-[10px] opacity-60">
                <EditableText id="benefit_3_desc" defaultText="Chuyên gia hỗ trợ 24/7" />
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
