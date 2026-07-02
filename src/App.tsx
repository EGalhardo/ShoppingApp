import React, { useState, useMemo, useEffect, useCallback, useRef, createContext, useContext, ReactNode } from 'react';
import { RefreshCw, LayoutGrid, List, Search, ShoppingCart, Heart, Bell, User, Clock, ChevronRight, Menu, X, Plus, Filter, ArrowLeft, ArrowRight, Star, Mail, MapPin, Phone, MessageSquare, ExternalLink, Shield, Package, Truck, CreditCard, RotateCcw, AlertCircle, CheckCircle2, QrCode, Download, Eye, EyeOff, Camera, Maximize2, MoreVertical, Settings, LogOut, Check, Home, Compass, Briefcase, Zap, Info, ScanLine, Users, Building, Wallet, History, FileText, Globe, Moon, Sun, Trash2, Edit2, Share2, DollarSign, BarChart3, PieChart, TrendingUp, HelpCircle, SlidersHorizontal, Gift, Tag, ChevronLeft, Minus, UserPlus, Send, Smartphone, CheckCircle, ChevronDown, Edit3, Scan, ClipboardList, ShieldCheck, FileCheck, Activity, Store, BarChart2, Ban, XCircle, Navigation, ArrowDownLeft, ArrowUpRight, Palette, Power, TrendingDown, Terminal, ShoppingBag, Apple, LayoutDashboard, Sparkles, Image, Wifi, WifiOff, Bot } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';

const FacebookIcon = ({ size = 24, className = "" }: { size?: number, className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);
import { QRCodeCanvas } from 'qrcode.react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend, Cell, LineChart, Line, PieChart as RePieChart, Pie
} from 'recharts';
import { PRODUCTS, Product } from './constants';
import { faceService } from './services/faceService';
import { SyncService } from './services/sync.service';
import { ProductService } from './services/product.service';
import { AuthService } from './services/auth.service';
import { OrderService } from './services/order.service';
import { ComplaintService } from './services/complaint.service';
import { ProductEntity, OrderEntity, ComplaintEntity, UserEntity } from './types';
import { productRepository, orderRepository, userRepository, complaintRepository } from './lib/repositories';
import { db } from './lib/database';
import { generateAdminInsight, chatWithAdminAI } from './services/geminiService';

// --- TYPES ---
function AdminAIChatModal({ open, onClose, context }: { open: boolean, onClose: () => void, context?: string }) {
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<{role: 'user' | 'ai', text: string}[]>([]);
  const [input, setInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  const stats = {
    volume: 'Kz 14.2M',
    sellers: '156',
    users: '2.4k',
    payments: '42',
    detail: '+12% crescimento mensal'
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    
    setLoading(true);
    const aiRes = await chatWithAdminAI(userMsg, context || JSON.stringify(stats));
    setMessages(prev => [...prev, { role: 'ai', text: aiRes }]);
    setLoading(false);
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
        >
          <div className="bg-white w-full max-w-2xl h-[80vh] rounded-[3rem] shadow-2xl flex flex-col overflow-hidden border border-gray-100">
            {/* Header */}
            <div className="bg-indigo-900 p-6 text-white flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center shadow-lg">
                  <Sparkles className="text-yellow-400" size={24} />
                </div>
                <div>
                  <h4 className="text-lg font-black leading-none">KwikInsight Assistente</h4>
                  <p className="text-[10px] uppercase tracking-widest opacity-60 font-black mt-1">Conectado • Gemini High Intelligence</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all"
              >
                <X size={20} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-8 space-y-6">
              {messages.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                  <Bot size={64} className="mb-4" />
                  <p className="text-sm font-black">Como posso ajudar na gestão da plataforma hoje?</p>
                  <p className="text-xs font-medium mt-2 max-w-xs leading-relaxed">
                    Podes perguntar sobre vendedores, aprovações, tendências de mercado ou problemas pendentes.
                  </p>
                  {context && (
                    <div className="mt-4 px-4 py-2 bg-indigo-50 rounded-xl text-indigo-900 text-[10px] font-black uppercase tracking-widest whitespace-nowrap overflow-hidden text-ellipsis max-w-xs">
                      Contexto: {context.length > 50 ? context.substring(0, 50) + '...' : context}
                    </div>
                  )}
                </div>
              )}
              
              {messages.map((m, i) => (
                <div key={i} className={cn("flex", m.role === 'user' ? "justify-end" : "justify-start")}>
                  <div className={cn(
                    "max-w-[80%] p-4 rounded-2xl text-sm font-medium leading-relaxed shadow-sm",
                    m.role === 'user' ? "bg-primary text-white rounded-tr-none" : "bg-gray-100 text-gray-800 rounded-tl-none border border-gray-100"
                  )}>
                    {m.text}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 p-4 rounded-2xl flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" />
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input */}
            <div className="p-6 border-t border-gray-100 bg-gray-50/50">
              <div className="flex gap-3 bg-white p-2 border border-gray-200 rounded-2xl shadow-sm focus-within:ring-2 ring-primary/20 transition-all">
                <input 
                  type="text" 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Escreva sua pergunta aqui..." 
                  className="flex-1 bg-transparent px-4 outline-none text-sm font-bold"
                />
                <button 
                  onClick={handleSend}
                  disabled={loading || !input.trim()}
                  className="bg-primary text-white p-3 rounded-xl hover:scale-105 active:scale-95 transition-all shadow-lg disabled:opacity-50"
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function AdminAIButton({ context }: { context?: string }) {
  const [chatOpen, setChatOpen] = useState(false);

  return (
    <>
      <button 
        onClick={() => setChatOpen(true)}
        className="flex items-center gap-2 bg-indigo-50 text-indigo-900 px-4 py-2 rounded-xl border border-indigo-100 font-black text-[10px] uppercase tracking-widest hover:bg-indigo-100 transition-all shadow-sm"
      >
        <Sparkles size={14} className="text-yellow-500" />
        Insights IA
      </button>
      <AdminAIChatModal open={chatOpen} onClose={() => setChatOpen(false)} context={context} />
    </>
  );
}

// --- TYPES ---
interface CartItem extends Product {
  quantity: number;
  selectedSize: string;
}
type UserRole = 'USER' | 'SELLER' | 'ADMIN';
type AuthStep = 'signin' | 'signup' | 'location-access' | 'enter-location' | 'forgot-password';
type UserScreen = 'home' | 'shop' | 'cart' | 'checkout' | 'orders' | 'payments' | 'qr-pickup' | 'profile' | 'complaints' | 'notifications' | 'profile-info' | 'profile-addresses' | 'profile-payments' | 'profile-security' | 'profile-settings' | 'store-detail';
type SellerScreen = 'seller-dashboard' | 'seller-products' | 'seller-add-product' | 'seller-edit-product' | 'seller-orders' | 'seller-scanner' | 'seller-earnings' | 'seller-subscription' | 'seller-profile';
type AdminScreen = 'admin-dashboard' | 'admin-sellers' | 'sellers-approval' | 'admin-payments' | 'payments-validation' | 'admin-orders' | 'admin-transfers' | 'admin-refunds' | 'admin-subscriptions' | 'admin-reports' | 'admin-audit';

type Screen = UserScreen | SellerScreen | AdminScreen;

// --- SCREEN COMPONENTS ---

const SearchBar = ({ value, onChange, onFilterClick }: { value?: string, onChange?: (v: string) => void, onFilterClick?: () => void }) => (
  <div className="flex gap-3 mb-8">
    <div className="flex-1 bg-gray-50 border border-gray-100 rounded-2xl px-5 flex items-center gap-3 focus-within:ring-4 focus-within:ring-primary/10 focus-within:bg-white transition-all">
      <Search size={20} className="text-gray-500" />
      <input 
        type="text" 
        placeholder="O que procuras hoje?" 
        className="bg-transparent border-none outline-none w-full py-4 text-sm font-medium"
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
      />
    </div>
    <button 
      onClick={onFilterClick}
      className="w-14 h-14 bg-gray-50 border border-gray-100 rounded-2xl flex items-center justify-center hover:bg-white transition-all group"
    >
      <SlidersHorizontal size={20} className="text-gray-600 group-hover:text-primary transition-colors" />
    </button>
  </div>
);

const SectionHeader = ({ title, subtitle, onSeeAll, aiContext }: { title: string, subtitle?: string, onSeeAll?: () => void, aiContext?: string }) => (
  <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
    <div className="space-y-1">
      <h2 className="text-xl md:text-3xl font-black text-gray-900 leading-tight tracking-tight">{title}</h2>
      {subtitle && <p className="text-xs md:text-sm text-gray-500 font-bold mt-1">{subtitle}</p>}
    </div>
    <div className="flex items-center gap-3">
      {aiContext && <AdminAIButton context={aiContext} />}
      {onSeeAll && (
        <button onClick={onSeeAll} className="text-xs font-black text-primary uppercase tracking-widest hover:underline whitespace-nowrap">Ver Tudo</button>
      )}
    </div>
  </div>
);

const ProductCard = ({ product, onClick, isFavorite, onToggleFavorite }: { product: Product, onClick: () => void, isFavorite?: boolean, onToggleFavorite?: (e: React.MouseEvent) => void, key?: any }) => (
  <motion.div 
    whileHover={{ y: -5 }}
    onClick={onClick}
    className="cursor-pointer group"
  >
    <div className="aspect-[3/4] rounded-[2rem] overflow-hidden mb-3 bg-gray-100 relative">
      <img 
        src={product.image || 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=800&auto=format&fit=crop'} 
        alt={product.name} 
        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
      />
      <div className={cn(
        "absolute top-4 right-4 transition-all z-10",
        isFavorite ? "opacity-100 translate-y-0" : "translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100"
      )}>
         <button 
           onClick={(e) => {
             e.preventDefault();
             e.stopPropagation();
             onToggleFavorite?.(e);
           }}
           className={cn(
             "w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-all active:scale-90",
             isFavorite ? "bg-red-500 text-white" : "bg-white/90 backdrop-blur-sm hover:bg-primary hover:text-white"
           )}
         >
            <Heart size={18} fill={isFavorite ? "white" : "none"} />
         </button>
      </div>
    </div>
    <div className="px-1">
      <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">{product.category}</p>
      <h3 className="text-sm font-bold text-gray-900 line-clamp-1">{product.name}</h3>
      <p className="text-sm font-black text-gray-900 mt-1 uppercase tracking-tighter">Kz {product.price.toLocaleString()}.000</p>
    </div>
  </motion.div>
);

function HomeScreen({ onProductClick, setActiveCategory, products, favorites, onToggleFavorite }: { onProductClick: (p: Product) => void, setActiveCategory: (c: string) => void, products: Product[], favorites: string[], onToggleFavorite: (id: string) => void }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [selectedSort, setSelectedSort] = useState<'default' | 'price-asc' | 'price-desc' | 'rating'>('default');

  const slides = [
    {
      image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1920&auto=format&fit=crop",
      title: "Estilo que Define o Teu Dia.",
      tag: "Nova Coleção"
    },
    {
      image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=1920&auto=format&fit=crop",
      title: "Elegância em Cada Detalhe.",
      tag: "Tendências 2024"
    },
    {
      image: "https://images.unsplash.com/photo-1441984904996-e0b6ba687e12?q=80&w=1920&auto=format&fit=crop",
      title: "Conforto sem Compromisso.",
      tag: "Exclusivo Online"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const categories = [
    { name: 'Homem', image: 'https://images.unsplash.com/photo-1480429370139-e0132c086e2a?q=80&w=400&auto=format&fit=crop' },
    { name: 'Mulher', image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?q=80&w=400&auto=format&fit=crop' },
    { name: 'Rapaz', image: 'https://images.unsplash.com/photo-1519238263530-99bbe197c904?q=80&w=400&auto=format&fit=crop' },
    { name: 'Rapariga', image: 'https://images.unsplash.com/photo-1503944583220-79d172745161?q=80&w=400&auto=format&fit=crop' },
    { name: 'Bebé', image: 'https://images.unsplash.com/photo-1596815064285-45ed8a9c0463?q=80&w=400&auto=format&fit=crop' },
  ];

  const applyFilters = (productList: Product[]) => {
    let filtered = productList.filter(p => 
      (p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
       p.category.toLowerCase().includes(searchQuery.toLowerCase())) &&
      p.price >= priceRange[0] && p.price <= priceRange[1]
    );

    if (selectedSort === 'price-asc') filtered.sort((a, b) => a.price - b.price);
    if (selectedSort === 'price-desc') filtered.sort((a, b) => b.price - a.price);
    if (selectedSort === 'rating') filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));

    return filtered;
  };

  return (
    <div className="w-full relative">
      <SearchBar 
        value={searchQuery} 
        onChange={setSearchQuery} 
        onFilterClick={() => setIsFilterOpen(true)} 
      />

      {/* Filter Modal */}
      <AnimatePresence>
        {isFilterOpen && (
          <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFilterOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              className="w-full max-w-lg bg-white rounded-[2.5rem] p-8 relative z-10 shadow-2xl overflow-hidden"
            >
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-black text-gray-900">Filtros</h3>
                <button 
                  onClick={() => setIsFilterOpen(false)}
                  className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center hover:bg-gray-100 transition-all"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-8">
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-gray-500 mb-4">Ordenar por</p>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { id: 'default', label: 'Padrão' },
                      { id: 'price-asc', label: 'Menor Preço' },
                      { id: 'price-desc', label: 'Maior Preço' },
                      { id: 'rating', label: 'Avaliação' }
                    ].map(sort => (
                      <button
                        key={sort.id}
                        onClick={() => setSelectedSort(sort.id as any)}
                        className={cn(
                          "px-6 py-2.5 rounded-xl text-xs font-black uppercase transition-all border-2",
                          selectedSort === sort.id ? "bg-primary border-primary text-white shadow-lg" : "bg-gray-50 border-gray-100 text-gray-500 hover:border-primary/20"
                        )}
                      >
                        {sort.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-4">
                    <p className="text-xs font-black uppercase tracking-widest text-gray-500">Faixa de Preço (Kz)</p>
                    <p className="text-sm font-black text-primary">0 - {priceRange[1]}.000</p>
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    step="10"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
                    className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button 
                    onClick={() => {
                      setPriceRange([0, 100]);
                      setSelectedSort('default');
                      setSearchQuery('');
                    }}
                    className="flex-1 py-4 bg-gray-50 text-gray-900 font-extrabold rounded-2xl hover:bg-gray-100 transition-all"
                  >
                    Resetar
                  </button>
                  <button 
                    onClick={() => setIsFilterOpen(false)}
                    className="flex-1 py-4 bg-primary text-white font-extrabold rounded-2xl hover:bg-primary/90 transition-all shadow-xl shadow-primary/20"
                  >
                    Aplicar
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Carousel Banner */}
      <div className="relative rounded-[3rem] overflow-hidden mb-12 h-[280px] md:h-[420px] shadow-2xl shadow-primary/10">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="absolute inset-0"
          >
            <img 
              src={slides[currentSlide].image} 
              alt={slides[currentSlide].title} 
              className="w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent flex flex-col justify-center px-6 md:px-20 text-white">
               <motion.span 
                 initial={{ y: 20, opacity: 0 }}
                 animate={{ y: 0, opacity: 1 }}
                 transition={{ delay: 0.2 }}
                 className="text-xs font-black uppercase tracking-[0.3em] mb-4 text-primary"
               >
                 {slides[currentSlide].tag}
               </motion.span>
               <motion.h2 
                 initial={{ y: 20, opacity: 0 }}
                 animate={{ y: 0, opacity: 1 }}
                 transition={{ delay: 0.3 }}
                 className="text-4xl md:text-6xl font-black mb-6 leading-tight max-w-md"
               >
                 {slides[currentSlide].title}
               </motion.h2>
               <motion.button 
                 initial={{ y: 20, opacity: 0 }}
                 animate={{ y: 0, opacity: 1 }}
                 transition={{ delay: 0.4 }}
                 onClick={() => setActiveCategory('Tudo')} 
                 className="w-fit px-8 py-4 bg-white text-black font-black rounded-2xl hover:bg-primary hover:text-white transition-all shadow-xl"
               >
                 Explorar Agora
               </motion.button>
            </div>
          </motion.div>
        </AnimatePresence>
        
        {/* Carousel Indicators */}
        <div className="absolute bottom-6 right-12 md:right-20 flex gap-2 z-10">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={cn(
                "h-1.5 rounded-full transition-all duration-300",
                currentSlide === idx ? "w-8 bg-primary" : "w-2 bg-white/40 hover:bg-white/60"
              )}
            />
          ))}
        </div>
      </div>

      <SectionHeader title="Categorias Populares" onSeeAll={() => setActiveCategory('Tudo')} />
      <div className="flex gap-4 mb-10 overflow-x-auto no-scrollbar pb-4 -mx-6 px-6">
        {categories.map(cat => (
          <button 
            key={cat.name}
            onClick={() => setActiveCategory(cat.name)}
            className="flex flex-col items-center gap-3 min-w-[100px] group"
          >
            <div className="w-20 h-20 bg-gray-50 border border-gray-100 rounded-3xl overflow-hidden group-hover:shadow-xl group-hover:shadow-primary/20 transition-all group-hover:ring-4 ring-primary/20">
              <img src={cat.image} alt={cat.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
            </div>
            <span className="text-xs font-bold text-gray-600 group-hover:text-gray-900">{cat.name}</span>
          </button>
        ))}
      </div>

      <SectionHeader title="Mais Procurados" onSeeAll={() => setActiveCategory('Tudo')} />
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 md:gap-8 mb-16">
        {applyFilters(products).slice(0, 10).map((product: any) => (
          <ProductCard 
            key={product.id} 
            product={product} 
            onClick={() => onProductClick(product)}
            isFavorite={favorites.includes(product.id)}
            onToggleFavorite={() => onToggleFavorite(product.id)}
          />
        ))}
        {applyFilters(products).length === 0 && (
          <div className="col-span-full py-20 text-center">
            <p className="text-gray-400 font-bold">Nenhum produto encontrado com os filtros selecionados.</p>
          </div>
        )}
      </div>

      {searchQuery === '' && categories.map(cat => (
        <React.Fragment key={cat.name}>
          <SectionHeader title={cat.name} onSeeAll={() => setActiveCategory(cat.name)} />
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 md:gap-8 mb-16">
            {products.filter((p: any) => p.category === cat.name).slice(0, 5).map((product: any) => (
              <ProductCard 
                key={product.id} 
                product={product} 
                onClick={() => onProductClick(product)}
                isFavorite={favorites.includes(product.id)}
                onToggleFavorite={() => onToggleFavorite(product.id)}
              />
            ))}
          </div>
        </React.Fragment>
      ))}
    </div>
  );
}

function ShopScreen({ activeCategory, setActiveCategory, onProductClick, searchQuery, setSearchQuery, products, favorites, onToggleFavorite }: { activeCategory: string, setActiveCategory: (c: string) => void, onProductClick: (p: Product) => void, searchQuery: string, setSearchQuery: (q: string) => void, products: Product[], favorites: string[], onToggleFavorite: (id: string) => void }) {
  const tabs = ['Tudo', 'Homem', 'Mulher', 'Rapaz', 'Rapariga', 'Bebé'];
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [selectedSort, setSelectedSort] = useState<'default' | 'price-asc' | 'price-desc' | 'rating'>('default');
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1920&auto=format&fit=crop",
      title: "Explora o Nosso Catálogo",
      tag: "Shopping"
    },
    {
      image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=1920&auto=format&fit=crop",
      title: "As Melhores Marcas",
      tag: "Exclusivo"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const filteredProducts = products.filter((p: any) => {
    const matchesCategory = activeCategory === 'Tudo' || p.category === activeCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.type.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPrice = p.price >= priceRange[0] && p.price <= priceRange[1];
    return matchesCategory && matchesSearch && matchesPrice;
  });

  if (selectedSort === 'price-asc') filteredProducts.sort((a: any, b: any) => a.price - b.price);
  if (selectedSort === 'price-desc') filteredProducts.sort((a: any, b: any) => b.price - a.price);
  if (selectedSort === 'rating') filteredProducts.sort((a: any, b: any) => (b.rating || 0) - (a.rating || 0));

  return (
    <div className="w-full">
      <SearchBar 
        value={searchQuery} 
        onChange={setSearchQuery} 
        onFilterClick={() => setIsFilterOpen(true)}
      />

      {/* Filter Modal */}
      <AnimatePresence>
        {isFilterOpen && (
          <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFilterOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              className="w-full max-w-lg bg-white rounded-[2.5rem] p-8 relative z-10 shadow-2xl overflow-hidden"
            >
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-black text-gray-900">Filtros</h3>
                <button 
                  onClick={() => setIsFilterOpen(false)}
                  className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center hover:bg-gray-100 transition-all"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-8">
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-gray-500 mb-4">Ordenar por</p>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { id: 'default', label: 'Padrão' },
                      { id: 'price-asc', label: 'Menor Preço' },
                      { id: 'price-desc', label: 'Maior Preço' },
                      { id: 'rating', label: 'Avaliação' }
                    ].map(sort => (
                      <button
                        key={sort.id}
                        onClick={() => setSelectedSort(sort.id as any)}
                        className={cn(
                          "px-6 py-2.5 rounded-xl text-xs font-black uppercase transition-all border-2",
                          selectedSort === sort.id ? "bg-primary border-primary text-white shadow-lg" : "bg-gray-50 border-gray-100 text-gray-500 hover:border-primary/20"
                        )}
                      >
                        {sort.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-4">
                    <p className="text-xs font-black uppercase tracking-widest text-gray-500">Faixa de Preço (Kz)</p>
                    <p className="text-sm font-black text-primary">0 - {priceRange[1]}.000</p>
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    step="10"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
                    className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button 
                    onClick={() => {
                      setPriceRange([0, 100]);
                      setSelectedSort('default');
                      setSearchQuery('');
                    }}
                    className="flex-1 py-4 bg-gray-50 text-gray-900 font-extrabold rounded-2xl hover:bg-gray-100 transition-all"
                  >
                    Resetar
                  </button>
                  <button 
                    onClick={() => setIsFilterOpen(false)}
                    className="flex-1 py-4 bg-primary text-white font-extrabold rounded-2xl hover:bg-primary/90 transition-all shadow-xl shadow-primary/20"
                  >
                    Aplicar
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="flex gap-3 mb-10 overflow-x-auto no-scrollbar pb-2 -mx-6 px-6">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveCategory(tab)}
            className={cn(
              "px-8 py-3 rounded-2xl text-sm font-black transition-all whitespace-nowrap border-2",
              activeCategory === tab 
                ? "bg-primary border-primary text-white shadow-xl shadow-primary/20" 
                : "bg-white border-gray-100 text-gray-500 hover:border-primary/30"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="text-sm text-gray-600 font-bold mb-6">
        Mostrando {filteredProducts.length} produtos
      </div>

      {activeCategory === 'Tudo' && searchQuery === '' ? (
        ['Homem', 'Mulher', 'Rapaz', 'Rapariga', 'Bebé'].map(cat => {
          const catProducts = filteredProducts.filter(p => p.category === cat);
          if (catProducts.length === 0) return null;
          return (
            <div key={cat} className="mb-16">
              <SectionHeader title={cat} />
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-x-6 gap-y-10">
                {catProducts.map(product => (
                  <ProductCard 
                    key={product.id} 
                    product={product} 
                    onClick={() => onProductClick(product)}
                    isFavorite={favorites.includes(product.id)}
                    onToggleFavorite={() => onToggleFavorite(product.id)}
                  />
                ))}
              </div>
            </div>
          );
        })
      ) : (
        <>
          {activeCategory !== 'Tudo' && searchQuery === '' && (
            <SectionHeader title={activeCategory} />
          )}
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-x-6 gap-y-10">
            {filteredProducts.map(product => (
              <ProductCard 
                key={product.id} 
                product={product} 
                onClick={() => onProductClick(product)}
                isFavorite={favorites.includes(product.id)}
                onToggleFavorite={() => onToggleFavorite(product.id)}
              />
            ))}
          </div>
        </>
      )}

      {filteredProducts.length === 0 && (
        <div className="py-20 flex flex-col items-center text-center opacity-40">
           <Search size={64} className="mb-4" />
           <p className="text-xl font-bold">Nenhum produto encontrado</p>
           <p className="text-sm">Tenta outra pesquisa ou categoria.</p>
        </div>
      )}
    </div>
  );
}

function DetailScreen({ product, onBack, onAddToCart, onBuyNow, isFavorite, onToggleFavorite }: { product: Product, onBack: () => void, onAddToCart: (p: Product, s: string, q: number) => void, onBuyNow: (p: Product, s: string, q: number) => void, isFavorite: boolean, onToggleFavorite: (id: string) => void }) {
  const [selectedSize, setSelectedSize] = useState('M');
  const [quantity, setQuantity] = useState(1);
  const [activeImg, setActiveImg] = useState(product.image);
  const sizes = ['S', 'M', 'L', 'XL'];

  const gallery = [product.image, ...(product.images || [])];

  return (
    <div className="w-full">
       <button onClick={onBack} className="flex items-center gap-2 text-gray-500 font-bold mb-8 hover:text-black transition-colors group">
          <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          Voltar às Compras
       </button>

       <div className="flex flex-col lg:flex-row gap-12 xl:gap-20">
          {/* Gallery Stack */}
          <div className="flex-1 space-y-4">
             <motion.div 
               layoutId={`product-img-${product.id}`}
               className="aspect-[3/4] rounded-[3rem] overflow-hidden bg-gray-50 border border-gray-100"
             >
                <img src={activeImg} alt={product.name} className="w-full h-full object-cover" />
             </motion.div>
             
             {gallery.length > 1 && (
               <div className="grid grid-cols-5 gap-3">
                 {gallery.map((img, idx) => (
                   <div 
                     key={idx} 
                     onClick={() => setActiveImg(img)}
                     className={cn(
                       "aspect-square rounded-2xl overflow-hidden bg-gray-50 cursor-pointer transition-all border-2",
                       activeImg === img ? "border-primary ring-4 ring-primary/10" : "border-transparent opacity-60 hover:opacity-100"
                     )}
                   >
                      <img src={img} className="w-full h-full object-cover" />
                   </div>
                 ))}
               </div>
             )}
          </div>

          {/* Info */}
          <div className="flex-1 flex flex-col pt-4">
             <div className="flex items-center gap-3 mb-4">
                <span className="px-4 py-1.5 bg-gray-100 rounded-full text-[10px] font-black uppercase tracking-widest text-gray-500">{product.category}</span>
                <span className="px-4 py-1.5 bg-primary/10 rounded-full text-[10px] font-black uppercase tracking-widest text-primary">Em Stock</span>
             </div>

             <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-2 leading-tight">{product.name}</h2>
             <div className="text-3xl font-black text-primary mb-8 px-1">Kz {product.price.toLocaleString()}.000</div>

             <div className="mb-10">
                <p className="text-gray-500 leading-relaxed font-medium">
                   {product.description}
                </p>
             </div>

             {/* Selections */}
             <div className="space-y-10 mb-12">
                <div>
                   <h3 className="text-lg font-black mb-4">Selecione o Tamanho</h3>
                   <div className="flex gap-4">
                      {sizes.map(size => (
                        <button 
                          key={size}
                          onClick={() => setSelectedSize(size)}
                          className={cn(
                            "w-14 h-14 rounded-2xl flex items-center justify-center font-black transition-all border-2",
                            selectedSize === size ? "bg-black border-black text-white shadow-xl" : "bg-white border-gray-100 text-gray-400 hover:border-gray-200"
                          )}
                        >
                          {size}
                        </button>
                      ))}
                   </div>
                </div>

                <div className="flex items-center gap-10">
                   <div>
                      <h3 className="text-lg font-black mb-4">Quantidade</h3>
                      <div className="flex items-center bg-gray-50 border border-gray-100 rounded-2xl p-2 gap-2">
                         <button 
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-black hover:bg-white rounded-xl transition-all"
                         >
                            <Minus size={18} />
                         </button>
                         <span className="w-10 text-center font-black text-lg">{quantity}</span>
                         <button 
                          onClick={() => setQuantity(quantity + 1)}
                          className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-black hover:bg-white rounded-xl transition-all"
                         >
                            <Plus size={18} />
                         </button>
                      </div>
                   </div>
                </div>
             </div>

             {/* Footer Buttons */}
             <div className="flex flex-col sm:flex-row gap-4 mt-auto">
                <button 
                  onClick={() => onAddToCart(product, selectedSize, quantity)}
                  className="flex-1 flex items-center justify-center gap-3 bg-white text-black border-2 border-black py-5 rounded-3xl font-black text-lg hover:bg-gray-50 transition-all"
                >
                  <ShoppingCart size={22} />
                  Carrinho
                </button>
                <button 
                  onClick={() => onBuyNow(product, selectedSize, quantity)}
                  className="flex-[1.5] flex items-center justify-center gap-3 bg-primary text-white py-5 rounded-3xl font-black text-lg hover:scale-[1.02] active:scale-[0.98] transition-all shadow-2xl shadow-primary/20"
                >
                  Comprar Agora
                </button>
                <button 
                  onClick={() => onToggleFavorite(product.id)}
                  className={cn(
                    "sm:w-20 h-full py-5 rounded-3xl border-2 flex items-center justify-center transition-all",
                    isFavorite ? "border-red-500 text-red-500 bg-red-50" : "border-gray-100 text-gray-400 hover:text-red-500 hover:border-red-100"
                  )}
                >
                  <Heart size={24} fill={isFavorite ? "currentColor" : "none"} />
                </button>
             </div>
          </div>
       </div>
    </div>
  );
}

function StoreDetailScreen({ 
  sellerLogo, 
  sellerCover, 
  highlightImages,
  sellerSettings, 
  brandColor, 
  products, 
  onProductClick, 
  onBack,
  favorites,
  onToggleFavorite
}: { 
  sellerLogo: string, 
  sellerCover: string, 
  highlightImages: string[],
  sellerSettings: any, 
  brandColor: string, 
  products: Product[], 
  onProductClick: (p: Product) => void, 
  onBack: () => void,
  favorites: string[],
  onToggleFavorite: (id: string) => void
}) {
  const [activeTab, setActiveTab] = useState('Produtos');
  const activeHighlights = useMemo(() => highlightImages.filter(img => img), [highlightImages]);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    if (activeHighlights.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % activeHighlights.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [activeHighlights.length]);

  return (
    <div className="w-full">
       <button onClick={onBack} className="flex items-center gap-2 text-gray-500 font-bold mb-8 hover:text-black transition-colors group">
          <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          Explorar
       </button>

       {/* Carousel Highlight */}
       {activeHighlights.length > 0 ? (
         <div className="mb-12 relative h-[400px] rounded-[3.5rem] overflow-hidden shadow-2xl group">
            <AnimatePresence mode="wait">
               <motion.div
                 key={currentSlide}
                 initial={{ opacity: 0, scale: 1.1 }}
                 animate={{ opacity: 1, scale: 1 }}
                 exit={{ opacity: 0, scale: 0.95 }}
                 transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                 className="absolute inset-0"
               >
                  <img src={activeHighlights[currentSlide]} className="w-full h-full object-cover" alt="Highlight" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
               </motion.div>
            </AnimatePresence>

            <div className="absolute bottom-10 left-10 right-10 flex flex-col md:flex-row md:items-center justify-between gap-6 pointer-events-none">
               <div>
                  <motion.p 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={`text-${currentSlide}`}
                    className="text-white/70 text-[10px] font-black uppercase tracking-[0.3em] mb-2"
                  >
                     Coleção Exclusiva
                  </motion.p>
                  <motion.h1 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    key={`title-${currentSlide}`}
                    className="text-4xl md:text-5xl font-black text-white leading-tight"
                  >
                     Novidades da Estação
                  </motion.h1>
               </div>
               
               {activeHighlights.length > 1 && (
                 <div className="flex gap-2 pointer-events-auto">
                    {activeHighlights.map((_, i) => (
                       <button 
                         key={i}
                         onClick={() => setCurrentSlide(i)}
                         className="relative h-1.5 transition-all duration-500"
                         style={{ width: currentSlide === i ? '40px' : '15px' }}
                       >
                          <div className={cn(
                            "absolute inset-0 rounded-full transition-all duration-500",
                            currentSlide === i ? "bg-white" : "bg-white/30"
                          )} />
                       </button>
                    ))}
                 </div>
               )}
            </div>
         </div>
       ) : (
         <div className="mb-12 relative h-64 rounded-[3.5rem] overflow-hidden shadow-sm border border-gray-100 bg-gray-50 flex items-center justify-center">
            <div className="text-center">
               <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-gray-200 mx-auto mb-4 border border-gray-100 shadow-sm">
                  <Sparkles size={32} />
               </div>
               <p className="text-sm font-black text-gray-400 uppercase tracking-widest">Nenhum destaque disponível</p>
            </div>
         </div>
       )}

        {/* Highlight Collections */}
        <div className="flex flex-col gap-6 mb-16">
          <div className="flex items-center gap-2 mb-2 px-2">
            <div className="h-1 w-8 bg-primary rounded-full"></div>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Coleções em Destaque</span>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {[
              "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=800&auto=format&fit=crop",
              "https://images.unsplash.com/photo-1542060770-de5c743bc50e?q=80&w=800&auto=format&fit=crop",
              "https://images.unsplash.com/photo-1552346154-21d32810aba3?q=80&w=800&auto=format&fit=crop"
            ].map((img, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 + 0.6 }}
                className="aspect-[16/10] rounded-[2.5rem] overflow-hidden shadow-2xl shadow-primary/5 border border-gray-100 group cursor-pointer relative"
              >
                <img src={img} alt={`Coleção ${idx + 1}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent group-hover:from-black/10 transition-all" />
                <div className="absolute bottom-6 left-6">
                  <span className="text-white font-black text-xs uppercase tracking-widest bg-white/20 backdrop-blur-md px-4 py-2 rounded-xl">Explorar</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Profile info */}
       <div className="bg-white rounded-[3rem] border border-gray-100 shadow-sm overflow-hidden mb-12 relative">
          <div className="px-10 py-10 relative">
             <div className="flex flex-col md:flex-row items-end gap-6 -mt-20 mb-8 px-2 relative z-10">
                <div className="w-32 h-32 rounded-[2.5rem] bg-white p-2 shadow-2xl border border-gray-100 flex-shrink-0">
                   <img src={sellerLogo} className="w-full h-full object-cover rounded-[2rem]" alt="Logo" />
                </div>
                <div className="flex-1 mb-2">
                   <h2 className="text-2xl md:text-5xl font-black text-gray-900 leading-tight">{sellerSettings.name}</h2>
                   <p className="text-sm text-gray-500 font-medium">{sellerSettings.handle} • {sellerSettings.location}</p>
                </div>
                <div className="flex gap-2 mb-2">
                   <button 
                     className="px-8 py-3 text-white rounded-2xl font-black text-xs uppercase shadow-xl hover:scale-105 transition-all flex items-center gap-2"
                     style={{ backgroundColor: brandColor }}
                   >
                      <UserPlus size={18} />
                      Seguir
                   </button>
                   <button className="p-3 bg-gray-50 text-gray-400 rounded-2xl hover:bg-gray-100 transition-all border border-gray-100">
                      <Send size={20} />
                   </button>
                </div>
             </div>

             <div className="max-w-3xl mb-10">
                <p className="text-gray-500 font-medium leading-relaxed">
                   {sellerSettings.bio}
                </p>
             </div>

             <div className="flex gap-10 border-b border-gray-100 overflow-x-auto no-scrollbar -mx-10 px-10">
                {['Produtos', 'Avaliações', 'Sobre'].map(tab => (
                  <button 
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={cn(
                      "pb-4 text-sm font-black uppercase tracking-widest relative transition-all",
                      activeTab === tab ? "text-primary" : "text-gray-400 hover:text-gray-600"
                    )}
                  >
                    {tab}
                    {activeTab === tab && (
                      <motion.div layoutId="store-tab" className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-full" />
                    )}
                  </button>
                ))}
             </div>
          </div>
       </div>

       {activeTab === 'Produtos' && (
         <>
           <SectionHeader title="Coleção em Destaque" />
           <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-x-6 gap-y-10">
              {products.slice(0, 10).map(product => (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                  onClick={() => onProductClick(product)}
                  isFavorite={favorites.includes(product.id)}
                  onToggleFavorite={() => onToggleFavorite(product.id)}
                />
              ))}
           </div>
         </>
       )}
    </div>
  );
}

function CartScreen({ cart, onUpdateQuantity, onRemove, onCheckout }: { cart: CartItem[], onUpdateQuantity: (id: string, s: string, d: number) => void, onRemove: (id: string, s: string) => void, onCheckout: () => void }) {
  const total = cart.reduce((acc: number, item: CartItem) => acc + (item.price * item.quantity), 0);

  if (cart.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <div className="w-32 h-32 bg-gray-50 rounded-[2.5rem] flex items-center justify-center text-gray-300 mb-8 border border-gray-100 shadow-inner">
          <ShoppingCart size={56} />
        </div>
        <h2 className="text-3xl font-black text-gray-900 mb-3 tracking-tight">O Carrinho está Vazio</h2>
        <p className="text-gray-500 max-w-sm mb-10 font-medium leading-relaxed">Ainda não escolheste os teus favoritos. Explora a nossa coleção e encontra o estilo perfeito para ti!</p>
        <button onClick={() => window.location.href = '#'} className="bg-primary text-white px-10 py-5 rounded-[1.5rem] font-black shadow-2xl shadow-primary/30 hover:scale-105 transition-all uppercase text-xs tracking-widest">Começar a Comprar</button>
      </div>
    );
  }

  return (
    <div className="w-full px-2 md:px-0">
      <SectionHeader title="O Teu Carrinho" subtitle={`${cart.length} itens selecionados`} />
      
      <div className="flex flex-col lg:flex-row gap-12 items-start">
        <div className="flex-1 w-full space-y-6">
          {cart.map((item: any) => (
            <div key={item.id + item.selectedSize} className="flex gap-6 md:gap-8 bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
              <div className="w-28 h-28 sm:w-40 sm:h-40 rounded-[2rem] overflow-hidden bg-gray-50 flex-shrink-0 border border-gray-50">
                <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-all duration-700" />
              </div>
              <div className="flex-1 flex flex-col justify-between py-2">
                <div>
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-black text-gray-900 text-lg md:text-xl leading-tight">{item.name}</h3>
                    <button 
                      onClick={() => onRemove(item.id, item.selectedSize)} 
                      className="w-10 h-10 bg-gray-50 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl flex items-center justify-center transition-all"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2 items-center">
                    <span className="px-3 py-1 bg-gray-100 rounded-lg text-[9px] font-black text-gray-500 uppercase tracking-widest leading-none">Tamanho {item.selectedSize}</span>
                    <span className="px-3 py-1 bg-primary/10 rounded-lg text-[9px] font-black text-primary uppercase tracking-widest leading-none">{item.category}</span>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 sm:items-end justify-between mt-4">
                  <div className="flex items-center bg-gray-50 rounded-2xl p-1.5 border border-gray-100 w-fit">
                    <button 
                      onClick={() => onUpdateQuantity(item.id, item.selectedSize, -1)} 
                      disabled={item.quantity <= 1}
                      className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-black hover:bg-white rounded-xl transition-all disabled:opacity-30"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="w-10 text-center font-black text-lg">{item.quantity}</span>
                    <button 
                      onClick={() => onUpdateQuantity(item.id, item.selectedSize, 1)} 
                      className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-black hover:bg-white rounded-xl transition-all"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Preço Total</p>
                    <p className="text-2xl font-black text-primary tracking-tighter">Kz {(item.price * item.quantity).toLocaleString()}.000</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="w-full lg:w-[400px] lg:sticky lg:top-28">
          <div className="bg-white p-8 md:p-10 rounded-[3rem] border border-gray-100 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>
            <h3 className="text-2xl font-black mb-8 tracking-tight">Resumo do Pedido</h3>
            
            <div className="space-y-6 mb-10">
              <div className="flex justify-between items-center text-gray-500 font-bold">
                <span className="text-sm">Subtotal ({cart.reduce((a, b) => a + b.quantity, 0)} itens)</span>
                <span className="text-gray-900">Kz {total.toLocaleString()}.000</span>
              </div>
              <div className="flex justify-between items-center text-gray-500 font-bold">
                <span className="text-sm">Taxa de Entrega</span>
                <span className="text-green-500 font-black uppercase text-[10px] tracking-widest">Grátis</span>
              </div>
              <div className="flex justify-between items-center text-gray-500 font-bold">
                <span className="text-sm">Desconto</span>
                <span className="text-gray-900">- Kz0</span>
              </div>
              
              <div className="pt-6 border-t-2 border-dashed border-gray-100 flex justify-between items-end">
                <div>
                  <span className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Total a Pagar</span>
                  <span className="font-black text-3xl text-gray-900 tracking-tighter">Kz {total.toLocaleString()}.000</span>
                </div>
              </div>
            </div>

            <button 
              onClick={onCheckout} 
              className="w-full bg-black text-white py-6 rounded-[2rem] font-black shadow-2xl shadow-black/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 group uppercase text-xs tracking-widest"
            >
              Finalizar Pedido
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
            
            <div className="mt-8 flex items-center justify-center gap-3 text-gray-400">
               <Shield size={16} />
               <p className="text-[10px] font-black uppercase tracking-widest">Pagamento 100% Seguro</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CheckoutScreen({ cart, onComplete, empresaId, userId }: { cart: CartItem[], onComplete: () => void, empresaId: string, userId: string }) {
  const total = cart.reduce((acc: number, item: CartItem) => acc + (item.price * item.quantity), 0);
  const [step, setStep] = useState(1);
  const [method, setMethod] = useState<'TRANSFER' | 'MCX' | 'KWIK'>('KWIK');
  const [file, setFile] = useState<any>(null);
  const [phone, setPhone] = useState('');
  const [kwikId, setKwikId] = useState('');
  const [senderNumber, setSenderNumber] = useState('');
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<string>('PENDING');
  const [loading, setLoading] = useState(false);

  // Criar pedido no IndexedDB
  const processOrder = useCallback(async () => {
    try {
      console.log('📝 Processando pedido para:', { empresaId, userId });
      // Mapear CartItem para o formato esperado pelo serviço
      const itemsForOrder = cart.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity
      }));

      await OrderService.placeOrder(empresaId, userId, itemsForOrder);
      console.log('✅ Pedido criado com sucesso!');
      setStep(3);
    } catch (err: any) {
      console.error('❌ Erro no processOrder:', err);
      alert(`Erro ao processar pedido: ${err.message}`);
    }
  }, [cart, empresaId, userId]);

  // Poll for MCX Express or Kwik payment status
  useEffect(() => {
    let interval: any;
    if (paymentId && paymentStatus === 'PENDING') {
      console.log('🔄 Iniciando polling de pagamento:', paymentId);
      interval = setInterval(async () => {
        try {
          const res = await fetch(`/api/pay/status/${paymentId}`);
          if (!res.ok) throw new Error('Erro na rede');
          const data = await res.json();
          console.log('📡 Status recebido:', data.status);
          if (data.status === 'SUCCESS') {
            setPaymentStatus('SUCCESS');
            await processOrder();
            clearInterval(interval);
          } else if (data.status === 'FAILED') {
            setPaymentStatus('FAILED');
            clearInterval(interval);
          }
        } catch (e) {
          console.error("Polling error", e);
        }
      }, 3000);
    }
    return () => {
      if (interval) {
        console.log('🛑 Limpando intervalo de polling');
        clearInterval(interval);
      }
    };
  }, [paymentId, paymentStatus, processOrder]);

  const handleKwikPay = async () => {
    // Normalizar ID (geralmente número de telefone ou ID específico)
    const normalizedId = kwikId.replace(/\D/g, '');
    if (normalizedId.length < 9) {
      alert("Por favor, introduza um ID Kwik ou Número válido.");
      return;
    }

    setLoading(true);
    try {
      // Endpoint simulado para Kwik
      const res = await fetch('/api/pay/kwik', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          kwikId: normalizedId, 
          amount: total,
          items: cart.map(i => i.name)
        })
      });
      if (!res.ok) throw new Error('Falha ao iniciar pagamento via Kwik');
      const data = await res.json();
      setPaymentId(data.paymentId);
      // O polling automático via useEffect tratará o sucesso
    } catch (e: any) {
      alert(`Erro ao iniciar pagamento Kwik: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleMCXPay = async () => {
    // Normalizar número (remover espaços e símbolos)
    const normalizedPhone = phone.replace(/\D/g, '');
    if (normalizedPhone.length < 9) {
      alert("Por favor, introduza um número válido de 9 dígitos.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/pay/mcx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          phoneNumber: normalizedPhone, 
          amount: total,
          items: cart.map(i => i.name)
        })
      });
      if (!res.ok) throw new Error('Falha ao iniciar pagamento');
      const data = await res.json();
      setPaymentId(data.paymentId);
      // Wait for success in the useEffect polling
    } catch (e: any) {
      alert(`Erro ao iniciar pagamento: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleManualPay = async () => {
    if (!file || !senderNumber) return;
    setLoading(true);
    try {
      const res = await fetch('/api/pay/transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          amount: total, 
          senderNumber,
          receiptImage: 'fake-url' // In real app, upload to S3/Firebase
        })
      });
      const data = await res.json();
      setPaymentId(data.paymentId);
      await processOrder();
    } catch (e) {
      alert("Erro ao enviar comprovativo");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto w-full">
      <SectionHeader title="Finalizar Compra" />

      {/* Stepper */}
      <div className="flex items-center gap-4 mb-10">
        <div className={cn("flex-1 h-2 rounded-full", step >= 1 ? "bg-primary" : "bg-gray-100")}></div>
        <div className={cn("flex-1 h-2 rounded-full", step >= 2 ? "bg-primary" : "bg-gray-100")}></div>
        <div className={cn("flex-1 h-2 rounded-full", step >= 3 ? "bg-primary" : "bg-gray-100")}></div>
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
             <h3 className="text-lg font-black mb-6">Detalhes de Entrega</h3>
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-400 uppercase ml-1">Província</label>
                  <input type="text" placeholder="Luanda" className="w-full bg-gray-50 border-none rounded-xl p-4 text-sm font-bold focus:ring-2 ring-primary/20 outline-none" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-400 uppercase ml-1">Bairro / Rua</label>
                  <input type="text" placeholder="Maianga, Rua 12" className="w-full bg-gray-50 border-none rounded-xl p-4 text-sm font-bold focus:ring-2 ring-primary/20 outline-none" />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-bold text-gray-400 uppercase ml-1">Instruções para Entrega</label>
                  <textarea placeholder="Perto da escola..." className="w-full bg-gray-50 border-none rounded-xl p-4 text-sm font-bold focus:ring-2 ring-primary/20 outline-none h-24" />
                </div>
             </div>
             <button onClick={() => setStep(2)} className="w-full bg-primary text-white py-5 rounded-2xl font-black shadow-xl shadow-primary/20">Continuar para Pagamento</button>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
             <div className="flex items-center justify-between mb-8">
               <h3 className="text-lg font-black">Método de Pagamento</h3>
               <div className="flex bg-gray-100 p-1 rounded-xl overflow-x-auto max-w-full">
                 <button 
                  onClick={() => setMethod('KWIK')}
                  className={cn("px-4 py-2 rounded-lg text-[10px] font-black uppercase transition-all whitespace-nowrap", method === 'KWIK' ? "bg-white shadow-sm text-primary" : "text-gray-400")}
                 >Kwik (Automático)</button>
                 <button 
                  onClick={() => setMethod('MCX')}
                  className={cn("px-4 py-2 rounded-lg text-[10px] font-black uppercase transition-all whitespace-nowrap", method === 'MCX' ? "bg-white shadow-sm text-primary" : "text-gray-400")}
                 >Express</button>
                 <button 
                  onClick={() => setMethod('TRANSFER')}
                  className={cn("px-4 py-2 rounded-lg text-[10px] font-black uppercase transition-all whitespace-nowrap", method === 'TRANSFER' ? "bg-white shadow-sm text-primary" : "text-gray-400")}
                 >Manual (Transferência)</button>
               </div>
             </div>

             {method === 'KWIK' && (
               <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
                  <div className="bg-gradient-to-br from-primary/10 to-transparent border border-primary/20 p-6 rounded-3xl flex items-center gap-4">
                    <div className="w-12 h-12 bg-black rounded-2xl flex items-center justify-center text-white shadow-lg shadow-black/20">
                      <Zap size={24} className="text-yellow-400" />
                    </div>
                    <div>
                      <p className="text-sm font-black text-gray-900">Kwik Instantâneo</p>
                      <p className="text-xs text-gray-500 font-medium leading-tight">Pagamento automático e verificação imediata via Kwik.</p>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-400 uppercase ml-1">Kwik ID / Número (9 dígitos)</label>
                    <div className="relative">
                      <input 
                        type="tel" 
                        value={kwikId}
                        onChange={(e) => setKwikId(e.target.value)}
                        placeholder="9XX XXX XXX" 
                        className="w-full bg-gray-50 border-none rounded-xl p-4 pl-12 text-sm font-bold focus:ring-2 ring-primary/20 outline-none" 
                      />
                      <Smartphone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    </div>
                    <p className="text-[10px] text-gray-400 italic ml-1 mt-1">Introduza o seu identificador Kwik ou número de telemóvel.</p>
                  </div>

                  {paymentId ? (
                    <div className="bg-gray-900 text-white p-8 rounded-[2rem] flex flex-col items-center text-center">
                       <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mb-4">
                          <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}>
                            <Clock size={32} className="text-primary" />
                          </motion.div>
                       </div>
                       <h4 className="text-xl font-black mb-2 tracking-tight">Verificando Kwik...</h4>
                       <p className="text-xs opacity-60 font-medium max-w-[200px]">O sistema está a confirmar a recepção automática do seu pagamento.</p>
                       <div className="mt-8 flex flex-col gap-4">
                           <button 
                             onClick={() => processOrder()} 
                             className="text-[10px] text-gray-500 underline decoration-gray-500/30 hover:text-white transition-colors"
                           >
                             Simular Verificação (Debug)
                           </button>
                       </div>
                    </div>
                  ) : (
                    <button 
                      onClick={handleKwikPay}
                      disabled={loading || kwikId.replace(/\D/g, '').length < 9}
                      className="w-full bg-primary text-white py-5 rounded-2xl font-black shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                    >
                      {loading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          <span>A processar...</span>
                        </>
                      ) : (
                        <>
                          <Zap size={18} />
                          <span>Pagar Agora com Kwik</span>
                        </>
                      )}
                    </button>
                  ) }
               </div>
             )}

             {method === 'MCX' && (
               <div className="space-y-8">
                  <div className="bg-primary/5 border border-primary/10 p-6 rounded-3xl flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-white shadow-lg shadow-primary/20">
                      <Smartphone size={24} />
                    </div>
                    <div>
                      <p className="text-sm font-black text-gray-900">Multicaixa Express</p>
                      <p className="text-xs text-gray-500 font-medium">Pagamento instantâneo via App MCX Express.</p>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-400 uppercase ml-1">Teu Número Multicaixa (9 dígitos)</label>
                    <div className="relative">
                      <input 
                        type="tel" 
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="9XX XXX XXX" 
                        className="w-full bg-gray-50 border-none rounded-xl p-4 pl-12 text-sm font-bold focus:ring-2 ring-primary/20 outline-none" 
                      />
                      <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    </div>
                    <p className="text-[10px] text-gray-400 italic ml-1 mt-1">Garante que o número está associado ao teu Multicaixa Express.</p>
                  </div>

                  {paymentId ? (
                    <div className="bg-gray-900 text-white p-8 rounded-[2rem] flex flex-col items-center text-center">
                       <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mb-4 animate-pulse">
                          <Clock size={32} className="text-primary" />
                       </div>
                       <h4 className="text-xl font-black mb-2 tracking-tight">Aguardando Aprovação...</h4>
                       <p className="text-xs opacity-60 font-medium max-w-[200px]">Por favor, abra o seu aplicativo Multicaixa Express agora para autorizar o pagamento.</p>
                       <div className="mt-8 flex flex-col gap-4">
                           <div className="flex gap-2 justify-center">
                              {[0,1,2].map(i => <div key={i} className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: `${i * 0.1}s` }} />)}
                           </div>
                           <button 
                             onClick={() => processOrder()} 
                             className="text-[10px] text-gray-500 underline decoration-gray-500/30 hover:text-white transition-colors"
                           >
                             Simular Aprovação (Debug)
                           </button>
                       </div>
                    </div>
                  ) : (
                    <button 
                      onClick={handleMCXPay}
                      disabled={loading || phone.replace(/\D/g, '').length < 9}
                      className="w-full bg-primary text-white py-5 rounded-2xl font-black shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                    >
                      {loading ? "A processar..." : `Pagar Kz ${total.toLocaleString()}.000`}
                    </button>
                  ) }
               </div>
             )}

             {method === 'TRANSFER' && (
               <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
                  <div className="bg-gray-900 text-white p-8 rounded-[2rem] relative overflow-hidden">
                    <div className="relative z-10">
                      <p className="text-xs opacity-60 uppercase mb-4 font-bold">Dados Bancários</p>
                      <div className="space-y-4">
                          <div>
                            <p className="text-[10px] opacity-40 uppercase">IBAN</p>
                            <p className="text-lg font-mono font-bold tracking-wider">AO06 0001 0000 1234 5678 1011 2</p>
                          </div>
                          <div className="flex justify-between">
                            <div>
                                <p className="text-[10px] opacity-40 uppercase">Banco</p>
                                <p className="font-bold">BFA</p>
                            </div>
                            <div>
                                <p className="text-[10px] opacity-40 uppercase">Titular</p>
                                <p className="font-bold">SHOPPINGAPP LTDA</p>
                            </div>
                          </div>
                      </div>
                    </div>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl text-primary flex items-center justify-center opacity-20">
                      <Wallet size={80} />
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-400 uppercase ml-1">Anexar Comprovativo</label>
                      <label className="w-full bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer hover:bg-primary/5 hover:border-primary transition-all">
                        <input type="file" className="hidden" onChange={(e) => setFile(e.target.files?.[0])} />
                        <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-primary mb-3">
                          <Plus size={24} />
                        </div>
                        <span className="text-sm font-bold text-gray-900">{file ? file.name : "Selecionar Comprovativo"}</span>
                        <span className="text-[10px] text-gray-400 mt-1 uppercase font-black tracking-tighter">PDF ou Imagem</span>
                      </label>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-400 uppercase ml-1">Número do Remetente</label>
                      <input 
                        type="text" 
                        value={senderNumber}
                        onChange={(e) => setSenderNumber(e.target.value)}
                        placeholder="Número da conta ou Telefone" 
                        className="w-full bg-gray-50 border-none rounded-xl p-4 text-sm font-bold focus:ring-2 ring-primary/20 outline-none" 
                      />
                    </div>
                  </div>

                  <button 
                    onClick={handleManualPay}
                    disabled={!file || !senderNumber || loading}
                    className={cn(
                      "w-full py-5 rounded-2xl font-black shadow-xl transition-all",
                      file && senderNumber ? "bg-primary text-white shadow-primary/20 hover:scale-[1.02]" : "bg-gray-100 text-gray-300 cursor-not-allowed"
                    )}
                  >
                    {loading ? "A carregar..." : "Confirmar Envio"}
                  </button>
               </div>
             )}
          </motion.div>
        )}

        {step === 3 && (
          <motion.div key="step3" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center py-10 text-center">
             <div className="w-40 h-40 bg-green-500 rounded-full flex items-center justify-center text-white mb-8 shadow-2xl shadow-green-100">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3, type: 'spring' }}>
                   <CheckCircle size={80} strokeWidth={2.5} />
                </motion.div>
             </div>
             <h2 className="text-4xl font-black text-gray-900 mb-4 tracking-tight">Pedido Sucesso!</h2>
             <p className="text-gray-500 max-w-sm mb-12 font-medium">
               {method === 'MCX' 
                ? "O seu pagamento foi detetado e processado automaticamente. Podes agora ver o teu QR Code de levantamento."
                : "Recebemos o teu comprovativo. O administrador irá validá-lo brevemente para libertar o teu pedido."}
             </p>
             <button onClick={onComplete} className="w-full bg-black text-white py-5 rounded-2xl font-black shadow-xl shadow-black/10">Ver Meus Pedidos</button>
             <button onClick={() => setStep(1)} className="mt-4 text-xs font-black text-gray-400 uppercase tracking-widest hover:text-gray-900">Voltar</button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// --- SELLER SCREEN COMPONENTS ---

function SellerDashboard({ products, setScreen }: { products: Product[], setScreen: (s: string) => void }) {
  const [selectedActivity, setSelectedActivity] = useState<any>(null);

  const stats = [
    { id: 'seller-earnings', label: 'Vendas Hoje', value: 'Kz 180.000', icon: DollarSign, color: 'bg-green-500' },
    { id: 'seller-orders', label: 'Pedidos Ativos', value: '12', icon: Clock, color: 'bg-blue-500' },
    { id: 'seller-products', label: 'Stock Baixo', value: '3 itens', icon: AlertCircle, color: 'bg-orange-500' },
    { id: 'seller-earnings', label: 'Ganhos Mês', value: 'Kz 2.4M', icon: TrendingUp, color: 'bg-purple-500' },
  ];

  return (
    <div className="w-full">
       <SectionHeader title="Visão Geral do Negócio" />
       
       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {stats.map((stat, i) => (
            <div 
              key={i} 
              onClick={() => setScreen(stat.id)}
              className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex items-center gap-5 cursor-pointer hover:shadow-md hover:scale-[1.02] transition-all"
            >
               <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg", stat.color)}>
                  <stat.icon size={24} />
               </div>
               <div>
                  <p className="text-xs font-black text-gray-400 uppercase tracking-wider">{stat.label}</p>
                  <p className="text-xl font-black text-gray-900">{stat.value}</p>
               </div>
            </div>
          ))}
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-gray-50 border border-gray-100 p-8 rounded-[2.5rem]">
             <h3 className="text-lg font-black mb-6">Atividade de Vendas</h3>
             <div className="space-y-4">
                {[0,1,2].map(i => {
                   const prod = products[i] || products[0];
                   const mockOrder = {
                     id: `#823${i}4`,
                     product: prod,
                     customer: 'João Silva',
                     date: '25 Abr 2026, 14:30',
                     amount: 'Kz 60.000',
                     status: 'Pago'
                   };
                   return (
                    <div 
                      key={i} 
                      onClick={() => setSelectedActivity(mockOrder)}
                      className="bg-white p-4 rounded-2xl flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
                    >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-100 rounded-lg overflow-hidden">
                              <img src={prod?.image} className="w-full h-full object-cover" />
                          </div>
                          <div>
                              <p className="text-sm font-bold">{prod?.name}</p>
                              <p className="text-[10px] text-gray-500 font-black uppercase truncate max-w-[100px] tracking-wider">Pedido {mockOrder.id}</p>
                          </div>
                        </div>
                        <span className="text-sm font-black text-green-500">+ {mockOrder.amount}</span>
                    </div>
                   );
                })}
             </div>
          </div>
          <div className="bg-primary/5 border border-primary/10 p-8 rounded-[2.5rem] flex flex-col justify-center items-center text-center">
             <div className="w-16 h-16 bg-white rounded-2xl shadow-xl flex items-center justify-center text-primary mb-4">
                <QrCode size={32} />
             </div>
             <h3 className="text-lg font-black mb-2">Entregas Rápidas</h3>
             <p className="text-sm text-gray-600 mb-6 max-w-xs font-medium">Usa o Scanner para confirmar a entrega e libertar o teu saldo instantaneamente.</p>
             <button 
               onClick={() => setScreen('seller-scanner')}
               className="bg-primary text-white px-8 py-3 rounded-xl font-black shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
             >
               Abrir Scanner
             </button>
          </div>
       </div>

       {/* Sale Activity Detail Modal */}
       <AnimatePresence>
         {selectedActivity && (
           <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedActivity(null)}
                className="absolute inset-0 bg-black/80 backdrop-blur-md"
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative bg-white w-full max-w-md md:max-w-xl rounded-[3rem] overflow-hidden shadow-2xl p-8"
              >
                 <div className="flex items-center justify-between mb-8">
                    <div>
                       <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">Detalhes da Venda</p>
                       <h3 className="text-xl font-black text-gray-900">{selectedActivity.id}</h3>
                    </div>
                    <button 
                      onClick={() => setSelectedActivity(null)}
                      className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-black hover:text-white transition-all"
                    >
                      <X size={20} />
                    </button>
                 </div>

                 <div className="space-y-6">
                    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                       <div className="w-16 h-16 bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100">
                          <img src={selectedActivity.product.image} className="w-full h-full object-cover" />
                       </div>
                       <div>
                          <p className="text-xs font-black text-gray-400 uppercase mb-0.5">{selectedActivity.product.category}</p>
                          <h4 className="text-sm font-black text-gray-900">{selectedActivity.product.name}</h4>
                          <p className="text-xs font-bold text-primary">{selectedActivity.amount}</p>
                       </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                       <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                          <p className="text-[9px] font-black text-gray-400 uppercase mb-1">Comprador</p>
                          <p className="text-xs font-black text-gray-900">{selectedActivity.customer}</p>
                       </div>
                       <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                          <p className="text-[9px] font-black text-gray-400 uppercase mb-1">Data</p>
                          <p className="text-xs font-black text-gray-900">{selectedActivity.date}</p>
                       </div>
                    </div>

                    <div className="p-5 bg-green-50 border border-green-100 rounded-2xl flex items-center justify-between">
                       <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-green-500 shadow-sm">
                             <Check size={16} strokeWidth={3} />
                          </div>
                          <span className="text-xs font-black text-green-700 uppercase tracking-widest">Saldo Disponível</span>
                       </div>
                       <span className="text-xs font-black text-green-700">{selectedActivity.amount}</span>
                    </div>
                 </div>

                 <button 
                   onClick={() => setSelectedActivity(null)}
                   className="w-full py-5 bg-black text-white rounded-2xl font-black text-xs uppercase tracking-widest mt-8"
                 >
                    Fechar
                 </button>
              </motion.div>
           </div>
         )}
       </AnimatePresence>
    </div>
  );
}

function SellerProducts({ products, onDelete, onEdit, onAdd }: { products: Product[], onDelete: (id: string) => void, onEdit: (p: Product) => void, onAdd: () => void }) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [filterCategory, setFilterCategory] = useState('Todos');

  const filteredProducts = useMemo(() => {
    if (filterCategory === 'Todos') return products;
    return products.filter(p => p.category === filterCategory);
  }, [products, filterCategory]);

  return (
    <div className="w-full">
       <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <SectionHeader title="Gerir Inventário" subtitle="Controle total sobre os seus produtos e stock" />
          <div className="flex items-center gap-3">
             <div className="relative flex-1 md:w-64">
                <Filter size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <select 
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="w-full pl-12 pr-10 py-3 bg-white border border-gray-100 rounded-2xl text-sm font-black focus:ring-4 focus:ring-primary/10 transition-all outline-none shadow-sm appearance-none cursor-pointer"
                >
                   <option value="Todos">Todos os Produtos</option>
                   <option value="Homem">Homem</option>
                   <option value="Mulher">Mulher</option>
                   <option value="Rapaz">Rapaz</option>
                   <option value="Rapariga">Rapariga</option>
                   <option value="Bebé">Bebé</option>
                </select>
                <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
             </div>
             <button 
               onClick={onAdd}
               className="flex items-center gap-2 bg-black text-white px-6 py-3 rounded-2xl font-black shadow-xl hover:scale-105 transition-all text-xs uppercase whitespace-nowrap"
             >
                <Plus size={18} />
                <span className="hidden sm:inline">Novo Produto</span>
             </button>
          </div>
       </div>

       <div className="bg-white border border-gray-100 rounded-[2.5rem] overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
             <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                   <th className="px-6 py-4 text-[10px] font-black text-gray-600 uppercase tracking-widest leading-none">Produto</th>
                   <th className="px-6 py-4 text-[10px] font-black text-gray-600 uppercase tracking-widest leading-none">Categoria</th>
                   <th className="px-6 py-4 text-[10px] font-black text-gray-600 uppercase tracking-widest leading-none">Preço</th>
                   <th className="px-6 py-4 text-[10px] font-black text-gray-600 uppercase tracking-widest leading-none">Stock</th>
                   <th className="px-6 py-4 text-[10px] font-black text-gray-600 uppercase tracking-widest leading-none text-right">Ações</th>
                </tr>
             </thead>
             <tbody className="divide-y divide-gray-50">
                {filteredProducts.length > 0 ? filteredProducts.map((p: any) => (
                   <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                         <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 shadow-sm border border-gray-100">
                               <img src={p.image} className="w-full h-full object-cover" />
                            </div>
                            <span className="text-sm font-bold text-gray-900">{p.name}</span>
                         </div>
                      </td>
                      <td className="px-6 py-4">
                         <span className="text-[10px] font-black text-gray-400 bg-gray-100 px-3 py-1 rounded-full uppercase">{p.category}</span>
                      </td>
                      <td className="px-6 py-4">
                         <span className="text-sm font-black text-gray-900">Kz {p.price.toLocaleString()}.000</span>
                      </td>
                      <td className="px-6 py-4">
                         <span className={cn("px-3 py-1 rounded-full text-[9px] font-black uppercase", (p.stock || 0) < 5 ? "bg-red-50 text-red-500" : "bg-green-50 text-green-500")}>
                            {(p.stock || 0) < 5 ? `Baixo (${p.stock || 0})` : `Em Stock (${p.stock || 0})`}
                         </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                         <div className="flex justify-end gap-2">
                            <button 
                              onClick={() => onEdit(p)}
                              className="p-2.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-xl transition-all"
                            >
                               <Edit3 size={18} />
                            </button>
                            <button 
                              onClick={() => {
                                if (p.id) {
                                  setProductToDelete(p);
                                  setShowDeleteConfirm(true);
                                }
                              }}
                              className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                            >
                               <Trash2 size={18} />
                            </button>
                         </div>
                      </td>
                   </tr>
                )) : (
                   <tr>
                      <td colSpan={5} className="px-6 py-20 text-center text-gray-400 font-medium italic">
                         Nenhum produto encontrado.
                      </td>
                   </tr>
                )}
             </tbody>
          </table>
       </div>

       {/* Delete Confirmation Modal */}
       <AnimatePresence>
         {showDeleteConfirm && (
           <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowDeleteConfirm(false)}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative bg-white dark:bg-gray-900 w-full max-w-sm rounded-[2.5rem] overflow-hidden shadow-2xl p-8 text-center border dark:border-gray-800"
              >
                 <div className="w-20 h-20 bg-red-50 dark:bg-red-500/10 text-red-500 rounded-3xl flex items-center justify-center mx-auto mb-6">
                    <Trash2 size={40} />
                 </div>
                 
                 <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">Tens a certeza?</h3>
                 <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-8 leading-relaxed">
                   Estás prestes a eliminar <span className="font-bold text-gray-900 dark:text-white">"{productToDelete?.name}"</span>. Esta ação não pode ser desfeita.
                 </p>

                 <div className="flex gap-3">
                    <button 
                      onClick={() => setShowDeleteConfirm(false)}
                      className="flex-1 py-4 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-2xl font-black text-xs uppercase hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
                    >
                       Cancelar
                    </button>
                    <button 
                      onClick={() => {
                        onDelete(productToDelete.id);
                        setShowDeleteConfirm(false);
                      }}
                      className="flex-1 py-4 bg-red-500 text-white rounded-2xl font-black text-xs uppercase hover:bg-red-600 transition-all shadow-lg shadow-red-100 dark:shadow-none"
                    >
                       Sim, Eliminar
                    </button>
                 </div>
              </motion.div>
           </div>
         )}
       </AnimatePresence>
    </div>
  );
}

function SellerOrders({ products }: { products: Product[] }) {
  const [readyOrders, setReadyOrders] = useState<number[]>([]);
  const [filterCategory, setFilterCategory] = useState('Todos');

  const handleMarkReady = (id: number) => {
    setReadyOrders(prev => [...prev, id]);
    alert(`Pedido #${id} marcado como pronto para levantamento!`);
  };

  const filteredOrders = useMemo(() => {
    // Use first 10 products to create more mock orders
    const mockOrders = products.slice(0, 10).map((p, i) => ({
      id: 890 + i,
      product: p,
      customer: ['João M.', 'Maria S.', 'Carlos D.', 'Ana L.', 'Pedro R.', 'Sofia B.', 'Rui T.', 'Inês F.', 'Tiago G.', 'Marta V.'][i] || 'Cliente',
      status: 'Pagamento Validado'
    }));

    if (filterCategory === 'Todos') return mockOrders;
    return mockOrders.filter(order => order.product.category === filterCategory);
  }, [products, filterCategory]);

  return (
    <div className="w-full">
       <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8">
          <SectionHeader 
            title="Pedidos para Preparar" 
            subtitle="Gere os pedidos recebidos e prepare-os para levantamento" 
          />
          <div className="relative sm:w-64 -mt-4 sm:mt-0">
             <Filter size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
             <select 
               value={filterCategory}
               onChange={(e) => setFilterCategory(e.target.value)}
               className="w-full pl-12 pr-10 py-3 bg-white border border-gray-100 rounded-2xl text-sm font-black focus:ring-4 focus:ring-primary/10 transition-all outline-none shadow-sm appearance-none cursor-pointer"
             >
                <option value="Todos">Todos os Pedidos</option>
                <option value="Homem">Homem</option>
                <option value="Mulher">Mulher</option>
                <option value="Rapaz">Rapaz</option>
                <option value="Rapariga">Rapariga</option>
                <option value="Bebé">Bebé</option>
             </select>
             <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
       </div>
       
       <div className="space-y-4">
          {filteredOrders.length > 0 ? filteredOrders.map(order => {
             const isReady = readyOrders.includes(order.id);
             return (
              <div key={order.id} className={cn("bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-md transition-all", isReady && "opacity-60")}>
                  <div className="flex items-center gap-5">
                    <div className="w-20 h-20 bg-gray-100 rounded-2xl overflow-hidden shadow-inner flex-shrink-0">
                        <img src={order.product.image} className="w-full h-full object-cover" />
                    </div>
                    <div>
                        <h4 className="text-lg font-black text-gray-900">Pedido #{order.id}</h4>
                        <p className="text-sm text-gray-500 font-medium">Cliente: {order.customer} • {order.product.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          {isReady ? (
                            <>
                              <span className="w-2 h-2 rounded-full bg-green-500"></span>
                              <span className="text-[10px] font-black text-green-500 uppercase tracking-widest">Pronto para Levantamento</span>
                            </>
                          ) : (
                            <>
                              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                              <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">{order.status}</span>
                            </>
                          )}
                        </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {!isReady && (
                      <button 
                        onClick={() => handleMarkReady(order.id)}
                        className="flex-1 sm:flex-none px-6 py-3 bg-gray-900 text-white rounded-xl font-bold text-sm tracking-tight hover:bg-black transition-all"
                      >
                          Marcar Pronto
                      </button>
                    )}
                    <button className="p-3 bg-primary/10 text-primary rounded-xl hover:bg-primary hover:text-white transition-all">
                        <Scan size={20} />
                    </button>
                  </div>
              </div>
             );
          }) : (
             <div className="bg-white p-20 rounded-[2.5rem] border border-gray-100 flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mb-4">
                   <ClipboardList size={40} />
                </div>
                <h3 className="text-lg font-black text-gray-900 mb-2">Nenhum pedido encontrado</h3>
                <p className="text-sm text-gray-500 max-w-xs">Não existem pedidos pendentes nesta categoria no momento.</p>
             </div>
          )}
       </div>
    </div>
  );
}

function SellerScanner({ onViewReport }: { onViewReport?: () => void }) {
  const deliveries = [
    { id: '#ORD-8901', customer: 'João Silva', items: 'Jaqueta Bamber Luxury (1x)', amount: 'Kz 60.000', status: 'Pendente' },
    { id: '#ORD-8842', customer: 'Maria Bento', items: 'Sapato Formal Couro (2x)', amount: 'Kz 160.000', status: 'Pendente' },
    { id: '#ORD-7751', customer: 'Carlos Manuel', items: 'Pack 3 T-Shirts Basic (1x)', amount: 'Kz 15.000', status: 'Pendente' },
  ];

  const [selectedDelivery, setSelectedDelivery] = useState<any>(null);

    const [isScanning, setIsScanning] = useState(false);
    const [scanSuccess, setScanSuccess] = useState(false);

    const handleStartScan = () => {
      setIsScanning(true);
      setTimeout(() => {
        setIsScanning(false);
        setScanSuccess(true);
        setTimeout(() => {
          alert(`Entrega ${selectedDelivery.id} validada com sucesso!`);
          setScanSuccess(false);
          setSelectedDelivery(null);
        }, 1500);
      }, 2000);
    };

    if (selectedDelivery) {
      return (
        <div className="max-w-2xl mx-auto w-full flex flex-col items-center">
           <div className="flex items-center justify-between w-full mb-8">
              <button 
                onClick={() => setSelectedDelivery(null)}
                className="w-12 h-12 bg-white border border-gray-100 rounded-2xl flex items-center justify-center text-gray-900 shadow-sm hover:bg-gray-50 transition-all"
              >
                 <ChevronLeft size={24} />
              </button>
              <h2 className="text-xl font-black text-gray-900">Validar Entrega</h2>
              <div className="w-12 h-12"></div>
           </div>

           <div className="bg-white p-10 rounded-[3.5rem] border border-gray-100 shadow-2xl shadow-primary/5 flex flex-col items-center w-full relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-[5rem] -mr-16 -mt-16"></div>
              
              <div className="w-full mb-8 space-y-2 text-center">
                 <span className="text-[10px] font-black text-primary uppercase tracking-widest bg-primary/10 px-4 py-1.5 rounded-full">Pedido {selectedDelivery.id}</span>
                 <h3 className="text-2xl font-black text-gray-900">{selectedDelivery.customer}</h3>
                 <p className="text-sm text-gray-500 font-medium">{selectedDelivery.items}</p>
              </div>

              <div className="p-8 bg-gray-50 rounded-[3rem] border-2 border-dashed border-gray-200 mb-8 w-full flex justify-center relative overflow-hidden">
                 {isScanning && (
                   <motion.div 
                     initial={{ top: 0 }}
                     animate={{ top: "100%" }}
                     transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                     className="absolute left-0 right-0 h-1 bg-primary z-10 shadow-[0_0_15px_rgba(var(--primary),0.5)]"
                   />
                 )}
                 {scanSuccess && (
                   <div className="absolute inset-0 bg-green-500/20 backdrop-blur-[2px] z-20 flex items-center justify-center">
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-green-500 shadow-xl">
                         <CheckCircle2 size={48} />
                      </motion.div>
                   </div>
                 )}
                 <div className="w-64 h-64 bg-white rounded-3xl shadow-md flex items-center justify-center p-8 border border-gray-50">
                    <QrCode size={200} strokeWidth={1} className={cn("text-gray-900 transition-opacity", isScanning ? "opacity-40" : "opacity-100")} />
                 </div>
              </div>

              <button 
                disabled={isScanning || scanSuccess}
                onClick={handleStartScan}
                className={cn(
                  "flex items-center gap-3 px-8 py-4 rounded-2xl shadow-lg ring-4 ring-black/5 w-full justify-center transition-all",
                  scanSuccess ? "bg-green-500 text-white" : isScanning ? "bg-gray-400 text-white cursor-not-allowed" : "bg-black text-white hover:bg-gray-800"
                )}
              >
                 {scanSuccess ? (
                   <Check size={20} strokeWidth={3} />
                 ) : (
                   <Scan size={20} className={cn(isScanning && "animate-spin")} />
                 )}
                 <span className="text-sm font-black uppercase tracking-widest">
                   {scanSuccess ? "Entrega Validada!" : isScanning ? "A Digitalizar..." : "Ativar Scanner da Loja"}
                 </span>
              </button>
              
              <p className="mt-8 text-xs font-bold text-gray-400 text-center max-w-xs leading-relaxed">
                 Posiciona o código do cliente dentro da área de scan para confirmar a entrega e libertar o pagamento.
              </p>
           </div>
        </div>
      );
    }

  return (
    <div className="w-full max-w-3xl mx-auto">
       <SectionHeader 
         title="Lista de Entregas" 
         subtitle="Gere as tuas entregas pendentes e valida as levantadas."
       />

       <div className="grid grid-cols-1 gap-4">
          {deliveries.map((delivery) => (
            <button 
              key={delivery.id}
              onClick={() => setSelectedDelivery(delivery)}
              className="bg-white border border-gray-100 p-6 rounded-[2.5rem] flex items-center justify-between group hover:shadow-xl hover:shadow-primary/5 transition-all text-left"
            >
               <div className="flex items-center gap-5">
                  <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
                     <Package size={28} />
                  </div>
                  <div>
                     <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-black text-primary uppercase tracking-widest">{delivery.id}</span>
                        <div className="w-1 h-1 rounded-full bg-gray-300"></div>
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{delivery.amount}</span>
                     </div>
                     <h3 className="text-lg font-black text-gray-900">{delivery.customer}</h3>
                     <p className="text-xs font-bold text-gray-500 mt-1">{delivery.items}</p>
                  </div>
               </div>
               <div className="flex items-center gap-3">
                  <div className="hidden sm:flex flex-col items-end">
                     <span className="text-[10px] font-black text-gray-400 uppercase mb-1">Estado</span>
                     <span className="text-xs font-black text-orange-500 uppercase tracking-widest">Aguardando</span>
                  </div>
                  <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-gray-300 group-hover:bg-black group-hover:text-white transition-all">
                     <Scan size={20} />
                  </div>
               </div>
            </button>
          ))}
       </div>

       <div className="mt-12 p-8 bg-gray-50 rounded-[3rem] border border-gray-100 flex items-center justify-between gap-6">
          <div className="flex items-center gap-5">
             <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-primary shadow-sm">
                <CheckCircle2 size={28} />
             </div>
             <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Hoje</p>
                <p className="text-lg font-black text-gray-900">12 Entregas Concluídas</p>
             </div>
          </div>
          <button 
            onClick={onViewReport}
            className="px-6 py-3 bg-white border border-gray-200 rounded-xl font-bold text-xs text-gray-600 hover:bg-gray-100 transition-all"
          >
            Ver Relatório
          </button>
       </div>
    </div>
  );
}

function SellerEarnings() {
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [transactions, setTransactions] = useState([
    { id: '#8219', date: '22 ABR 2024', amount: '60.000', customer: 'João Silva', items: '1x Jaqueta Bamber Luxury', method: 'Multicaixa Express', status: 'Concluído' },
    { id: '#8229', date: '21 ABR 2024', amount: '120.000', customer: 'Maria Bento', items: '2x Sapato Formal Couro', method: 'Transferência', status: 'Concluído' },
    { id: '#8239', date: '20 ABR 2024', amount: '45.000', customer: 'Carlos André', items: '1x T-shirt Premium Black', method: 'Multicaixa Express', status: 'Concluído' },
    { id: '#8249', date: '19 ABR 2024', amount: '80.000', customer: 'Ana Paula', items: '1x Calças Cargo Khaki', method: 'Dinheiro', status: 'Concluído' },
  ]);

  const handleWithdraw = () => {
    if (!withdrawAmount || isNaN(Number(withdrawAmount))) return;
    alert(`Levantamento de Kz ${withdrawAmount} solicitado com sucesso!`);
    setShowWithdrawModal(false);
    setWithdrawAmount('');
  };

  return (
    <div className="w-full">
       <SectionHeader title="O Teu Saldo" />

       <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="bg-primary text-white p-10 rounded-[3rem] shadow-2xl shadow-primary/30 relative overflow-hidden">
             <div className="relative z-10">
                <p className="text-xs font-black uppercase tracking-[0.2em] mb-4 opacity-70">Saldo Disponível para Levantamento</p>
                <h2 className="text-5xl font-black mb-8 leading-none">Kz 480.000</h2>
                
                <div className="flex gap-4">
                   <button 
                     onClick={() => setShowWithdrawModal(true)}
                     className="bg-white text-black px-8 py-4 rounded-2xl font-black flex-1 shadow-lg hover:scale-[1.02] transition-all"
                   >
                     Levantar Dinheiro
                   </button>
                   <button className="w-16 h-16 bg-white/20 backdrop-blur-md flex items-center justify-center rounded-2xl">
                      <TrendingUp size={24} />
                   </button>
                </div>
             </div>
             <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full translate-x-1/4 -translate-y-1/2"></div>
          </div>

          <div className="space-y-6">
             <h3 className="text-lg font-black px-2">Histórico Recente</h3>
             {transactions.map((t, i) => (
                <div 
                  key={i} 
                  onClick={() => setSelectedTransaction(t)}
                  className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl border border-transparent hover:border-gray-100 hover:bg-white hover:shadow-sm transition-all cursor-pointer group"
                >
                   <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-green-500 group-hover:bg-green-50 transition-colors">
                         <Package size={20} />
                      </div>
                      <div>
                         <p className="text-sm font-bold text-gray-900">Venda {t.id}</p>
                         <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{t.date}</p>
                      </div>
                   </div>
                   <div className="flex items-center gap-4">
                      <span className="text-sm font-black text-green-500">+ Kz {t.amount}</span>
                      <ChevronRight size={14} className="text-gray-300 group-hover:text-gray-900 group-hover:translate-x-1 transition-all" />
                   </div>
                </div>
             ))}
             <button className="w-full py-4 text-gray-400 font-bold hover:text-primary transition-colors text-sm">Ver Todo o Histórico</button>
          </div>
       </div>

       {showWithdrawModal && (
         <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <motion.div 
               initial={{ opacity: 0, scale: 0.9 }}
               animate={{ opacity: 1, scale: 1 }}
               className="bg-white w-full max-w-md rounded-[3rem] p-10 relative"
            >
               <button 
                 onClick={() => setShowWithdrawModal(false)}
                 className="absolute top-6 right-6 text-gray-400 hover:text-gray-900"
               >
                 <X size={24} />
               </button>

               <div className="text-center mb-8">
                  <div className="w-20 h-20 bg-green-50 text-green-500 rounded-3xl flex items-center justify-center mx-auto mb-6">
                     <Wallet size={32} />
                  </div>
                  <h2 className="text-2xl font-black text-gray-900">Levantar Dinheiro</h2>
                  <p className="text-sm text-gray-500 font-bold mt-2">Introduz o montante que desejas retirar do teu saldo.</p>
               </div>

               <div className="space-y-6">
                  <div>
                     <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2 mb-2 block">Montante (Kz)</label>
                     <input 
                       type="text" 
                       value={withdrawAmount}
                       onChange={(e) => setWithdrawAmount(e.target.value)}
                       placeholder="0.00"
                       className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-gray-900 outline-none focus:ring-2 focus:ring-primary/20"
                     />
                  </div>

                  <div className="p-4 bg-blue-50 rounded-2xl flex gap-3">
                     <Info size={16} className="text-blue-500 shrink-0" />
                     <p className="text-[10px] text-blue-700 font-bold leading-relaxed">
                        O montante será transferido para o IBAN associado ao teu perfil em até 24 horas úteis.
                     </p>
                  </div>

                  <button 
                    onClick={handleWithdraw}
                    className="w-full py-5 bg-gray-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-primary transition-all shadow-xl shadow-gray-200"
                  >
                    Confirmar Levantamento
                  </button>
               </div>
            </motion.div>
         </div>
       )}

       {selectedTransaction && (
         <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <motion.div 
               initial={{ opacity: 0, scale: 0.9 }}
               animate={{ opacity: 1, scale: 1 }}
               className="bg-white w-full max-w-md rounded-[3rem] p-10 relative"
            >
               <button 
                 onClick={() => setSelectedTransaction(null)}
                 className="absolute top-6 right-6 text-gray-400 hover:text-gray-900"
               >
                 <X size={24} />
               </button>

               <div className="mb-8">
                  <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center mb-6">
                     <Package size={28} />
                  </div>
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-2xl font-black text-gray-900">Detalhes da Venda</h2>
                      <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-1">Venda {selectedTransaction.id}</p>
                    </div>
                    <span className="px-4 py-1.5 bg-green-50 text-green-600 rounded-full text-[10px] font-black uppercase tracking-widest leading-none">
                      {selectedTransaction.status}
                    </span>
                  </div>
               </div>

               <div className="space-y-6 border-t border-gray-100 pt-8">
                  <div className="grid grid-cols-2 gap-6">
                     <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Data</p>
                        <p className="text-sm font-bold text-gray-900">{selectedTransaction.date}</p>
                     </div>
                     <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Método</p>
                        <p className="text-sm font-bold text-gray-900">{selectedTransaction.method}</p>
                     </div>
                  </div>

                  <div>
                     <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Cliente</p>
                     <p className="text-sm font-bold text-gray-900">{selectedTransaction.customer}</p>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-2xl">
                     <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">Produtos</p>
                     <p className="text-xs font-bold text-gray-700">{selectedTransaction.items}</p>
                  </div>

                  <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                     <p className="text-sm font-black text-gray-900 uppercase tracking-widest">Total Ganho</p>
                     <p className="text-xl font-black text-green-500">Kz {selectedTransaction.amount}</p>
                  </div>

                  <button 
                    onClick={() => setSelectedTransaction(null)}
                    className="w-full py-5 bg-gray-50 text-gray-900 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-100 transition-all"
                  >
                    Fechar Detalhes
                  </button>
               </div>
            </motion.div>
         </div>
       )}
    </div>
  );
}

function SellerSubscription({ empresaId, userId }: { empresaId: string, userId: string }) {
  const [activePlan, setActivePlan] = useState('Plano Premium');
  const [showPayment, setShowPayment] = useState<string | null>(null);

  const plans = [
    { 
      name: 'Plano Start', 
      price: 'Kz 5.000', 
      features: ['Até 50 Produtos', 'Gestor de Inventário Base', 'Pagamentos via Transferência', 'Suporte Via Email']
    },
    { 
      name: 'Plano Pro', 
      price: 'Kz 10.000', 
      features: ['Até 100 Produtos', 'Suporte Prioritário', 'Scanner QR de Entrega', 'Estatísticas de Vendas']
    },
    { 
      name: 'Plano Premium', 
      price: 'Kz 20.000', 
      features: ['Produtos Ilimitados', 'Destaque no Catálogo', 'Relatórios Avançados', 'Gestor de Conta Dedicado']
    }
  ];

  const handlePlanChange = (name: string) => {
    if (name === activePlan) return;
    setShowPayment(name);
  };

  const handlePaymentComplete = () => {
    if (showPayment) setActivePlan(showPayment);
    setShowPayment(null);
  };

  return (
    <div className="w-full max-w-6xl mx-auto">
       <div className="text-center mb-12">
          <SectionHeader 
            title="Assinatura da Loja" 
            subtitle="Escolhe o plano que melhor se adapta ao crescimento do teu negócio."
          />
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          {plans.map((plan, i) => {
            const isActive = activePlan === plan.name;
            return (
              <div 
                key={i} 
                className={cn(
                  "relative p-8 rounded-[3rem] border transition-all duration-500 flex flex-col items-center text-center",
                  isActive 
                    ? "border-primary border-4 shadow-2xl scale-105 z-10 bg-white" 
                    : "bg-white border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-2"
                )}
              >
                 {isActive && (
                   <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-white text-gray-900 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg border-2 border-primary">
                      Plano Ativo
                   </div>
                 )}
                 
                 <h3 className="text-xl font-black mb-1 text-gray-900">{plan.name}</h3>
                 <div className="mb-8">
                    <span className="text-3xl font-black text-gray-900">{plan.price}</span>
                    <span className="text-xs font-bold text-gray-500">/mês</span>
                 </div>

                 <div className="w-full h-px mb-8 bg-gray-100"></div>

                 <ul className="space-y-4 mb-10 flex-1">
                    {plan.features.map((feature, j) => (
                      <li key={j} className="flex items-center gap-3 text-xs font-bold text-left w-full">
                         <CheckCircle2 size={18} className="text-primary" />
                         <span className="text-gray-600">{feature}</span>
                      </li>
                    ))}
                 </ul>

                 <button 
                   onClick={() => handlePlanChange(plan.name)}
                   disabled={isActive}
                   className={cn(
                     "w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all",
                     isActive 
                       ? "bg-primary text-gray-900 cursor-default shadow-lg shadow-primary/20" 
                       : "bg-gray-900 text-white hover:bg-primary"
                   )}
                 >
                    {isActive ? 'Plano Ativo' : 'Mudar para este Plano'}
                 </button>
              </div>
            );
          })}
       </div>

       {showPayment && (
         <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
           <div className="bg-white w-full max-w-2xl max-h-[90vh] rounded-[4rem] overflow-y-auto shadow-2xl relative scrollbar-hide">
              <button 
                onClick={() => setShowPayment(null)}
                className="absolute top-8 right-8 w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-all z-20 shadow-sm"
              >
                <X size={24} />
              </button>

              <div className="p-8 md:p-14">
                 <div className="mb-10 pt-4">
                    <h2 className="text-3xl font-black text-gray-900 mb-2">Pagamento de Assinatura</h2>
                    <p className="text-gray-500 font-medium">Melhora a tua loja aderindo ao <strong className="text-primary">{showPayment}</strong>.</p>
                 </div>
                 
                 <div className="bg-gray-50/50 rounded-[3rem] p-2">
                    <CheckoutScreen 
                        cart={[{ id: 'sub', name: showPayment, price: parseInt(plans.find(p => p.name === showPayment)?.price.replace(/\D/g,'') || '0'), quantity: 1, image: '', type: 'Casual', category: 'Assinatura', description: 'Ativação de Plano' , selectedSize: 'Standard' }]}
                        onComplete={handlePaymentComplete}
                        empresaId={empresaId}
                        userId={userId}
                    />
                 </div>
              </div>
           </div>
         </div>
       )}

       <div className="p-8 bg-gray-50 rounded-[3rem] border border-gray-100 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-5">
             <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-primary shadow-sm">
                <CreditCard size={28} />
             </div>
             <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 leading-none">Próximo Pagamento</p>
                <p className="text-lg font-black text-gray-900">22 de Maio, 2026</p>
             </div>
          </div>
          <div className="flex items-center gap-3">
             <button className="px-6 py-3 bg-white border border-gray-100 rounded-xl font-bold text-xs text-gray-600 hover:bg-gray-50 transition-all">Alterar Método</button>
             <button className="px-6 py-3 bg-white border border-gray-100 rounded-xl font-bold text-xs text-red-500 hover:bg-red-50 transition-all">Cancelar</button>
          </div>
       </div>
    </div>
  );
}

// --- ADMIN SCREEN COMPONENTS ---

function AdminPaymentsValidation() {
  const [payments, setPayments] = useState<any[]>([
    { id: 'PAY-1021', customer: 'Alice Maria', amount: 75, reference: 'REF-AN-00192', type: 'TRANSFER', senderNumber: '923 456 789', createdAt: new Date(Date.now() - 3600000).toISOString(), status: 'AWAITING_VALIDATION' },
    { id: 'PAY-1022', customer: 'Roberto Kapanda', amount: 150, reference: 'REF-AN-00193', type: 'EXPRESS', phoneNumber: '912 000 111', createdAt: new Date(Date.now() - 7200000).toISOString(), status: 'SUCCESS' },
    { id: 'PAY-1023', customer: 'Carla Vunge', amount: 45, reference: 'REF-AN-00194', type: 'TRANSFER', senderNumber: '931 999 888', createdAt: new Date(Date.now() - 86400000).toISOString(), status: 'FAILED' },
    { id: 'PAY-1024', customer: 'Delson Gomes', amount: 25, reference: 'REF-AN-00195', type: 'EXPRESS', phoneNumber: '945 333 222', createdAt: new Date(Date.now() - 172800000).toISOString(), status: 'AWAITING_VALIDATION' },
    { id: 'PAY-1025', customer: 'Helena Bartolomeu', amount: 310, reference: 'REF-AN-00196', type: 'TRANSFER', senderNumber: '921 555 444', createdAt: new Date(Date.now() - 259200000).toISOString(), status: 'SUSPICIOUS' },
  ]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('ALL'); // ALL, PENDING, SUCCESS, FAILED

  const handleAction = async (id: string, action: string) => {
    // Para demo, vamos apenas atualizar o estado local
    setPayments(prev => prev.map(p => {
      if (p.id === id) {
        let newStatus = p.status;
        if (action === 'APPROVE') newStatus = 'SUCCESS';
        if (action === 'REJECT') newStatus = 'FAILED';
        if (action === 'SUSPECT') newStatus = 'SUSPICIOUS';
        if (action === 'REQUEST_PROOF') newStatus = 'AWAITING_PROOF';
        return { ...p, status: newStatus };
      }
      return p;
    }));
    
    // Feedback visual
    const messages: Record<string, string> = {
      APPROVE: 'Pagamento aprovado com sucesso!',
      REJECT: 'Pagamento rejeitado.',
      SUSPECT: 'Marcado como suspeito para análise posterior.',
      REQUEST_PROOF: 'Pedido de novo comprovativo enviado ao cliente.'
    };
    alert(messages[action] || 'Ação executada.');
  };

  const filteredPayments = payments.filter(p => {
    if (filter === 'ALL') return true;
    return p.status === filter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SUCCESS': return 'bg-green-100 text-green-700 border-green-200';
      case 'PENDING':
      case 'AWAITING_VALIDATION': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'FAILED': return 'bg-red-100 text-red-700 border-red-200';
      case 'SUSPICIOUS': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'AWAITING_PROOF': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'SUCCESS': return 'Aprovado';
      case 'PENDING': return 'Pendente (Automático)';
      case 'AWAITING_VALIDATION': return 'Aguardando Validação';
      case 'FAILED': return 'Rejeitado';
      case 'SUSPICIOUS': return 'Suspeito';
      case 'AWAITING_PROOF': return 'Pedida Nova Prova';
      default: return status;
    }
  };

  return (
    <div className="w-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <SectionHeader 
          title="Validação de Pagamentos" 
          subtitle="Controlo centralizado de todas as transações da plataforma."
          aiContext="Validação de comprovativos e detecção de fraudes em pagamentos angolanos (Kwik, Express, Transferência)."
        />
        <div className="flex bg-gray-100 p-1 rounded-2xl h-fit">
          {['ALL', 'AWAITING_VALIDATION', 'SUCCESS', 'FAILED'].map(f => (
            <button 
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                filter === f ? "bg-white shadow-lg text-primary" : "text-gray-500 hover:text-gray-700"
              )}
            >
              {f === 'ALL' ? 'Todos' : f === 'AWAITING_VALIDATION' ? 'Pendentes' : f === 'SUCCESS' ? 'Sucesso' : 'Erro'}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-[3rem] overflow-hidden shadow-sm overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/50 border-b border-gray-100">
              <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Cliente / Pedido</th>
              <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Valor / Referência</th>
              <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Comprovativo / Remetente</th>
              <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Data / Hora</th>
              <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Estado</th>
              <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr><td colSpan={6} className="px-8 py-20 text-center text-gray-400 font-medium italic">A carregar pagamentos...</td></tr>
            ) : filteredPayments.length === 0 ? (
              <tr><td colSpan={6} className="px-8 py-20 text-center text-gray-400 font-medium italic">Nenhum pagamento encontrado.</td></tr>
            ) : (
              filteredPayments.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-8 py-6">
                    <p className="font-black text-gray-900">{p.customer}</p>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-tighter mt-0.5">#{p.id}</p>
                  </td>
                  <td className="px-8 py-6">
                    <p className="font-black text-gray-900">Kz {p.amount.toLocaleString()}.000</p>
                    <p className="text-xs text-primary font-bold tracking-widest mt-0.5">{p.reference}</p>
                  </td>
                  <td className="px-8 py-6">
                    {p.type === 'TRANSFER' ? (
                      <div className="flex items-center gap-3">
                         <button className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-all">
                            <Eye size={18} />
                         </button>
                         <div>
                            <p className="text-xs font-black text-gray-900">{p.senderNumber}</p>
                            <p className="text-[10px] text-gray-400 font-bold uppercase">Via Transferência</p>
                         </div>
                      </div>
                    ) : (
                      <div>
                          <p className="text-xs font-black text-gray-900">{p.phoneNumber}</p>
                          <p className="text-[10px] text-primary font-bold uppercase">{p.type === 'KWIK' ? 'Kwik Instantâneo' : 'Multicaixa Express'}</p>
                      </div>
                    )}
                  </td>
                  <td className="px-8 py-6">
                    <p className="text-sm font-bold text-gray-900">{new Date(p.createdAt).toLocaleDateString()}</p>
                    <p className="text-xs text-gray-400 font-medium">{new Date(p.createdAt).toLocaleTimeString()}</p>
                  </td>
                  <td className="px-8 py-6">
                    <span className={cn(
                      "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tighter border",
                      getStatusColor(p.status)
                    )}>
                      {getStatusLabel(p.status)}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {p.status === 'AWAITING_VALIDATION' && (
                        <>
                          <button onClick={() => handleAction(p.id, 'APPROVE')} className="w-9 h-9 bg-green-500 text-white rounded-xl flex items-center justify-center hover:scale-110 transition-all shadow-lg shadow-green-100" title="Aprovar">
                            <Check size={18} />
                          </button>
                          <button onClick={() => handleAction(p.id, 'REJECT')} className="w-9 h-9 bg-red-500 text-white rounded-xl flex items-center justify-center hover:scale-110 transition-all shadow-lg shadow-red-100" title="Rejeitar">
                            <X size={18} />
                          </button>
                          <button onClick={() => handleAction(p.id, 'SUSPECT')} className="w-9 h-9 bg-orange-500 text-white rounded-xl flex items-center justify-center hover:scale-110 transition-all shadow-lg shadow-orange-100" title="Marcar como Suspeito">
                            <ShieldCheck size={18} />
                          </button>
                          <button onClick={() => handleAction(p.id, 'REQUEST_PROOF')} className="w-9 h-9 bg-blue-500 text-white rounded-xl flex items-center justify-center hover:scale-110 transition-all shadow-lg shadow-blue-100" title="Pedir Nova Prova">
                            <FileCheck size={18} />
                          </button>
                        </>
                      )}
                      {(p.status === 'SUCCESS' || p.status === 'FAILED') && (
                        <span className="text-xs text-gray-300 font-bold italic">Processado</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AdminAIAssistant() {
  const [insight, setInsight] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);

  const stats = {
    volume: 'Kz 14.2M',
    sellers: '156',
    users: '2.4k',
    payments: '42',
    detail: '+12% crescimento mensal'
  };

  const getInsight = async () => {
    setLoading(true);
    const res = await generateAdminInsight(stats);
    setInsight(res);
    setLoading(false);
  };

  return (
    <div className="space-y-6">
       <div className="bg-gradient-to-br from-indigo-900 to-primary p-8 rounded-[2.5rem] text-white overflow-hidden relative border border-white/10 shadow-2xl">
          <div className="absolute -right-20 -top-20 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -left-10 -bottom-10 w-60 h-60 bg-indigo-500/20 rounded-full blur-3xl" />
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
             <div className="max-w-xl">
                <div className="flex items-center gap-3 mb-4">
                   <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center">
                      <Sparkles className="text-yellow-400" size={20} />
                   </div>
                   <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">KwikInsight • Administração com IA</span>
                </div>
                <h2 className="text-3xl font-black mb-4 leading-tight">Olá Administrador! Precisas de uma análise rápida?</h2>
                <p className="text-sm text-white/70 font-medium leading-relaxed mb-8">
                   O KwikInsight analisa os dados em tempo real para sugerir acções que impulsionam o Moda d'Angola.
                </p>
                
                <div className="flex flex-wrap gap-4">
                   <button 
                     onClick={getInsight}
                     disabled={loading}
                     className="bg-white text-indigo-900 px-8 py-4 rounded-2xl font-black shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-3 disabled:opacity-50"
                   >
                     {loading ? <RefreshCw className="animate-spin" size={20} /> : <Activity size={20} />}
                     Gerar Insight Agora
                   </button>
                   <button 
                     onClick={() => setChatOpen(true)}
                     className="bg-indigo-500/30 backdrop-blur-md text-white border border-white/20 px-8 py-4 rounded-2xl font-black hover:bg-indigo-500/40 transition-all flex items-center gap-3"
                   >
                     <MessageSquare size={20} />
                     Conversar com IA
                   </button>
                </div>
             </div>

             {insight && (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-white/10 backdrop-blur-xl border border-white/10 p-6 rounded-3xl max-w-sm"
                >
                   <div className="flex items-center gap-2 mb-3">
                      <TrendingUp className="text-green-400" size={18} />
                      <p className="text-xs font-black uppercase">Análise Estratégica</p>
                   </div>
                   <div className="text-xs font-medium leading-relaxed text-white/90 whitespace-pre-wrap italic">
                      "{insight}"
                   </div>
                </motion.div>
             )}
          </div>
       </div>

       <AdminAIChatModal open={chatOpen} onClose={() => setChatOpen(false)} />
    </div>
  );
}


function AdminDashboard() {
  const [selectedStat, setSelectedStat] = useState<string | null>(null);
  const [chartPeriod, setChartPeriod] = useState<'weekly' | 'monthly'>('weekly');
  const [chartType, setChartType] = useState<'bar' | 'line'>('bar');
  
  const stats = [
    { id: 'volume', label: 'Volume Total', value: 'Kz 14.2M', icon: Activity, color: 'bg-purple-600', detail: '+12% desde o mês passado' },
    { id: 'sellers', label: 'Vendedores', value: '156', icon: Store, color: 'bg-blue-600', detail: '8 novos esta semana' },
    { id: 'users', label: 'Utilizadores', value: '2.4k', icon: Users, color: 'bg-indigo-600', detail: '+240 este mês' },
    { id: 'payments', label: 'Pagamentos Pendentes', value: '42', icon: CreditCard, color: 'bg-orange-600', detail: '12 urgentes' },
  ];

  const weeklyData = [
    { name: '24 Abr', value: 900 },
    { name: '25 Abr', value: 650 },
    { name: '26 Abr', value: 800 },
    { name: '27 Abr', value: 500 },
    { name: '28 Abr', value: 850 },
    { name: '29 Abr', value: 600 },
    { name: '30 Abr', value: 950 },
  ];

  const monthlyData = [
    { name: 'Jan', value: 12000 },
    { name: 'Fev', value: 15000 },
    { name: 'Mar', value: 13500 },
    { name: 'Abr', value: 18000 },
    { name: 'Mai', value: 16500 },
    { name: 'Jun', value: 21000 },
    { name: 'Jul', value: 19500 },
    { name: 'Ago', value: 24000 },
    { name: 'Set', value: 22000 },
    { name: 'Out', value: 28000 },
    { name: 'Nov', value: 26000 },
    { name: 'Dez', value: 34000 },
  ];

  const currentChartData = chartPeriod === 'weekly' ? weeklyData : monthlyData;

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <motion.div 
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className="bg-gray-900 text-white p-4 rounded-2xl shadow-2xl border border-white/10 backdrop-blur-md"
        >
          <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-50 mb-1">{payload[0].payload.name}</p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-indigo-500" />
            <p className="text-sm font-black">Kz {payload[0].value.toLocaleString()} {chartPeriod === 'weekly' ? '.000' : ''}</p>
          </div>
          <p className="text-[9px] text-green-400 font-bold mt-2 flex items-center gap-1">
            <TrendingUp size={10} /> +12.4% vs anterior
          </p>
        </motion.div>
      );
    }
    return null;
  };

  return (
    <div className="w-full space-y-10">
       <SectionHeader title="Painel de Administração" aiContext="Visão geral executiva da plataforma Moda d'Angola." />
       
       <AdminAIAssistant />
       
       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {stats.map((stat, i) => (
            <motion.div 
              key={i} 
              whileHover={{ y: -5 }}
              onClick={() => setSelectedStat(stat.label)}
              className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex items-center gap-5 cursor-pointer hover:border-primary/20 transition-all group"
            >
               <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg transition-transform group-hover:scale-110", stat.color)}>
                  <stat.icon size={24} />
               </div>
               <div>
                  <p className="text-xs font-black text-gray-400 uppercase tracking-wider">{stat.label}</p>
                  <p className="text-xl font-black text-gray-900">{stat.value}</p>
                  <p className="text-[10px] font-bold text-gray-400 mt-0.5">{stat.detail}</p>
               </div>
            </motion.div>
          ))}
       </div>

       <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <div className="xl:col-span-2 bg-white border border-gray-100 p-8 rounded-[2.5rem] shadow-sm">
             <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-10 gap-4">
                <div>
                   <h3 className="text-lg font-black">Tendência de Crescimento</h3>
                   <p className="text-xs text-gray-400 font-bold mt-1">
                     {chartPeriod === 'weekly' ? 'Volume de transações diárias na plataforma' : 'Volume de transações mensais acumuladas'}
                   </p>
                </div>
                <div className="flex bg-gray-50 p-1 rounded-2xl items-center gap-1">
                   <div className="flex bg-white/50 rounded-xl p-0.5 mr-2">
                      <button 
                        onClick={() => setChartType('bar')}
                        className={cn(
                          "p-2 rounded-lg transition-all",
                          chartType === 'bar' ? "bg-white shadow-sm text-indigo-600" : "text-gray-400 hover:text-gray-600"
                        )}
                        title="Gráfico de Barras"
                      >
                        <BarChart2 size={18} />
                      </button>
                      <button 
                        onClick={() => setChartType('line')}
                        className={cn(
                          "p-2 rounded-lg transition-all",
                          chartType === 'line' ? "bg-white shadow-sm text-indigo-600" : "text-gray-400 hover:text-gray-600"
                        )}
                        title="Gráfico de Linha"
                      >
                        <TrendingUp size={18} />
                      </button>
                   </div>
                   <div className="h-6 w-px bg-gray-200 mx-1" />
                   <button 
                     onClick={() => setChartPeriod('weekly')}
                     className={cn(
                       "px-5 py-2 rounded-xl text-[10px] font-black uppercase transition-all",
                       chartPeriod === 'weekly' ? "bg-white shadow-sm text-gray-900" : "text-gray-400 hover:text-gray-600"
                     )}
                   >
                     Semanal
                   </button>
                   <button 
                     onClick={() => setChartPeriod('monthly')}
                     className={cn(
                       "px-5 py-2 rounded-xl text-[10px] font-black uppercase transition-all",
                       chartPeriod === 'monthly' ? "bg-white shadow-sm text-gray-900" : "text-gray-400 hover:text-gray-600"
                     )}
                   >
                     Mensal
                   </button>
                </div>
             </div>
             
             <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                   {chartType === 'bar' ? (
                      <BarChart data={currentChartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                         <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                         <XAxis 
                           dataKey="name" 
                           axisLine={false} 
                           tickLine={false} 
                           tick={{ fontSize: 10, fontWeight: 700, fill: '#D1D5DB' }}
                           dy={10}
                         />
                         <YAxis 
                           axisLine={false} 
                           tickLine={false} 
                           tick={{ fontSize: 10, fontWeight: 700, fill: '#D1D5DB' }}
                         />
                         <Tooltip 
                           cursor={{ fill: '#F9FAFB', radius: 8 }}
                           content={<CustomTooltip />}
                         />
                         <Bar 
                           dataKey="value" 
                           radius={[8, 8, 8, 8]} 
                           barSize={chartPeriod === 'weekly' ? 32 : 16}
                           animationDuration={1500}
                         >
                            {currentChartData.map((entry, index) => (
                              <Cell 
                                key={`cell-${index}`} 
                                fill={index === currentChartData.length - 1 ? '#6366F1' : '#EEF2FF'}
                                className="hover:fill-indigo-500 transition-colors cursor-pointer"
                              />
                            ))}
                         </Bar>
                      </BarChart>
                   ) : (
                      <LineChart data={currentChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                         <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                         <XAxis 
                           dataKey="name" 
                           axisLine={false} 
                           tickLine={false} 
                           tick={{ fontSize: 10, fontWeight: 700, fill: '#D1D5DB' }}
                           dy={10}
                         />
                         <YAxis 
                           axisLine={false} 
                           tickLine={false} 
                           tick={{ fontSize: 10, fontWeight: 700, fill: '#D1D5DB' }}
                         />
                         <Tooltip 
                           content={<CustomTooltip />}
                         />
                         <Line 
                           type="monotone" 
                           dataKey="value" 
                           stroke="#6366F1" 
                           strokeWidth={4} 
                           dot={{ r: 6, fill: '#6366F1', strokeWidth: 3, stroke: '#fff' }}
                           activeDot={{ r: 8, strokeWidth: 0, fill: '#4F46E5' }} 
                           animationDuration={1500}
                         />
                      </LineChart>
                   )}
                </ResponsiveContainer>
             </div>
          </div>

          <div className="bg-white border border-gray-100 p-8 rounded-[2.5rem] flex flex-col shadow-sm">
             <h3 className="text-lg font-black mb-6 text-gray-900">Alertas do Sistema</h3>
             <div className="space-y-4">
                {[
                   { title: 'Servidor com Carga Alta', desc: 'Pico de tráfego detectado às 14:02.', icon: AlertCircle, color: 'text-orange-500', bg: 'bg-orange-50' },
                   { title: 'SSL Renovado', desc: 'Criptografia atualizada com sucesso.', icon: ShieldCheck, color: 'text-green-500', bg: 'bg-green-50' },
                   { title: '12 Novos Lojistas', desc: 'Aguardando aprovação no painel.', icon: Users, color: 'text-blue-500', bg: 'bg-blue-50' },
                   { title: 'Backup Diário', desc: 'Executado e verificado sem erros.', icon: CheckCircle, color: 'text-indigo-500', bg: 'bg-indigo-50' }
                ].map((alert, i) => (
                  <motion.div 
                    key={i} 
                    whileHover={{ scale: 1.02 }}
                    className="flex gap-4 items-start p-4 bg-gray-50 rounded-2xl cursor-pointer hover:bg-white hover:shadow-md transition-all border border-transparent hover:border-gray-100"
                  >
                     <div className={cn("p-2 rounded-xl", alert.bg)}>
                        <alert.icon size={20} className={alert.color} />
                     </div>
                     <div>
                        <p className="text-sm font-bold text-gray-900">{alert.title}</p>
                        <p className="text-xs text-gray-500 mt-1 leading-relaxed font-medium">{alert.desc}</p>
                     </div>
                  </motion.div>
                ))}
             </div>
             <button 
               className="mt-10 w-full py-4 border border-gray-100 rounded-2xl text-[10px] font-black uppercase hover:bg-gray-900 hover:text-white transition-all text-gray-400"
               onClick={() => alert('Abrindo logs do sistema...')}
             >
                Ver Todos os Logs
             </button>
          </div>
       </div>

       {selectedStat && (
         <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <motion.div 
               initial={{ opacity: 0, scale: 0.9 }}
               animate={{ opacity: 1, scale: 1 }}
               className="bg-white w-full max-w-md rounded-[3rem] p-10 relative"
            >
               <button 
                 onClick={() => setSelectedStat(null)}
                 className="absolute top-6 right-6 text-gray-400 hover:text-gray-900"
               >
                 <X size={24} />
               </button>

               <div className="text-center mb-8">
                  <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
                     <FileText size={32} />
                  </div>
                  <h2 className="text-2xl font-black text-gray-900">Relatório: {selectedStat}</h2>
                  <p className="text-sm text-gray-500 font-bold mt-2">Dados processados em tempo real pela plataforma.</p>
               </div>

               <div className="space-y-4 mb-8">
                  <div className="p-4 bg-gray-50 rounded-2xl flex justify-between items-center">
                     <span className="text-xs font-black uppercase text-gray-400">Total Acumulado</span>
                     <span className="text-sm font-black text-gray-900">Kz 245.8M</span>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-2xl flex justify-between items-center">
                     <span className="text-xs font-black uppercase text-gray-400">Média Geral</span>
                     <span className="text-sm font-black text-gray-900">Kz 1.2M / dia</span>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-2xl flex justify-between items-center">
                     <span className="text-xs font-black uppercase text-gray-400">Taxa de Conversão</span>
                     <span className="text-sm font-black text-green-500">84.2%</span>
                  </div>
               </div>

               <button 
                 onClick={() => {
                    alert('Exportando dados para CSV...');
                    setSelectedStat(null);
                 }}
                 className="w-full py-5 bg-gray-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-primary transition-all flex items-center justify-center gap-3"
               >
                 <Download size={18} />
                 Exportar Relatório
               </button>
            </motion.div>
         </div>
       )}
    </div>
  );
}

function SellersApproval({ sellers, onApprove, onReject }: any) {
  return (
    <div className="w-full">
       <SectionHeader 
         title="Aprovação de Novos Lojistas" 
         subtitle="Analise e aprove pedidos de abertura de loja na plataforma"
         aiContext="Análise de perfil de lojistas, verificação de legitimidade de negócios e critérios de ativação em Angola."
       />

       {sellers.length === 0 ? (
         <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[3rem] border border-dashed border-gray-200">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mb-4">
               <Store size={32} />
            </div>
            <h3 className="text-lg font-black text-gray-900">Tudo em dia!</h3>
            <p className="text-sm text-gray-400 font-medium">Não existem novos lojistas a aguardar aprovação.</p>
         </div>
       ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sellers.map((seller: any) => (
               <div key={seller.id} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm relative overflow-hidden group">
                  <div className="relative z-10">
                     <div className="w-16 h-16 bg-gray-50 rounded-3xl flex items-center justify-center text-indigo-600 mb-6 group-hover:scale-110 transition-transform">
                        <Store size={32} />
                     </div>
                     <h3 className="text-xl font-black text-gray-900 mb-1">{seller.name}</h3>
                     <p className="text-sm text-gray-500 font-medium mb-6">Proprietário: {seller.owner}</p>
                     
                     <div className="flex items-center justify-between py-4 border-t border-gray-50 mb-6">
                        <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Registado em</div>
                        <div className="text-xs font-bold text-gray-900">{seller.date}</div>
                     </div>

                     <div className="flex gap-3">
                        <button 
                          onClick={() => onApprove(seller.id)}
                          className="flex-1 bg-green-500 text-white py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-green-100 hover:scale-105 transition-all"
                        >
                           <Check size={18} strokeWidth={3} />
                           <span className="text-xs font-black uppercase">Aprovar</span>
                        </button>
                        <button 
                          onClick={() => onReject(seller.id)}
                          className="w-12 h-12 bg-red-50 text-red-500 rounded-xl flex items-center justify-center hover:bg-red-500 hover:text-white transition-all"
                        >
                           <Ban size={18} />
                        </button>
                     </div>
                  </div>
                  <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-indigo-50 rounded-full scale-150 opacity-20 group-hover:opacity-40 transition-opacity"></div>
               </div>
            ))}
         </div>
       )}
    </div>
  );
}

function PaymentsValidation({ clientPayments, sellerPayments, onApprove, onReject }: any) {
  const [filter, setFilter] = useState<'client' | 'seller'>('client');
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [modalType, setModalType] = useState<'view' | 'approve' | 'reject' | null>(null);
  
  const currentPayments = filter === 'client' ? clientPayments : sellerPayments;

  const handleAction = (pay: any, type: 'view' | 'approve' | 'reject') => {
    setSelectedPayment(pay);
    setModalType(type);
  };

  const closeModal = () => {
    setSelectedPayment(null);
    setModalType(null);
  };

  return (
    <div className="w-full">
       <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <SectionHeader 
            title="Validação de Comprovativos" 
            subtitle="Verifique os comprovativos de transferência bancária"
          />
          
          <div className="flex items-center gap-3 bg-white p-2 rounded-[1.5rem] border border-gray-100 shadow-sm self-start md:self-auto">
             <button 
               onClick={() => setFilter('client')}
               className={cn(
                 "px-6 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all",
                 filter === 'client' ? "bg-black text-white shadow-lg" : "text-gray-400 hover:text-gray-600"
               )}
             >
                Clientes
             </button>
             <button 
               onClick={() => setFilter('seller')}
               className={cn(
                 "px-6 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all",
                 filter === 'seller' ? "bg-black text-white shadow-lg" : "text-gray-400 hover:text-gray-600"
               )}
             >
                Vendedores
             </button>
          </div>
       </div>

       {currentPayments.length === 0 ? (
         <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[3rem] border border-dashed border-gray-200">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mb-4">
               <CreditCard size={32} />
            </div>
            <h3 className="text-lg font-black text-gray-900 ml-1">Sem pagamentos pendentes!</h3>
            <p className="text-sm text-gray-400 font-medium ml-1">Todos os comprovativos de {filter === 'client' ? 'clientes' : 'vendedores'} foram processados.</p>
         </div>
       ) : (
         <div className="space-y-4">
            {currentPayments.map((pay: any) => (
               <motion.div 
                 key={pay.id} 
                 initial={{ opacity: 0, y: 10 }}
                 animate={{ opacity: 1, y: 0 }}
                 className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-6"
               >
                  <div className="flex items-center gap-5">
                     <div className={cn(
                       "w-16 h-16 rounded-2xl flex flex-col items-center justify-center font-black border border-gray-100",
                       filter === 'client' ? "bg-orange-50 text-orange-500" : "bg-purple-50 text-purple-500"
                     )}>
                        {filter === 'client' ? <CreditCard size={24} /> : <Store size={24} />}
                     </div>
                     <div>
                        <div className="flex items-center gap-2 mb-1">
                           <h4 className="text-lg font-black text-gray-900">{pay.amount}</h4>
                           <span className="text-[10px] font-bold text-gray-400 bg-gray-50 px-2 py-0.5 rounded-md">{pay.id}</span>
                        </div>
                        <p className="text-sm text-gray-500 font-medium">
                          {filter === 'client' ? `Cliente: ${pay.user} • ${pay.item}` : `Lojista: ${pay.seller} • ${pay.plan}`}
                        </p>
                        <p className="text-[10px] text-indigo-500 font-black uppercase mt-1 tracking-widest">{pay.date}</p>
                     </div>
                  </div>

                  <div className="flex items-center gap-3">
                     <button 
                       onClick={() => handleAction(pay, 'view')}
                       className="flex-1 lg:flex-none flex items-center justify-center gap-3 px-8 py-3 bg-gray-50 text-gray-600 rounded-xl font-bold text-sm border border-gray-100 hover:bg-white transition-all group"
                     >
                        <FileText size={18} className="group-hover:text-primary transition-colors" />
                        Ver Documento
                     </button>
                     <button 
                       onClick={() => handleAction(pay, 'approve')}
                       className="p-3 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all text-xs"
                     >
                        <Check size={24} strokeWidth={2.5} />
                     </button>
                     <button 
                       onClick={() => handleAction(pay, 'reject')}
                       className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all text-xs"
                     >
                        <XCircle size={24} strokeWidth={2} />
                     </button>
                  </div>
               </motion.div>
            ))}
         </div>
       )}

       {/* MODAL OVERLAY */}
       <AnimatePresence>
         {modalType && (
           <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={closeModal}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              />
              
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative bg-white w-full max-w-md md:max-w-xl rounded-[2.5rem] overflow-hidden shadow-2xl p-8"
              >
                  {modalType === 'view' && (
                    <div className="space-y-6">
                       <div className="flex items-center justify-between mb-4">
                          <h3 className="text-xl font-black text-gray-900">Comprovativo de Pagamento</h3>
                          <button onClick={closeModal} className="p-2 bg-gray-100 rounded-xl hover:bg-black hover:text-white transition-all">
                             <X size={18} />
                          </button>
                       </div>
                       
                       <div className="aspect-[3/4] bg-gray-50 border-2 border-dashed border-gray-200 rounded-3xl flex flex-col items-center justify-center p-8 text-center">
                          <FileText size={48} className="text-gray-300 mb-4" />
                          <p className="text-gray-400 font-medium text-sm">Visualização do Documento de Transferência</p>
                          <p className="text-[10px] text-gray-300 uppercase font-bold mt-2">Ref: {selectedPayment.id}</p>
                       </div>

                       <div className="bg-gray-50 p-6 rounded-2xl space-y-3">
                          <div className="flex justify-between items-center">
                             <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Valor</span>
                             <span className="text-lg font-black text-gray-900">{selectedPayment.amount}</span>
                          </div>
                          <div className="flex justify-between items-center">
                             <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Entidade</span>
                             <span className="text-sm font-bold text-gray-700">{filter === 'client' ? selectedPayment.user : selectedPayment.seller}</span>
                          </div>
                       </div>

                       <button onClick={closeModal} className="w-full py-4 bg-black text-white rounded-2xl font-black text-xs uppercase shadow-xl hover:scale-[1.02] transition-all">
                          Fechar Documento
                       </button>
                    </div>
                  )}

                  {modalType === 'approve' && (
                    <div className="text-center">
                       <div className="w-20 h-20 bg-green-50 text-green-500 rounded-3xl flex items-center justify-center mx-auto mb-6">
                          <Check size={40} strokeWidth={3} />
                       </div>
                       <h3 className="text-xl font-black text-gray-900 mb-2">Validar Pagamento?</h3>
                       <p className="text-sm text-gray-500 font-medium mb-8 leading-relaxed px-4">
                         Confirmas que recebeste o valor de <span className="font-bold text-gray-900">{selectedPayment.amount}</span> referente ao ID <span className="font-bold text-gray-900">{selectedPayment.id}</span>?
                       </p>
                       <div className="flex gap-3">
                          <button onClick={closeModal} className="flex-1 py-4 bg-gray-100 text-gray-600 rounded-2xl font-black text-xs uppercase hover:bg-gray-200 transition-all">
                             Cancelar
                          </button>
                          <button 
                            onClick={() => {
                              onApprove(selectedPayment.id, filter);
                              closeModal();
                            }}
                            className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
                          >
                             Confirmar
                          </button>
                       </div>
                    </div>
                  )}

                  {modalType === 'reject' && (
                    <div className="text-center">
                       <div className="w-20 h-20 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center mx-auto mb-6">
                          <XCircle size={40} />
                       </div>
                       <h3 className="text-xl font-black text-gray-900 mb-2">Rejeitar Pagamento?</h3>
                       <p className="text-sm text-gray-500 font-medium mb-8 leading-relaxed px-4">
                         Tens a certeza que pretendes rejeitar este comprovativo? O utilizador será notificado para enviar um documento válido.
                       </p>
                       <div className="flex gap-3">
                          <button onClick={closeModal} className="flex-1 py-4 bg-gray-100 text-gray-600 rounded-2xl font-black text-xs uppercase hover:bg-gray-200 transition-all">
                             voltar
                          </button>
                          <button 
                            onClick={() => {
                              onReject(selectedPayment.id, filter);
                              closeModal();
                            }}
                            className="flex-1 py-4 bg-red-500 text-white rounded-2xl font-black text-xs uppercase hover:bg-red-600 transition-all shadow-lg shadow-red-100"
                          >
                             Sim, Rejeitar
                          </button>
                       </div>
                    </div>
                  )}
              </motion.div>
           </div>
         )}
       </AnimatePresence>
    </div>
  );
}

function AdminOrders() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'Todos' | 'Pago' | 'Em Trânsito' | 'Pendente' | 'Cancelado'>('Todos');
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  
  const orders = [
    { id: '#ADM-9901', client: 'Alice M.', seller: 'Boutique Elegance', total: 'Kz 75.000', status: 'Em Trânsito', date: '2 horas atrás', items: '1x Jaqueta Bomber (Kz 60.000), 1x Cachecol (Kz 15.000)', address: 'Rua Direita, Luanda', paymentMethod: 'Multicaixa Express' },
    { id: '#ADM-9902', client: 'Roberto K.', seller: 'Tech Store AO', total: 'Kz 150.000', status: 'Pago', date: '4 horas atrás', items: '1x Smartphone X1 (Kz 150.000)', address: 'Av. Revolução, Talatona', paymentMethod: 'Transferência' },
    { id: '#ADM-9903', client: 'Carla V.', seller: 'Moda Jovem', total: 'Kz 45.000', status: 'Pendente', date: '6 horas atrás', items: '3x T-shirt Basic (Kz 15.000 cada)', address: 'Condomínio Rosa, Viana', paymentMethod: 'Dinheiro' },
    { id: '#ADM-9904', client: 'Sérgio T.', seller: 'Boutique Elegance', total: 'Kz 12.000', status: 'Cancelado', date: 'Ontem', items: '1x Meias Wool (Kz 12.000)', address: 'Kilamba, Bloco B', paymentMethod: 'Multicaixa Express' },
  ];

  const filteredOrders = orders.filter(o => {
    const matchesSearch = o.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         o.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         o.seller.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'Todos' || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Pago': return 'bg-green-50 text-green-600';
      case 'Em Trânsito': return 'bg-blue-50 text-blue-600';
      case 'Pendente': return 'bg-orange-50 text-orange-600';
      case 'Cancelado': return 'bg-red-50 text-red-600';
      default: return 'bg-gray-50 text-gray-600';
    }
  };

  return (
    <div className="w-full">
       <SectionHeader 
         title="Gestão de Pedidos" 
         subtitle="Monitoramento global de todas as transações da plataforma" 
         aiContext="Otimização de logística, tempos de entrega e análise de satisfação do cliente em Luanda e províncias."
       />
       
       <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
             <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" />
             <input 
               type="text" 
               placeholder="Pesquisar por ID, Cliente ou Vendedor..."
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               className="w-full pl-14 pr-6 py-4 bg-white border border-gray-100 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-primary/10 shadow-sm"
             />
          </div>
          <div className="flex bg-gray-50 p-1 rounded-2xl border border-gray-100 overflow-x-auto">
             {(['Todos', 'Pago', 'Em Trânsito', 'Pendente', 'Cancelado'] as const).map((status) => (
               <button
                 key={status}
                 onClick={() => setStatusFilter(status)}
                 className={cn(
                   "px-6 py-2 rounded-xl text-[10px] font-black uppercase transition-all whitespace-nowrap",
                   statusFilter === status ? "bg-white shadow-sm text-gray-900" : "text-gray-400 hover:text-gray-600"
                 )}
               >
                 {status}
               </button>
             ))}
          </div>
       </div>

       <div className="bg-white border border-gray-100 rounded-[2.5rem] overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
               <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                     <th className="px-6 py-4 text-[10px] font-black text-gray-600 uppercase tracking-widest leading-none">ID Pedido</th>
                     <th className="px-6 py-4 text-[10px] font-black text-gray-600 uppercase tracking-widest leading-none">Cliente / Vendedor</th>
                     <th className="px-6 py-4 text-[10px] font-black text-gray-600 uppercase tracking-widest leading-none">Valor</th>
                     <th className="px-6 py-4 text-[10px] font-black text-gray-600 uppercase tracking-widest leading-none">Status</th>
                     <th className="px-6 py-4 text-[10px] font-black text-gray-600 uppercase tracking-widest leading-none text-right">Ação</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-gray-50">
                  {filteredOrders.map((o) => (
                     <tr key={o.id} className="hover:bg-gray-50 transition-colors group">
                        <td className="px-6 py-4">
                           <span className="text-sm font-black text-gray-900">{o.id}</span>
                           <p className="text-[10px] text-gray-400 font-medium">{o.date}</p>
                        </td>
                        <td className="px-6 py-4">
                           <div className="flex flex-col">
                              <span className="text-sm font-bold text-gray-900">{o.client}</span>
                              <span className="text-[10px] text-gray-400">De: {o.seller}</span>
                           </div>
                        </td>
                        <td className="px-6 py-4">
                           <span className="text-sm font-black text-gray-900">{o.total}</span>
                        </td>
                        <td className="px-6 py-4">
                           <span className={cn("px-3 py-1 rounded-full text-[9px] font-black uppercase whitespace-nowrap", getStatusStyle(o.status))}>
                              {o.status}
                           </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                           <button 
                             onClick={() => setSelectedOrder(o)}
                             className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline"
                           >
                             Ver Detalhes
                           </button>
                        </td>
                     </tr>
                  ))}
               </tbody>
            </table>
          </div>
          {filteredOrders.length === 0 && (
            <div className="py-20 text-center">
              <Package size={48} className="mx-auto text-gray-200 mb-4" />
              <p className="text-gray-400 font-bold">Nenhum pedido encontrado.</p>
            </div>
          )}
       </div>

       {selectedOrder && (
         <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <motion.div 
               initial={{ opacity: 0, scale: 0.9 }}
               animate={{ opacity: 1, scale: 1 }}
               className="bg-white w-full max-w-2xl rounded-[3rem] overflow-hidden relative shadow-2xl"
            >
               <button 
                 onClick={() => setSelectedOrder(null)}
                 className="absolute top-6 right-6 text-gray-400 hover:text-gray-900"
               >
                 <X size={24} />
               </button>

               <div className="p-10">
                  <div className="mb-10">
                     <div className="flex items-center justify-between mb-4">
                        <span className="px-4 py-1.5 bg-gray-100 rounded-full text-[10px] font-black uppercase tracking-widest">
                          Pedido {selectedOrder.id}
                        </span>
                        <span className={cn(
                          "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest",
                          getStatusStyle(selectedOrder.status)
                        )}>
                          {selectedOrder.status}
                        </span>
                     </div>
                     <h2 className="text-3xl font-black text-gray-900">Detalhes da Transação</h2>
                  </div>

                  <div className="grid grid-cols-2 gap-8 mb-10">
                     <div className="space-y-6">
                        <div>
                           <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Cliente</p>
                           <p className="text-sm font-bold text-gray-900">{selectedOrder.client}</p>
                        </div>
                        <div>
                           <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Vendedor</p>
                           <p className="text-sm font-bold text-gray-900">{selectedOrder.seller}</p>
                        </div>
                        <div>
                           <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Método de Pagamento</p>
                           <p className="text-sm font-bold text-gray-900">{selectedOrder.paymentMethod}</p>
                        </div>
                     </div>
                     <div className="space-y-6">
                        <div>
                           <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Data/Hora</p>
                           <p className="text-sm font-bold text-gray-900">{selectedOrder.date}</p>
                        </div>
                        <div>
                           <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Endereço de Entrega</p>
                           <p className="text-sm font-bold text-gray-900">{selectedOrder.address}</p>
                        </div>
                        <div>
                           <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Total</p>
                           <p className="text-sm font-black text-indigo-600">{selectedOrder.total}</p>
                        </div>
                     </div>
                  </div>

                  <div className="p-6 bg-gray-50 rounded-2xl mb-10">
                     <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">Itens do Pedido</p>
                     <p className="text-xs font-bold text-gray-700 leading-relaxed">{selectedOrder.items}</p>
                  </div>

                  <div className="flex gap-4">
                     <button 
                       onClick={() => setSelectedOrder(null)}
                       className="flex-1 py-5 bg-gray-50 text-gray-900 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-100 transition-all"
                     >
                       Fechar
                     </button>
                     <button 
                       onClick={() => alert('Imprimindo factura...')}
                       className="px-8 py-5 bg-gray-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-primary transition-all flex items-center justify-center"
                     >
                        Imprimir Factura
                     </button>
                  </div>
               </div>
            </motion.div>
         </div>
       )}
    </div>
  );
}

function AdminDisputes() {
  const disputes = [
    { id: '#DSP-001', client: 'Joana P.', seller: 'Boutique Elegance', reason: 'Item não recebido', status: 'Em Análise', priority: 'Alta' },
    { id: '#DSP-002', client: 'Marcos A.', seller: 'Tech Store AO', reason: 'Produto com defeito', status: 'Aguardando Resposta', priority: 'Média' },
  ];

  return (
    <div className="w-full">
       <SectionHeader title="Disputas & Suporte" subtitle="Mediação de conflitos entre clientes e vendedores" />
       
       <div className="grid grid-cols-1 gap-6">
          {disputes.map((d) => (
             <div key={d.id} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-md transition-all">
                <div className="flex items-center gap-5">
                   <div className={cn(
                     "w-16 h-16 rounded-3xl flex items-center justify-center",
                     d.priority === 'Alta' ? "bg-red-50 text-red-500" : "bg-orange-50 text-orange-500"
                   )}>
                      <AlertCircle size={32} />
                   </div>
                   <div>
                      <div className="flex items-center gap-3 mb-1">
                         <h4 className="text-lg font-black text-gray-900">{d.id} - {d.reason}</h4>
                         <span className={cn(
                           "px-2 py-0.5 rounded-md text-[9px] font-black uppercase",
                           d.priority === 'Alta' ? "bg-red-500 text-white" : "bg-orange-500 text-white"
                         )}>{d.priority}</span>
                      </div>
                      <p className="text-sm text-gray-500 font-medium">Cliente: {d.client} vs Lojista: {d.seller}</p>
                      <div className="flex items-center gap-2 mt-2">
                         <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                         <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">{d.status}</span>
                      </div>
                   </div>
                </div>

                <div className="flex gap-3">
                   <button className="flex-1 md:flex-none px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold text-xs uppercase tracking-tight shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all">
                      Mediar Conflito
                   </button>
                   <button className="p-3 bg-gray-50 text-gray-400 rounded-xl hover:bg-gray-100 transition-all">
                      <FileText size={20} />
                   </button>
                </div>
             </div>
          ))}

          {disputes.length === 0 && (
            <div className="py-20 text-center bg-white rounded-[3rem] border border-dashed border-gray-200">
               <ShieldCheck size={48} className="mx-auto text-gray-200 mb-4" />
               <h3 className="text-lg font-black text-gray-900">Nenhuma disputa aberta</h3>
               <p className="text-sm text-gray-400 font-medium">A plataforma está a operar sem conflitos reportados.</p>
            </div>
          )}
       </div>
    </div>
  );
}

function AdminSystemSettings() {
  const [maintenance, setMaintenance] = useState(false);
  
  return (
    <div className="w-full">
       <SectionHeader title="Configurações do Sistema" subtitle="Gerenciamento global de parâmetros e estado da plataforma" />
       
       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Platform General */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
             <h3 className="text-lg font-black text-gray-900 mb-6 flex items-center gap-2">
                <Settings size={20} className="text-indigo-600" />
                Parâmetros Gerais
             </h3>
             
             <div className="space-y-6">
                <div className="flex items-center justify-between py-2">
                   <div>
                      <p className="text-sm font-black text-gray-900">Taxa de Serviço (%)</p>
                      <p className="text-[10px] text-gray-400 font-medium">Percentagem cobrada sobre cada venda</p>
                   </div>
                   <input type="text" defaultValue="5.0" className="w-20 px-4 py-2 bg-gray-50 rounded-xl text-center font-bold text-sm outline-none focus:ring-2 ring-indigo-50" />
                </div>

                <div className="flex items-center justify-between py-2 border-t border-gray-50">
                   <div>
                      <p className="text-sm font-black text-gray-900">Valor Mínimo Saque</p>
                      <p className="text-[10px] text-gray-400 font-medium">Montante mínimo para retirada (Kz)</p>
                   </div>
                   <input type="text" defaultValue="5.000" className="w-24 px-4 py-2 bg-gray-50 rounded-xl text-center font-bold text-sm outline-none focus:ring-2 ring-indigo-50" />
                </div>

                <div className="flex items-center justify-between py-2 border-t border-gray-50">
                   <div>
                      <p className="text-sm font-black text-gray-900">Dias para Expiração</p>
                      <p className="text-[10px] text-gray-400 font-medium">Tempo limite para validação de pedido</p>
                   </div>
                   <input type="text" defaultValue="3" className="w-20 px-4 py-2 bg-gray-50 rounded-xl text-center font-bold text-sm outline-none focus:ring-2 ring-indigo-50" />
                </div>
             </div>
             
             <button className="w-full mt-10 py-4 bg-black text-white rounded-2xl font-black text-[10px] uppercase shadow-xl hover:scale-105 transition-all">
                Guardar Alterações
             </button>
          </div>

          {/* Maintenance & Security */}
          <div className="space-y-8">
             <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
                <h3 className="text-lg font-black text-gray-900 mb-6 flex items-center gap-2">
                   <Shield size={20} className="text-red-500" />
                   Modo de Manutenção
                </h3>
                
                <div className="flex items-center justify-between">
                   <div className="flex-1 py-1 pr-4">
                      <p className="text-sm font-black text-gray-900">Ativar Manutenção</p>
                      <p className="text-xs text-gray-500 font-medium leading-relaxed">Bloqueia o acesso de todos os utilizadores ao frontend e lojistas.</p>
                   </div>
                   <button 
                     onClick={() => setMaintenance(!maintenance)}
                     className={cn(
                       "w-14 h-8 rounded-full relative transition-colors duration-300 flex items-center px-1",
                       maintenance ? "bg-red-500" : "bg-gray-200"
                     )}
                   >
                      <div className={cn(
                        "w-6 h-6 bg-white rounded-full shadow-sm transition-transform duration-300",
                        maintenance ? "translate-x-6" : "translate-x-0"
                      )}></div>
                   </button>
                </div>
             </div>

             <div className="bg-indigo-600 p-8 rounded-[2.5rem] text-white shadow-xl shadow-indigo-100">
                <h3 className="text-lg font-black mb-4">Relatório do Sistema</h3>
                <div className="space-y-4">
                   <div className="flex justify-between text-xs font-bold text-indigo-100">
                      <span>Uso de CPU</span>
                      <span>12%</span>
                   </div>
                   <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                      <div className="w-[12%] h-full bg-white"></div>
                   </div>
                   
                   <div className="flex justify-between text-xs font-bold text-indigo-100 mt-4">
                      <span>Memória RAM</span>
                      <span>2.4 GB / 8 GB</span>
                   </div>
                   <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                      <div className="w-[30%] h-full bg-white"></div>
                   </div>
                </div>
                
                <div className="mt-8 flex items-center gap-3">
                   <div className="w-2 h-2 rounded-full bg-green-400"></div>
                   <span className="text-[10px] font-black uppercase tracking-wider">Status: Operacional</span>
                </div>
             </div>
          </div>
       </div>
    </div>
  );
}

function OrdersScreen({ empresaId, userId }: { empresaId: string, userId: string }) {
  const [activeTab, setActiveTab] = useState('Todos');
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [trackingOrder, setTrackingOrder] = useState<any>(null);
  const [dbOrders, setDbOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const orders = await orderRepository.getByUserId(empresaId, userId);
        setDbOrders(orders);
      } catch (err) {
        console.error('Falha ao buscar pedidos:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [empresaId, userId]);
  
  const mappedOrders = useMemo(() => {
    return dbOrders.map(o => ({
      id: `#ORD-${o.id.slice(0, 4).toUpperCase()}`,
      date: new Date(o.criadoEm).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }),
      total: `Kz ${o.total.toLocaleString()}`,
      status: o.status === 'pendente' ? 'Pendente' : (o.status === 'pago' ? 'Pago' : 'Entregue'),
      items: o.items.length,
      image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=200&auto=format&fit=crop', // Placeholder
      seller: 'Loja Oficial',
      paymentMethod: 'Multicaixa Express',
      address: 'Endereço Principal'
    }));
  }, [dbOrders]);

  const filteredOrders = useMemo(() => {
    if (activeTab === 'Todos') return mappedOrders;
    if (activeTab === 'Pendentes') return mappedOrders.filter(o => o.status === 'Pendente');
    if (activeTab === 'Pagos') return mappedOrders.filter(o => o.status === 'Pago');
    if (activeTab === 'Concluídos') return mappedOrders.filter(o => o.status === 'Entregue');
    return [];
  }, [activeTab, mappedOrders]);

  return (
    <div className="w-full">
      <SectionHeader title="Meus Pedidos" />
      
      <div className="flex gap-2 mb-8 overflow-x-auto no-scrollbar -mx-2 px-2">
         {['Todos', 'Pendentes', 'Pagos', 'Enviados', 'Concluídos'].map((tab) => (
           <button 
             key={tab} 
             onClick={() => setActiveTab(tab)}
             className={cn(
               "px-6 py-3 rounded-2xl text-xs font-black uppercase whitespace-nowrap transition-all",
               activeTab === tab ? "bg-primary text-white shadow-lg shadow-primary/20" : "bg-gray-50 text-gray-400 hover:bg-gray-100"
             )}
           >
             {tab}
           </button>
         ))}
      </div>

      <div className="space-y-6">
        {filteredOrders.length > 0 ? filteredOrders.map((order) => (
          <motion.div 
            key={order.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={() => setSelectedOrder(order)}
            className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col md:flex-row gap-6 hover:shadow-xl hover:shadow-gray-100 transition-all group cursor-pointer"
          >
            <div className="w-24 h-24 bg-gray-50 rounded-3xl overflow-hidden flex-shrink-0">
               <img src={order.image} alt="Produto" className="w-full h-full object-cover" />
            </div>
            
            <div className="flex-1 flex flex-col justify-center">
               <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{order.date}</span>
                  <div className={cn(
                    "px-3 py-1 rounded-full text-[10px] font-black uppercase",
                    order.status === 'Entregue' ? "bg-green-100 text-green-600" : 
                    order.status === 'Pago' ? "bg-blue-100 text-blue-600" :
                    "bg-orange-100 text-orange-600"
                  )}>
                    {order.status}
                  </div>
               </div>
               <h3 className="text-lg font-black text-gray-900 mb-1">{order.id}</h3>
               <p className="text-sm text-gray-500 font-medium">{order.items} {order.items === 1 ? 'item' : 'itens'} • <span className="font-black text-gray-900">{order.total}</span></p>
            </div>

            <div className="flex items-center gap-3">
               <button className="flex-1 md:flex-none px-6 py-3 bg-gray-50 text-gray-600 rounded-2xl text-xs font-black uppercase hover:bg-gray-900 hover:text-white transition-all">
                  Detalhes
               </button>
               <button 
                 onClick={(e) => { e.stopPropagation(); /* In theory QrCode button click */ }}
                 className="w-12 h-12 bg-primary text-white rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform"
               >
                  <QrCode size={20} />
               </button>
            </div>
          </motion.div>
        )) : (
          <div className="py-20 text-center">
             <Package size={48} className="mx-auto text-gray-200 mb-4" />
             <p className="text-gray-400 font-bold">Nenhum pedido encontrado nesta categoria.</p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {selectedOrder && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
             <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setSelectedOrder(null)}
               className="absolute inset-0 bg-black/60 backdrop-blur-sm"
             />
             <motion.div 
               initial={{ opacity: 0, scale: 0.9, y: 20 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.9, y: 20 }}
               className="relative bg-white w-full max-w-lg rounded-[3rem] overflow-hidden shadow-2xl"
             >
                <button 
                  onClick={() => setSelectedOrder(null)}
                  className="absolute top-6 right-6 w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-black hover:text-white transition-all z-10"
                >
                  <X size={20} />
                </button>

                <div className="p-8">
                   <div className="flex items-center gap-6 mb-8">
                      <div className="w-24 h-24 rounded-3xl overflow-hidden shadow-lg">
                         <img src={selectedOrder.image} className="w-full h-full object-cover" />
                      </div>
                      <div>
                         <span className="text-[10px] font-black text-primary uppercase tracking-widest">{selectedOrder.date}</span>
                         <h3 className="text-2xl font-black text-gray-900">{selectedOrder.id}</h3>
                         <div className={cn(
                            "inline-block mt-2 px-3 py-1 rounded-full text-[10px] font-black uppercase",
                            selectedOrder.status === 'Entregue' ? "bg-green-100 text-green-600" : 
                            selectedOrder.status === 'Pago' ? "bg-blue-100 text-blue-600" :
                            "bg-orange-100 text-orange-600"
                          )}>
                            {selectedOrder.status}
                          </div>
                      </div>
                   </div>

                   <div className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                         <div className="bg-gray-50 p-4 rounded-2xl">
                            <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Vendedor</p>
                            <p className="text-sm font-bold text-gray-900">{selectedOrder.seller}</p>
                         </div>
                         <div className="bg-gray-50 p-4 rounded-2xl">
                            <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Total Pago</p>
                            <p className="text-sm font-black text-gray-900">{selectedOrder.total}</p>
                         </div>
                      </div>

                      <div className="bg-gray-50 p-5 rounded-2xl">
                         <div className="flex items-center gap-3 mb-3 text-gray-400">
                            <CreditCard size={16} />
                            <span className="text-[10px] font-black uppercase tracking-wider">Método de Pagamento</span>
                         </div>
                         <p className="text-sm font-bold text-gray-900">{selectedOrder.paymentMethod}</p>
                      </div>

                      <div className="bg-gray-50 p-5 rounded-2xl">
                         <div className="flex items-center gap-3 mb-3 text-gray-400">
                            <Package size={16} />
                            <span className="text-[10px] font-black uppercase tracking-wider">Endereço de Entrega</span>
                         </div>
                         <p className="text-sm font-bold text-gray-900">{selectedOrder.address}</p>
                      </div>
                   </div>

                   <div className="mt-10 flex gap-3">
                      <button 
                        onClick={() => setTrackingOrder(selectedOrder)}
                        className="flex-1 bg-black text-white py-4 rounded-2xl font-black text-sm hover:scale-[1.02] transition-all"
                      >
                        Acompanhar Encomenda
                      </button>
                      <button 
                        onClick={() => alert(`QR Code para levantamento: ${selectedOrder.id}`)}
                        className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center hover:bg-primary hover:text-white transition-all shadow-lg shadow-primary/5"
                      >
                         <QrCode size={24} />
                      </button>
                   </div>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {trackingOrder && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
             <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setTrackingOrder(null)}
               className="absolute inset-0 bg-black/80 backdrop-blur-md"
             />
             <motion.div 
               initial={{ opacity: 0, scale: 0.9, y: 20 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.9, y: 20 }}
               className="relative bg-white w-full max-w-md rounded-[3rem] overflow-hidden shadow-2xl p-8"
             >
                <div className="flex items-center justify-between mb-8">
                   <div>
                      <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">Rastreamento</p>
                      <h3 className="text-xl font-black text-gray-900">{trackingOrder.id}</h3>
                   </div>
                   <button 
                     onClick={() => setTrackingOrder(null)}
                     className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-black hover:text-white transition-all"
                   >
                     <X size={20} />
                   </button>
                </div>

                <div className="space-y-8 relative">
                   <div className="absolute left-[15px] top-4 bottom-4 w-0.5 bg-gray-100"></div>
                   
                   {[
                     { status: 'Pedido Recebido', date: '22 Abr, 10:00', done: true, current: false },
                     { status: 'Pagamento Confirmado', date: '22 Abr, 10:30', done: true, current: false },
                     { status: 'Em Processamento', date: '23 Abr, 09:15', done: true, current: true },
                     { status: 'Enviado para Entrega', date: 'Pendente', done: false, current: false },
                     { status: 'Entregue', date: 'Pendente', done: false, current: false },
                   ].map((step, i) => (
                     <div key={i} className="flex gap-6 relative z-10">
                        <div className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center border-4 border-white shadow-sm ring-2",
                          step.done ? "bg-primary ring-primary/20" : "bg-white ring-gray-100"
                        )}>
                           {step.done ? <Check size={14} className="text-white" strokeWidth={4} /> : <div className="w-2 h-2 rounded-full bg-gray-200" />}
                        </div>
                        <div>
                           <h4 className={cn("text-sm font-black", step.current ? "text-primary" : "text-gray-900")}>{step.status}</h4>
                           <p className="text-[10px] text-gray-400 font-bold uppercase">{step.date}</p>
                        </div>
                     </div>
                   ))}
                </div>

                <div className="mt-10 p-6 bg-gray-50 rounded-[2rem] border border-gray-100">
                   <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-primary shadow-sm">
                         <Navigation size={24} />
                      </div>
                      <div>
                         <p className="text-[10px] font-black text-gray-400 uppercase">Previsão de Entrega</p>
                         <p className="text-sm font-black text-gray-900">2 Dias Úteis</p>
                      </div>
                   </div>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function PaymentsScreen({ onBack, methods, transactions, onAdd }: { onBack: () => void, methods: any[], transactions: any[], onAdd: (method: any) => void }) {
  const [selectedMethod, setSelectedMethod] = useState<any>(null);
  const [selectedTx, setSelectedTx] = useState<any>(null);
  const [selectedStatement, setSelectedStatement] = useState<any>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [paymentTab, setPaymentTab] = useState('geral');

  // Add Card Form State
  const [newCardType, setNewCardType] = useState('Multicaixa Express');
  const [newCardLast4, setNewCardLast4] = useState('');
  const [newCardExpiry, setNewCardExpiry] = useState('12/28');

  const handleAddCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCardLast4 || newCardLast4.length < 4) {
      alert('Por favor, introduza os últimos 4 dígitos do cartão.');
      return;
    }
    
    onAdd({
      id: Date.now(),
      type: newCardType,
      last4: newCardLast4.slice(-4),
      expiry: newCardExpiry,
      isDefault: methods.length === 0
    });
    
    setIsAdding(false);
    setNewCardLast4('');
    alert(`${newCardType} adicionado com sucesso!`);
  };

  const handleTopUp = () => {
    const amount = prompt('Introduza o montante a carregar (Kz):', '5000');
    if (amount) {
      alert(`Pedido de carregamento de Kz ${amount} enviado para processamento via Multicaixa Express.`);
    }
  };

  const handleViewStatement = () => {
    setPaymentTab('extrato');
  };

  const handleDownloadPDF = (period?: string) => {
    const periodStr = period || 'Geral';
    alert(`A gerar extrato detalhado (${periodStr}) em PDF...`);
    
    setTimeout(() => {
      const content = `EXTRATO DE PAGAMENTOS - ${periodStr.toUpperCase()}\n\nResumo de Transações\nSaldo Total: Kz 245.000\nData de Emissão: ${new Date().toLocaleString()}\n\nEste é um documento de demonstração de extrato.`;
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Extrato_${periodStr.replace(/\s+/g, '_')}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      alert('Extrato descarregado com sucesso!');
    }, 1000);
  };

  if (isAdding) {
    return (
      <div className="w-full">
        <div className="flex items-center gap-4 mb-8">
           <button onClick={() => setIsAdding(false)} className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-gray-100 hover:bg-black hover:text-white transition-all">
              <ChevronLeft size={20} />
           </button>
           <h2 className="text-xl font-black text-gray-900">Novo Método de Pagamento</h2>
        </div>
        
        <div className="bg-white p-10 rounded-[3.5rem] border border-gray-100 shadow-sm max-w-xl mx-auto">
           <form onSubmit={handleAddCard} className="space-y-6">
              <div className="space-y-2">
                 <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Tipo de Método</label>
                 <div className="grid grid-cols-2 gap-4">
                    {['Multicaixa Express', 'Kwik', 'Visa', 'Mastercard'].map(type => (
                       <button
                         key={type}
                         type="button"
                         onClick={() => setNewCardType(type)}
                         className={cn(
                           "py-4 rounded-2xl font-black text-[10px] uppercase transition-all border-2",
                           newCardType === type 
                             ? "bg-black text-white border-black" 
                             : "bg-gray-50 text-gray-400 border-transparent hover:border-gray-200"
                         )}
                       >
                         {type}
                       </button>
                    ))}
                 </div>
              </div>

              <div className="space-y-2">
                 <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Últimos 4 Dígitos</label>
                 <input 
                   type="text" 
                   maxLength={4}
                   value={newCardLast4}
                   onChange={(e) => setNewCardLast4(e.target.value.replace(/\D/g, ''))}
                   placeholder="8888"
                   className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-gray-900 focus:ring-2 ring-primary/20 outline-none"
                   required
                 />
              </div>

              <div className="space-y-2">
                 <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Validade (MM/AA)</label>
                 <input 
                   type="text" 
                   value={newCardExpiry}
                   onChange={(e) => setNewCardExpiry(e.target.value)}
                   placeholder="12/28"
                   className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-gray-900 focus:ring-2 ring-primary/20 outline-none"
                   required
                 />
              </div>

              <div className="pt-4">
                 <button 
                   type="submit"
                   className="w-full py-5 bg-yellow-400 text-black rounded-2xl font-black text-xs uppercase hover:bg-yellow-500 transition-all shadow-xl shadow-yellow-400/20"
                 >
                   Guardar Método
                 </button>
              </div>
           </form>
        </div>
      </div>
    );
  }

  if (selectedMethod) {
    return (
      <div className="w-full">
        <div className="flex items-center gap-4 mb-8">
           <button onClick={() => setSelectedMethod(null)} className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-gray-100 hover:bg-black hover:text-white transition-all">
              <ChevronLeft size={20} />
           </button>
           <h2 className="text-xl font-black text-gray-900">Gerir Cartão</h2>
        </div>
        <div className="bg-white p-10 rounded-[3.5rem] border border-gray-100 shadow-sm text-center">
           <div className="w-24 h-24 bg-blue-50 text-blue-600 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
              <CreditCard size={48} />
           </div>
           <h3 className="text-2xl font-black text-gray-900 mb-1">{selectedMethod.type}</h3>
           <p className="text-gray-400 font-bold mb-8 italic">Final **** {selectedMethod.last4}</p>
           
           <div className="grid grid-cols-1 gap-4 mb-8">
              <button className="w-full py-5 bg-gray-50 text-gray-900 rounded-2xl font-black text-xs uppercase hover:bg-gray-100 transition-all">Definir como Principal</button>
              <button 
                onClick={() => {
                  if (confirm("Remover este método de pagamento?")) {
                    setSelectedMethod(null);
                  }
                }}
                className="w-full py-5 bg-red-50 text-red-500 rounded-2xl font-black text-xs uppercase hover:bg-red-100 transition-all"
              >
                Remover Cartão
              </button>
           </div>
        </div>
      </div>
    );
  }

  if (selectedTx) {
    return (
      <div className="w-full">
        <div className="flex items-center gap-4 mb-8">
           <button onClick={() => setSelectedTx(null)} className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-gray-100 hover:bg-black hover:text-white transition-all">
              <ChevronLeft size={20} />
           </button>
           <h2 className="text-xl font-black text-gray-900">Detalhes do Pagamento</h2>
        </div>
        <div className="bg-white p-10 rounded-[3.5rem] border border-gray-100 shadow-sm">
           <div className="flex items-center justify-between mb-10">
              <div className={cn(
                 "w-16 h-16 rounded-2xl flex items-center justify-center",
                 selectedTx.positive ? "bg-green-50 text-green-500" : "bg-orange-50 text-orange-500"
              )}>
                 {selectedTx.positive ? <ArrowDownLeft size={32} /> : <ArrowUpRight size={32} />}
              </div>
              <div className="text-right">
                 <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Montante</p>
                 <h4 className={cn("text-3xl font-black", selectedTx.positive ? "text-green-500" : "text-gray-900")}>{selectedTx.amount}</h4>
              </div>
           </div>
           
           <div className="space-y-6 mb-10">
              <div className="flex justify-between border-b border-gray-50 pb-4">
                 <span className="text-xs font-bold text-gray-400 uppercase">Referência</span>
                 <span className="text-xs font-black text-gray-900">ORD-{selectedTx.id}992</span>
              </div>
              <div className="flex justify-between border-b border-gray-50 pb-4">
                 <span className="text-xs font-bold text-gray-400 uppercase">Descrição</span>
                 <span className="text-xs font-black text-gray-900">{selectedTx.title}</span>
              </div>
              <div className="flex justify-between border-b border-gray-50 pb-4">
                 <span className="text-xs font-bold text-gray-400 uppercase">Data/Hora</span>
                 <span className="text-xs font-black text-gray-900">{selectedTx.date}</span>
              </div>
              <div className="flex justify-between border-b border-gray-50 pb-4">
                 <span className="text-xs font-bold text-gray-400 uppercase">Status</span>
                 <span className="text-[10px] font-black text-green-500 bg-green-50 px-3 py-1 rounded-full uppercase">Confirmado</span>
              </div>
           </div>
           
           <button onClick={() => handleDownloadPDF(`Recibo_${selectedTx.id}`)} className="w-full py-5 bg-black text-white rounded-2xl font-black text-xs uppercase hover:bg-primary transition-all shadow-xl">Descarregar Recibo</button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex items-center gap-4 mb-8">
         <button onClick={onBack} className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-gray-100 hover:bg-black hover:text-white transition-all">
            <ChevronLeft size={20} />
         </button>
         <h2 className="text-xl font-black text-gray-900">Meus Pagamentos</h2>
      </div>

      <div className="flex gap-4 mb-8 bg-gray-50 p-2 rounded-3xl w-fit">
        <button 
          onClick={() => setPaymentTab('geral')}
          className={cn(
            "px-8 py-3 rounded-2xl text-xs font-black uppercase transition-all",
            paymentTab === 'geral' ? "bg-yellow-400 text-black shadow-lg shadow-yellow-400/20" : "text-gray-400 hover:text-gray-600"
          )}
        >
          Geral
        </button>
        <button 
          onClick={() => setPaymentTab('extrato')}
          className={cn(
            "px-8 py-3 rounded-2xl text-xs font-black uppercase transition-all",
            paymentTab === 'extrato' ? "bg-yellow-400 text-black shadow-lg shadow-yellow-400/20" : "text-gray-400 hover:text-gray-600"
          )}
        >
          Ver Extrato
        </button>
      </div>

      {paymentTab === 'geral' ? (
        <>
          {/* Wallet Balance Card */}
      <div className="relative overflow-hidden bg-white border border-gray-100 rounded-[3rem] p-8 mb-10 text-gray-900 shadow-xl shadow-gray-100">
         <div className="relative z-10">
            <div className="flex justify-between items-start mb-10">
               <div>
                  <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-1">Saldo Total</p>
                  <h3 className="text-4xl font-black">Kz 245.000</h3>
               </div>
               <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-primary shadow-sm">
                  <Wallet size={24} />
               </div>
            </div>
            
            <div className="flex gap-4">
               <button 
                onClick={handleTopUp}
                className="flex-1 bg-yellow-400 text-black py-4 rounded-2xl font-black text-xs uppercase flex items-center justify-center gap-2 hover:bg-yellow-500 transition-all shadow-lg shadow-yellow-400/20"
               >
                  <Plus size={16} /> Carregar Saldo
               </button>
               <button 
                onClick={handleViewStatement}
                className="flex-1 bg-yellow-50 text-yellow-700 py-4 rounded-2xl font-black text-xs uppercase flex items-center justify-center gap-2 hover:bg-yellow-100 transition-all border border-yellow-100"
               >
                  <Download size={16} /> Ver Extrato
               </button>
            </div>
         </div>
         {/* Abstract background elements - subtler for white bg */}
         <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-[80px] -translate-y-1/2 translate-x-1/2"></div>
         <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/5 blur-[80px] translate-y-1/2 -translate-x-1/2"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
               <h3 className="text-lg font-black text-gray-900">Histórico de Transações</h3>
               <button className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline">Filtrar</button>
            </div>

            <div className="space-y-4">
               {transactions.map((tx) => (
                  <div 
                    key={tx.id} 
                    onClick={() => setSelectedTx(tx)}
                    className="bg-white p-5 rounded-[2rem] border border-gray-100 shadow-sm flex items-center justify-between hover:shadow-lg transition-all group cursor-pointer"
                  >
                     <div className="flex items-center gap-5">
                        <div className={cn(
                           "w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110",
                           tx.positive ? "bg-green-50 text-green-500" : "bg-orange-50 text-orange-500"
                        )}>
                           {tx.positive ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
                        </div>
                        <div>
                           <h4 className="text-sm font-bold text-gray-900">{tx.title}</h4>
                           <p className="text-[10px] text-gray-400 font-bold uppercase mt-0.5">{tx.date}</p>
                        </div>
                     </div>
                     <span className={cn(
                        "text-sm font-black",
                        tx.positive ? "text-green-500" : "text-gray-900"
                     )}>
                        {tx.amount}
                     </span>
                  </div>
               ))}
            </div>
         </div>

         <div className="space-y-8">
            <div>
               <h3 className="text-lg font-black text-gray-900 mb-6">Métodos Salvos</h3>
               <div className="space-y-4">
                  {methods.map(method => (
                    <div 
                      key={method.id} 
                      onClick={() => setSelectedMethod(method)}
                      className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm flex items-center gap-4 relative overflow-hidden cursor-pointer hover:border-black transition-all"
                    >
                       <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                          <CreditCard size={24} />
                       </div>
                       <div>
                          <p className="text-sm font-black text-gray-900">{method.type} final {method.last4}</p>
                          <p className="text-[10px] text-gray-400 font-bold uppercase">Expira {method.expiry}</p>
                       </div>
                    </div>
                  ))}
                  <button 
                    onClick={() => setIsAdding(true)}
                    className="w-full py-6 border-2 border-dashed border-gray-100 rounded-[2.5rem] text-gray-400 text-xs font-black uppercase flex items-center justify-center gap-3 hover:border-primary hover:text-primary transition-all"
                  >
                     <Plus size={18} /> Adicionar Cartão
                  </button>
               </div>
            </div>

            <div className="bg-primary/5 p-8 rounded-[3rem] border border-primary/10">
               <div className="w-12 h-12 bg-primary text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-primary/20">
                  <ShieldCheck size={24} />
               </div>
               <h4 className="text-lg font-black text-gray-900 mb-2">Pagamento Seguro</h4>
               <p className="text-xs text-gray-500 leading-relaxed font-medium">
                  Todos os teus pagamentos são processados sob encriptação e validados pela nossa equipa de segurança.
               </p>
            </div>
         </div>
       </div>
        </>
      ) : (
        <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm">
           <div className="flex items-center justify-between mb-10">
              <h3 className="text-xl font-black text-gray-900">Extrato Consolidado</h3>
              <button onClick={() => handleDownloadPDF('Extrato Geral')} className="flex items-center gap-2 text-primary text-xs font-black uppercase hover:underline">
                 <Download size={16} /> Descarregar PDF
              </button>
           </div>
           <div className="space-y-4">
              {[
                { period: 'Abril 2024', entries: '14 transações', limit: 'Kz 450.000', detail: 'O teu extrato de Abril mostra um crescimento de 15% em relação ao mês anterior. A maioria dos gastos foram em vestuário casual.' },
                { period: 'Março 2024', entries: '22 transações', limit: 'Kz 620.000', detail: 'Março foi o mês com maior volume de compras devido à nova coleção de Primavera/Verão.' },
                { period: 'Fevereiro 2024', entries: '08 transações', limit: 'Kz 120.000', detail: 'Fevereiro manteve-se estável com foco em acessórios e calçado formal.' }
              ].map((item, i) => (
                <div key={i} onClick={() => setSelectedStatement(item)} className="p-6 bg-gray-50 rounded-[2rem] flex items-center justify-between group cursor-pointer hover:bg-gray-100 transition-all">
                   <div>
                      <h4 className="text-sm font-bold text-gray-900">{item.period}</h4>
                      <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">{item.entries}</p>
                   </div>
                   <div className="text-right">
                      <p className="text-sm font-black text-gray-900">{item.limit}</p>
                      <p className="text-[8px] text-green-500 font-black uppercase mt-1">Disponível</p>
                   </div>
                </div>
              ))}
           </div>
        </div>
      )}

      {/* Statement Details Popup */}
      <AnimatePresence>
        {selectedStatement && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
             <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setSelectedStatement(null)}
               className="absolute inset-0 bg-black/60 backdrop-blur-sm"
             />
             <motion.div 
               initial={{ opacity: 0, scale: 0.9, y: 20 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.9, y: 20 }}
               className="relative bg-white w-full max-w-md rounded-[3rem] overflow-hidden shadow-2xl p-8"
             >
                <div className="flex items-center justify-between mb-8">
                   <div>
                      <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">Detalhes do Extrato</p>
                      <h3 className="text-2xl font-black text-gray-900">{selectedStatement.period}</h3>
                   </div>
                   <button 
                     onClick={() => setSelectedStatement(null)}
                     className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center hover:bg-black hover:text-white transition-all"
                   >
                     <X size={20} />
                   </button>
                </div>

                <div className="space-y-6">
                   <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100">
                      <div className="flex justify-between items-center mb-4">
                         <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Gasto</span>
                         <span className="text-lg font-black text-gray-900">{selectedStatement.limit}</span>
                      </div>
                      <div className="flex justify-between items-center">
                         <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Volume</span>
                         <span className="text-sm font-bold text-gray-700">{selectedStatement.entries}</span>
                      </div>
                   </div>

                   <div className="space-y-2">
                      <h4 className="text-xs font-black text-gray-900 uppercase tracking-widest">Resumo do Período</h4>
                      <p className="text-sm text-gray-500 leading-relaxed font-medium">
                        {selectedStatement.detail}
                      </p>
                   </div>

                   <div className="pt-4 flex gap-3">
                      <button 
                        onClick={() => {
                          setSelectedStatement(null);
                          handleDownloadPDF(selectedStatement.period);
                        }}
                        className="flex-1 py-4 bg-yellow-400 text-black rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2"
                      >
                         <Download size={16} /> PDF
                      </button>
                      <button 
                        onClick={() => setSelectedStatement(null)}
                        className="flex-1 py-4 bg-gray-100 text-gray-900 rounded-2xl font-black text-xs uppercase tracking-widest"
                      >
                         Fechar
                      </button>
                   </div>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ProfileInfoScreen({ onBack, userInfo, onSave }: { onBack: () => void, userInfo: any, onSave: (data: any) => void }) {
  const [formData, setFormData] = useState(userInfo);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  return (
    <div className="w-full">
      <div className="flex items-center gap-4 mb-8">
         <button onClick={onBack} className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-gray-100 hover:bg-black hover:text-white transition-all">
            <ChevronLeft size={20} />
         </button>
         <h2 className="text-xl font-black text-gray-900">Informações Pessoais</h2>
      </div>

      <div className="bg-white rounded-[3rem] p-8 border border-gray-100 shadow-sm space-y-6">
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
               <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Nome Completo</label>
               <input 
                  type="text" 
                  name="name"
                  value={formData.name} 
                  onChange={handleChange}
                  className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl font-bold text-gray-900 focus:ring-2 ring-primary/20 outline-none" 
               />
            </div>
            <div className="space-y-2">
               <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email</label>
               <input 
                  type="email" 
                  name="email"
                  value={formData.email} 
                  onChange={handleChange}
                  className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl font-bold text-gray-900 focus:ring-2 ring-primary/20 outline-none" 
               />
            </div>
            <div className="space-y-2">
               <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Telefone</label>
               <input 
                  type="tel" 
                  name="phone"
                  value={formData.phone} 
                  onChange={handleChange}
                  className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl font-bold text-gray-900 focus:ring-2 ring-primary/20 outline-none" 
               />
            </div>
            <div className="space-y-2">
               <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Data de Nascimento</label>
               <input 
                  type="date" 
                  name="birthday"
                  value={formData.birthday} 
                  onChange={handleChange}
                  className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl font-bold text-gray-900 focus:ring-2 ring-primary/20 outline-none" 
               />
            </div>
         </div>
         <button 
            onClick={() => {
               onSave(formData);
               alert('Perfil atualizado com sucesso!');
               onBack();
            }}
            className="w-full py-5 bg-black text-white rounded-2xl font-black text-xs uppercase hover:bg-primary transition-all shadow-xl shadow-gray-200"
         >
            Salvar Alterações
         </button>
      </div>
    </div>
  );
}

function ProfileAddressesScreen({ onBack, addresses, onAdd, onDelete, onUpdate }: { onBack: () => void, addresses: any[], onAdd: () => void, onDelete: (id: number) => void, onUpdate: (addr: any) => void }) {
  const [editingAddr, setEditingAddr] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const handleSave = () => {
    if (editingAddr) {
      onUpdate(editingAddr);
      setEditingAddr(null);
      alert('Endereço atualizado com sucesso!');
    }
  };

  if (editingAddr) {
    return (
      <div className="w-full">
        <div className="flex items-center gap-4 mb-8">
           <button onClick={() => setEditingAddr(null)} className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-gray-100 hover:bg-black hover:text-white transition-all">
              <ChevronLeft size={20} />
           </button>
           <h2 className="text-xl font-black text-gray-900">Editar Endereço</h2>
        </div>
        <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm space-y-6">
           <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Tipo (ex: Casa, Trabalho)</label>
              <input 
                type="text" 
                value={editingAddr.type} 
                onChange={(e) => setEditingAddr({...editingAddr, type: e.target.value})}
                className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl font-bold focus:ring-2 ring-primary/20 outline-none" 
              />
           </div>
           <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Detalhes do Endereço</label>
              <input 
                type="text" 
                value={editingAddr.detail} 
                onChange={(e) => setEditingAddr({...editingAddr, detail: e.target.value})}
                className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl font-bold focus:ring-2 ring-primary/20 outline-none" 
              />
           </div>
           <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Cidade / Província</label>
              <input 
                type="text" 
                value={editingAddr.city} 
                onChange={(e) => setEditingAddr({...editingAddr, city: e.target.value})}
                className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl font-bold focus:ring-2 ring-primary/20 outline-none" 
              />
           </div>
           <button 
             onClick={handleSave}
             className="w-full py-5 bg-black text-white rounded-2xl font-black text-xs uppercase hover:bg-primary transition-all shadow-xl"
           >
              Salvar Alterações
           </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex items-center gap-4 mb-8">
         <button onClick={onBack} className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-gray-100 hover:bg-black hover:text-white transition-all">
            <ChevronLeft size={20} />
         </button>
         <h2 className="text-xl font-black text-gray-900">Endereços de Entrega</h2>
      </div>

      <div className="space-y-4">
         {addresses.map(addr => (
            <div key={addr.id} className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm flex items-start justify-between group">
               <div className="flex gap-5">
                  <div className="w-12 h-12 bg-gray-50 text-gray-400 rounded-2xl flex items-center justify-center">
                     <MapPin size={24} />
                  </div>
                  <div>
                     <div className="flex items-center gap-3 mb-1">
                        <h4 className="text-sm font-black text-gray-900">{addr.type}</h4>
                        {addr.primary && <span className="bg-primary/10 text-primary text-[8px] font-black uppercase px-2 py-0.5 rounded-full">Principal</span>}
                     </div>
                     <p className="text-xs text-gray-500 font-medium leading-relaxed max-w-xs">{addr.detail}</p>
                     <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">{addr.city}</p>
                  </div>
               </div>
               <div className="flex gap-2">
                  {deleteId === addr.id ? (
                     <div className="flex bg-red-50 rounded-xl overflow-hidden border border-red-100 scale-95 origin-right">
                        <button 
                          onClick={() => {
                            onDelete(addr.id);
                            setDeleteId(null);
                            alert('Endereço removido com sucesso!');
                          }}
                          className="px-3 py-2 text-[10px] font-black uppercase text-red-600 hover:bg-red-600 hover:text-white transition-all border-r border-red-100"
                        >
                           Confirmar
                        </button>
                        <button 
                          onClick={() => setDeleteId(null)}
                          className="px-3 py-2 text-[10px] font-black uppercase text-gray-400 hover:bg-gray-100 transition-all font-bold"
                        >
                           X
                        </button>
                     </div>
                  ) : (
                     <>
                        <button 
                          onClick={() => setEditingAddr(addr)}
                          className="w-10 h-10 bg-gray-50 text-gray-400 rounded-xl flex items-center justify-center hover:bg-gray-900 hover:text-white transition-all"
                        >
                           <Edit3 size={16} />
                        </button>
                        <button 
                          onClick={() => setDeleteId(addr.id)}
                          className="w-10 h-10 bg-gray-50 text-red-400 rounded-xl flex items-center justify-center hover:bg-red-500 hover:text-white transition-all"
                        >
                           <Trash2 size={16} />
                        </button>
                     </>
                  )}
               </div>
            </div>
         ))}

         <button 
            onClick={onAdd}
            className="w-full py-6 border-2 border-dashed border-gray-100 rounded-[2.5rem] text-gray-400 text-xs font-black uppercase flex items-center justify-center gap-3 hover:border-primary hover:text-primary transition-all"
         >
            <Plus size={18} /> Adicionar Novo Endereço
         </button>
      </div>
    </div>
  );
}

function ProfileSecurityScreen({ onBack }: { onBack: () => void }) {
  return (
    <div className="w-full">
      <div className="flex items-center gap-4 mb-8">
         <button onClick={onBack} className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-gray-100 hover:bg-black hover:text-white transition-all">
            <ChevronLeft size={20} />
         </button>
         <h2 className="text-xl font-black text-gray-900">Segurança</h2>
      </div>

      <div className="space-y-6">
         <div className="bg-white rounded-[3.5rem] p-10 border border-gray-100 shadow-sm">
            <h3 className="text-lg font-black text-gray-900 mb-8">Alterar Palavra-passe</h3>
            <div className="space-y-5">
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Palavra-passe Atual</label>
                  <input type="password" placeholder="••••••••" className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl font-bold focus:ring-2 ring-primary/20 outline-none" />
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Nova Palavra-passe</label>
                  <input type="password" placeholder="Mínimo 8 caracteres" className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl font-bold focus:ring-2 ring-primary/20 outline-none" />
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Confirmar Nova Palavra-passe</label>
                  <input type="password" placeholder="••••••••" className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl font-bold focus:ring-2 ring-primary/20 outline-none" />
               </div>
               <button className="w-full py-5 bg-black text-white rounded-2xl font-black text-xs uppercase hover:bg-primary transition-all shadow-xl mt-4">
                  Atualizar Segurança
               </button>
            </div>
         </div>

         <div className="bg-blue-50 border border-blue-100 rounded-[2.5rem] p-8 flex items-center justify-between">
            <div className="flex items-center gap-5">
               <div className="w-14 h-14 bg-white text-blue-500 rounded-3xl flex items-center justify-center shadow-sm">
                  <ShieldCheck size={28} />
               </div>
               <div>
                  <h4 className="text-sm font-black text-gray-900">Autenticação de Dois Fatores</h4>
                  <p className="text-xs text-gray-500 font-medium">Adiciona uma camada extra de proteção</p>
               </div>
            </div>
            <div className="w-14 h-8 bg-gray-200 rounded-full relative p-1 cursor-pointer">
               <div className="w-6 h-6 bg-white rounded-full shadow-sm"></div>
            </div>
         </div>
      </div>
    </div>
  );
}

function ProfileSettingsScreen({ onBack, isDarkMode, setIsDarkMode, onFaceRegClick, isFaceEnabled, onToggleFace }: { onBack: () => void, isDarkMode: boolean, setIsDarkMode: (v: boolean) => void, onFaceRegClick: () => void, isFaceEnabled: boolean, onToggleFace: () => void }) {
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [language, setLanguage] = useState('Português (Angola)');

  const handleChangeLanguage = () => {
    setShowLanguageModal(true);
  };

  const handleSelectLanguage = (lang: string) => {
    setLanguage(lang);
    setShowLanguageModal(false);
    alert(`Idioma alterado para: ${lang}`);
  };

  return (
    <div className="w-full">
      <div className="flex items-center gap-4 mb-8">
         <button onClick={onBack} className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-gray-100 hover:bg-black hover:text-white transition-all">
            <ChevronLeft size={20} />
         </button>
         <h2 className="text-xl font-black text-gray-900">Definições do App</h2>
      </div>

      <div className="space-y-6">
        {/* Face ID Section */}
        <div className="bg-white rounded-[3rem] p-8 border border-gray-100 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-2xl" />
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
              <Scan size={24} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-gray-900">Biometria Facial</h4>
              <p className="text-[10px] text-gray-400 font-bold uppercase mt-0.5">Desbloqueio Seguro</p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
             <button 
                onClick={onFaceRegClick}
                className="flex-1 py-3 bg-gray-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all flex items-center justify-center gap-2"
             >
                <Camera size={14} />
                Registar Rosto
             </button>
             <button 
                onClick={async () => {
                  if (confirm('Desejas apagar os dados faciais?')) {
                    await faceService.clearBiometrics('current-user');
                    alert('Dados apagados');
                  }
                }}
                className="px-6 py-3 bg-gray-50 text-gray-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-100 transition-all"
             >
                Limpar
             </button>
          </div>

          <div className="mt-6 flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
             <span className="text-[10px] font-black uppercase text-gray-500">Ativar Desbloqueio Facial</span>
             <button 
                onClick={onToggleFace}
                className={cn(
                  "w-12 h-6 rounded-full relative transition-all duration-300",
                  isFaceEnabled ? "bg-primary" : "bg-gray-200"
                )}
             >
                <div className={cn(
                  "absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-300 shadow-sm",
                  isFaceEnabled ? "left-7" : "left-1"
                )} />
             </button>
          </div>
        </div>

        <div className="bg-white rounded-[3rem] p-8 border border-gray-100 shadow-sm divide-y divide-gray-50">
           <div className="py-6 flex items-center justify-between first:pt-0">
            <div>
               <h4 className="text-sm font-bold text-gray-900">Idioma do Aplicativo</h4>
               <p className="text-[10px] text-gray-400 font-bold uppercase mt-0.5">{language}</p>
            </div>
            <button onClick={handleChangeLanguage} className="text-xs font-black text-primary uppercase">Mudar</button>
         </div>
         
         <div className="py-6 flex items-center justify-between">
            <div>
               <h4 className="text-sm font-bold text-gray-900">Modo Escuro</h4>
               <p className="text-[10px] text-gray-400 font-bold uppercase mt-0.5">
                  {isDarkMode ? 'Ativado' : 'Desativado'}
               </p>
            </div>
            <button 
               onClick={() => setIsDarkMode(!isDarkMode)}
               className={cn(
                 "w-14 h-8 rounded-full relative p-1 transition-all duration-300",
                 isDarkMode ? "bg-primary" : "bg-gray-200"
               )}
            >
               <div className={cn(
                 "w-6 h-6 bg-white rounded-full shadow-sm transition-all duration-300 transform",
                 isDarkMode ? "translate-x-6" : "translate-x-0"
               )}></div>
            </button>
         </div>

         <div className="py-6 flex items-center justify-between">
            <div>
               <h4 className="text-sm font-bold text-gray-900">Notificações Push</h4>
               <p className="text-[10px] text-gray-400 font-bold uppercase mt-0.5">Alertas e Newsletters</p>
            </div>
            <div className="w-14 h-8 bg-primary rounded-full relative p-1 cursor-pointer">
               <div className="w-6 h-6 bg-white rounded-full shadow-sm translate-x-6"></div>
            </div>
         </div>

         <button 
           onClick={() => setShowPrivacyModal(true)}
           className="w-full py-6 flex items-center justify-between last:pb-0 text-left hover:bg-gray-50/50 -mx-8 px-8 rounded-b-[3rem] transition-all"
         >
            <div>
               <h4 className="text-sm font-bold text-gray-900">Privacidade de Dados</h4>
               <p className="text-[10px] text-gray-400 font-bold uppercase mt-0.5">Gerir cookies e rastreio</p>
            </div>
            <ChevronRight size={20} className="text-gray-300" />
         </button>
      </div>
    </div>

      {/* Language Modal */}
      <AnimatePresence>
        {showLanguageModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
             <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setShowLanguageModal(false)}
               className="absolute inset-0 bg-black/60 backdrop-blur-sm"
             />
             <motion.div 
               initial={{ opacity: 0, scale: 0.9, y: 20 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.9, y: 20 }}
               className="relative bg-white w-full max-w-sm rounded-[3rem] overflow-hidden shadow-2xl p-8"
             >
                <div className="flex items-center justify-between mb-8">
                   <h3 className="text-xl font-black text-gray-900">Selecionar Idioma</h3>
                   <button onClick={() => setShowLanguageModal(false)} className="w-10 h-10 bg-gray-100 rounded-2xl flex items-center justify-center hover:bg-black hover:text-white transition-all">
                      <X size={20} />
                   </button>
                </div>

                <div className="space-y-2">
                   {['Português (Angola)', 'English', 'Français', 'Español', 'Deutsch'].map((lang) => (
                     <button
                       key={lang}
                       onClick={() => handleSelectLanguage(lang)}
                       className={cn(
                         "w-full p-5 rounded-2xl text-left font-bold transition-all border",
                         language === lang 
                           ? "bg-black text-white border-black" 
                           : "bg-gray-50 text-gray-600 border-gray-50 hover:bg-gray-100"
                       )}
                     >
                        {lang}
                     </button>
                   ))}
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>


      {/* Privacy Modal */}
      <AnimatePresence>
        {showPrivacyModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
             <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setShowPrivacyModal(false)}
               className="absolute inset-0 bg-black/60 backdrop-blur-sm"
             />
             <motion.div 
               initial={{ opacity: 0, scale: 0.9, y: 20 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.9, y: 20 }}
               className="relative bg-white w-full max-w-lg rounded-[3rem] overflow-hidden shadow-2xl p-8"
             >
                <div className="flex items-center justify-between mb-8">
                   <h3 className="text-xl font-black text-gray-900">Privacidade de Dados</h3>
                   <button onClick={() => setShowPrivacyModal(false)} className="w-10 h-10 bg-gray-100 rounded-2xl flex items-center justify-center hover:bg-black hover:text-white transition-all">
                      <X size={20} />
                   </button>
                </div>

                <div className="space-y-6">
                   <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                      <div>
                         <p className="text-sm font-bold text-gray-900">Cookies Essenciais</p>
                         <p className="text-[10px] text-gray-400 font-bold uppercase">Sempre Ativo</p>
                      </div>
                      <div className="w-10 h-6 bg-primary/20 rounded-full flex items-center justify-end p-1">
                         <div className="w-4 h-4 bg-primary rounded-full"></div>
                      </div>
                   </div>

                   <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                      <div>
                         <p className="text-sm font-bold text-gray-900">Análise e Estatísticas</p>
                         <p className="text-[10px] text-gray-400 font-bold uppercase">Melhorar a experiência</p>
                      </div>
                      <div className="w-10 h-6 bg-primary rounded-full flex items-center justify-end p-1 cursor-pointer">
                         <div className="w-4 h-4 bg-white rounded-full"></div>
                      </div>
                   </div>

                   <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                      <div>
                         <p className="text-sm font-bold text-gray-900">Marketing Personalizado</p>
                         <p className="text-[10px] text-gray-400 font-bold uppercase">Ofertas relevantes</p>
                      </div>
                      <div className="w-10 h-6 bg-gray-200 rounded-full flex items-center justify-start p-1 cursor-pointer">
                         <div className="w-4 h-4 bg-white rounded-full"></div>
                      </div>
                   </div>

                   <p className="text-[10px] text-gray-400 font-medium leading-relaxed">
                      Ao ajustar estas definições, você controla como o Moda d'Angola utiliza os seus dados para melhorar os nossos serviços. Consulte a nossa Política de Privacidade para mais detalhes.
                   </p>

                   <button 
                     onClick={() => setShowPrivacyModal(false)}
                     className="w-full py-4 bg-black text-white rounded-2xl font-black text-xs uppercase hover:bg-primary transition-all shadow-xl"
                   >
                      Confirmar Preferências
                   </button>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function AdminProfileScreen({ onNavigate, userInfo, onLogout, onFaceRegClick, isFaceEnabled, onToggleFace }: { onNavigate: (screen: string) => void, userInfo: any, onLogout: () => void, onFaceRegClick: () => void, isFaceEnabled: boolean, onToggleFace: () => void }) {
  const stats = [
    { label: 'Sellers Approved', value: '42' },
    { label: 'Security Alerts', value: '0' },
    { label: 'Platform Status', value: '100%' },
  ];

  return (
    <div className="w-full">
      <SectionHeader title="Perfil do Administrador" />
      <div className="bg-white text-gray-900 rounded-[3rem] p-10 border border-[#D9D9D9] shadow-sm mb-10 overflow-hidden relative group">
        <div className="absolute top-0 right-0 p-12 opacity-5 blur-2xl group-hover:opacity-10 transition-opacity text-gray-900">
          <ShieldCheck size={200} />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
          <div className="w-32 h-32 rounded-[2.5rem] overflow-hidden border border-[#D9D9D9] shadow-xl transition-transform duration-500">
            <img src={userInfo.avatar} alt="Admin" className="w-full h-full object-cover" />
          </div>
          <div className="text-center md:text-left flex-1">
            <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
              <h3 className="text-3xl font-black text-gray-900">{userInfo.name}</h3>
              <span className="px-3 py-1 bg-primary text-black text-[10px] font-black uppercase rounded-full shadow-sm">System Admin</span>
            </div>
            <p className="text-gray-500 font-bold mb-6 italic">{userInfo.email}</p>
            <div className="flex flex-wrap justify-center md:justify-start gap-4">
              <button 
                onClick={() => onNavigate('profile-info')}
                className="px-8 py-3 bg-black text-white text-xs font-black uppercase rounded-2xl hover:bg-primary transition-all shadow-md"
              >
                Configurações de Conta
              </button>
              <button 
                onClick={onLogout}
                className="px-8 py-3 bg-gray-50 text-gray-700 text-xs font-black uppercase rounded-2xl hover:bg-gray-100 transition-all border border-gray-200 shadow-sm"
              >
                Terminar Sessão
              </button>
            </div>
          </div>
          <div className="hidden lg:flex gap-12 px-10 border-l border-[#D9D9D9]">
            {stats.map((s, i) => (
              <div key={i} className="text-center">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{s.label}</p>
                <p className="text-3xl font-black text-gray-900">{s.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        {[
          { icon: Shield, label: 'Logs de Auditoria', sub: 'Verificar atividades do sistema', id: 'admin-audit' },
          { icon: Users, label: 'Gestão de Staff', sub: 'Controlar acessos administrativos', id: 'admin-sellers' },
          { icon: Settings, label: 'Configurações de Sistema', sub: 'Taxas, API, Manutenção', id: 'profile-settings' },
          { icon: Bell, label: 'Notificações Globais', sub: 'Enviar alertas para a plataforma', id: 'notifications' },
          { icon: CreditCard, label: 'Reconciliação Financeira', sub: 'Verificar saldos e taxas', id: 'admin-payments' },
          { icon: Terminal, label: 'Painel de Comando', sub: 'Acesso rápido a funções críticas', id: 'admin-dashboard' },
        ].map((item, i) => (
          <button 
            key={i}
            onClick={() => onNavigate(item.id)}
            className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm flex items-center justify-between group hover:shadow-xl hover:shadow-primary/5 transition-all text-left"
          >
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-gray-50 text-gray-400 rounded-[2rem] flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all shadow-inner">
                <item.icon size={28} />
              </div>
              <div>
                <h4 className="text-sm font-black text-gray-900 mb-1">{item.label}</h4>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-relaxed">{item.sub}</p>
              </div>
            </div>
            <div className="w-10 h-10 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-300 group-hover:text-primary transition-all">
              <ChevronRight size={18} />
            </div>
          </button>
        ))}
      </div>

      <div className="bg-white rounded-[3.5rem] p-10 border border-gray-100 shadow-sm">
         <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="flex items-center gap-6">
               <div className="w-20 h-20 bg-primary/10 text-primary rounded-[2.5rem] flex items-center justify-center shadow-inner">
                  <Scan size={36} />
               </div>
               <div>
                  <h3 className="text-xl font-black text-gray-900 mb-2">Biometria Facial</h3>
                  <p className="text-xs text-gray-500 font-medium max-w-xs">Usa o Face Unlock para acederes rapidamente ao painel administrativo de forma segura.</p>
               </div>
            </div>
            <div className="flex items-center gap-4">
               <div className="flex flex-col items-end mr-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Status</span>
                  <span className={cn("text-xs font-black uppercase tracking-widest", isFaceEnabled ? "text-green-500" : "text-gray-300")}>
                    {isFaceEnabled ? 'Ativado' : 'Desativado'}
                  </span>
               </div>
               <button 
                  onClick={onToggleFace}
                  className={cn(
                    "w-16 h-9 rounded-full relative p-1 transition-all duration-500",
                    isFaceEnabled ? "bg-primary shadow-lg shadow-primary/30" : "bg-gray-200"
                  )}
               >
                  <div className={cn(
                    "w-7 h-7 bg-white rounded-full shadow-md transition-all duration-500 flex items-center justify-center",
                    isFaceEnabled ? "translate-x-7" : "translate-x-0"
                  )}>
                    {isFaceEnabled && <Check size={14} className="text-primary" />}
                  </div>
               </button>
            </div>
         </div>
         
         <div className="mt-10 pt-10 border-t border-gray-50 flex flex-col md:flex-row gap-4">
            <button 
              onClick={onFaceRegClick}
              className="flex-1 py-5 bg-black text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-primary hover:shadow-xl hover:shadow-primary/20 transition-all flex items-center justify-center gap-3"
            >
               <Camera size={18} />
               {isFaceEnabled ? 'Atualizar Registo Facial' : 'Registar Rosto'}
            </button>
            {isFaceEnabled && (
              <button 
                onClick={onToggleFace}
                className="px-10 py-5 bg-red-50 text-red-500 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all border border-red-100"
              >
                Remover Biometria
              </button>
            )}
         </div>
      </div>
    </div>
  );
}

function SellerPersonalProfile({ onNavigate, userInfo, onLogout, onFaceRegClick, isFaceEnabled, onToggleFace }: { onNavigate: (screen: string) => void, userInfo: any, onLogout: () => void, onFaceRegClick: () => void, isFaceEnabled: boolean, onToggleFace: () => void }) {
  const stats = [
    { label: 'Vendas Totais', value: '142' },
    { label: 'Produtos', value: '48' },
    { label: 'Avaliação', value: '4.9' },
  ];

  return (
    <div className="w-full">
      <SectionHeader title="Perfil do Vendedor" />
      <div className="bg-white rounded-[3.5rem] p-10 border border-gray-100 shadow-sm mb-10 overflow-hidden relative group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32" />
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
          <div className="w-32 h-32 rounded-[2.5rem] overflow-hidden ring-4 ring-primary/10 shadow-xl">
            <img src={userInfo.avatar} alt="Seller" className="w-full h-full object-cover" />
          </div>
          <div className="text-center md:text-left flex-1">
            <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
              <h3 className="text-3xl font-black text-gray-900">{userInfo.name}</h3>
              <span className="px-3 py-1 bg-green-50 text-green-600 text-[10px] font-black uppercase rounded-full">Vendedor Verificado</span>
            </div>
            <p className="text-gray-400 font-medium mb-6">{userInfo.email}</p>
            <div className="flex flex-wrap justify-center md:justify-start gap-4">
              <button 
                onClick={() => onNavigate('profile-info')}
                className="px-8 py-3 bg-gray-900 text-white text-xs font-black uppercase rounded-2xl hover:scale-105 transition-all"
              >
                Informações Pessoais
              </button>
              <button 
                onClick={() => onNavigate('seller-profile')}
                className="px-8 py-3 bg-white text-gray-900 text-xs font-black uppercase rounded-2xl hover:bg-gray-50 transition-all border border-gray-100"
              >
                Configurar Loja
              </button>
            </div>
          </div>
          <div className="hidden lg:flex gap-12 px-10 border-l border-gray-100">
            {stats.map((s, i) => (
              <div key={i} className="text-center">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{s.label}</p>
                <p className="text-3xl font-black text-gray-900">{s.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        {[
          { icon: Store, label: 'Visualizar Loja', sub: 'Ver como seus clientes veem', id: 'seller-profile' },
          { icon: Wallet, label: 'Meus Ganhos', sub: 'Saldos, Transferências e Taxas', id: 'seller-earnings' },
          { icon: Bell, label: 'Notificações', sub: 'Novos pedidos e mensagens', id: 'notifications' },
          { icon: Settings, label: 'Definições do App', sub: 'Preferências e Segurança', id: 'profile-settings' },
        ].map((item, i) => (
          <button 
            key={i}
            onClick={() => onNavigate(item.id)}
            className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm flex items-center justify-between group hover:shadow-xl hover:shadow-primary/5 transition-all text-left"
          >
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-gray-50 text-gray-400 rounded-[2rem] flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all shadow-inner">
                <item.icon size={28} />
              </div>
              <div>
                <h4 className="text-sm font-black text-gray-900 mb-1">{item.label}</h4>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-relaxed">{item.sub}</p>
              </div>
            </div>
            <div className="w-10 h-10 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-300 group-hover:text-primary transition-all">
              <ChevronRight size={18} />
            </div>
          </button>
        ))}
      </div>

      <div className="bg-white rounded-[3.5rem] p-10 border border-gray-100 shadow-sm">
         <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="flex items-center gap-6">
               <div className="w-20 h-20 bg-primary/10 text-primary rounded-[2.5rem] flex items-center justify-center shadow-inner">
                  <Scan size={36} />
               </div>
               <div>
                  <h3 className="text-xl font-black text-gray-900 mb-2">Biometria Facial</h3>
                  <p className="text-xs text-gray-500 font-medium max-w-xs">Usa o Face Unlock para acederes rapidamente à tua conta de vendedor de forma segura.</p>
               </div>
            </div>
            <div className="flex items-center gap-4">
               <div className="flex flex-col items-end mr-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Status</span>
                  <span className={cn("text-xs font-black uppercase tracking-widest", isFaceEnabled ? "text-green-500" : "text-gray-300")}>
                    {isFaceEnabled ? 'Ativado' : 'Desativado'}
                  </span>
               </div>
               <button 
                  onClick={onToggleFace}
                  className={cn(
                    "w-16 h-9 rounded-full relative p-1 transition-all duration-500",
                    isFaceEnabled ? "bg-primary shadow-lg shadow-primary/30" : "bg-gray-200"
                  )}
               >
                  <div className={cn(
                    "w-7 h-7 bg-white rounded-full shadow-md transition-all duration-500 flex items-center justify-center",
                    isFaceEnabled ? "translate-x-7" : "translate-x-0"
                  )}>
                    {isFaceEnabled && <Check size={14} className="text-primary" />}
                  </div>
               </button>
            </div>
         </div>
         
         <div className="mt-10 pt-10 border-t border-gray-50 flex flex-col md:flex-row gap-4">
            <button 
              onClick={onFaceRegClick}
              className="flex-1 py-5 bg-black text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-primary hover:shadow-xl hover:shadow-primary/20 transition-all flex items-center justify-center gap-3"
            >
               <Camera size={18} />
               {isFaceEnabled ? 'Atualizar Registo Facial' : 'Registar Rosto'}
            </button>
            {isFaceEnabled && (
              <button 
                onClick={onToggleFace}
                className="px-10 py-5 bg-red-50 text-red-500 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all border border-red-100"
              >
                Remover Biometria
              </button>
            )}
         </div>
      </div>
    </div>
  );
}

function ProfileScreen({ onNavigate, userInfo, onPhotoUpload, onLogout, onFaceRegClick, isFaceEnabled, onToggleFace }: { 
  onNavigate: (screen: string) => void, 
  userInfo: any, 
  onPhotoUpload: (url: string) => void,
  onLogout: () => void,
  onFaceRegClick: () => void,
  isFaceEnabled: boolean,
  onToggleFace: () => void
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onPhotoUpload(reader.result as string);
        alert('Foto de perfil atualizada com sucesso!');
      };
      reader.readAsDataURL(file);
    }
  };

  const menuItems = [
    { id: 'profile-info', icon: User, label: 'Informações Pessoais', sub: 'Nome, Email, Telefone' },
    { id: 'profile-addresses', icon: MapPin, label: 'Endereços de Entrega', sub: 'Gerir locais de recebimento' },
    { id: 'profile-payments', icon: CreditCard, label: 'Métodos de Pagamento', sub: 'Cartões e Carteira digital' },
    { id: 'notifications', icon: Bell, label: 'Notificações', sub: 'Alertas e Promoções' },
    { id: 'profile-security', icon: ShieldCheck, label: 'Segurança', sub: 'Palavra-passe e Autenticação' },
    { id: 'profile-settings', icon: Settings, label: 'Definições do App', sub: 'Idioma e Preferências' },
  ];

  return (
    <div className="w-full">
      <SectionHeader title="O Meu Perfil" />

      {/* Profile Header */}
      <div className="bg-white rounded-[3rem] p-8 border border-[#D9D9D9] shadow-sm mb-8 relative overflow-hidden group">
         <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
            <div className="relative">
               <div className="w-32 h-32 rounded-[2.5rem] overflow-hidden ring-4 ring-gray-100 shadow-xl group-hover:scale-105 transition-transform duration-500 cursor-pointer" onClick={handlePhotoClick}>
                  <img src={userInfo.avatar} alt="Avatar" className="w-full h-full object-cover" />
               </div>
               <button onClick={handlePhotoClick} className="absolute -bottom-2 -right-2 w-10 h-10 bg-black text-white rounded-2xl flex items-center justify-center hover:bg-primary transition-all shadow-lg">
                  <Camera size={18} />
               </button>
               <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  className="hidden" 
                  accept="image/*"
               />
            </div>
            
            <div className="text-center md:text-left flex-1">
               <h3 className="text-2xl font-black text-gray-900 mb-1">{userInfo.name}</h3>
               <p className="text-sm text-gray-500 font-bold mb-4">{userInfo.email}</p>
               <div className="flex flex-wrap justify-center md:justify-start gap-3">
                  <button onClick={() => onNavigate('profile-info')} className="px-6 py-2.5 bg-black text-white text-xs font-black uppercase rounded-2xl hover:bg-primary transition-all shadow-sm">Editar Perfil</button>
                  <button onClick={onLogout} className="px-6 py-2.5 bg-gray-50 text-gray-700 text-xs font-black uppercase rounded-2xl hover:bg-gray-200 transition-all border border-gray-200">Terminar Sessão</button>
               </div>
            </div>

            <div className="hidden lg:flex gap-8 px-8 border-l border-gray-200">
               {[
                 { label: 'Pedidos', value: '12' },
                 { label: 'Wishlist', value: '25' },
                 { label: 'Cupons', value: '3' },
               ].map((stat, i) => (
                 <div key={i} className="text-center">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{stat.label}</p>
                    <p className="text-2xl font-black text-gray-900">{stat.value}</p>
                 </div>
               ))}
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         {menuItems.map((item, i) => (
            <button 
              key={i}
              onClick={() => onNavigate(item.id)}
              className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm flex items-center justify-between group hover:shadow-xl hover:shadow-gray-100 transition-all text-left"
            >
               <div className="flex items-center gap-5">
                  <div className="w-14 h-14 bg-gray-50 text-gray-400 rounded-3xl flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
                     <item.icon size={26} strokeWidth={1.5} />
                  </div>
                  <div>
                     <h4 className="text-sm font-bold text-gray-900">{item.label}</h4>
                     <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">{item.sub}</p>
                  </div>
               </div>
               <div className="w-10 h-10 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-300 group-hover:text-primary transition-all">
                  <ChevronRight size={20} />
               </div>
            </button>
         ))}
      </div>

      {/* Face Login Section for User */}
      <div className="mt-10 bg-white rounded-[3rem] p-10 border border-gray-100 shadow-sm">
         <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="flex items-center gap-6">
               <div className="w-20 h-20 bg-primary/10 text-primary rounded-[2.5rem] flex items-center justify-center shadow-inner">
                  <Scan size={36} />
               </div>
               <div>
                  <h3 className="text-xl font-black text-gray-900 mb-2">Biometria Facial</h3>
                  <p className="text-xs text-gray-500 font-medium max-w-xs">Usa o Face Unlock para acederes rapidamente à tua conta de forma segura.</p>
               </div>
            </div>
            <div className="flex items-center gap-4">
               <div className="flex flex-col items-end mr-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Status</span>
                  <span className={cn("text-xs font-black uppercase tracking-widest", isFaceEnabled ? "text-green-500" : "text-gray-300")}>
                    {isFaceEnabled ? 'Ativado' : 'Desativado'}
                  </span>
               </div>
               <button 
                  onClick={onToggleFace}
                  className={cn(
                    "w-16 h-9 rounded-full relative p-1 transition-all duration-500",
                    isFaceEnabled ? "bg-primary shadow-lg shadow-primary/30" : "bg-gray-200"
                  )}
               >
                  <div className={cn(
                    "w-7 h-7 bg-white rounded-full shadow-md transition-all duration-500 flex items-center justify-center",
                    isFaceEnabled ? "translate-x-7" : "translate-x-0"
                  )}>
                    {isFaceEnabled && <Check size={14} className="text-primary" />}
                  </div>
               </button>
            </div>
         </div>
         
         <div className="mt-10 pt-10 border-t border-gray-50 flex flex-col md:flex-row gap-4">
            <button 
              onClick={onFaceRegClick}
              className="flex-1 py-5 bg-black text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-primary hover:shadow-xl hover:shadow-primary/20 transition-all flex items-center justify-center gap-3"
            >
               <Camera size={18} />
               {isFaceEnabled ? 'Atualizar Registo Facial' : 'Registar Rosto'}
            </button>
            {isFaceEnabled && (
              <button 
                onClick={onToggleFace}
                className="px-10 py-5 bg-red-50 text-red-500 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all border border-red-100"
              >
                Remover Biometria
              </button>
            )}
         </div>
      </div>

      <div className="mt-12 bg-red-50/50 border border-red-100 rounded-[2.5rem] p-8 flex flex-col md:flex-row items-center justify-between gap-6">
         <div>
            <h4 className="text-lg font-black text-red-900 mb-1">Zona de Perigo</h4>
            <p className="text-xs text-red-600/70 font-medium">Tem cuidado, estas ações são permanentes e não podem ser desfeitas.</p>
         </div>
         <button className="whitespace-nowrap px-8 py-4 bg-red-600 text-white text-xs font-black uppercase rounded-2xl hover:bg-red-700 transition-all shadow-lg shadow-red-200">
            Eliminar Minha Conta
         </button>
      </div>
    </div>
  );
}

function NotificationsScreen({ onBack, notifications, onRead }: { onBack: () => void, notifications: any[], onRead: (id: number) => void }) {
  const [selectedNotif, setSelectedNotif] = useState<any>(null);

  const handleNotifClick = (notif: any) => {
    onRead(notif.id);
    setSelectedNotif(notif);
  };

  if (selectedNotif) {
    return (
      <div className="w-full">
        <div className="flex items-center gap-4 mb-8">
           <button onClick={() => setSelectedNotif(null)} className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-gray-100 hover:bg-black hover:text-white transition-all">
              <ChevronLeft size={20} />
           </button>
           <h2 className="text-xl font-black text-gray-900">Detalhes da Notificação</h2>
        </div>
        <div className="bg-white p-10 rounded-[3.5rem] border border-gray-100 shadow-sm text-center">
           <div className={cn(
              "w-20 h-20 rounded-[2rem] flex items-center justify-center mx-auto mb-8 transition-transform",
              selectedNotif.color
           )}>
              <selectedNotif.icon size={40} />
           </div>
           <h3 className="text-2xl font-black text-gray-900 mb-2">{selectedNotif.title}</h3>
           <p className="text-xs text-gray-400 font-bold uppercase mb-6">{selectedNotif.time}</p>
           <div className="bg-gray-50 rounded-3xl p-8 mb-8 text-left">
              <p className="text-sm text-gray-600 font-medium leading-relaxed italic">
                 "{selectedNotif.description}"
              </p>
           </div>
           <button 
             onClick={() => setSelectedNotif(null)}
             className="w-full py-5 bg-black text-white rounded-2xl font-black text-xs uppercase hover:bg-primary transition-all shadow-xl"
           >
              Entendido
           </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex items-center gap-4 mb-8">
         <button onClick={onBack} className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-gray-100 hover:bg-black hover:text-white transition-all">
            <ChevronLeft size={20} />
         </button>
         <h2 className="text-xl font-black text-gray-900">Notificações</h2>
      </div>

      <div className="space-y-4">
        {notifications.map((notif) => (
          <motion.div 
            key={notif.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => handleNotifClick(notif)}
            className={cn(
              "flex items-start gap-5 p-6 rounded-[2.5rem] border transition-all cursor-pointer group",
              notif.read ? "bg-white border-gray-100 opacity-70" : "bg-white border-primary/20 shadow-lg shadow-primary/5 ring-1 ring-primary/5"
            )}
          >
            <div className={cn(
              "w-14 h-14 rounded-3xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110",
              notif.color
            )}>
              <notif.icon size={26} strokeWidth={1.5} />
            </div>
            
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <h4 className="text-sm font-black text-gray-900">{notif.title}</h4>
                <span className="text-[9px] font-bold text-gray-400 uppercase">{notif.time}</span>
              </div>
              <p className="text-xs text-gray-500 font-medium leading-relaxed">{notif.description}</p>
              {!notif.read && (
                <div className="mt-3 flex gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                  <span className="text-[9px] font-black text-primary uppercase tracking-wider">Nova</span>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-10 p-8 bg-gray-50 rounded-[3rem] border border-dashed border-gray-200 text-center">
        <p className="text-xs font-bold text-gray-400">Não tens mais notificações para mostrar.</p>
      </div>
    </div>
  );
}

function QRPickupScreen({ empresaId, userId }: { empresaId: string, userId: string }) {
  const orders = useLiveQuery(
    () => orderRepository.getByUserId(empresaId, userId),
    [empresaId, userId]
  ) || [];

  const pickups = orders
    .filter(o => o.status === 'pago')
    .map(o => ({
      id: o.id,
      item: o.items.map(i => i.name).join(', '),
      location: 'Loja Física (Sede)',
      time: '09:00 - 18:00',
      date: o.date
    }));

  const [selectedPickup, setSelectedPickup] = useState<any>(pickups[0] || null);

  // Auto-select if first time or selected becomes unavailable
  useEffect(() => {
    if (!selectedPickup && pickups.length > 0) {
      setSelectedPickup(pickups[0]);
    }
  }, [pickups, selectedPickup]);

  if (pickups.length === 0) {
    return (
      <div className="w-full flex flex-col items-center justify-center py-20 text-center">
        <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center text-gray-300 mb-6">
          <QrCode size={40} />
        </div>
        <h3 className="text-xl font-black text-gray-900">Sem levantamentos</h3>
        <p className="text-sm text-gray-500 mt-2 max-w-xs">Você não tem encomendas pagas prontas para levantamento de momento.</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col md:flex-row gap-8">
      {/* List of Pickups */}
      <div className="w-full md:w-1/3 space-y-4">
        <SectionHeader title="Levantamentos" subtitle={`${pickups.length} disponíveis`} />
        {pickups.map((pickup) => (
          <button
            key={pickup.id}
            onClick={() => setSelectedPickup(pickup)}
            className={cn(
              "w-full p-6 rounded-[2rem] border transition-all text-left group",
              selectedPickup?.id === pickup.id 
                ? "bg-black border-black text-white shadow-xl translate-x-2" 
                : "bg-white border-gray-100 hover:border-primary/30"
            )}
          >
            <div className="flex items-center justify-between mb-2">
              <span className={cn("text-[10px] font-black uppercase tracking-widest", selectedPickup?.id === pickup.id ? "text-primary" : "text-gray-400")}>
                #{pickup.id.slice(0, 8)}
              </span>
              <div className={cn("w-2 h-2 rounded-full", selectedPickup?.id === pickup.id ? "bg-primary animate-pulse" : "bg-green-500")}></div>
            </div>
            <h4 className="text-sm font-black truncate">{pickup.item}</h4>
            <p className={cn("text-[10px] font-bold mt-1", selectedPickup?.id === pickup.id ? "text-gray-400" : "text-gray-400")}>
              {pickup.date}
            </p>
          </button>
        ))}
      </div>

      {/* Selected Pickup Detail/QR */}
      <div className="flex-1">
        {selectedPickup && (
          <div className="bg-white rounded-[3rem] p-10 border border-gray-100 shadow-2xl shadow-primary/5 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-6">
               <QrCode size={32} strokeWidth={2.5} />
            </div>

            <div className="p-6 bg-gray-50 rounded-[2.5rem] border-2 border-dashed border-gray-200 mb-8 relative w-full flex justify-center">
               <div className="w-56 h-56 bg-white rounded-3xl shadow-sm flex items-center justify-center p-6 mx-auto">
                  <QRCodeCanvas 
                    value={JSON.stringify({
                      orderId: selectedPickup.id,
                      item: selectedPickup.item,
                      type: 'PICKUP',
                      timestamp: new Date().toISOString()
                    })}
                    size={180}
                    level="H"
                    includeMargin={false}
                    className="transition-opacity duration-300"
                  />
               </div>
               <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-black text-white text-[9px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-lg">
                  Código de Resgate
               </div>
            </div>

            <div className="w-full space-y-4">
              <div className="flex justify-between items-center pb-4 border-bottom border-gray-100">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Encomenda</span>
                <span className="text-sm font-black text-gray-900">#{selectedPickup.id.slice(0, 12)}</span>
              </div>
              <div className="bg-yellow-50 p-6 rounded-2xl border border-yellow-100">
                <div className="flex items-center gap-3 mb-3">
                  <MapPin size={16} className="text-primary" />
                  <span className="text-[10px] font-black text-gray-900 uppercase">Local de Levantamento</span>
                </div>
                <p className="text-xs font-bold text-gray-900 mb-1">{selectedPickup.location}</p>
                <p className="text-[10px] text-gray-500 font-medium">{selectedPickup.time}</p>
              </div>
            </div>

            <button className="w-full mt-8 py-5 bg-black text-white rounded-2xl font-black text-xs uppercase hover:bg-primary transition-all shadow-xl flex items-center justify-center gap-2">
              <Download size={16} /> Descarregar Passe
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function ComplaintsScreen({ empresaId, userId }: { empresaId: string, userId: string }) {
  const [activeTab, setActiveTab] = useState('nova');
  const [selectedComplaint, setSelectedComplaint] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  
  // Form State
  const [orderId, setOrderId] = useState('#ORD-8901');
  const [reason, setReason] = useState('Artigo não recebido');
  const [description, setDescription] = useState('');

  // Sincronização reativa com o banco local
  const complaints = useLiveQuery(
    () => complaintRepository.getByUser(empresaId, userId),
    [empresaId, userId]
  ) || [];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setAttachedFiles(prev => [...prev, ...files].slice(0, 3));
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      alert('Por favor, descreve o problema.');
      return;
    }

    try {
      await ComplaintService.createComplaint(empresaId, userId, {
        orderId,
        title: reason,
        reason,
        message: description
      });

      alert('Reclamação enviada com sucesso! Receberá uma resposta no prazo de 24-48 horas.');
      setActiveTab('historico');
      setAttachedFiles([]);
      setDescription('');
    } catch (error) {
      alert('Erro ao enviar reclamação: ' + (error instanceof Error ? error.message : String(error)));
    }
  };

  return (
    <div className="w-full max-w-3xl">
      <SectionHeader 
        title="Reclamações" 
        subtitle="Estamos aqui para ajudar a resolver qualquer problema com as tuas compras."
      />

      <div className="flex gap-4 mb-10 overflow-x-auto no-scrollbar">
         <button 
           onClick={() => setActiveTab('nova')}
           className={cn(
             "px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-widest border-2 transition-all whitespace-nowrap",
             activeTab === 'nova' ? "bg-black border-black text-white shadow-xl" : "bg-white border-gray-100 text-gray-400 hover:border-gray-200"
           )}
         >
           Nova Reclamação
         </button>
         <button 
           onClick={() => setActiveTab('historico')}
           className={cn(
             "px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-widest border-2 transition-all whitespace-nowrap",
             activeTab === 'historico' ? "bg-black border-black text-white shadow-xl" : "bg-white border-gray-100 text-gray-400 hover:border-gray-200"
           )}
         >
           Histórico ({complaints.length})
         </button>
      </div>

      {activeTab === 'nova' ? (
        <div className="bg-white border border-gray-100 rounded-[3rem] p-10 shadow-sm">
           <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Número do Pedido</label>
                    <select 
                      value={orderId}
                      onChange={(e) => setOrderId(e.target.value)}
                      className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-gray-900 focus:ring-2 ring-primary/20 outline-none appearance-none cursor-pointer"
                    >
                       <option>#ORD-8901</option>
                       <option>#ORD-8842</option>
                       <option>#ORD-7751</option>
                    </select>
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Motivo</label>
                    <select 
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-gray-900 focus:ring-2 ring-primary/20 outline-none appearance-none cursor-pointer"
                    >
                       <option>Artigo não recebido</option>
                       <option>Artigo danificado</option>
                       <option>Tamanho ou cor errada</option>
                       <option>Qualidade inferior ao esperado</option>
                       <option>Outro motivo</option>
                    </select>
                 </div>
              </div>

              <div className="space-y-2">
                 <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Descrição Detalhada</label>
                 <textarea 
                   rows={5}
                   value={description}
                   onChange={(e) => setDescription(e.target.value)}
                   placeholder="Explica o que aconteceu com o máximo de detalhes possível..."
                   className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-gray-900 focus:ring-2 ring-primary/20 outline-none resize-none"
                 />
              </div>

              <div className="space-y-2">
                 <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Anexar Comprovativos (Fotos)</label>
                 <input 
                   type="file" 
                   ref={fileInputRef} 
                   onChange={handleFileChange} 
                   accept="image/*" 
                   multiple 
                   className="hidden" 
                 />
                 <div 
                   onClick={handleUploadClick}
                   className="w-full p-8 bg-gray-50 border-2 border-dashed border-gray-200 rounded-[2.5rem] flex flex-col items-center justify-center text-center hover:border-primary/30 cursor-pointer transition-all"
                 >
                    {attachedFiles.length > 0 ? (
                      <div className="flex flex-col items-center">
                        <CheckCircle size={32} className="text-primary mb-3" />
                        <p className="text-xs font-bold text-gray-900">{attachedFiles.length} {attachedFiles.length === 1 ? 'Foto anexada' : 'Fotos anexadas'}</p>
                        <div className="flex gap-2 mt-2">
                          {attachedFiles.map((f, i) => (
                            <span key={i} className="text-[8px] bg-white px-2 py-1 rounded-full font-black text-gray-400 border border-gray-100">{f.name}</span>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <>
                        <Camera size={32} className="text-gray-300 mb-3" />
                        <p className="text-xs font-bold text-gray-400">Clicar ou arrastar fotos do artigo</p>
                        <p className="text-[9px] font-black text-gray-300 uppercase mt-2">Máximo 3 fotos • JPG/PNG</p>
                      </>
                    )}
                 </div>
              </div>

              <button 
                type="submit"
                className="w-full py-5 bg-black text-white rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-xl shadow-black/10 hover:bg-gray-800 transition-all mt-6"
              >
                 Enviar Reclamação
              </button>
           </form>
        </div>
      ) : (
        <div className="space-y-4">
           {complaints.map(item => (
             <div 
               key={item.id} 
               onClick={() => setSelectedComplaint({
                 ...item,
                 date: new Date(item.criadoEm).toLocaleDateString('pt-PT', { day: '2-digit', month: 'short' }),
                 order: item.orderId || 'N/A',
                 description: item.message,
                 color: item.status === 'resolvido' ? 'bg-green-50 text-green-600' : (item.status === 'em_analise' ? 'bg-orange-50 text-orange-600' : 'bg-blue-50 text-blue-600'),
                 status: item.status === 'resolvido' ? 'Resolvido' : (item.status === 'em_analise' ? 'Em Análise' : 'Pendente')
               })}
               className="bg-white border border-gray-100 rounded-[2.5rem] p-6 flex items-center justify-between group hover:shadow-md transition-all cursor-pointer"
             >
                <div className="flex items-center gap-5">
                   <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 group-hover:bg-gray-900 group-hover:text-white transition-all">
                      <FileText size={24} />
                   </div>
                   <div>
                      <h4 className="text-sm font-black text-gray-900">{item.title}</h4>
                      <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">{item.id} • {new Date(item.criadoEm).toLocaleDateString('pt-PT', { day: '2-digit', month: 'short' })}</p>
                   </div>
                </div>
                <div className="flex items-center gap-4">
                   <span className={cn(
                     "px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest",
                     item.status === 'resolvido' ? 'bg-green-50 text-green-600' : (item.status === 'em_analise' ? 'bg-orange-50 text-orange-600' : 'bg-blue-50 text-blue-600')
                   )}>
                      {item.status === 'resolvido' ? 'Resolvido' : (item.status === 'em_analise' ? 'Em Análise' : 'Pendente')}
                   </span>
                   <button 
                     className="p-2 text-gray-300 group-hover:text-black transition-colors"
                   >
                      <ChevronRight size={20} />
                   </button>
                </div>
             </div>
           ))}
        </div>
      )}

      {/* Complaint Detail Popup */}
      <AnimatePresence>
        {selectedComplaint && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
             <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setSelectedComplaint(null)}
               className="absolute inset-0 bg-black/80 backdrop-blur-md"
             />
             <motion.div 
               initial={{ opacity: 0, scale: 0.9, y: 20 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.9, y: 20 }}
               className="relative bg-white w-full max-w-md rounded-[3rem] overflow-hidden shadow-2xl p-8"
             >
                <div className="flex items-center justify-between mb-8">
                   <div>
                      <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">Detalhes da Reclamação</p>
                      <h3 className="text-xl font-black text-gray-900">{selectedComplaint.id}</h3>
                   </div>
                   <button 
                     onClick={() => setSelectedComplaint(null)}
                     className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-black hover:text-white transition-all"
                   >
                     <X size={20} />
                   </button>
                </div>

                <div className="space-y-6">
                   <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                         <p className="text-[9px] font-black text-gray-400 uppercase mb-1">Pedido</p>
                         <p className="text-xs font-black text-gray-900">{selectedComplaint.order}</p>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                         <p className="text-[9px] font-black text-gray-400 uppercase mb-1">Data</p>
                         <p className="text-xs font-black text-gray-900">{selectedComplaint.date}</p>
                      </div>
                   </div>

                   <div>
                      <p className="text-[9px] font-black text-gray-400 uppercase mb-2 ml-1">Assunto</p>
                      <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100">
                         <p className="text-sm font-black text-gray-900 mb-1">{selectedComplaint.title}</p>
                         <p className="text-xs text-gray-500 font-bold uppercase">{selectedComplaint.reason}</p>
                      </div>
                   </div>

                   <div>
                      <p className="text-[9px] font-black text-gray-400 uppercase mb-2 ml-1">Descrição</p>
                      <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100">
                         <p className="text-xs text-gray-600 font-medium leading-relaxed">{selectedComplaint.description}</p>
                      </div>
                   </div>

                   {selectedComplaint.solution && (
                     <div>
                        <p className="text-[9px] font-black text-primary uppercase mb-2 ml-1">Resolução do Vendedor</p>
                        <div className="p-5 bg-primary/5 border border-primary/20 rounded-2xl">
                           <p className="text-xs text-primary font-black leading-relaxed">{selectedComplaint.solution}</p>
                        </div>
                     </div>
                   )}
                </div>

                <button 
                  onClick={() => setSelectedComplaint(null)}
                  className="w-full py-5 bg-black text-white rounded-2xl font-black text-xs uppercase tracking-widest mt-8"
                >
                   Fechar
                </button>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

function SellerProfile({ 
  brandColor, 
  onColorChange, 
  sellerLogo, 
  onLogoChange,
  sellerCover,
  onCoverChange,
  highlightImages,
  onHighlightImagesChange,
  sellerSettings,
  onSettingsChange,
  onViewStore
}: { 
  brandColor: string, 
  onColorChange: (color: string) => void,
  sellerLogo: string,
  onLogoChange: (logo: string) => void,
  sellerCover: string,
  onCoverChange: (cover: string) => void,
  highlightImages: string[],
  onHighlightImagesChange: (imgs: string[]) => void,
  sellerSettings: any,
  onSettingsChange: (settings: any) => void,
  onViewStore: () => void
}) {
  const [localSettings, setLocalSettings] = useState(sellerSettings);

  const colors = [
    { name: 'Amarelo', value: '#FFB800' },
    { name: 'Rosa', value: '#FF2D55' },
    { name: 'Azul', value: '#007AFF' },
    { name: 'Verde', value: '#34C759' },
    { name: 'Roxo', value: '#5856D6' },
    { name: 'Preto', value: '#000000' },
    { name: 'Laranja', value: '#FF9500' },
    { name: 'Violeta', value: '#AF52DE' },
    { name: 'Ciano', value: '#5AC8FA' },
    { name: 'Ouro', value: '#FFCC00' },
    { name: 'Vermelho', value: '#FF3B30' },
    { name: 'Lima', value: '#4CD964' },
    { name: 'Cinza', value: '#8E8E93' },
    { name: 'Índigo', value: '#6366F1' },
    { name: 'Fúcsia', value: '#EC4899' },
    { name: 'Lavanda', value: '#8B5CF6' },
    { name: 'Esmeralda', value: '#10B981' },
    { name: 'Âmbar', value: '#F59E0B' },
    { name: 'Cobalto', value: '#3B82F6' },
    { name: 'Escarlate', value: '#EF4444' },
  ];

  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onLogoChange(reader.result as string);
        alert("Logo atualizado com sucesso!");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onCoverChange(reader.result as string);
        alert("Capa atualizada com sucesso!");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleHighlightChange = (idx: number) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          const newImgs = [...highlightImages];
          newImgs[idx] = reader.result as string;
          onHighlightImagesChange(newImgs);
          alert(`Destaque ${idx + 1} atualizado!`);
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  return (
    <div className="w-full max-w-5xl mx-auto pb-24">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <SectionHeader title="Configurações da Loja" subtitle="Gere a identidade visual e informações da sua marca" />
        <button 
          onClick={onViewStore}
          className="px-8 py-4 bg-white text-gray-900 border border-gray-200 rounded-2xl font-black text-xs uppercase shadow-sm hover:shadow-md active:scale-95 transition-all flex items-center gap-3 group"
        >
          <Eye size={18} className="text-primary group-hover:scale-110 transition-transform" />
          Ver como Cliente
        </button>
      </div>

      <div className="space-y-10">
        {/* Identity & Header Section */}
        <div className="bg-white rounded-[3.5rem] border border-gray-100 shadow-sm overflow-hidden">
          <div className="h-64 relative group/cover">
            <img src={sellerCover} className="w-full h-full object-cover transition-transform duration-1000 group-hover/cover:scale-105" alt="Cover" />
            <div className="absolute inset-0 bg-black/10 flex items-center justify-center opacity-0 group-hover/cover:opacity-100 transition-opacity">
              <input 
                type="file" 
                ref={coverInputRef} 
                onChange={handleCoverUpload} 
                accept="image/*" 
                className="hidden" 
              />
              <button 
                onClick={() => coverInputRef.current?.click()}
                className="bg-white/95 backdrop-blur-md px-6 py-3 rounded-2xl text-black text-xs font-black uppercase flex items-center gap-2 hover:bg-black hover:text-white transition-all shadow-2xl"
              >
                <Camera size={18} />
                Mudar Capa
              </button>
            </div>
            {/* Logo positioning */}
            <div className="absolute -bottom-12 left-12 group/logo">
              <div className="w-32 h-32 rounded-[2.5rem] bg-white p-2 shadow-2xl border border-gray-50 relative z-10">
                <img src={sellerLogo} className="w-full h-full object-cover rounded-[2rem]" alt="Logo" />
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleLogoUpload} 
                  accept="image/*" 
                  className="hidden" 
                />
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-2 bg-black/60 rounded-[2rem] flex items-center justify-center text-white opacity-0 group-hover/logo:opacity-100 transition-all z-20 cursor-pointer"
                >
                  <Camera size={24} />
                </button>
              </div>
            </div>
          </div>

          <div className="pt-20 px-12 pb-12">
            <div className="flex flex-col md:flex-row justify-between items-start gap-10">
              <div className="flex-1 space-y-2">
                <h2 className="text-2xl md:text-5xl font-black text-gray-900 leading-tight">{sellerSettings.name}</h2>
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-[10px] font-black uppercase tracking-widest">{sellerSettings.handle}</span>
                  <span className="flex items-center gap-1.5 text-gray-400 text-xs font-medium">
                    <MapPin size={12} />
                    {sellerSettings.location}
                  </span>
                </div>
              </div>

              <div className="w-full md:w-auto p-6 bg-gray-50 rounded-3xl border border-gray-100">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4 flex items-center gap-2">
                  <Palette size={14} style={{ color: brandColor }} />
                  Cores da Marca
                </p>
                <div className="flex flex-wrap gap-3">
                  {colors.map((color) => (
                    <button
                      key={color.value}
                      onClick={() => onColorChange(color.value)}
                      className={cn(
                        "w-8 h-8 rounded-full border-2 transition-all hover:scale-110",
                        brandColor === color.value ? "border-gray-900 shadow-md scale-110" : "border-gray-100"
                      )}
                      style={{ backgroundColor: color.value }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
          {/* Settings Form */}
          <div className="lg:col-span-3">
            <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm h-full">
              <h3 className="text-sm font-black uppercase tracking-widest mb-8 text-gray-900">Perfil Público</h3>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Nome da Loja</label>
                    <input 
                      type="text" 
                      value={localSettings.name} 
                      onChange={(e) => setLocalSettings({...localSettings, name: e.target.value})}
                      className="w-full px-6 py-4 bg-gray-50 border border-transparent focus:border-primary/20 focus:bg-white rounded-2xl font-bold text-gray-900 outline-none transition-all" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email Público</label>
                    <input 
                      type="email" 
                      value={localSettings.email} 
                      onChange={(e) => setLocalSettings({...localSettings, email: e.target.value})}
                      className="w-full px-6 py-4 bg-gray-50 border border-transparent focus:border-primary/20 focus:bg-white rounded-2xl font-bold text-gray-900 outline-none transition-all" 
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Biografia da Marca</label>
                  <textarea 
                    rows={4} 
                    value={localSettings.bio} 
                    onChange={(e) => setLocalSettings({...localSettings, bio: e.target.value})}
                    className="w-full px-6 py-4 bg-gray-50 border border-transparent focus:border-primary/20 focus:bg-white rounded-2xl font-bold text-gray-900 outline-none resize-none transition-all" 
                  />
                </div>
                <button 
                  onClick={() => {
                    onSettingsChange(localSettings);
                    alert('Definições guardadas com sucesso!');
                  }}
                  className="w-full py-5 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl transition-all hover:brightness-110 active:scale-[0.98] mt-4"
                  style={{ backgroundColor: brandColor }}
                >
                  Salvar Alterações
                </button>
              </div>
            </div>
          </div>

          {/* Carousel Management */}
          <div className="lg:col-span-2">
            <div className="bg-white p-10 rounded-[3rem] border border-[#E7E7E7] shadow-sm h-full">
              <div className="flex items-center justify-between mb-10">
                <div>
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] flex items-center gap-2 text-gray-900">
                    <Sparkles size={16} className="text-primary" />
                    Destaques Loja
                  </h3>
                  <p className="text-[9px] text-gray-400 font-bold uppercase mt-1">Carrossel da Página Inicial</p>
                </div>
                <div className="flex items-center gap-2 bg-gray-50 py-1 px-3 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-[8px] font-black uppercase tracking-widest text-gray-400">Ativo</span>
                </div>
              </div>

              <div className="space-y-4">
                {highlightImages.map((img, idx) => (
                  <div key={idx} className="relative">
                    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-3xl border border-gray-100 hover:border-primary/20 transition-all">
                      <div className="w-16 h-12 rounded-2xl overflow-hidden bg-white border border-gray-100 flex-shrink-0">
                        {img ? (
                          <img src={img} className="w-full h-full object-cover" alt={`Slide ${idx + 1}`} />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300">
                            <Image size={20} />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-0.5">Slide {idx + 1}</p>
                        <p className="text-[11px] font-bold text-gray-700 truncate">{img ? 'Configurado' : 'Vazio'}</p>
                      </div>
                      <div className="flex gap-1.5">
                        <button 
                          onClick={() => handleHighlightChange(idx)}
                          className="p-2.5 bg-white text-gray-500 hover:text-primary hover:border-primary/30 hover:shadow-sm rounded-xl transition-all border border-gray-100"
                          title="Actualizar imagem"
                        >
                          <RefreshCw size={14} />
                        </button>
                        <button 
                          onClick={() => {
                            const newImgs = highlightImages.filter((_, i) => i !== idx);
                            // Keep at least one slide if possible, or just allow empty
                            onHighlightImagesChange(newImgs);
                          }}
                          className="p-2.5 bg-white text-red-400 hover:bg-red-50 hover:border-red-200 rounded-xl transition-all border border-gray-100"
                          title="Remover slide"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                <button 
                  onClick={() => {
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.accept = 'image/*';
                    input.onchange = (e: any) => {
                      const file = e.target.files[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          onHighlightImagesChange([...highlightImages, reader.result as string]);
                          alert("Novo slide adicionado!");
                        };
                        reader.readAsDataURL(file);
                      }
                    };
                    input.click();
                  }}
                  className="w-full py-4 border-2 border-dashed border-gray-100 rounded-3xl text-[10px] font-black uppercase text-gray-400 hover:border-primary/30 hover:text-primary hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
                >
                  <Plus size={16} />
                  Adicionar Novo Slide
                </button>
              </div>

              <div className="mt-10 p-6 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                <p className="text-[9px] text-center font-bold text-gray-400 leading-relaxed uppercase">
                  Para melhores resultados use imagens <br/> na proporção 16:9 de alta qualidade
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


function ProductForm({ initialData, onSubmit, onCancel, title }: { initialData?: any, onSubmit: (data: any) => void, onCancel: () => void, title: string }) {
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    category: initialData?.category || 'Homem',
    price: initialData?.price?.toString() || '',
    stock: initialData?.stock?.toString() || '15',
    description: initialData?.description || '',
    image: initialData?.image || null as string | null,
    images: initialData?.images || [] as string[]
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const productImgRef = useRef<HTMLInputElement>(null);
  const galleryImgsRef = useRef<HTMLInputElement>(null);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'O nome é obrigatório';
    if (!formData.price || parseInt(formData.price) <= 0) newErrors.price = 'Preço deve ser maior que zero';
    if (!formData.stock || parseInt(formData.stock) < 0) newErrors.stock = 'Stock não pode ser negativo';
    if (!formData.description.trim()) newErrors.description = 'A descrição é obrigatória';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleProductImgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, image: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGalleryImgsUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach((file: File) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setFormData(prev => ({
            ...prev,
            images: [...prev.images, reader.result as string]
           }));
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeGalleryImg = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      showToast('Por favor, verifique os campos em falta', 'error');
      return;
    }
    onSubmit({
      ...formData,
      price: parseInt(formData.price) || 0,
      stock: parseInt(formData.stock) || 0,
      image: formData.image || 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=400&auto=format&fit=crop'
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <SectionHeader title={title} subtitle="Preencha os detalhes do produto para publicar no catálogo" />
      
      <div className="bg-white border border-gray-100 rounded-[3rem] p-10 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* Left */}
              <div className="space-y-6">
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Imagem Principal</label>
                  <input 
                    type="file" 
                    ref={productImgRef} 
                    onChange={handleProductImgUpload} 
                    accept="image/*" 
                    className="hidden" 
                  />
                  <div 
                    className="relative aspect-square w-full bg-gray-50 rounded-[2.5rem] border-2 border-dashed border-gray-200 flex flex-col items-center justify-center group cursor-pointer hover:border-primary transition-all overflow-hidden"
                    onClick={() => productImgRef.current?.click()}
                  >
                     {formData.image ? (
                       <>
                         <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                         <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <div className="p-3 bg-white text-black rounded-2xl font-black text-[10px] uppercase shadow-2xl">Mudar Foto</div>
                         </div>
                       </>
                     ) : (
                       <div className="text-center px-8 transition-all group-hover:scale-105">
                         <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center shadow-xl text-primary mx-auto mb-4 border border-gray-100">
                            <Plus size={32} />
                         </div>
                         <p className="text-[11px] font-black uppercase text-gray-900 tracking-widest mb-1">Foto Principal</p>
                         <p className="text-[10px] font-bold text-gray-400 uppercase leading-relaxed text-center">
                            Imagem de destaque no catálogo
                         </p>
                       </div>
                     )}
                  </div>
                </div>

                <div className="space-y-4">
                   <div className="flex items-center justify-between ml-1">
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Galeria de Fotos</label>
                      <span className="text-[10px] font-bold text-gray-400">{formData.images.length}/4 imagens</span>
                   </div>
                   <input 
                     type="file" 
                     ref={galleryImgsRef} 
                     onChange={handleGalleryImgsUpload} 
                     accept="image/*" 
                     multiple 
                     className="hidden" 
                   />
                   <div className="grid grid-cols-2 gap-4">
                      {formData.images.map((img, idx) => (
                        <div key={idx} className="relative aspect-square bg-gray-50 rounded-3xl overflow-hidden group border border-gray-100">
                           <img src={img} className="w-full h-full object-cover" />
                           <button 
                             type="button"
                             onClick={(e) => {
                               e.stopPropagation();
                               removeGalleryImg(idx);
                             }}
                             className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                           >
                              <Trash2 size={16} />
                           </button>
                        </div>
                      ))}
                      {formData.images.length < 4 && (
                        <button 
                          type="button"
                          onClick={() => galleryImgsRef.current?.click()}
                          className="aspect-square bg-gray-50 border-2 border-dashed border-gray-200 rounded-3xl flex flex-col items-center justify-center gap-2 hover:border-primary hover:bg-primary/5 transition-all group"
                        >
                           <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center shadow-md text-gray-400 group-hover:text-primary group-hover:scale-110 transition-all">
                              <Plus size={20} />
                           </div>
                           <span className="text-[9px] font-black uppercase text-gray-500 tracking-widest">Adicionar</span>
                        </button>
                      )}
                   </div>
                </div>
             </div>

            {/* Right */}
            <div className="space-y-6">
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Nome do Produto</label>
                  <input 
                    value={formData.name} 
                    onChange={e => {
                      setFormData({...formData, name: e.target.value});
                      if (errors.name) setErrors(prev => ({ ...prev, name: '' }));
                    }} 
                    type="text" 
                    placeholder="Ex: T-shirt Oversized" 
                    className={cn(
                      "w-full px-6 py-4 bg-gray-50 border rounded-2xl font-bold text-gray-900 outline-none transition-all",
                      errors.name ? "border-red-500 bg-red-50/10" : "border-gray-100"
                    )} 
                  />
                  {errors.name && <p className="text-[9px] text-red-500 font-bold ml-1">{errors.name}</p>}
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Categoria</label>
                  <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-gray-900 outline-none">
                     <option value="Homem">Homem</option>
                     <option value="Mulher">Mulher</option>
                     <option value="Rapaz">Rapaz</option>
                     <option value="Rapariga">Rapariga</option>
                     <option value="Bebé">Bebé</option>

                  </select>
               </div>
                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Preço (Kz .000)</label>
                      <input 
                       value={formData.price} 
                       onChange={e => {
                         setFormData({...formData, price: e.target.value});
                         if (errors.price) setErrors(prev => ({ ...prev, price: '' }));
                       }} 
                       type="number" 
                       placeholder="Ex: 45" 
                       className={cn(
                         "w-full px-6 py-4 bg-gray-50 border rounded-2xl font-bold text-gray-900 outline-none transition-all",
                         errors.price ? "border-red-500 bg-red-50/10" : "border-gray-100"
                       )} 
                      />
                      {errors.price && <p className="text-[9px] text-red-500 font-bold ml-1">{errors.price}</p>}
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Stock Inicial</label>
                      <input 
                       value={formData.stock} 
                       onChange={e => {
                         setFormData({...formData, stock: e.target.value});
                         if (errors.stock) setErrors(prev => ({ ...prev, stock: '' }));
                       }} 
                       type="number" 
                       placeholder="Ex: 50" 
                       className={cn(
                         "w-full px-6 py-4 bg-gray-50 border rounded-2xl font-bold text-gray-900 outline-none transition-all",
                         errors.stock ? "border-red-500 bg-red-50/10" : "border-gray-100"
                       )} 
                      />
                      {errors.stock && <p className="text-[9px] text-red-500 font-bold ml-1">{errors.stock}</p>}
                   </div>
                </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Descrição</label>
                  <textarea 
                   value={formData.description} 
                   onChange={e => {
                     setFormData({...formData, description: e.target.value});
                     if (errors.description) setErrors(prev => ({ ...prev, description: '' }));
                   }} 
                   rows={3} 
                   placeholder="Descreve o teu produto..." 
                   className={cn(
                     "w-full px-6 py-4 bg-gray-50 border rounded-2xl font-bold text-gray-900 outline-none resize-none transition-all",
                     errors.description ? "border-red-500 bg-red-50/10" : "border-gray-100"
                   )} 
                  />
                  {errors.description && <p className="text-[9px] text-red-500 font-bold ml-1">{errors.description}</p>}
               </div>
            </div>
          </div>

          <div className="flex gap-4 pt-6">
             <button type="button" onClick={onCancel} className="flex-1 py-5 bg-gray-100 text-gray-600 rounded-[2rem] font-black text-xs uppercase tracking-widest hover:bg-gray-200 transition-all">Cancelar</button>
             <button type="submit" className="flex-[2] py-5 bg-black text-white rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-xl shadow-black/10 hover:bg-gray-800 transition-all">Finalizar Produto</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function SellerAddProductScreen({ onAdd, onBack }: { onAdd: (p: Product) => void, onBack: () => void }) {
  return (
    <ProductForm 
      title="Adicionar Novo Produto" 
      onSubmit={(data: any) => {
        onAdd({ ...data, id: Math.random().toString(36).substr(2, 9) });
        onBack();
      }} 
      onCancel={onBack} 
    />
  );
}

function SellerEditProductScreen({ products, onEdit, onBack, initialProduct }: { products: Product[], onEdit: (p: Product) => void, onBack: () => void, initialProduct?: Product | null }) {
  const [selectedToEdit, setSelectedToEdit] = useState<Product | null>(initialProduct || null);
  const [filterCategory, setFilterCategory] = useState('Todos');

  const filteredProducts = useMemo(() => {
    if (filterCategory === 'Todos') return products;
    return products.filter(p => p.category === filterCategory);
  }, [products, filterCategory]);

  if (!selectedToEdit) {
    return (
      <div className="w-full max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
           <div>
              <h2 className="text-2xl md:text-3xl font-black text-gray-900 leading-tight">Editar Produto</h2>
              <p className="text-xs md:text-sm text-gray-500 font-bold mt-1">Seleciona um produto da tua lista para fazer alterações</p>
           </div>
           
           <div className="relative w-full md:w-64">
              <Filter size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <select 
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full pl-12 pr-10 py-3.5 bg-white border border-gray-100 rounded-2xl text-[11px] font-black uppercase tracking-widest text-gray-600 focus:ring-4 focus:ring-primary/10 transition-all outline-none shadow-sm appearance-none cursor-pointer"
              >
                 <option value="Todos">Todas Categorias</option>
                 <option value="Homem">Homem</option>
                 <option value="Mulher">Mulher</option>
                 <option value="Rapaz">Rapaz</option>
                 <option value="Rapariga">Rapariga</option>
                 <option value="Bebé">Bebé</option>
              </select>
              <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
           </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           {filteredProducts.map((p: any) => (
             <div 
               key={p.id} 
               onClick={() => setSelectedToEdit(p)}
               className="bg-white border border-gray-100 p-4 rounded-[2rem] flex items-center gap-4 cursor-pointer hover:border-primary/30 hover:shadow-lg transition-all group"
             >
                <div className="w-16 h-16 rounded-2xl overflow-hidden bg-gray-100">
                   <img src={p.image} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1">
                   <h4 className="font-bold text-gray-900 group-hover:text-primary transition-colors">{p.name}</h4>
                   <p className="text-xs text-gray-400 font-medium">Kz {p.price.toLocaleString()}.000</p>
                </div>
                <Edit3 size={20} className="text-gray-300 group-hover:text-primary transition-colors mr-2" />
             </div>
           ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <button 
        onClick={() => setSelectedToEdit(null)}
        className="flex items-center gap-2 text-gray-500 hover:text-primary transition-all font-black text-[10px] uppercase tracking-widest mb-6 group"
      >
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
        Voltar à lista
      </button>
      <ProductForm 
        title={`Editar: ${selectedToEdit.name}`}
        initialData={selectedToEdit}
        onSubmit={(data: any) => {
          onEdit({ ...data, id: selectedToEdit.id });
          onBack();
        }}
        onCancel={() => setSelectedToEdit(null)}
      />
    </div>
  );
}

function AdminSellers() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'Todos' | 'Ativo' | 'Inativo'>('Todos');
  const [selectedSeller, setSelectedSeller] = useState<any>(null);
  const [sellers, setSellers] = useState([
    { id: 1, name: 'Boutique Elegance', category: 'Moda', sales: 'Kz 450.000', joined: 'Jan 2024', status: 'Ativo', email: 'contato@elegance.ao', products: 42, rating: 4.8 },
    { id: 2, name: 'Tech Store AO', category: 'Eletrónicos', sales: 'Kz 1.2M', joined: 'Fev 2024', status: 'Ativo', email: 'info@techstore.ao', products: 156, rating: 4.5 },
    { id: 3, name: 'Moda Jovem', category: 'Moda', sales: 'Kz 180.000', joined: 'Mar 2024', status: 'Inativo', email: 'vendas@modajovem.ao', products: 15, rating: 3.9 },
  ]);

  const filteredSellers = sellers.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         s.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'Todos' || s.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const toggleStatus = (id: number) => {
    setSellers(prev => prev.map(s => 
      s.id === id ? { ...s, status: s.status === 'Ativo' ? 'Inativo' : 'Ativo' } : s
    ));
    if (selectedSeller && selectedSeller.id === id) {
      setSelectedSeller({ ...selectedSeller, status: selectedSeller.status === 'Ativo' ? 'Inativo' : 'Ativo' });
    }
  };

  return (
    <div className="w-full">
      <SectionHeader 
        title="Gestão de Vendedores" 
        subtitle="Lista completa e controlo de todas as lojas na plataforma" 
        aiContext="Avaliação de performance de vendedores, ranking de vendas e monitorização de conformidade."
      />

      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="flex-1 relative">
          <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Pesquisar por nome ou categoria..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-14 pr-6 py-4 bg-white border border-gray-100 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-primary/10 shadow-sm"
          />
        </div>
        <div className="flex bg-gray-50 p-1 rounded-2xl border border-gray-100">
          {(['Todos', 'Ativo', 'Inativo'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={cn(
                "px-6 py-2 rounded-xl text-[10px] font-black uppercase transition-all",
                filterStatus === status ? "bg-white shadow-sm text-gray-900" : "text-gray-400 hover:text-gray-600"
              )}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-[2.5rem] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Loja</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Categoria</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Vendas Totais</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Adesão</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredSellers.map((s) => (
                <tr 
                  key={s.id} 
                  className="hover:bg-gray-50 transition-colors cursor-pointer group"
                >
                  <td className="px-6 py-4" onClick={() => setSelectedSeller(s)}>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center font-black text-primary group-hover:bg-white transition-colors">{s.name[0]}</div>
                      <span className="text-sm font-bold text-gray-900">{s.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs font-medium text-gray-500" onClick={() => setSelectedSeller(s)}>{s.category}</td>
                  <td className="px-6 py-4 text-sm font-black text-gray-900" onClick={() => setSelectedSeller(s)}>{s.sales}</td>
                  <td className="px-6 py-4 text-xs font-medium text-gray-500" onClick={() => setSelectedSeller(s)}>{s.joined}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <span className={cn(
                        "px-3 py-1 rounded-full text-[9px] font-black uppercase",
                        s.status === 'Ativo' ? "bg-green-50 text-green-500" : "bg-red-50 text-red-500"
                      )}>{s.status}</span>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleStatus(s.id);
                        }}
                        className="p-2 hover:bg-white hover:shadow-sm rounded-lg text-gray-400 hover:text-gray-900 transition-all"
                      >
                        <Power size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredSellers.length === 0 && (
          <div className="py-20 text-center">
            <Package size={48} className="mx-auto text-gray-200 mb-4" />
            <p className="text-gray-400 font-bold">Nenhum vendedor encontrado.</p>
          </div>
        )}
      </div>

      {selectedSeller && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <motion.div 
             initial={{ opacity: 0, scale: 0.9 }}
             animate={{ opacity: 1, scale: 1 }}
             className="bg-white w-full max-w-2xl rounded-[3rem] overflow-hidden relative shadow-2xl"
          >
             <button 
               onClick={() => setSelectedSeller(null)}
               className="absolute top-6 right-6 text-gray-400 hover:text-gray-900"
             >
               <X size={24} />
             </button>

             <div className="p-10">
                <div className="flex items-center gap-6 mb-10">
                   <div className="w-24 h-24 bg-gray-50 rounded-[2rem] flex items-center justify-center text-3xl font-black text-primary border border-gray-100 shadow-inner">
                      {selectedSeller.name[0]}
                   </div>
                   <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h2 className="text-3xl font-black text-gray-900">{selectedSeller.name}</h2>
                        <span className={cn(
                          "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest",
                          selectedSeller.status === 'Ativo' ? "bg-green-50 text-green-500" : "bg-red-50 text-red-500"
                        )}>
                          {selectedSeller.status}
                        </span>
                      </div>
                      <p className="text-sm font-bold text-gray-400">{selectedSeller.email}</p>
                   </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-10">
                   <div className="bg-gray-50 p-5 rounded-2xl text-center">
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Vendas</p>
                      <p className="text-lg font-black text-gray-900">{selectedSeller.sales}</p>
                   </div>
                   <div className="bg-gray-50 p-5 rounded-2xl text-center">
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Produtos</p>
                      <p className="text-lg font-black text-gray-900">{selectedSeller.products}</p>
                   </div>
                   <div className="bg-gray-50 p-5 rounded-2xl text-center">
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Avaliação</p>
                      <div className="flex items-center justify-center gap-1">
                        <p className="text-lg font-black text-gray-900">{selectedSeller.rating}</p>
                        <Star size={14} className="fill-yellow-400 text-yellow-400 -mt-0.5" />
                      </div>
                   </div>
                   <div className="bg-gray-50 p-5 rounded-2xl text-center">
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Membro desde</p>
                      <p className="text-lg font-black text-gray-900">{selectedSeller.joined}</p>
                   </div>
                </div>

                <div className="flex gap-4">
                   <button 
                     onClick={() => toggleStatus(selectedSeller.id)}
                     className={cn(
                       "flex-1 py-5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-gray-100 flex items-center justify-center gap-3",
                       selectedSeller.status === 'Ativo' 
                         ? "bg-red-50 text-red-600 hover:bg-red-100" 
                         : "bg-green-50 text-green-600 hover:bg-green-100"
                     )}
                   >
                     <Power size={18} />
                     {selectedSeller.status === 'Ativo' ? 'Suspender Loja' : 'Reativar Loja'}
                   </button>
                   <button 
                     onClick={() => alert(`Enviando mensagem para ${selectedSeller.email}...`)}
                     className="px-8 py-5 bg-gray-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-primary transition-all flex items-center justify-center"
                   >
                      <Mail size={18} />
                   </button>
                </div>
             </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

function AdminPayments() {
  const [period, setPeriod] = useState<'weekly' | 'monthly'>('weekly');
  
  const stats = [
    { label: 'Volume Mensal', value: 'Kz 4.5M', delta: '+12%', positive: true },
    { label: 'Taxas Transação', value: 'Kz 320.000', delta: '+5%', positive: true },
    { label: 'Pendentes Pago', value: 'Kz 1.2M', delta: '-8%', positive: false },
  ];

  const weeklyData = [
    { name: 'Seg', value: 450 },
    { name: 'Ter', value: 620 },
    { name: 'Qua', value: 580 },
    { name: 'Qui', value: 890 },
    { name: 'Sex', value: 720 },
    { name: 'Sáb', value: 950 },
    { name: 'Dom', value: 400 },
  ];

  const monthlyData = [
    { name: 'Sem 1', value: 2400 },
    { name: 'Sem 2', value: 3100 },
    { name: 'Sem 3', value: 2800 },
    { name: 'Sem 4', value: 4500 },
  ];

  const currentData = period === 'weekly' ? weeklyData : monthlyData;

  return (
    <div className="w-full">
      <SectionHeader 
        title="Visão Geral de Pagamentos" 
        subtitle="Monitorização de fluxo financeiro e reconciliação" 
        aiContext="Saúde financeira do ecossistema, volume de transações Kwik e reconciliação bancária."
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {stats.map((s, i) => (
          <motion.div 
            key={i} 
            whileHover={{ y: -5 }}
            className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm relative overflow-hidden group cursor-default"
          >
            <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-opacity">
               <Info size={16} className="text-gray-300" />
            </div>
            <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-2">{s.label}</p>
            <h3 className="text-3xl font-black text-gray-900 mb-2">{s.value}</h3>
            <div className={cn("text-[10px] font-black flex items-center gap-1", s.positive ? "text-green-600" : "text-red-600")}>
              {s.positive ? <TrendingUp size={14} /> : <TrendingDown size={14} />} {s.delta} em relação ao anterior
            </div>
          </motion.div>
        ))}
      </div>

      <div className="bg-white rounded-[2.5rem] border border-gray-100 p-8 shadow-sm">
        <div className="flex items-center justify-between mb-8">
           <div>
              <h3 className="text-lg font-black text-gray-900">Gráfico de Performance (Kz)</h3>
              <p className="text-xs text-gray-400 font-bold mt-1">Evolução financeira baseada no período seleccionado</p>
           </div>
           <div className="flex bg-gray-50 p-1 rounded-xl">
              <button 
                onClick={() => setPeriod('weekly')}
                className={cn(
                  "px-5 py-2 rounded-lg text-[10px] font-black uppercase transition-all",
                  period === 'weekly' ? "bg-white shadow-sm text-gray-900" : "text-gray-400"
                )}
              >
                Semanal
              </button>
              <button 
                onClick={() => setPeriod('monthly')}
                className={cn(
                  "px-5 py-2 rounded-lg text-[10px] font-black uppercase transition-all",
                  period === 'monthly' ? "bg-white shadow-sm text-gray-900" : "text-gray-400"
                )}
              >
                Mensal
              </button>
           </div>
        </div>

        <div className="h-64 w-full">
           <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={currentData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                 <defs>
                   <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                     <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                     <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                   </linearGradient>
                 </defs>
                 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                 <XAxis 
                   dataKey="name" 
                   axisLine={false} 
                   tickLine={false} 
                   tick={{ fontSize: 10, fontWeight: 700, fill: '#D1D5DB' }}
                   dy={10}
                 />
                 <YAxis 
                   axisLine={false} 
                   tickLine={false} 
                   tick={{ fontSize: 10, fontWeight: 700, fill: '#D1D5DB' }}
                 />
                 <Tooltip 
                   content={({ active, payload }) => {
                     if (active && payload && payload.length) {
                       return (
                         <motion.div 
                           initial={{ opacity: 0, y: 10, scale: 0.95 }}
                           animate={{ opacity: 1, y: 0, scale: 1 }}
                           className="bg-gray-900 text-white p-3 rounded-xl shadow-xl border border-white/10 backdrop-blur-md"
                         >
                            <p className="text-[10px] font-black uppercase tracking-widest opacity-60">{payload[0].payload.name}</p>
                            <p className="text-sm font-black mt-1">Kz {payload[0].value.toLocaleString()}.000</p>
                         </motion.div>
                       );
                     }
                     return null;
                   }}
                 />
                 <Area 
                   type="monotone" 
                   dataKey="value" 
                   stroke="#10B981" 
                   strokeWidth={3}
                   fillOpacity={1} 
                   fill="url(#colorValue)" 
                 />
              </AreaChart>
           </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 }
};

// --- UI HELPERS ---
const Skeleton = ({ className }: { className?: string }) => (
  <div className={cn("animate-pulse bg-gray-100 rounded-lg", className)} />
);

function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(error);
    }
  }, [key, storedValue]);

  return [storedValue, setValue] as const;
}

function AdminTransfers() {
  const { showToast } = useToast();
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [transfers, setTransfers] = useLocalStorage('admin_transfers', [
    { id: '#TRF-001', seller: 'Boutique Elegance', iban: 'AO06 0040 0000 1234 5678 1012 3', amount: 145000, status: 'PENDING', date: 'Hoje, 09:45' },
    { id: '#TRF-002', seller: 'Tech Store AO', iban: 'AO06 0040 0000 8765 4321 1012 4', amount: 890000, status: 'COMPLETED', date: 'Ontem, 14:20' },
    { id: '#TRF-003', seller: 'Moda Jovem', iban: 'AO06 0040 0000 1111 2222 1012 5', amount: 45000, status: 'PROCESSING', date: 'Ontem, 16:30' },
    { id: '#TRF-004', seller: 'Sapataria Luanda', iban: 'AO06 0040 0000 3333 4444 1012 6', amount: 120000, status: 'PENDING', date: '29 Abr, 11:15' },
  ]);

  useEffect(() => {
    const timer = setTimeout(() => setIsDataLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  const [confirmAction, setConfirmAction] = useState<{ id: string, type: 'APPROVE' | 'REJECT', seller: string } | null>(null);

  const handleTransferAction = (id: string, newStatus: string) => {
    setTransfers(prev => prev.map(t => t.id === id ? { ...t, status: newStatus } : t));
    const label = newStatus === 'COMPLETED' ? 'Aprovada' : 'Recusada';
    showToast(`Transferência ${label} com sucesso!`, newStatus === 'COMPLETED' ? 'success' : 'error');
    setConfirmAction(null);
  };

  const pendingCount = transfers.filter(t => t.status === 'PENDING').length;
  const totalPendingVal = transfers.filter(t => t.status === 'PENDING').reduce((acc, curr) => acc + curr.amount, 0);
  const totalCompletedVal = transfers.filter(t => t.status === 'COMPLETED').reduce((acc, curr) => acc + curr.amount, 0);

  const KpiCard = ({ title, value, color, icon: Icon, loading }: any) => (
    <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm relative overflow-hidden">
      {loading && (
        <div className="absolute inset-0 bg-white z-10 flex flex-col p-6 gap-3">
          <Skeleton className="w-1/2 h-2" />
          <Skeleton className="w-3/4 h-8" />
        </div>
      )}
      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{title}</p>
      <div className="flex items-end justify-between">
        <h3 className={cn("text-2xl font-black", color || "text-gray-900")}>{value}</h3>
        {Icon && <Icon size={16} className="text-gray-300" />}
      </div>
    </div>
  );

  return (
    <div className="w-full">
      <SectionHeader title="Transferências a Vendedores" subtitle="Pagamentos de saldos libertados aos lojistas" />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <KpiCard 
          title="Pedidos Pendentes" 
          value={pendingCount} 
          loading={isDataLoading}
          icon={AlertCircle}
        />
        <KpiCard 
          title="Volume Pendente" 
          value={`Kz ${totalPendingVal.toLocaleString()}`} 
          color="text-indigo-600"
          loading={isDataLoading}
          icon={ArrowUpRight}
        />
        <KpiCard 
          title="Total Pago (Mês)" 
          value={`Kz ${totalCompletedVal.toLocaleString()}`} 
          color="text-green-600"
          loading={isDataLoading}
          icon={CheckCircle2}
        />
      </div>

      {pendingCount > 0 && !isDataLoading && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-orange-50 border border-orange-100 rounded-2xl p-6 flex gap-4 mb-8"
        >
          <AlertCircle className="text-orange-500 flex-shrink-0" />
          <p className="text-sm font-medium text-orange-900">Existem {pendingCount} pedidos de levantamento pendentes que requerem validação manual.</p>
        </motion.div>
      )}

      <div className="bg-white border border-gray-100 rounded-[2.5rem] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">ID / Data</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Vendedor / IBAN</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Montante</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Ação</th>
              </tr>
            </thead>
            <motion.tbody 
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="divide-y divide-gray-50"
            >
              {isDataLoading ? (
                Array(4).fill(0).map((_, idx) => (
                  <tr key={idx}>
                    <td className="px-6 py-4"><Skeleton className="w-24 h-4 mb-2" /><Skeleton className="w-16 h-3" /></td>
                    <td className="px-6 py-4"><Skeleton className="w-32 h-4 mb-2" /><Skeleton className="w-40 h-3" /></td>
                    <td className="px-6 py-4"><Skeleton className="w-20 h-5" /></td>
                    <td className="px-6 py-4"><Skeleton className="w-16 h-6 rounded-full" /></td>
                    <td className="px-6 py-4 text-right"><Skeleton className="w-16 h-8 rounded-lg ml-auto" /></td>
                  </tr>
                ))
              ) : (
                transfers.map((t) => (
                  <motion.tr 
                    variants={itemVariants}
                    key={t.id} 
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <span className="text-sm font-black text-gray-900">{t.id}</span>
                      <p className="text-[10px] text-gray-400 font-bold">{t.date}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-bold text-gray-900">{t.seller}</span>
                      <p className="text-[10px] text-gray-400 font-mono tracking-tighter">{t.iban}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-black text-indigo-600">Kz {t.amount.toLocaleString()}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider",
                        t.status === 'COMPLETED' ? "bg-green-50 text-green-500" : 
                        t.status === 'PENDING' ? "bg-orange-50 text-orange-500" :
                        t.status === 'PROCESSING' ? "bg-blue-50 text-blue-500" : "bg-gray-50 text-gray-400"
                      )}>
                        {t.status === 'COMPLETED' ? 'Concluído' : 
                         t.status === 'PENDING' ? 'Pendente' : 
                         t.status === 'PROCESSING' ? 'Processando' : 'Cancelado'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        {t.status === 'PENDING' && (
                          <>
                            <button 
                              onClick={() => setConfirmAction({ id: t.id, type: 'APPROVE', seller: t.seller })}
                              className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-all font-bold"
                              title="Confirmar Transferência"
                            >
                              <Check size={14} />
                            </button>
                            <button 
                              onClick={() => setConfirmAction({ id: t.id, type: 'REJECT', seller: t.seller })}
                              className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-all font-bold"
                              title="Recusar"
                            >
                              <X size={14} />
                            </button>
                          </>
                        )}
                        <button 
                          onClick={() => alert(`Visualizando detalhes da transferência ${t.id}`)}
                          className="p-2 bg-gray-50 text-gray-400 rounded-lg hover:bg-gray-200 transition-all"
                        >
                          <Info size={14} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </motion.tbody>
          </table>
        </div>
      </div>

      {confirmAction && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
           <motion.div 
             initial={{ opacity: 0, scale: 0.9 }}
             animate={{ opacity: 1, scale: 1 }}
             className="bg-white w-full max-w-sm rounded-[2.5rem] overflow-hidden relative shadow-2xl p-10 text-center"
           >
              <div className={cn(
                "w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6",
                confirmAction.type === 'APPROVE' ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
              )}>
                {confirmAction.type === 'APPROVE' ? <Check size={32} /> : <AlertCircle size={32} />}
              </div>
              
              <h3 className="text-xl font-black text-gray-900 mb-2">
                {confirmAction.type === 'APPROVE' ? 'Confirmar Transferência?' : 'Recusar Transferência?'}
              </h3>
              <p className="text-sm font-medium text-gray-500 mb-8">
                Esta ação para a loja <span className="font-black text-gray-900">{confirmAction.seller}</span> não pode ser desfeita.
              </p>

              <div className="flex gap-3">
                 <button 
                   onClick={() => setConfirmAction(null)}
                   className="flex-1 py-4 bg-gray-50 text-gray-900 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-gray-100 transition-all"
                 >
                   Cancelar
                 </button>
                 <button 
                   onClick={() => handleTransferAction(confirmAction.id, confirmAction.type === 'APPROVE' ? 'COMPLETED' : 'CANCELLED')}
                   className={cn(
                     "flex-1 py-4 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg transition-all",
                     confirmAction.type === 'APPROVE' ? "bg-green-600 shadow-green-100" : "bg-red-600 shadow-red-100"
                   )}
                 >
                   {confirmAction.type === 'APPROVE' ? 'Confirmar' : 'Recusar'}
                 </button>
              </div>
           </motion.div>
        </div>
      )}
    </div>
  );
}

function AdminRefunds() {
  const { showToast } = useToast();
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'Todos' | 'Pendente' | 'Aprovado' | 'Recusado'>('Todos');
  const [refunds, setRefunds] = useLocalStorage('admin_refunds', [
    { id: '#RF-201', client: 'Maria Joana', orderId: '#ADM-9901', amount: 75000, reason: 'Produto danificado', status: 'Pendente', date: 'Hoje, 10:20' },
    { id: '#RF-202', client: 'Carlos Alberto', orderId: '#ADM-9988', amount: 12500, reason: 'Item não corresponde à foto', status: 'Aprovado', date: 'Ontem, 16:45' },
    { id: '#RF-203', client: 'Ana Paula', orderId: '#ADM-9855', amount: 45000, reason: 'Entrega em atraso (recusou)', status: 'Recusado', date: '28 Abr, 09:15' },
    { id: '#RF-204', client: 'Lúcio Vaz', orderId: '#ADM-9712', amount: 150000, reason: 'Defeito técnico no aparelho', status: 'Pendente', date: '27 Abr, 14:30' },
  ]);

  useEffect(() => {
    const timer = setTimeout(() => setIsDataLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const [confirmAction, setConfirmAction] = useState<{ id: string, type: 'APPROVE' | 'REJECT', client: string } | null>(null);

  const handleAction = (id: string, newStatus: string) => {
    setRefunds(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r));
    const label = newStatus === 'Aprovado' ? 'aprovado' : 'recusado';
    showToast(`Reembolso ${label} com sucesso!`, newStatus === 'Aprovado' ? 'success' : 'error');
    setConfirmAction(null);
  };

  const filteredRefunds = refunds.filter(r => {
    const matchesSearch = r.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         r.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         r.reason.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'Todos' || r.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    pendingVal: refunds.filter(r => r.status === 'Pendente').reduce((acc, r) => acc + r.amount, 0),
    approvedVal: refunds.filter(r => r.status === 'Aprovado').reduce((acc, r) => acc + r.amount, 0),
    count: refunds.filter(r => r.status === 'Pendente').length
  };

  const KpiCard = ({ title, value, color, icon: Icon, loading, badge }: any) => (
    <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm relative overflow-hidden group">
      {loading && (
        <div className="absolute inset-0 bg-white z-10 flex flex-col p-6 gap-3">
          <div className="w-1/2 h-2 bg-gray-100 rounded-full animate-pulse" />
          <div className="w-3/4 h-8 bg-gray-50 rounded-xl animate-pulse" />
        </div>
      )}
      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{title}</p>
      <div className="flex items-end justify-between">
        <h3 className={cn("text-2xl font-black", color || "text-gray-900")}>{value}</h3>
        {badge ? (
           <span className="text-[9px] font-bold text-red-500 bg-red-50 px-2 py-1 rounded-lg uppercase tracking-wider">{badge}</span>
        ) : Icon && <Icon size={16} className="text-gray-300 group-hover:text-primary/30 transition-colors" />}
      </div>
    </div>
  );

  return (
    <div className="w-full">
      <SectionHeader 
        title="Gestão de Reembolsos" 
        subtitle="Controlo de devoluções e devolução de valores aos clientes" 
        aiContext="Políticas de devolução, satisfação pós-venda e análise de taxa de retorno."
      />
       
       <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <KpiCard 
            title="Aguardando Revisão" 
            value={`${stats.count} Tickets`} 
            badge="Prioridade"
            loading={isDataLoading}
          />
          <KpiCard 
            title="Volume em Disputa" 
            value={`Kz ${stats.pendingVal.toLocaleString()}`} 
            color="text-orange-600"
            loading={isDataLoading}
            icon={RotateCcw}
          />
          <KpiCard 
            title="Total Devolvido (Mês)" 
            value={`Kz ${stats.approvedVal.toLocaleString()}`} 
            loading={isDataLoading}
            icon={CheckCircle2}
          />
       </div>

       <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
             <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" />
             <input 
               type="text" 
               placeholder="Pesquisar por ID, cliente ou motivo..."
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               className="w-full pl-14 pr-6 py-4 bg-white border border-gray-100 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-primary/10 shadow-sm"
             />
          </div>
          <div className="flex bg-gray-50 p-1 rounded-2xl border border-gray-100 overflow-x-auto">
             {(['Todos', 'Pendente', 'Aprovado', 'Recusado'] as const).map((status) => (
               <button
                 key={status}
                 onClick={() => setFilterStatus(status)}
                 className={cn(
                   "px-6 py-2 rounded-xl text-[10px] font-black uppercase transition-all whitespace-nowrap",
                   filterStatus === status ? "bg-white shadow-sm text-gray-900" : "text-gray-400 hover:text-gray-600"
                 )}
               >
                 {status}
               </button>
             ))}
          </div>
       </div>

       <div className="bg-white border border-gray-100 rounded-[2.5rem] overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
             <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50 border-b border-gray-100">
                   <tr>
                      <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">ID / Data</th>
                      <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Cliente / Ticket</th>
                      <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Montante</th>
                      <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Motivo</th>
                      <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                      <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Ações</th>
                   </tr>
                </thead>
                <motion.tbody 
                  variants={containerVariants}
                  initial="hidden"
                  animate={isDataLoading ? "hidden" : "visible"}
                  className="divide-y divide-gray-50"
                >
                   {isDataLoading ? (
                     Array(4).fill(0).map((_, idx) => (
                       <tr key={idx}>
                         <td className="px-6 py-4"><Skeleton className="w-20 h-4 mb-2" /><Skeleton className="w-16 h-3" /></td>
                         <td className="px-6 py-4"><Skeleton className="w-32 h-4 mb-2" /><Skeleton className="w-24 h-3" /></td>
                         <td className="px-6 py-4"><Skeleton className="w-24 h-5" /></td>
                         <td className="px-6 py-4"><Skeleton className="w-40 h-4" /></td>
                         <td className="px-6 py-4"><Skeleton className="w-16 h-6 rounded-full" /></td>
                         <td className="px-6 py-4 text-right"><Skeleton className="w-16 h-8 rounded-lg ml-auto" /></td>
                       </tr>
                     ))
                   ) : (
                     filteredRefunds.map((r) => (
                       <motion.tr 
                         variants={itemVariants}
                         key={r.id} 
                         className="hover:bg-gray-50 transition-colors"
                       >
                          <td className="px-6 py-4">
                             <span className="text-sm font-black text-gray-900">{r.id}</span>
                             <p className="text-[10px] text-gray-400 font-bold">{r.date}</p>
                          </td>
                          <td className="px-6 py-4">
                             <span className="text-sm font-bold text-gray-900">{r.client}</span>
                             <p className="text-[10px] text-indigo-500 font-bold">{r.orderId}</p>
                          </td>
                          <td className="px-6 py-4">
                             <span className="text-sm font-black text-gray-900">Kz {r.amount.toLocaleString()}</span>
                          </td>
                          <td className="px-6 py-4 max-w-[200px]">
                             <span className="text-xs font-medium text-gray-500 line-clamp-1">{r.reason}</span>
                          </td>
                          <td className="px-6 py-4">
                             <span className={cn(
                                "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider",
                                r.status === 'Aprovado' ? "bg-green-50 text-green-500" : 
                                r.status === 'Pendente' ? "bg-orange-50 text-orange-500" :
                                "bg-red-50 text-red-500"
                             )}>
                                {r.status}
                             </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                             <div className="flex justify-end gap-2">
                                {r.status === 'Pendente' && (
                                   <>
                                      <button 
                                        onClick={() => setConfirmAction({ id: r.id, type: 'APPROVE', client: r.client })}
                                        className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-all font-bold"
                                      >
                                        <Check size={14} />
                                      </button>
                                      <button 
                                        onClick={() => setConfirmAction({ id: r.id, type: 'REJECT', client: r.client })}
                                        className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-all font-bold"
                                      >
                                        <X size={14} />
                                      </button>
                                   </>
                                )}
                                <button 
                                  onClick={() => showToast(`Detalhes do reembolso ${r.id}: ${r.reason}`, 'info')}
                                  className="p-2 bg-gray-50 text-gray-400 rounded-lg hover:bg-gray-200 transition-all"
                                >
                                  <Info size={14} />
                                </button>
                             </div>
                          </td>
                       </motion.tr>
                     ))
                   )}
                </motion.tbody>
             </table>
          </div>
          {(filteredRefunds.length === 0 && !isDataLoading) && (
             <div className="py-20 text-center">
                <RotateCcw size={48} className="mx-auto text-gray-200 mb-4" />
                <p className="text-gray-400 font-bold">Nenhum pedido de reembolso encontrado.</p>
             </div>
          )}
       </div>

       {confirmAction && (
         <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white w-full max-w-sm rounded-[2.5rem] overflow-hidden relative shadow-2xl p-10 text-center"
            >
               <div className={cn(
                 "w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6",
                 confirmAction.type === 'APPROVE' ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
               )}>
                 {confirmAction.type === 'APPROVE' ? <Check size={32} /> : <AlertCircle size={32} />}
               </div>
               
               <h3 className="text-xl font-black text-gray-900 mb-2">
                 {confirmAction.type === 'APPROVE' ? 'Aprovar Reembolso?' : 'Recusar Reembolso?'}
               </h3>
               <p className="text-sm font-medium text-gray-500 mb-8">
                 Confirmar esta ação para o cliente <span className="font-black text-gray-900">{confirmAction.client}</span>.
               </p>

               <div className="flex gap-3">
                  <button 
                    onClick={() => setConfirmAction(null)}
                    className="flex-1 py-4 bg-gray-50 text-gray-900 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-gray-100 transition-all"
                  >
                    Cancelar
                  </button>
                  <button 
                    onClick={() => handleAction(confirmAction.id, confirmAction.type === 'APPROVE' ? 'Aprovado' : 'Recusado')}
                    className={cn(
                      "flex-1 py-4 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg transition-all",
                      confirmAction.type === 'APPROVE' ? "bg-green-600 shadow-green-100" : "bg-red-600 shadow-red-100"
                    )}
                  >
                    {confirmAction.type === 'APPROVE' ? 'Confirmar' : 'Recusar'}
                  </button>
               </div>
            </motion.div>
         </div>
       )}
    </div>
  );
}

function AdminSubscriptions() {
  const { showToast } = useToast();
  const [plans, setPlans] = useLocalStorage('admin_plans', [
    { id: 1, name: 'Bronze', price: 10000, features: ['Gestão de encomendas básica', 'Atendimento por email', 'Limite de 50 produtos'] },
    { id: 2, name: 'Silver', price: 20000, features: ['Produtos ilimitados', 'Destaque na pesquisa', 'Analytics avançado', 'Suporte priorizado'] },
    { id: 3, name: 'Gold', price: 30000, features: ['Taxa de venda reduzida', 'Gestor de conta dedicado', 'Acesso antecipado a funcionalidades', 'Relatórios personalizados'] },
  ]);

  const [editingPlan, setEditingPlan] = useState<any>(null);
  const [editName, setEditName] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editFeatures, setEditFeatures] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!editName.trim()) newErrors.name = 'O nome do plano é obrigatório';
    if (!editPrice || parseInt(editPrice) <= 0) newErrors.price = 'O preço deve ser superior a zero';
    if (!editFeatures.trim()) newErrors.features = 'Insira pelo menos uma funcionalidade';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleEditClick = (plan: any) => {
    setEditingPlan(plan);
    setEditName(plan.name);
    setEditPrice(plan.price.toString());
    setEditFeatures(plan.features.join('\n'));
    setErrors({});
  };

  const handleSave = () => {
    if (!validate()) {
      showToast('Por favor, corrija os erros no formulário', 'error');
      return;
    }

    setPlans(prev => prev.map(p => 
      p.id === editingPlan.id ? { 
        ...p, 
        name: editName, 
        price: parseInt(editPrice),
        features: editFeatures.split('\n').filter(f => f.trim() !== '')
      } : p
    ));
    showToast(`Plano ${editName} actualizado!`, 'success');
    setEditingPlan(null);
  };

  return (
    <div className="w-full">
      <SectionHeader 
        title="Planos de Assinatura" 
        subtitle="Configuração e monitorização de receitas recurrentes" 
        aiContext="Estratégias de monetização, retenção de assinantes e MRR (Monthly Recurring Revenue)."
      />
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        {plans.map((plan) => (
          <motion.div 
            variants={itemVariants}
            key={plan.id} 
            className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm text-center flex flex-col group hover:border-primary/20 transition-all hover:shadow-xl hover:shadow-primary/5"
          >
            <h4 className="text-xl font-black text-gray-900 mb-2">{plan.name}</h4>
            <p className="text-3xl font-black text-primary mb-6">Kz {plan.price.toLocaleString()}<span className="text-xs text-gray-400">/mês</span></p>
            <div className="space-y-3 mb-10 text-left flex-1">
              {plan.features.map((feature, idx) => (
                <div key={idx} className="flex items-center gap-2 text-xs font-medium text-gray-500">
                  <CheckCircle2 size={16} className="text-green-500 flex-shrink-0" /> {feature}
                </div>
              ))}
            </div>
            <button 
              onClick={() => handleEditClick(plan)}
              className="w-full py-4 border-2 border-gray-100 rounded-2xl font-black text-xs uppercase group-hover:border-black group-hover:bg-black group-hover:text-white transition-all text-gray-900"
            >
              Editar Plano
            </button>
          </motion.div>
        ))}
      </motion.div>

      {editingPlan && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
           <motion.div 
             initial={{ opacity: 0, scale: 0.9 }}
             animate={{ opacity: 1, scale: 1 }}
             className="bg-white w-full max-w-sm rounded-[2.5rem] overflow-hidden relative shadow-2xl p-10"
           >
              <button 
                onClick={() => setEditingPlan(null)}
                className="absolute top-6 right-6 text-gray-400 hover:text-gray-900"
              >
                <X size={24} />
              </button>

              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Edit3 size={32} />
                </div>
                <h3 className="text-xl font-black text-gray-900">Editar {editingPlan.name}</h3>
                <p className="text-sm text-gray-500 font-medium">Actualize os valores base do plano</p>
              </div>

              <div className="space-y-4 mb-8">
                <div>
                  <label className="text-[10px] font-black uppercase text-gray-400 mb-1 block tracking-widest">Nome do Plano</label>
                  <input 
                    type="text" 
                    value={editName}
                    onChange={(e) => {
                      setEditName(e.target.value);
                      if (errors.name) setErrors(prev => ({ ...prev, name: '' }));
                    }}
                    className={cn(
                      "w-full px-5 py-3 bg-gray-50 border rounded-xl font-bold text-sm outline-none transition-all focus:ring-2 focus:ring-primary/10",
                      errors.name ? "border-red-500 bg-red-50/10" : "border-gray-100"
                    )}
                  />
                  {errors.name && <p className="text-[9px] text-red-500 font-bold mt-1 uppercase tracking-tighter">{errors.name}</p>}
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-gray-400 mb-1 block tracking-widest">Preço Mensal (Kz)</label>
                  <input 
                    type="number" 
                    value={editPrice}
                    onChange={(e) => {
                      setEditPrice(e.target.value);
                      if (errors.price) setErrors(prev => ({ ...prev, price: '' }));
                    }}
                    className={cn(
                      "w-full px-5 py-3 bg-gray-50 border rounded-xl font-bold text-sm outline-none transition-all focus:ring-2 focus:ring-primary/10",
                      errors.price ? "border-red-500 bg-red-50/10" : "border-gray-100"
                    )}
                  />
                  {errors.price && <p className="text-[9px] text-red-500 font-bold mt-1 uppercase tracking-tighter">{errors.price}</p>}
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-gray-400 mb-1 block tracking-widest">Vantagens (uma por linha)</label>
                  <textarea 
                    rows={4}
                    value={editFeatures}
                    onChange={(e) => {
                      setEditFeatures(e.target.value);
                      if (errors.features) setErrors(prev => ({ ...prev, features: '' }));
                    }}
                    className={cn(
                      "w-full px-5 py-3 bg-gray-50 border rounded-xl font-bold text-sm outline-none transition-all focus:ring-2 focus:ring-primary/10 resize-none",
                      errors.features ? "border-red-500 bg-red-50/10" : "border-gray-100"
                    )}
                    placeholder="Ex: Gestão de encomendas básica"
                  />
                  {errors.features && <p className="text-[9px] text-red-500 font-bold mt-1 uppercase tracking-tighter">{errors.features}</p>}
                </div>
              </div>

              <div className="flex gap-3">
                 <button 
                   onClick={() => setEditingPlan(null)}
                   className="flex-1 py-4 bg-gray-50 text-gray-900 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-gray-100 transition-all"
                 >
                   Cancelar
                 </button>
                 <button 
                   onClick={handleSave}
                   className="flex-1 py-4 bg-primary text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                 >
                   Guardar
                 </button>
              </div>
           </motion.div>
        </div>
      )}
    </div>
  );
}

function AdminReports() {
  const regionData = [
    { name: 'Luanda', value: 45 },
    { name: 'Benguela', value: 20 },
    { name: 'Huíla', value: 15 },
    { name: 'Outras', value: 20 },
  ];

  const conversionData = [
    { time: '08:00', rate: 2.1 },
    { time: '10:00', rate: 3.5 },
    { time: '12:00', rate: 2.8 },
    { time: '14:00', rate: 4.2 },
    { time: '16:00', rate: 3.9 },
    { time: '18:00', rate: 5.1 },
    { time: '20:00', rate: 4.5 },
  ];

  const COLORS = ['#6366F1', '#10B981', '#F59E0B', '#EF4444'];

  return (
    <div className="w-full">
      <SectionHeader 
        title="Relatórios e Analítica" 
        subtitle="Dados detalhados sobre o crescimento do ecossistema" 
        aiContext="Projeções de crescimento para o próximo trimestre, análise de churn e LTV de usuários."
      />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm min-h-[450px] flex flex-col">
            <div className="mb-6">
              <h4 className="text-lg font-black text-gray-900">Heatmap de Vendas por Região</h4>
              <p className="text-xs text-gray-400 font-bold mt-1">Distribuição geográfica de vendas em Angola</p>
            </div>
            <div className="flex-1 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RePieChart>
                  <Pie
                    data={regionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {regionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <motion.div 
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            className="bg-gray-900 text-white p-3 rounded-xl shadow-xl border border-white/10 backdrop-blur-md"
                          >
                            <p className="text-sm font-black">{payload[0].name}: {payload[0].value}%</p>
                          </motion.div>
                        );
                      }
                      return null;
                    }}
                  />
                </RePieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-4">
              {regionData.map((reg, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i] }}></div>
                  <span className="text-[10px] font-black uppercase text-gray-500 tracking-wider">{reg.name}</span>
                  <span className="text-[10px] font-black text-gray-900 ml-auto">{reg.value}%</span>
                </div>
              ))}
            </div>
          </div>

         <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm min-h-[450px] flex flex-col">
            <div className="mb-6">
              <h4 className="text-lg font-black text-gray-900">Taxa de Conversão em Tempo Real</h4>
              <p className="text-xs text-gray-400 font-bold mt-1">Percentagem de visitantes que concretizam compras</p>
            </div>
            <div className="flex-1 h-64">
               <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={conversionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                    <XAxis 
                      dataKey="time" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 10, fontWeight: 700, fill: '#D1D5DB' }}
                      dy={10}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 10, fontWeight: 700, fill: '#D1D5DB' }}
                    />
                    <Tooltip 
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <motion.div 
                              initial={{ opacity: 0, y: 10, scale: 0.95 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              className="bg-gray-900 text-white p-3 rounded-xl shadow-xl border border-white/10 backdrop-blur-md"
                            >
                              <p className="text-[10px] font-black uppercase tracking-widest opacity-60">{payload[0].payload.time}</p>
                              <p className="text-sm font-black mt-1">{payload[0].value}% de Conversão</p>
                            </motion.div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="rate" 
                      stroke="#6366F1" 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#colorRate)" 
                    />
                 </AreaChart>
               </ResponsiveContainer>
            </div>
            <div className="mt-8 p-6 bg-gray-50 rounded-[2rem] flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Média do Dia</p>
                <p className="text-2xl font-black text-gray-900">3.8%</p>
              </div>
              <div className="text-right">
                <span className="px-3 py-1 bg-green-50 text-green-500 rounded-full text-[10px] font-black uppercase">+1.2%</span>
                <p className="text-[10px] text-gray-400 font-bold mt-1">vs ontem</p>
              </div>
            </div>
         </div>
      </div>
    </div>
  );
}

function AdminAudit() {
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterUser, setFilterUser] = useState('Todos');
  const [selectedLog, setSelectedLog] = useState<any>(null);

  useEffect(() => {
    const timer = setTimeout(() => setIsDataLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const logs = [
    { id: 1, user: 'Admin Joana', action: 'Login no sistema', time: 'Há 10 min', ip: '192.168.1.1', type: 'SECURITY' },
    { id: 2, user: 'Admin Joana', action: 'Validou pagamento TX771', time: 'Há 15 min', ip: '192.168.1.1', type: 'PAYMENT' },
    { id: 3, user: 'Sistema', action: 'Backup automático concluído', time: 'Hoje, 04:00', ip: 'SERVER-01', type: 'SYSTEM' },
    { id: 4, user: 'Admin Carlos', action: 'Eliminou produto #PROD-99', time: 'Ontem, 16:20', ip: '192.168.1.45', type: 'MANAGEMENT' },
    { id: 5, user: 'Sistema', action: 'Actualização de stock crítica', time: 'Ontem, 14:00', ip: 'SERVER-01', type: 'SYSTEM' },
    { id: 6, user: 'Admin Joana', action: 'Alterou permissões de vendedor #SELL-23', time: '28 Abr, 11:10', ip: '192.168.1.1', type: 'SECURITY' },
    { id: 7, user: 'Admin Carlos', action: 'Aprovou reembolso #RF-202', time: '28 Abr, 09:30', ip: '192.168.1.45', type: 'PAYMENT' },
  ];

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.action.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.ip.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesUser = filterUser === 'Todos' || log.user === filterUser;
    return matchesSearch && matchesUser;
  });

  const getLogIcon = (type: string) => {
    switch (type) {
      case 'SECURITY': return <Shield size={20} className="text-red-500" />;
      case 'PAYMENT': return <CreditCard size={20} className="text-green-500" />;
      case 'SYSTEM': return <Terminal size={20} className="text-blue-500" />;
      case 'MANAGEMENT': return <Package size={20} className="text-orange-500" />;
      default: return <Clock size={20} className="text-gray-500" />;
    }
  };

  const users = ['Todos', ...Array.from(new Set(logs.map(l => l.user)))];

  const KpiCard = ({ title, value, color, icon: Icon, loading }: any) => (
    <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm relative overflow-hidden group">
      {loading && (
        <div className="absolute inset-0 bg-white z-10 flex flex-col p-6 gap-3">
          <div className="w-1/2 h-2 bg-gray-100 rounded-full animate-pulse" />
          <div className="w-3/4 h-8 bg-gray-50 rounded-xl animate-pulse" />
        </div>
      )}
      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{title}</p>
      <div className="flex items-end justify-between">
        <h3 className={cn("text-2xl font-black", color || "text-gray-900")}>{value}</h3>
        {Icon && <Icon size={16} className="text-gray-300 group-hover:text-primary/30 transition-colors" />}
      </div>
    </div>
  );

  return (
    <div className="w-full">
      <SectionHeader 
        title="Log de Auditoria" 
        subtitle="Histórico completo de ações administrativas para transparência" 
        aiContext="Análise de logs de segurança, integridade de dados e conformidade operacional."
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
         <KpiCard title="Total de Registos" value={logs.length} loading={isDataLoading} icon={Activity} />
         <KpiCard title="Eventos de Segurança" value={logs.filter(l => l.type === 'SECURITY').length} color="text-red-500" loading={isDataLoading} icon={Shield} />
         <KpiCard title="Ações Financeiras" value={logs.filter(l => l.type === 'PAYMENT').length} color="text-green-500" loading={isDataLoading} icon={CreditCard} />
      </div>
      
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="flex-1 relative">
          <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Pesquisar acção, administrador ou IP..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-14 pr-6 py-4 bg-white border border-gray-100 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-primary/10 shadow-sm"
          />
        </div>
        <div className="flex bg-gray-50 p-1 rounded-2xl border border-gray-100 overflow-x-auto">
          {users.map((u) => (
            <button
              key={u}
              onClick={() => setFilterUser(u)}
              className={cn(
                "px-6 py-2 rounded-xl text-[10px] font-black uppercase transition-all whitespace-nowrap",
                filterUser === u ? "bg-white shadow-sm text-gray-900" : "text-gray-400 hover:text-gray-600"
              )}
            >
              {u}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-[2.5rem] overflow-hidden shadow-sm">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate={isDataLoading ? "hidden" : "visible"}
          className="divide-y divide-gray-50"
        >
          {isDataLoading ? (
            Array(5).fill(0).map((_, idx) => (
              <div key={idx} className="p-6 flex items-center justify-between">
                 <div className="flex items-center gap-4">
                   <Skeleton className="w-12 h-12 rounded-2xl" />
                   <div>
                     <Skeleton className="w-32 h-4 mb-2" />
                     <Skeleton className="w-48 h-3" />
                   </div>
                 </div>
                 <div className="text-right">
                   <Skeleton className="w-16 h-4 mb-2 ml-auto" />
                   <Skeleton className="w-20 h-3 ml-auto" />
                 </div>
              </div>
            ))
          ) : (
            filteredLogs.map((log) => (
              <motion.div 
                variants={itemVariants}
                key={log.id} 
                onClick={() => setSelectedLog(log)}
                className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors group cursor-pointer"
              >
                <div className="flex items-center gap-4">
                   <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center group-hover:bg-white group-hover:shadow-sm transition-all">
                     {getLogIcon(log.type)}
                   </div>
                   <div>
                      <h4 className="text-sm font-black text-gray-900 mb-0.5">{log.action}</h4>
                      <div className="flex items-center gap-3">
                        <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest leading-none">{log.user}</p>
                        <span className="w-1 h-1 bg-gray-200 rounded-full"></span>
                        <p className="text-[10px] text-gray-400 font-mono font-bold leading-none">{log.ip}</p>
                      </div>
                   </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-gray-900">{log.time}</p>
                  <button className="text-[10px] font-black text-indigo-600 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Ver Detalhes</button>
                </div>
              </motion.div>
            ))
          )}
        </motion.div>
        
        {(filteredLogs.length === 0 && !isDataLoading) && (
          <div className="py-20 text-center">
            <Activity size={48} className="mx-auto text-gray-200 mb-4" />
            <p className="text-gray-400 font-bold">Nenhum registo encontrado para os filtros aplicados.</p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {selectedLog && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
             <motion.div 
               initial={{ opacity: 0, scale: 0.9, y: 20 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.9, y: 20 }}
               className="bg-white w-full max-w-md md:max-w-xl rounded-[3rem] overflow-hidden relative shadow-2xl p-10"
             >
                <button 
                  onClick={() => setSelectedLog(null)}
                  className="absolute top-8 right-8 text-gray-400 hover:text-gray-900 transition-colors"
                >
                  <X size={24} />
                </button>

                <div className="flex items-center gap-4 mb-8">
                   <div className="w-16 h-16 bg-gray-50 rounded-[1.5rem] flex items-center justify-center text-gray-900 shadow-sm border border-gray-100">
                     {getLogIcon(selectedLog.type)}
                   </div>
                   <div>
                      <p className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] mb-1">{selectedLog.type}</p>
                      <h3 className="text-xl font-black text-gray-900 leading-tight">{selectedLog.action}</h3>
                   </div>
                </div>

                <div className="space-y-6 mb-10">
                   <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-50/50 p-5 rounded-2xl border border-gray-100">
                         <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Administrador</p>
                         <p className="text-sm font-black text-gray-900">{selectedLog.user}</p>
                      </div>
                      <div className="bg-gray-50/50 p-5 rounded-2xl border border-gray-100">
                         <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Data e Hora</p>
                         <p className="text-sm font-black text-gray-900">{selectedLog.time}</p>
                      </div>
                   </div>

                   <div className="bg-gray-50/50 p-5 rounded-2xl border border-gray-100">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Endereço IP / Origem</p>
                      <p className="text-sm font-mono font-black text-gray-900 tracking-tight">{selectedLog.ip}</p>
                   </div>

                   <div className="bg-gray-50/50 p-5 rounded-2xl border border-gray-100">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Metadata do Evento</p>
                      <div className="flex flex-wrap gap-2">
                         <span className="px-3 py-1 bg-white border border-gray-200 rounded-full text-[9px] font-black text-gray-500">AUTH_PASS</span>
                         <span className="px-3 py-1 bg-white border border-gray-200 rounded-full text-[9px] font-black text-gray-500">ENV_PROD</span>
                         <span className="px-3 py-1 bg-white border border-gray-200 rounded-full text-[9px] font-black text-gray-500">TRACE_{selectedLog.id}293</span>
                      </div>
                   </div>
                </div>

                <button 
                  onClick={() => setSelectedLog(null)}
                  className="w-full py-5 bg-black text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-black/10 hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  Fechar Registo
                </button>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function PlaceholderScreen({ screen, role, icon: Icon }: { screen: string, role: string, icon?: any }) {
  return (
    <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-[3rem] p-12 flex flex-col items-center justify-center min-h-[60vh] text-center">
      <div className="w-24 h-24 bg-white rounded-3xl shadow-xl flex items-center justify-center text-primary mb-6 ring-1 ring-gray-100">
          {Icon && <Icon size={48} strokeWidth={1.5} />}
      </div>
      <h2 className="text-3xl font-black text-gray-900 mb-2">Interface {screen}</h2>
      <p className="text-gray-600 max-w-sm mb-8 font-medium">
          A preparar a área de <strong>{screen}</strong> para o perfil de <strong>{role}</strong>. Em breve estará operacional.
      </p>
      
      <div className="flex flex-wrap justify-center gap-4">
        <div className="px-6 py-3 bg-white rounded-2xl shadow-sm border border-gray-200 text-xs font-black text-gray-500 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            Desenvolvimento Ativo
        </div>
      </div>
    </div>
  );
}

// --- AUTH SCREENS ---

function SplashScreen({ role }: { role: UserRole }) {
  return (
    <div className="fixed inset-0 bg-white z-[100] flex flex-col items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center"
      >
        <div className="w-32 h-32 bg-primary rounded-[2.5rem] flex items-center justify-center text-white mb-10 shadow-2xl shadow-primary/40">
          <Sparkles size={64} strokeWidth={2.5} />
        </div>
        
        <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-2">
          {role === 'ADMIN' ? 'Admin Portal' : role === 'SELLER' ? 'Partner Space' : 'Vibe Store'}
        </h1>
        <p className="text-gray-500 font-medium mb-16">
          {role === 'USER' ? 'Sua moda, seu estilo.' : 'Carregando suas ferramentas...'}
        </p>

        <div className="w-80 h-2 bg-gray-100 rounded-full overflow-hidden relative">
          <motion.div 
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 3, ease: "easeInOut" }}
            className="absolute inset-y-0 left-0 bg-primary"
          />
        </div>
      </motion.div>
    </div>
  );
}

function RoleDropdown({ selectedRole, onSelect }: { selectedRole: UserRole, onSelect: (role: UserRole) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const roles = [
    { id: 'USER', label: 'Cliente', icon: ShoppingBag, color: 'text-blue-500' },
    { id: 'SELLER', label: 'Vendedor', icon: Store, color: 'text-orange-500' },
    { id: 'ADMIN', label: 'Administrador', icon: ShieldCheck, color: 'text-purple-500' },
  ];

  const current = roles.find(r => r.id === selectedRole);

  return (
    <div className="relative w-full mb-6">
      <label className="block text-sm font-bold text-gray-700 mb-2">Tipo de Utilizador</label>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full h-14 px-4 bg-gray-50 border border-gray-100 rounded-xl flex items-center justify-between group hover:border-primary/30 transition-all shadow-sm"
      >
        <div className="flex items-center gap-3">
          {current && <current.icon size={20} className={current.color} />}
          <span className="font-bold text-gray-900">{current?.label}</span>
        </div>
        <ChevronDown size={20} className={cn("text-gray-400 transition-transform", isOpen && "rotate-180")} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 w-full mt-2 bg-white border border-gray-100 rounded-2xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in duration-200">
          {roles.map((role) => (
            <button
              key={role.id}
              onClick={() => {
                onSelect(role.id as UserRole);
                setIsOpen(false);
              }}
              className="w-full px-5 py-4 flex items-center gap-4 hover:bg-gray-50 transition-all text-left"
            >
              <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center bg-gray-50 shadow-sm", role.color)}>
                <role.icon size={20} />
              </div>
              <div>
                <p className="font-bold text-gray-900">{role.label}</p>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{role.id === 'USER' ? 'Comprar' : role.id === 'SELLER' ? 'Vender' : 'Gerir'}</p>
              </div>
              {selectedRole === role.id && <Check size={16} className="ml-auto text-primary" strokeWidth={3} />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function SocialAuth() {
  return (
    <div className="mt-6">
      <div className="relative flex items-center justify-center mb-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-100"></div>
        </div>
        <div className="relative flex justify-center">
          <span className="relative z-10 bg-white px-4 text-[10px] font-black uppercase tracking-widest text-gray-400">ou entra com</span>
        </div>
      </div>

      <div className="flex justify-center gap-3">
        <button className="w-12 h-12 rounded-full border border-gray-100 flex items-center justify-center hover:bg-gray-50 transition-all shadow-sm">
          <FacebookIcon size={20} className="text-[#1877F2] fill-[#1877F2]" />
        </button>
        <button className="w-12 h-12 rounded-full border border-gray-100 flex items-center justify-center hover:bg-gray-50 transition-all shadow-sm">
          <Mail size={20} className="text-[#EA4335]" />
        </button>
        <button className="w-12 h-12 rounded-full border border-gray-100 flex items-center justify-center hover:bg-gray-50 transition-all shadow-sm">
          <Apple size={20} className="text-black fill-black" />
        </button>
      </div>
    </div>
  );
}

function SignInScreen({ onNext, onSignUp, onForgot, onFaceLoginClick }: { onNext: () => void, onSignUp: () => void, onForgot: () => void, onFaceLoginClick: () => void }) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 sm:py-12">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-black text-gray-900 mb-1">Log In</h1>
          <p className="text-xs font-bold text-gray-400">Olá! Bem-vindo de volta</p>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-black tracking-widest text-gray-500 mb-1.5">Email</label>
            <input 
              type="email" 
              placeholder="exemplo@gmail.com" 
              className="w-full h-11 px-4 bg-gray-50 border border-gray-100 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-black tracking-widest text-gray-500 mb-1.5">Palavras-Passe</label>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                defaultValue="**************" 
                className="w-full h-11 px-4 bg-gray-50 border border-gray-100 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold"
              />
              <button 
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
              >
                {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
              </button>
            </div>
          </div>

          <button onClick={onForgot} className="w-full text-right text-[10px] font-black uppercase tracking-widest text-primary hover:underline">Esqueci a Palavra-passe?</button>

          <button 
            onClick={onNext}
            className="w-full py-4 bg-primary text-white rounded-2xl font-black text-base shadow-xl shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all mt-2"
          >
            Log In
          </button>

          <div className="relative py-2">
             <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100"></div></div>
          <div className="relative flex justify-center">
             <span className="relative z-10 bg-white px-4 text-gray-400 font-black uppercase tracking-widest text-[10px]">ou entra com</span>
          </div>
          </div>

          <button 
            onClick={onFaceLoginClick}
            className="w-full py-4 bg-white border-2 border-primary/20 text-primary rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-primary/5 transition-all shadow-sm"
          >
            <Scan size={20} />
            Desbloqueio Facial
          </button>
        </div>

        <SocialAuth />

        <p className="mt-6 text-center text-[10px] font-black uppercase tracking-widest text-gray-500">
          Não tens uma conta? <button onClick={onSignUp} className="text-primary hover:underline">Sign Up</button>
        </p>
      </div>
    </div>
  );
}

function SignUpScreen({ onNext, onSignIn }: { onNext: () => void, onSignIn: () => void }) {
  const [showPassword, setShowPassword] = useState(false);
  const [agree, setAgree] = useState(false);

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 sm:py-12">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-black text-gray-900 mb-1">Create Account</h1>
          <p className="text-xs font-bold text-gray-400 max-w-[250px] mx-auto">Fill your information below or register with your social account.</p>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Name</label>
            <input 
              type="text" 
              placeholder="John Doe" 
              className="w-full h-11 px-4 bg-gray-50 border border-gray-100 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Email</label>
            <input 
              type="email" 
              placeholder="example@gmail.com" 
              className="w-full h-11 px-4 bg-gray-50 border border-gray-100 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Password</label>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                defaultValue="**************" 
                className="w-full h-11 px-4 bg-gray-50 border border-gray-100 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold"
              />
              <button 
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
              >
                {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3 py-1">
            <button 
              onClick={() => setAgree(!agree)}
              className={cn(
                "w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all",
                agree ? "bg-primary border-primary text-white shadow-lg shadow-primary/20" : "bg-gray-50 border-gray-100"
              )}
            >
              {agree && <Check size={12} strokeWidth={4} />}
            </button>
            <p className="text-xs font-bold text-gray-600">
              Agree with <span className="text-primary hover:underline cursor-pointer">Terms & Condition</span>
            </p>
          </div>

          <button 
            disabled={!agree}
            onClick={onNext}
            className="w-full py-4 bg-primary text-white rounded-2xl font-black text-base shadow-xl shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:hover:scale-100 mt-2"
          >
            Sign Up
          </button>
        </div>

        <SocialAuth />

        <p className="mt-6 text-center text-xs font-bold text-gray-500">
          Already have an account? <button onClick={onSignIn} className="text-primary hover:underline">Log In</button>
        </p>
      </div>
    </div>
  );
}

function ForgotPasswordScreen({ onBack }: { onBack: () => void }) {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 sm:py-12">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-4 mb-4">
          <button 
            onClick={onBack}
            className="w-9 h-9 bg-white border border-gray-100 rounded-xl flex items-center justify-center text-gray-900 shadow-sm hover:bg-gray-50 transition-all"
          >
             <ChevronLeft size={18} />
          </button>
        </div>

        <div className="text-center mb-6">
          <h1 className="text-3xl font-black text-gray-900 mb-2">New Password</h1>
          <p className="text-xs font-bold text-gray-400 px-10">Choose a new password that you will use to enter in account.</p>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">New Password</label>
            <input 
              type="password" 
              placeholder="**************" 
              className="w-full h-11 px-4 bg-gray-50 border border-gray-100 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Confirm Password</label>
            <input 
              type="password" 
              placeholder="**************" 
              className="w-full h-11 px-4 bg-gray-50 border border-gray-100 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold"
            />
          </div>

          <button 
            onClick={onBack}
            className="w-full py-4 bg-primary text-white rounded-2xl font-black text-base shadow-xl shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all mt-2"
          >
            Reset Password
          </button>
        </div>
      </div>
    </div>
  );
}

function LocationAccessScreen({ onAllow, onManual }: { onAllow: () => void, onManual: () => void }) {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
      <div className="w-full max-w-sm">
        <div className="w-40 h-40 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-blue-500/10">
          <div className="w-28 h-28 bg-blue-100 rounded-full flex items-center justify-center">
            <div className="w-14 h-14 bg-primary rounded-full flex items-center justify-center text-white shadow-xl shadow-primary/40">
               <MapPin size={28} />
            </div>
          </div>
        </div>

        <h1 className="text-2xl font-black text-gray-900 mb-3 tracking-tight">What is Your Location?</h1>
        <p className="text-xs font-bold text-gray-400 mb-8 leading-relaxed max-w-[280px] mx-auto">
          We need to know your location in order to suggest nearby services.
        </p>

        <div className="space-y-3">
          <button 
            onClick={onAllow}
            className="w-full py-4 bg-primary text-white rounded-2xl font-black text-base shadow-xl shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            Allow Location Access
          </button>
          <button 
            onClick={onManual}
            className="w-full py-4 text-primary rounded-2xl font-black text-base hover:bg-gray-50 transition-all font-bold"
          >
            Enter Location Manually
          </button>
        </div>
      </div>
    </div>
  );
}

function EnterLocationScreen({ onBack, onSelect }: { onBack: () => void, onSelect: () => void }) {
  const [query, setQuery] = useState('');

  return (
    <div className="min-h-screen bg-white flex flex-col p-6">
      <div className="w-full max-w-sm mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <button 
            onClick={onBack}
            className="w-10 h-10 bg-white border border-gray-100 rounded-xl flex items-center justify-center text-gray-900 shadow-sm hover:bg-gray-50 transition-all"
          >
             <ChevronLeft size={20} />
          </button>
          <h1 className="text-lg font-black text-gray-900">Enter Your Location</h1>
        </div>

        <div className="relative mb-6">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
            <Search size={18} />
          </div>
          <input 
            type="text" 
            placeholder="Golden Avenue" 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full h-12 pl-11 pr-11 bg-gray-50 border border-gray-100 rounded-xl text-sm text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
          />
          {query && (
            <button 
              onClick={() => setQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 bg-primary text-white rounded-full flex items-center justify-center"
            >
              <X size={12} />
            </button>
          )}
        </div>

        <button 
          onClick={onSelect}
          className="flex items-center gap-3 w-full p-3.5 hover:bg-gray-50 rounded-2xl transition-all text-left mb-6 group"
        >
          <div className="w-9 h-9 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
             <Navigation size={18} className="fill-current" />
          </div>
          <span className="text-xs font-black text-gray-900">Use my current location</span>
        </button>

        <div className="border-t border-gray-50 pt-5">
           <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Search Result</h3>
           
           <button 
             onClick={onSelect}
             className="flex items-start gap-3 w-full group p-3.5 hover:bg-gray-50 rounded-2xl transition-all"
           >
              <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-white shrink-0 mt-0.5 shadow-lg shadow-blue-500/20">
                 <Navigation size={10} className="fill-current" />
              </div>
              <div className="text-left">
                 <p className="text-xs font-black text-gray-900 mb-0.5">Golden Avenue</p>
                 <p className="text-[10px] font-bold text-gray-400">8502 Preston Rd. Ingl..</p>
              </div>
           </button>
        </div>
      </div>
    </div>
  );
}

// --- COMPONENTS ---

// --- COMPONENTS ---

const NavigationItem = ({ icon: Icon, label, active, onClick, badge, isDarkMode, activeColor }: { icon: any, label: string, active: boolean, onClick: () => void, badge?: string | number, isDarkMode: boolean, activeColor?: string, key?: any }) => (
  <button 
    onClick={onClick}
    className={cn(
      "flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-all relative group",
      active 
        ? "text-white shadow-lg" 
        : isDarkMode ? "text-gray-400 hover:bg-gray-800" : "text-gray-500 hover:bg-gray-50"
    )}
    style={active ? { backgroundColor: activeColor || '#FFB800', boxShadow: `0 10px 15px -3px ${activeColor || '#FFB800'}33` } : {}}
  >
    <Icon size={22} strokeWidth={active ? 2.5 : 2} />
    <span className={cn("font-medium", active ? "font-bold" : "font-normal")}>{label}</span>
    {badge && (
      <span className="absolute right-3 top-1/2 -translate-y-1/2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-white">
        {badge}
      </span>
    )}
  </button>
);

const NavbarMobileItem = ({ icon: Icon, label, active, onClick, isDarkMode, activeColor }: { icon: any, label: string, active: boolean, onClick: () => void, isDarkMode: boolean, activeColor?: string, key?: any }) => (
  <button 
    onClick={onClick}
    className={cn(
      "flex flex-col items-center gap-1 flex-1 py-1 transition-all",
      active ? "" : (isDarkMode ? "text-gray-500" : "text-gray-400")
    )}
    style={active ? { color: activeColor || '#FFB800', transform: 'scale(1.1)' } : {}}
  >
    <Icon size={24} strokeWidth={active ? 2.5 : 2} />
    <span className="text-[10px] font-bold">{label}</span>
  </button>
);

// --- TOAST NOTIFICATION SYSTEM ---
type ToastType = 'success' | 'error' | 'info';
interface Toast { id: string; message: string; type: ToastType }
const ToastContext = createContext<{ 
  showToast: (msg: string, type?: ToastType) => void 
}>({ showToast: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (message: string, type: ToastType = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed top-8 left-1/2 -translate-x-1/2 md:left-auto md:right-8 md:translate-x-0 z-[1000] flex flex-col gap-3 pointer-events-none w-full max-w-xs px-4">
        <AnimatePresence mode="popLayout">
          {toasts.map(toast => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: -20, scale: 0.9, x: 0 }}
              animate={{ opacity: 1, y: 0, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
              layout
              className={cn(
                "px-6 py-4 rounded-[1.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.15)] flex items-center gap-4 pointer-events-auto border backdrop-blur-md",
                toast.type === 'success' ? "bg-black/90 text-white border-black" : 
                toast.type === 'error' ? "bg-red-600/90 text-white border-red-500" : "bg-white/90 text-gray-900 border-gray-100"
              )}
            >
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm",
                toast.type === 'success' ? "bg-white/10 text-white" : 
                toast.type === 'error' ? "bg-white/20 text-white" : "bg-primary/10 text-primary"
              )}>
                {toast.type === 'success' ? <Check size={20} /> : 
                 toast.type === 'error' ? <X size={20} /> : <Info size={20} />}
              </div>
              <div className="flex-1">
                <p className="text-[11px] font-black uppercase tracking-[0.1em] leading-tight">{toast.message}</p>
              </div>
              <button 
                onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
                className="text-white/40 hover:text-white transition-colors"
              >
                <X size={14} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

function FaceRegistrationModal({ isOpen, onClose, userId, onComplete }: { isOpen: boolean, onClose: () => void, userId: string, onComplete: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [samples, setSamples] = useState<number[][]>([]);
  const [status, setStatus] = useState<string>('Posiciona o teu rosto no círculo');
  const [isLoaded, setIsLoaded] = useState(false);
  const [isFaceDetected, setIsFaceDetected] = useState(false);
  const detectionInterval = useRef<any>(null);

  useEffect(() => {
    if (isOpen) {
      faceService.loadModels().then(() => {
        setIsLoaded(true);
        startVideo();
      });
    } else {
      stopVideo();
      if (detectionInterval.current) clearInterval(detectionInterval.current);
    }
    return () => {
      stopVideo();
      if (detectionInterval.current) clearInterval(detectionInterval.current);
    };
  }, [isOpen]);

  useEffect(() => {
    if (isLoaded && isOpen && videoRef.current) {
      detectionInterval.current = setInterval(async () => {
        if (videoRef.current && !isCapturing && samples.length < 5) {
          const descriptor = await faceService.getDescriptorFromVideo(videoRef.current);
          const hasFace = !!descriptor;
          setIsFaceDetected(hasFace);
          
          // Only update status if it's currently a neutral/idle message
          const neutralMessages = [
            'Posiciona o teu rosto no círculo',
            'Rosto detetado. Capture uma amostra.',
            'Rosto não detetado',
            'Posicione o rosto no círculo'
          ];
          
          if (neutralMessages.includes(status)) {
            setStatus(hasFace ? 'Rosto detetado. Capture uma amostra.' : 'Posiciona o teu rosto no círculo');
          }
        }
      }, 1000);
    }
  }, [isLoaded, isOpen, isCapturing, status]);

  const startVideo = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Erro ao acessar câmera", err);
      setStatus('Erro: Câmara não disponível ou sem permissão');
    }
  };

  const stopVideo = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
  };

  const captureSample = async () => {
    if (!videoRef.current || samples.length >= 5) return;
    setIsCapturing(true);
    setStatus('A capturar...');

    try {
      // Try multiple times to get a good descriptor
      let descriptor = null;
      for (let i = 0; i < 3; i++) {
        descriptor = await faceService.getDescriptorFromVideo(videoRef.current);
        if (descriptor) break;
        await new Promise(r => setTimeout(r, 200));
      }

      if (descriptor) {
        const newSamples = [...samples, Array.from(descriptor)];
        setSamples(newSamples);
        setStatus(`Amostra ${newSamples.length}/5 capturada!`);
        
        // Brief pause to show success before continuing
        if (newSamples.length < 5) {
          setTimeout(() => {
            if (isOpen) setStatus('Rosto detetado. Capture uma amostra.');
          }, 1500);
        } else {
          // Auto-stop video when all samples are collected
          stopVideo();
          setIsFaceDetected(false);
          setStatus('Registo concluído! Clica em guardar.');
        }
      } else {
        setStatus('Rosto não detetado. Asegura-te que estás num local iluminado.');
        setTimeout(() => {
          if (isOpen) setStatus('Posiciona o teu rosto no círculo');
        }, 2000);
      }
    } catch (err) {
      setStatus('Erro na captura. Tenta novamente.');
    } finally {
      setIsCapturing(false);
    }
  };

  const saveBiometrics = async () => {
    if (samples.length < 5) return;
    try {
      await faceService.saveUserBiometrics(userId, 'Perfil Principal', samples);
      onComplete();
      onClose();
    } catch (err) {
      setStatus('Erro ao guardar biometria');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-[3rem] p-8 w-full max-w-md relative z-10 overflow-hidden text-center">
        <button onClick={onClose} className="absolute top-6 right-6 p-2 text-gray-400 hover:text-black">
          <X size={24} />
        </button>
        
        <h3 className="text-2xl font-black mb-2">Registo Facial</h3>
        <p className="text-sm text-gray-400 font-bold mb-8">Capture 5 amostras para melhor precisão.</p>
        
        <div className="relative aspect-video bg-gray-100 rounded-[2rem] overflow-hidden mb-6 border-4 border-gray-50 shadow-inner">
          <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover scale-x-[-1]" />
           <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
             <div className={cn(
               "w-48 h-64 border-4 rounded-full border-dashed transition-all duration-500",
               isFaceDetected ? "border-green-500/60 scale-105" : "border-white/40 shadow-[0_0_100px_rgba(255,255,255,0.1)]"
             )} />
           </div>
          {!isLoaded && (
             <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm flex flex-col items-center justify-center text-white">
                <RefreshCw size={40} className="animate-spin mb-4 text-primary" />
                <p className="text-xs font-black uppercase tracking-widest text-white/60">Carregando IA...</p>
             </div>
          )}
        </div>

         <div className="mb-8">
            <p className={cn(
              "text-xs font-black uppercase tracking-widest mb-4 transition-colors", 
              status.includes('Sucesso') || status.includes('Amostra') || isFaceDetected ? "text-green-500" : "text-primary"
            )}>
              {status}
            </p>
           {status.includes('Erro') && (
             <button 
               onClick={startVideo}
               className="mb-4 px-4 py-2 bg-gray-50 text-gray-900 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-100 transition-all"
             >
               Tentar Ligar Câmara
             </button>
           )}
           <div className="flex justify-center gap-2">
             <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
               Amostras capturadas: {samples.length}/5
             </span>
           </div>
        </div>

        <div className="flex gap-3">
          {samples.length < 5 ? (
            <button 
              onClick={captureSample}
              disabled={isCapturing || !isLoaded}
              className="flex-1 py-4 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 disabled:opacity-50"
            >
              {isCapturing ? 'A Processar...' : 'Capturar Amostra'}
            </button>
          ) : (
            <button 
              onClick={saveBiometrics}
              className="flex-1 py-4 bg-green-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-green-500/20"
            >
              Guardar Biometria
            </button>
          )}
          <button 
            onClick={onClose}
            className="flex-1 py-4 bg-gray-50 text-gray-500 rounded-2xl font-black text-xs uppercase tracking-widest"
          >
            Cancelar
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function FaceLoginModal({ isOpen, onClose, onAuthSuccess }: { isOpen: boolean, onClose: () => void, onAuthSuccess: (user: any) => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [status, setStatus] = useState<string>('Posiciona o teu rosto para entrar');
  const [isLoaded, setIsLoaded] = useState(false);
  const [isFaceDetected, setIsFaceDetected] = useState(false);
  const detectionInterval = useRef<any>(null);

  useEffect(() => {
    if (isOpen) {
      faceService.loadModels().then(() => {
        setIsLoaded(true);
        startVideo();
      });
    } else {
      stopVideo();
      if (detectionInterval.current) clearInterval(detectionInterval.current);
    }
    return () => {
      stopVideo();
      if (detectionInterval.current) clearInterval(detectionInterval.current);
    };
  }, [isOpen]);

  useEffect(() => {
    if (isLoaded && isOpen && videoRef.current) {
      detectionInterval.current = setInterval(async () => {
        if (videoRef.current && !isVerifying) {
          const descriptor = await faceService.getDescriptorFromVideo(videoRef.current);
          const hasFace = !!descriptor;
          setIsFaceDetected(hasFace);
          
          if (status === 'Posiciona o teu rosto para entrar' || status === 'Rosto não detetado' || status === 'Rosto detectado') {
             setStatus(hasFace ? 'Rosto detetado. Carregando biometria...' : 'Posiciona o teu rosto para entrar');
          }
        }
      }, 1000);
    }
  }, [isLoaded, isOpen, isVerifying, status]);

  const startVideo = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Camera access error:", err);
      setStatus('Erro: Câmara sem permissão ou indisponível');
    }
  };

  const stopVideo = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
  };

  const handleVerify = async () => {
    if (!videoRef.current || !isLoaded) return;
    setIsVerifying(true);
    setStatus('Verificando...');

    try {
      const liveDescriptor = await faceService.getDescriptorFromVideo(videoRef.current);
      if (!liveDescriptor) {
        setStatus('Rosto não detetado');
        setIsVerifying(false);
        return;
      }

      const allUsers = await faceService.getAllBiometrics();
      let bestMatch: any = null;
      let minDistance = 1.0;

      for (const u of allUsers) {
        for (const sample of u.embeddings) {
          const dist = faceService.compareDescriptors(liveDescriptor, sample);
          if (dist < minDistance) {
            minDistance = dist;
            bestMatch = u;
          }
        }
      }

      // 0.6 is a standard good threshold for face-api descriptors
      if (bestMatch && minDistance < 0.6) {
        setStatus('Acesso Permitido!');
        stopVideo();
        // Mock user login - find user in constants or handle session
        // In real app, we would use the userId stored in biometrics
        setTimeout(() => {
          onAuthSuccess({ 
            id: bestMatch.userId, 
            name: bestMatch.label === 'Perfil Principal' ? 'Usuário Biocêntrico' : 'Usuário',
            role: 'USER', // Default for now
            email: 'biometria@app.com',
            avatar: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=200&auto=format&fit=crop'
          });
          onClose();
        }, 1000);
      } else {
        setStatus('Sinto muito, não te reconheci.');
      }
    } catch (err) {
      setStatus('Erro na verificação');
    } finally {
      setIsVerifying(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-[3rem] p-8 w-full max-w-md relative z-10 overflow-hidden text-center shadow-2xl">
        <button onClick={onClose} className="absolute top-6 right-6 p-2 text-gray-400 hover:text-black">
          <X size={24} />
        </button>
        
        <h3 className="text-2xl font-black mb-2">Desbloqueio Facial</h3>
        <p className="text-sm text-gray-400 font-bold mb-8">Posiciona o rosto para entrar no sistema.</p>
        
        <div className="relative aspect-video bg-gray-100 rounded-[2rem] overflow-hidden mb-6 border-4 border-gray-50 shadow-inner">
          <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover scale-x-[-1]" />
           <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
             <div className={cn(
               "w-48 h-64 border-4 rounded-full transition-all duration-500",
               isFaceDetected ? "border-green-500/60 scale-105" : "border-white/40 shadow-[0_0_100px_rgba(255,255,255,0.1)]"
             )} />
           </div>
          {!isLoaded && (
             <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm flex flex-col items-center justify-center text-white">
                <RefreshCw size={40} className="animate-spin mb-4 text-primary" />
                <p className="text-xs font-black uppercase tracking-widest text-white/60">Carregando IA...</p>
             </div>
          )}
        </div>

        <div className="mb-8">
            <p className={cn(
               "text-xs font-black uppercase tracking-widest mb-4 transition-colors", 
               status.includes('Permitido') || isFaceDetected ? "text-green-500" : "text-primary"
            )}>
              {status}
            </p>
           {status.includes('Erro') && (
             <button 
               onClick={startVideo}
               className="mb-4 px-4 py-2 bg-gray-50 text-gray-900 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-100 transition-all"
             >
               Tentar Ligar Câmara
             </button>
           )}
        </div>

        <div className="flex gap-3">
          <button 
            onClick={handleVerify}
            disabled={isVerifying || !isLoaded}
            className="flex-1 py-4 bg-green-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-green-500/20 disabled:opacity-50"
          >
            {isVerifying ? 'A Analisar...' : 'Tentar Agora'}
          </button>
          <button 
            onClick={onClose}
            className="flex-1 py-4 bg-gray-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-gray-500/10"
          >
            Cancelar
          </button>
        </div>
        
        <button 
          onClick={onClose}
          className="mt-6 text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-gray-900"
        >
          Usar PIN ou Senha
        </button>
      </motion.div>
    </div>
  );
}

export default function App() {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [authStep, setAuthStep] = useState<AuthStep>('signin');
  const [isLoading, setIsLoading] = useState(true);
  const [role, setRole] = useState<UserRole>('USER');
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isFaceLoginOpen, setIsFaceLoginOpen] = useState(false);
  const [isFaceRegOpen, setIsFaceRegOpen] = useState(false);
  const [isFaceEnabled, setIsFaceEnabled] = useState(false);
  
  // --- OFFLINE-FIRST STATE (REATIVO) ---
  const empresaId = 'empresa_default_123';
  const userId = 'user_default_456';

  // useLiveQuery faz com que o componente re-renderize sempre que a tabela mudar
  const dbProducts = useLiveQuery(() => productRepository.getAll(empresaId), [empresaId]) || [];
  
  const [isSyncing, setIsSyncing] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  
  // Reativo: Carrega o usuário do banco local
  const currentUserEntity = useLiveQuery(() => userRepository.getById(userId), [userId]);
  
  const paymentMethods = currentUserEntity?.cards || [
    { id: 1, type: 'Visa', last4: '4242', expiry: '12/26', isDefault: true }
  ];
  const addresses = currentUserEntity?.addresses || [
    { id: 1, type: 'Casa', detail: 'Centralidade do Sequele, Bloco 10, Edifício 4, Apto 101', city: 'Cacuaco, Luanda', primary: true },
    { id: 2, type: 'Trabalho', detail: 'Talatona, Edifício Cristal, 4º Andar', city: 'Belas, Luanda', primary: false },
  ];
  const favorites = currentUserEntity?.favorites || [];

  // População inicial se estiver vazio
  useEffect(() => {
    const populate = async () => {
      if (dbProducts.length === 0) {
        console.log('📦 Populando produtos...');
        for (const p of PRODUCTS) {
          await ProductService.createProduct(empresaId, {
            name: p.name,
            description: p.description,
            price: p.price,
            category: p.category,
            image: p.image,
            type: p.type as any,
            stock: 10 + Math.floor(Math.random() * 50),
            rating: p.rating
          });
        }
      }

      // Garantir que o usuário default existe
      const existingUser = await userRepository.getById(userId);
      if (!existingUser) {
        console.log('👤 Criando usuário default...');
        await userRepository.createWithId(userId, {
          name: 'Edlasio Galhardo',
          email: 'edlasio.galhardo@exemplo.ao',
          role: 'USER',
          avatar: 'https://i.postimg.cc/cL90F2nV/Foto-Edlasio.jpg',
          cards: [
            { id: 1, type: 'Visa', last4: '4242', expiry: '12/26', isDefault: true }
          ],
          addresses: [
            { id: 1, type: 'Casa', detail: 'Centralidade do Sequele, Bloco 10, Edifício 4, Apto 101', city: 'Cacuaco, Luanda', primary: true },
            { id: 2, type: 'Trabalho', detail: 'Talatona, Edifício Cristal, 4º Andar', city: 'Belas, Luanda', primary: false },
          ],
          favorites: []
        }, empresaId);
      }
    };
    populate();
  }, [dbProducts.length, empresaId, userId]);

  const handleAddPaymentMethod = async (method: any) => {
    const user = await userRepository.getById(userId);
    if (user) {
      const updatedCards = [...(user.cards || []), method];
      await userRepository.update(userId, { cards: updatedCards });
    }
  };

  const handleAddAddress = async (addr: any) => {
    const user = await userRepository.getById(userId);
    if (user) {
      const updatedAddresses = [...(user.addresses || []), addr];
      await userRepository.update(userId, { addresses: updatedAddresses });
    }
  };

  const handleDeleteAddress = async (id: number) => {
    const user = await userRepository.getById(userId);
    if (user) {
      const updatedAddresses = (user.addresses || []).filter(a => a.id !== id);
      await userRepository.update(userId, { addresses: updatedAddresses });
    }
  };

  const handleUpdateAddress = async (updatedAddr: any) => {
    const user = await userRepository.getById(userId);
    if (user) {
      const updatedAddresses = (user.addresses || []).map(a => a.id === updatedAddr.id ? updatedAddr : a);
      await userRepository.update(userId, { addresses: updatedAddresses });
    }
  };

  // Ciclo de Sincronização
  const runSync = useCallback(async () => {
    const online = await SyncService.isOnline();
    setIsOnline(online);
    
    if (online) {
      setIsSyncing(true);
      try {
        await SyncService.fullSync(empresaId);
      } catch (err) {
        console.error('Sync failed:', err);
      } finally {
        setIsSyncing(false);
      }
    }
  }, [empresaId]);

  useEffect(() => {
    runSync();
    const interval = setInterval(runSync, 30000);
    return () => clearInterval(interval);
  }, [runSync]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('Tudo');

  const [isDarkMode, setIsDarkMode] = useState(false);
  const [brandColor, setBrandColor] = useState('#FFB800');
  const [sellerLogo, setSellerLogo] = useState('https://images.unsplash.com/photo-1541963463532-d68292c34b19?q=80&w=100&auto=format&fit=crop');
  const [sellerCover, setSellerCover] = useState('https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1920&auto=format&fit=crop');
  const [highlightImages, setHighlightImages] = useState([
    'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?q=80&w=1000&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1472851294608-062f824d29cc?q=80&w=1000&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1441986115162-b3c66b1a95a9?q=80&w=1000&auto=format&fit=crop'
  ]);
  const [sellerSettings, setSellerSettings] = useState({
    name: 'Boutique Elegance',
    email: 'contato@boutiqueelegance.ao',
    bio: 'A melhor seleção de moda masculina e feminina em Luanda. Qualidade e estilo garantidos desde 2020.',
    handle: '@boutique_elegance_ao',
    location: 'Luanda, Angola'
  });
  const [notificationCount, setNotificationCount] = useState(3);
  const [userInfo, setUserInfo] = useState({
    name: 'Edlasio Galhardo',
    email: 'edlasio.galhardo@exemplo.ao',
    phone: '+244 923 000 000',
    avatar: 'https://i.postimg.cc/cL90F2nV/Foto-Edlasio.jpg',
    birthday: '1995-05-15'
  });

  const [transactions, setTransactions] = useState([
    { id: 1, type: 'compra', title: 'Jaqueta Bamber', date: 'Hoje, 14:20', amount: '- Kz 60.000', positive: false },
    { id: 2, type: 'reembolso', title: 'Sapato Social', date: 'Ontem, 09:15', amount: '+ Kz 80.000', positive: true },
    { id: 3, type: 'compra', title: 'Blusa Azul Sky', date: '15 Abr, 2024', amount: '- Kz 15.000', positive: false },
  ]);
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: 'Promoção Exclusiva! 🎁',
      description: 'Ganhe 20% de desconto em toda a coleção de Verão. Use o código: VERAO20',
      time: 'Há 5 min',
      type: 'promo',
      read: false,
      icon: Gift,
      color: 'bg-purple-50 text-purple-600'
    },
    {
      id: 2,
      title: 'Pedido Enviado 🚚',
      description: 'O seu pedido #ORD-8901 já está a caminho da sua morada.',
      time: 'Há 2 horas',
      type: 'order',
      read: false,
      icon: Package,
      color: 'bg-blue-50 text-blue-600'
    },
    {
      id: 3,
      title: 'Pagamento Confirmado ✅',
      description: 'Recebemos o seu pagamento referente ao pedido #ORD-7742.',
      time: 'Ontem',
      type: 'payment',
      read: true,
      icon: CreditCard,
      color: 'bg-green-50 text-green-600'
    },
    {
      id: 4,
      title: 'Novo Item na Wishlist 💖',
      description: 'Um item que você salvou baixou de preço! Aproveite agora.',
      time: 'Há 2 dias',
      type: 'alert',
      read: true,
      icon: Tag,
      color: 'bg-orange-50 text-orange-600'
    }
  ]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);

  useEffect(() => {
    if (dbProducts.length > 0) {
      // Mapear ProductEntity de volta para o tipo Product das constantes se necessário
      const mapped: Product[] = dbProducts.map(p => ({
        id: p.id,
        name: p.name,
        description: p.description,
        price: p.price,
        category: p.category,
        image: p.image,
        type: p.type as any,
        rating: p.rating || 4.5
      }));
      setAllProducts(mapped);
    }
  }, [dbProducts]);
  const [pendingSellers, setPendingSellers] = useLocalStorage('admin_pending_sellers', [
    { id: 1, name: 'Boutique Elegance', owner: 'Marta Dias', date: '22 ABR', status: 'Aguardando' },
    { id: 2, name: 'Tech Store AO', owner: 'Carlos Brito', date: '21 ABR', status: 'Aguardando' },
    { id: 3, name: 'Moda Jovem', owner: 'Lara Santos', date: '20 ABR', status: 'Aguardando' },
  ]);
  const [pendingPayments, setPendingPayments] = useLocalStorage('admin_pending_payments', [
    { id: 'TX8901', user: 'Pedro S.', amount: 'Kz 60.000', item: 'Jaqueta Bamber', date: 'Hoje, 14:20' },
    { id: 'TX8902', user: 'Ana G.', amount: 'Kz 120.000', item: 'Fato Suite', date: 'Hoje, 13:45' },
    { id: 'TX8903', user: 'Bruno R.', amount: 'Kz 80.000', item: 'Sapato Social', date: 'Hoje, 12:10' },
  ]);
  const [pendingSellerPayments, setPendingSellerPayments] = useState([
    { id: 'SUB-001', seller: 'Boutique Elegance', amount: 'Kz 25.000', plan: 'Plano Premium', date: 'Hoje, 10:15' },
    { id: 'SUB-002', seller: 'Tech Store AO', amount: 'Kz 15.000', plan: 'Plano Pro', date: 'Ontem, 16:30' },
    { id: 'SUB-003', seller: 'Moda Jovem', amount: 'Kz 25.000', plan: 'Plano Premium', date: '21 ABR, 09:20' },
  ]);

  // --- ADMIN MANAGEMENT ---
  const handleApproveSeller = (id: number) => {
    setPendingSellers(prev => prev.filter(s => s.id !== id));
  };
  const handleRejectSeller = (id: number) => {
    setPendingSellers(prev => prev.filter(s => s.id !== id));
  };
  const handleApprovePayment = (id: string, type: 'client' | 'seller') => {
    if (type === 'client') {
      setPendingPayments(prev => prev.filter(p => p.id !== id));
    } else {
      // Find the seller name from the payment
      const payment = pendingSellerPayments.find(p => p.id === id);
      if (payment) {
        // Approve the seller automatically if they are also in the pending sellers list
        setPendingSellers(prev => prev.filter(s => s.name !== payment.seller));
      }
      setPendingSellerPayments(prev => prev.filter(p => p.id !== id));
    }
  };
  const handleRejectPayment = (id: string, type: 'client' | 'seller') => {
    if (type === 'client') {
      setPendingPayments(prev => prev.filter(p => p.id !== id));
    } else {
      setPendingSellerPayments(prev => prev.filter(p => p.id !== id));
    }
  };

  // --- PRODUCT MANAGEMENT ---
  const toggleFavorite = async (id: string) => {
    const user = await userRepository.getById(userId);
    if (user) {
      const currentFavs = user.favorites || [];
      const updatedFavs = currentFavs.includes(id) 
        ? currentFavs.filter(fid => fid !== id) 
        : [...currentFavs, id];
      await userRepository.update(userId, { favorites: updatedFavs });
    }
  };

  const handleDeleteProduct = (id: string) => {
    setAllProducts(prev => prev.filter(p => p.id !== id));
  };

  const handleUpdateProduct = (updatedProduct: Product) => {
    setAllProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
  };

  const handleAddProduct = (newProduct: Product) => {
    setAllProducts(prev => [...prev, newProduct]);
  };

  // --- THEME MANAGEMENT ---
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // --- SCROLL TO TOP ON SCREEN CHANGE ---
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentScreen, role]);

  const cartCount = useMemo(() => cart.reduce((acc, item) => acc + item.quantity, 0), [cart]);

  useEffect(() => {
    // Detect role from URL path
    const path = window.location.pathname.toLowerCase();
    if (path.includes('/admin')) {
      setRole('ADMIN');
    } else if (path.includes('/vendedor') || path.includes('/seller')) {
      setRole('SELLER');
    } else {
      setRole('USER');
    }

    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  // --- AUTH ACTIONS ---
  const handleFinalLogin = () => {
    setIsSignedIn(true);
    // Set initial screen based on role
    if (role === 'USER') setCurrentScreen('home');
    if (role === 'SELLER') setCurrentScreen('seller-dashboard');
    if (role === 'ADMIN') setCurrentScreen('admin-dashboard');
  };

  const handleLogout = () => {
    setIsSignedIn(false);
    setSelectedProduct(null);
    setCart([]);
    setAuthStep('signin');
  };

  if (isLoading) {
    return <SplashScreen role={role} />;
  }

  if (!isSignedIn) {
    return (
      <div className={cn(
        "min-h-screen transition-colors duration-300",
        isDarkMode ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"
      )}>
        {authStep === 'signin' && (
          <SignInScreen 
            onNext={() => {
              if (role === 'SELLER') {
                setAuthStep('location-access');
              } else {
                handleFinalLogin();
              }
            }} 
            onSignUp={() => setAuthStep('signup')}
            onForgot={() => setAuthStep('forgot-password')}
            onFaceLoginClick={() => setIsFaceLoginOpen(true)}
          />
        )}
        {authStep === 'signup' && (
          <SignUpScreen 
            onNext={() => {
              if (role === 'SELLER') {
                setAuthStep('location-access');
              } else {
                handleFinalLogin();
              }
            }} 
            onSignIn={() => setAuthStep('signin')}
          />
        )}
        {authStep === 'forgot-password' && (
          <ForgotPasswordScreen 
            onBack={() => setAuthStep('signin')}
          />
        )}
        {authStep === 'location-access' && (
          <LocationAccessScreen 
            onAllow={handleFinalLogin} 
            onManual={() => setAuthStep('enter-location')} 
          />
        )}
        {authStep === 'enter-location' && (
          <EnterLocationScreen 
            onBack={() => setAuthStep('location-access')} 
            onSelect={handleFinalLogin} 
          />
        )}

        <FaceLoginModal 
          isOpen={isFaceLoginOpen} 
          onClose={() => setIsFaceLoginOpen(false)} 
          onAuthSuccess={(user) => {
            setUserInfo(prev => ({ ...prev, ...user }));
            handleFinalLogin();
          }} 
        />

        <FaceRegistrationModal 
          isOpen={isFaceRegOpen} 
          onClose={() => setIsFaceRegOpen(false)} 
          userId="current-user"
          onComplete={() => {
            setIsFaceEnabled(true);
            alert('Biometria registada com sucesso!');
          }} 
        />
      </div>
    );
  }

  const addToCart = (product: Product, size: string, quantity: number) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id && item.selectedSize === size);
      if (existing) {
        return prev.map(item => 
          item.id === product.id && item.selectedSize === size 
            ? { ...item, quantity: item.quantity + quantity } 
            : item
        );
      }
      return [...prev, { ...product, quantity, selectedSize: size }];
    });
    setCurrentScreen('shop'); // Go back to shop or stay or go to cart
  };

  const removeFromCart = (id: string, size: string) => {
    setCart(prev => prev.filter(item => !(item.id === id && item.selectedSize === size)));
  };

  const updateCartQuantity = (id: string, size: string, delta: number) => {
    setCart(prev => prev.map(item => 
      item.id === id && item.selectedSize === size 
        ? { ...item, quantity: Math.max(1, item.quantity + delta) } 
        : item
    ));
  };

  // --- MENU CONFIGURATION ---
  const MENUS = {
    USER: [
      { id: 'home', label: 'Início', icon: Home },
      { id: 'shop', label: 'Compras', icon: ShoppingBag },
      { id: 'cart', label: 'Carrinho', icon: ShoppingCart, badge: cartCount > 0 ? cartCount : undefined },
      { id: 'orders', label: 'Pedidos', icon: Package, badge: 2 },
      { id: 'payments', label: 'Pagamentos', icon: CreditCard },
      { id: 'qr-pickup', label: 'QR de Levantamento', icon: QrCode },
      { id: 'complaints', label: 'Reclamações', icon: MessageSquare },
      { id: 'profile', label: 'Perfil', icon: User },
      { id: 'profile-info', label: 'Informações Pessoais', icon: User, hidden: true },
      { id: 'profile-addresses', label: 'Endereços de Entrega', icon: MapPin, hidden: true },
      { id: 'profile-payments', label: 'Gerir Cartões', icon: CreditCard, hidden: true },
      { id: 'profile-security', label: 'Segurança', icon: ShieldCheck, hidden: true },
      { id: 'profile-settings', label: 'Definições do App', icon: Settings, hidden: true },
    ],
    SELLER: [
      { id: 'seller-dashboard', label: 'Painel', icon: LayoutDashboard },
      { id: 'seller-orders', label: 'Pedidos', icon: Store, badge: 5 },
      { id: 'seller-scanner', label: 'Scanner QR', icon: Scan },
      { id: 'seller-products', label: 'Produtos', icon: Package },
      { id: 'seller-earnings', label: 'Ganhos', icon: Wallet },
      { id: 'seller-profile', label: 'Perfil da Loja', icon: Store },
      { id: 'seller-subscription', label: 'Assinatura', icon: CheckCircle },
      { id: 'seller-add-product', label: 'Adicionar Produto', icon: Plus, hidden: true },
      { id: 'seller-edit-product', label: 'Editar Produto', icon: Edit3, hidden: true },
      { id: 'profile', label: 'Perfil Pessoal', icon: User },
    ],
    ADMIN: [
      { id: 'admin-dashboard', label: 'Dashboard', icon: ShieldCheck },
      { id: 'admin-sellers', label: 'Vendedores', icon: Users },
      { id: 'sellers-approval', label: 'Activação de Vendedor', icon: UserPlus, badge: 3 },
      { id: 'admin-orders', label: 'Pedidos', icon: ShoppingBag },
      { id: 'admin-payments', label: 'Pagamentos', icon: CreditCard },
      { id: 'payments-validation', label: 'Validar Comprovativos', icon: CheckCircle, badge: 12 },
      { id: 'admin-transfers', label: 'Transferências', icon: Send },
      { id: 'admin-refunds', label: 'Reembolsos', icon: RotateCcw },
      { id: 'admin-subscriptions', label: 'Assinaturas', icon: CheckCircle },
      { id: 'admin-reports', label: 'Relatórios', icon: BarChart3 },
      { id: 'admin-audit', label: 'Auditoria', icon: Search },
      { id: 'profile', label: 'Perfil Pessoal', icon: User },
    ]
  };

  const getActiveMenu = () => MENUS[role];

  const getProfileDropdownItems = () => {
    switch(role) {
      case 'USER':
        return [
          { id: 'profile', label: 'Ver Perfil', icon: User },
          { id: 'orders', label: 'Meus Pedidos', icon: Package },
          { id: 'profile-addresses', label: 'Endereços', icon: MapPin },
          { id: 'payments', label: 'Pagamentos', icon: CreditCard },
          { id: 'profile-settings', label: 'Configurações', icon: Settings },
        ];
      case 'SELLER':
        return [
          { id: 'profile', label: 'Meu Perfil', icon: User },
          { id: 'seller-profile', label: 'Perfil da Loja', icon: Store },
          { id: 'seller-dashboard', label: 'Painel', icon: LayoutDashboard },
          { id: 'seller-earnings', label: 'Ganhos', icon: Wallet },
        ];
      case 'ADMIN':
        return [
          { id: 'profile', label: 'Meu Perfil', icon: User },
          { id: 'admin-dashboard', label: 'Dashboard', icon: ShieldCheck },
          { id: 'sellers-approval', label: 'Aprovar Vendedores', icon: UserPlus },
          { id: 'admin-reports', label: 'Relatórios', icon: BarChart3 },
        ];
      default:
        return [];
    }
  };

  return (
    <ToastProvider>
      <div className={cn("min-h-screen flex flex-col md:flex-row font-sans transition-colors duration-300", isDarkMode ? "bg-gray-950 text-white" : "bg-white text-black")}>
      
      {/* --- DESKTOP SIDEBAR --- */}
      <aside className={cn(
        "hidden md:flex flex-col border-r sticky top-0 h-screen transition-all duration-300 z-50",
        isSidebarOpen ? "w-72 p-6" : "w-20 p-4",
        isDarkMode ? "bg-gray-900 border-gray-800" : "bg-white border-[#D9D9D9]"
      )}>
          <div className={cn("flex items-center gap-3 mb-10 px-2", !isSidebarOpen && "justify-center")}>
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white">
              <ShoppingBag size={24} strokeWidth={2.5} />
            </div>
            {isSidebarOpen && <span className="text-xl font-black tracking-tight">Moda d'Angola</span>}
          </div>

          <nav className="flex-1 space-y-1">
            {getActiveMenu().filter((item: any) => !item.hidden).map((item: any) => (
              <NavigationItem 
                key={item.id}
                icon={item.icon}
                label={isSidebarOpen ? item.label : ''}
                active={currentScreen === item.id}
                onClick={() => setCurrentScreen(item.id)}
                badge={item.badge}
                isDarkMode={isDarkMode}
                activeColor={role === 'SELLER' ? brandColor : undefined}
              />
            ))}
          </nav>

          {/* --- FOOTER ACTIONS --- */}
          <div className={cn("mt-auto pt-6 border-t", isDarkMode ? "border-gray-800" : "border-[#D9D9D9]", !isSidebarOpen && "flex flex-col items-center")}>
             {isSidebarOpen ? (
               <button 
                 onClick={handleLogout}
                 className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-all"
               >
                  <LogOut size={20} />
                  <span className="font-bold">Sair</span>
               </button>
             ) : (
               <button onClick={handleLogout} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all">
                  <LogOut size={20} />
               </button>
             )}
          </div>
        </aside>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 flex flex-col min-h-screen">
        
        {/* --- APP BAR --- */}
        <header className={cn(
          "sticky top-0 z-40 backdrop-blur-md px-6 py-4 border-b flex items-center justify-between transition-all duration-300",
          isDarkMode ? "bg-gray-950/80 border-gray-800" : "bg-white/80 border-[#D9D9D9]"
        )}>
          <div className="flex items-center gap-3">
             <div className="md:hidden w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white mr-2">
                <ShoppingBag size={18} strokeWidth={2.5} />
             </div>
             <h1 className={cn(
               "text-xl font-black capitalize transition-colors duration-300",
               isDarkMode ? "text-white" : "text-gray-900"
             )}>
               {getActiveMenu().find((m: any) => m.id === currentScreen)?.label || "Moda d'Angola"}
             </h1>
          </div>

          <div className="flex items-center gap-4">
              <div className="relative">
                <button 
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className={cn(
                    "flex items-center gap-3 transition-all duration-300 group",
                    isDarkMode ? "text-white" : "text-gray-900"
                  )}
                >
                  <div className="hidden sm:flex flex-col items-end">
                    <p className={cn("text-sm font-black leading-tight", isDarkMode ? "text-white" : "text-gray-900")}>Edlásio G.</p>
                    <div className="flex items-center gap-3 text-[9px] font-black uppercase tracking-widest">
                       {/* Status Indicador Minimalista */}
                       {isSyncing ? (
                          <div className="flex items-center text-blue-500 mr-1" title="Sincronizando">
                             <RefreshCw size={12} className="animate-spin" />
                          </div>
                       ) : isOnline ? (
                          <div className="flex items-center text-green-500 relative mr-1" title="Online">
                             <Wifi size={12} />
                             <div className="w-1 h-1 rounded-full bg-green-500 absolute -top-0.5 -right-0.5 shadow-[0_0_5px_rgba(34,197,94,0.5)]" />
                          </div>
                       ) : (
                          <div className="flex items-center text-amber-500 mr-1" title="Offline">
                             <WifiOff size={12} />
                          </div>
                       )}

                       <div className="h-2 w-[1px] bg-gray-300 dark:bg-gray-700 mx-1" />

                       <span className={isDarkMode ? "text-gray-500" : "text-gray-400"}>
                         {role === 'USER' ? 'Cliente' : role === 'SELLER' ? 'Vendedor' : 'Administrador'}
                       </span>
                    </div>
                  </div>
                  <div className="relative">
                    <div className={cn(
                      "w-10 h-10 rounded-xl overflow-hidden border-2 shadow-sm transition-transform group-active:scale-95",
                      isDarkMode ? "border-gray-800" : "border-white"
                    )}>
                      <img 
                        src="https://i.postimg.cc/cL90F2nV/Foto-Edlasio.jpg" 
                        alt="Avatar" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    {notificationCount > 0 && (
                      <span className={cn(
                        "absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white text-[10px] font-black flex items-center justify-center rounded-full border-2 shadow-sm animate-in zoom-in duration-300",
                        isDarkMode ? "border-gray-950" : "border-white"
                      )}>
                        {notificationCount}
                      </span>
                    )}
                  </div>
                  <ChevronDown size={14} className={cn("text-gray-400 transition-transform duration-300", isProfileMenuOpen && "rotate-180")} />
                </button>

                <AnimatePresence>
                  {isProfileMenuOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setIsProfileMenuOpen(false)} />
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className={cn(
                          "absolute right-0 mt-3 w-64 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] border overflow-hidden z-50",
                          isDarkMode ? "bg-gray-900 border-gray-800" : "bg-white border-gray-100"
                        )}
                      >
                        <div className={cn("p-5 border-b", isDarkMode ? "border-gray-800 bg-gray-900/50" : "border-gray-50 bg-gray-50/50")}>
                          <p className={cn("text-xs font-black uppercase tracking-widest mb-1", isDarkMode ? "text-gray-500" : "text-gray-400")}>Minha Conta</p>
                          <p className={cn("text-sm font-black", isDarkMode ? "text-white" : "text-gray-900")}>edlasiogalhardo@gmail.com</p>
                        </div>
                        
                        <div className="p-2">
                          {getProfileDropdownItems().map((item) => (
                            <button
                              key={item.id}
                              onClick={() => {
                                setCurrentScreen(item.id as any);
                                setIsProfileMenuOpen(false);
                              }}
                              className={cn(
                                "w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 group text-left",
                                isDarkMode ? "hover:bg-gray-800 text-gray-300" : "hover:bg-gray-50 text-gray-600"
                              )}
                            >
                              <div className={cn(
                                "w-8 h-8 rounded-xl flex items-center justify-center transition-colors",
                                isDarkMode ? "bg-gray-800 group-hover:bg-primary/20 text-gray-400 group-hover:text-primary" : "bg-gray-100 group-hover:bg-primary/10 text-gray-500 group-hover:text-primary"
                              )}>
                                <item.icon size={18} />
                              </div>
                              <span className="text-sm font-black">{item.label}</span>
                            </button>
                          ))}
                        </div>

                        <div className={cn("p-2 border-t mt-1", isDarkMode ? "border-gray-800" : "border-gray-50")}>
                          <button
                            onClick={() => {
                              handleLogout();
                              setIsProfileMenuOpen(false);
                            }}
                            className={cn(
                              "w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all mb-1 group text-left",
                              "hover:bg-red-50 text-red-500"
                            )}
                          >
                            <div className="w-8 h-8 rounded-xl bg-red-100 flex items-center justify-center text-red-600 transition-colors group-hover:bg-red-200">
                              <LogOut size={18} />
                            </div>
                            <span className="text-sm font-black">Sair da Conta</span>
                          </button>
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
          </div>
        </header>

      {/* --- PAGE CONTENT --- */}
        <div className="flex-1 p-6 md:p-10 pb-28 md:pb-10 max-w-7xl w-full mx-auto">
          <AnimatePresence mode="wait">
             <motion.div
               key={currentScreen + role}
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: -10 }}
               transition={{ duration: 0.2 }}
               className="w-full"
             >
                {role === 'USER' && (
                  <>
                    {currentScreen === 'home' && (
                      <HomeScreen 
                        onProductClick={(p: any) => { setSelectedProduct(p); setCurrentScreen('detail'); }} 
                        setActiveCategory={(c: any) => { setActiveCategory(c); setCurrentScreen('shop'); }}
                        products={allProducts}
                        favorites={favorites}
                        onToggleFavorite={toggleFavorite}
                      />
                    )}
                    {currentScreen === 'shop' && (
                      <ShopScreen 
                        activeCategory={activeCategory}
                        setActiveCategory={setActiveCategory}
                        onProductClick={(p: any) => { setSelectedProduct(p); setCurrentScreen('detail'); }}
                        searchQuery={searchQuery}
                        setSearchQuery={setSearchQuery}
                        products={allProducts}
                        favorites={favorites}
                        onToggleFavorite={toggleFavorite}
                      />
                    )}
                    {currentScreen === 'detail' && selectedProduct && (
                      <DetailScreen 
                        product={selectedProduct} 
                        onBack={() => setCurrentScreen('shop')}
                        onAddToCart={addToCart}
                        onBuyNow={(p, s, q) => {
                          addToCart(p, s, q);
                          setCurrentScreen('cart');
                        }}
                        isFavorite={favorites.includes(selectedProduct.id)}
                        onToggleFavorite={toggleFavorite}
                      />
                    )}
                    {currentScreen === 'cart' && (
                      <CartScreen 
                        cart={cart} 
                        onUpdateQuantity={updateCartQuantity} 
                        onRemove={removeFromCart} 
                        onCheckout={() => setCurrentScreen('checkout')}
                      />
                    )}
                    {currentScreen === 'checkout' && (
                      <CheckoutScreen 
                        cart={cart} 
                        onComplete={() => { setCart([]); setCurrentScreen('orders'); }}
                        empresaId={empresaId}
                        userId={userId}
                      />
                    )}
                    {currentScreen === 'orders' && <OrdersScreen empresaId={empresaId} userId={userId} />}
                    {currentScreen === 'payments' && (
                       <PaymentsScreen 
                         onBack={() => setCurrentScreen('home')} 
                         methods={paymentMethods} 
                         transactions={transactions} 
                         onAdd={handleAddPaymentMethod}
                       />
                    )}
                    {currentScreen === 'qr-pickup' && <QRPickupScreen empresaId={empresaId} userId={userId} />}
                    {currentScreen === 'complaints' && <ComplaintsScreen empresaId={empresaId} userId={userId} />}
                    {currentScreen === 'profile' && (
                      <ProfileScreen 
                        onNavigate={setCurrentScreen} 
                        userInfo={userInfo} 
                        onPhotoUpload={(url) => setUserInfo({ ...userInfo, avatar: url })}
                        onLogout={handleLogout}
                        onFaceRegClick={() => setIsFaceRegOpen(true)}
                        isFaceEnabled={isFaceEnabled}
                        onToggleFace={() => setIsFaceEnabled(!isFaceEnabled)}
                      />
                    )}
                    {currentScreen === 'profile-info' && <ProfileInfoScreen onBack={() => setCurrentScreen('profile')} userInfo={userInfo} onSave={setUserInfo} />}
                    {currentScreen === 'profile-addresses' && (
                      <ProfileAddressesScreen 
                        onBack={() => setCurrentScreen('profile')} 
                        addresses={addresses} 
                        onAdd={() => handleAddAddress({ id: Date.now(), type: 'Novo', detail: 'Novo Endereço', city: 'Luanda', primary: false })}
                        onDelete={handleDeleteAddress}
                        onUpdate={handleUpdateAddress}
                      />
                    )}
                    {currentScreen === 'profile-payments' && (
                       <PaymentsScreen 
                         onBack={() => setCurrentScreen('profile')} 
                         methods={paymentMethods} 
                         transactions={transactions} 
                         onAdd={handleAddPaymentMethod}
                       />
                    )}
                    {currentScreen === 'profile-security' && <ProfileSecurityScreen onBack={() => setCurrentScreen('profile')} />}
                    {currentScreen === 'profile-settings' && <ProfileSettingsScreen onBack={() => setCurrentScreen('profile')} isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} onFaceRegClick={() => setIsFaceRegOpen(true)} isFaceEnabled={isFaceEnabled} onToggleFace={() => setIsFaceEnabled(!isFaceEnabled)} />}
                    {currentScreen === 'notifications' && (
                      <NotificationsScreen 
                        onBack={() => setCurrentScreen('profile')} 
                        notifications={notifications} 
                        onRead={(id) => setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n))}
                      />
                    )}
                    {currentScreen === 'store-detail' && (
                      <StoreDetailScreen 
                        sellerLogo={sellerLogo} 
                        sellerCover={sellerCover} 
                        highlightImages={highlightImages}
                        sellerSettings={sellerSettings} 
                        brandColor={brandColor} 
                        products={allProducts}
                        onProductClick={(p: any) => { setSelectedProduct(p); setCurrentScreen('detail'); }}
                        onBack={() => setCurrentScreen('home')}
                        favorites={favorites}
                        onToggleFavorite={toggleFavorite}
                      />
                    )}
                    {/* Placeholder for other user screens */}
                    {!['home', 'shop', 'detail', 'cart', 'checkout', 'orders', 'payments', 'qr-pickup', 'complaints', 'profile', 'profile-info', 'profile-addresses', 'profile-payments', 'profile-security', 'profile-settings', 'notifications', 'store-detail'].includes(currentScreen) && (
                      <PlaceholderScreen screen={currentScreen} role={role} icon={getActiveMenu().find((m: any) => m.id === currentScreen)?.icon} />
                    )}
                  </>
                )}

                {role === 'SELLER' && (
                  <>
                    {currentScreen === 'seller-dashboard' && <SellerDashboard products={allProducts} setScreen={setCurrentScreen} />}
                    {currentScreen === 'seller-products' && (
                      <SellerProducts 
                        products={allProducts} 
                        onDelete={handleDeleteProduct} 
                        onEdit={(p: any) => { setSelectedProduct(p); setCurrentScreen('seller-edit-product'); }} 
                        onAdd={() => setCurrentScreen('seller-add-product')} 
                      />
                    )}
                    {currentScreen === 'seller-add-product' && (
                      <SellerAddProductScreen 
                        onAdd={handleAddProduct} 
                        onBack={() => setCurrentScreen('seller-products')} 
                      />
                    )}
                    {currentScreen === 'seller-edit-product' && (
                      <SellerEditProductScreen 
                        products={allProducts} 
                        initialProduct={selectedProduct}
                        onEdit={handleUpdateProduct} 
                        onBack={() => { setSelectedProduct(null); setCurrentScreen('seller-products'); }} 
                      />
                    )}
                    {currentScreen === 'seller-orders' && <SellerOrders products={allProducts} />}
                    {currentScreen === 'seller-scanner' && <SellerScanner onViewReport={() => setCurrentScreen('seller-earnings')} />}
                    {currentScreen === 'seller-earnings' && <SellerEarnings />}
                    {currentScreen === 'seller-subscription' && <SellerSubscription empresaId={empresaId} userId={userId} />}
                    {currentScreen === 'seller-profile' && (
                      <SellerProfile 
                        brandColor={brandColor} 
                        onColorChange={setBrandColor} 
                        sellerLogo={sellerLogo}
                        onLogoChange={setSellerLogo}
                        sellerCover={sellerCover}
                        onCoverChange={setSellerCover}
                        highlightImages={highlightImages}
                        onHighlightImagesChange={setHighlightImages}
                        sellerSettings={sellerSettings}
                        onSettingsChange={setSellerSettings}
                        onViewStore={() => {
                          setRole('USER');
                          setCurrentScreen('store-detail');
                        }}
                      />
                    )}
                    {/* Personal Profile Screens for Seller */}
                    {currentScreen === 'profile' && (
                      <SellerPersonalProfile 
                        onNavigate={setCurrentScreen} 
                        userInfo={userInfo} 
                        onLogout={handleLogout}
                        onFaceRegClick={() => setIsFaceRegOpen(true)}
                        isFaceEnabled={isFaceEnabled}
                        onToggleFace={() => setIsFaceEnabled(!isFaceEnabled)}
                      />
                    )}
                    {currentScreen === 'profile-info' && <ProfileInfoScreen onBack={() => setCurrentScreen('profile')} userInfo={userInfo} onSave={setUserInfo} />}
                    {currentScreen === 'profile-addresses' && (
                      <ProfileAddressesScreen 
                        onBack={() => setCurrentScreen('profile')} 
                        addresses={addresses} 
                        onAdd={() => handleAddAddress({ id: Date.now(), type: 'Novo', detail: 'Novo Endereço', city: 'Luanda', primary: false })}
                        onDelete={handleDeleteAddress}
                        onUpdate={handleUpdateAddress}
                      />
                    )}
                    {currentScreen === 'profile-payments' && (
                       <PaymentsScreen 
                         onBack={() => setCurrentScreen('profile')} 
                         methods={paymentMethods} 
                         transactions={transactions} 
                         onAdd={handleAddPaymentMethod}
                       />
                    )}
                    {currentScreen === 'profile-security' && <ProfileSecurityScreen onBack={() => setCurrentScreen('profile')} />}
                    {currentScreen === 'profile-settings' && <ProfileSettingsScreen onBack={() => setCurrentScreen('profile')} isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} onFaceRegClick={() => setIsFaceRegOpen(true)} isFaceEnabled={isFaceEnabled} onToggleFace={() => setIsFaceEnabled(!isFaceEnabled)} />}
                    {currentScreen === 'notifications' && (
                      <NotificationsScreen 
                        onBack={() => setCurrentScreen('profile')} 
                        notifications={notifications} 
                        onRead={(id) => setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n))}
                      />
                    )}
                    {!['seller-dashboard', 'seller-products', 'seller-add-product', 'seller-edit-product', 'seller-orders', 'seller-scanner', 'seller-earnings', 'seller-subscription', 'seller-profile', 'profile', 'profile-info', 'profile-addresses', 'profile-payments', 'profile-security', 'profile-settings', 'notifications'].includes(currentScreen) && (
                      <PlaceholderScreen screen={currentScreen} role={role} icon={getActiveMenu().find((m: any) => m.id === currentScreen)?.icon} />
                    )}
                  </>
                )}

                {role === 'ADMIN' && (
                  <>
                    {currentScreen === 'admin-dashboard' && <AdminDashboard />}
                    {currentScreen === 'admin-sellers' && <AdminSellers />}
                    {currentScreen === 'sellers-approval' && (
                      <SellersApproval 
                        sellers={pendingSellers} 
                        onApprove={handleApproveSeller} 
                        onReject={handleRejectSeller} 
                      />
                    )}
                    {currentScreen === 'admin-payments' && <AdminPayments />}
                    {currentScreen === 'payments-validation' && <AdminPaymentsValidation />}
                    {currentScreen === 'admin-orders' && <AdminOrders />}
                    {currentScreen === 'admin-transfers' && <AdminTransfers />}
                    {currentScreen === 'admin-refunds' && <AdminRefunds />}
                    {currentScreen === 'admin-subscriptions' && <AdminSubscriptions />}
                    {currentScreen === 'admin-reports' && <AdminReports />}
                    {currentScreen === 'admin-audit' && <AdminAudit />}
                    {/* Personal Profile Screens for Admin */}
                    {currentScreen === 'profile' && (
                      <AdminProfileScreen 
                        onNavigate={setCurrentScreen} 
                        userInfo={userInfo} 
                        onLogout={handleLogout}
                        onFaceRegClick={() => setIsFaceRegOpen(true)}
                        isFaceEnabled={isFaceEnabled}
                        onToggleFace={() => setIsFaceEnabled(!isFaceEnabled)}
                      />
                    )}
                    {currentScreen === 'profile-info' && <ProfileInfoScreen onBack={() => setCurrentScreen('profile')} userInfo={userInfo} onSave={setUserInfo} />}
                    {currentScreen === 'profile-addresses' && (
                      <ProfileAddressesScreen 
                        onBack={() => setCurrentScreen('profile')} 
                        addresses={addresses} 
                        onAdd={() => handleAddAddress({ id: Date.now(), type: 'Novo', detail: 'Novo Endereço', city: 'Luanda', primary: false })}
                        onDelete={handleDeleteAddress}
                        onUpdate={handleUpdateAddress}
                      />
                    )}
                    {currentScreen === 'profile-payments' && (
                       <PaymentsScreen 
                         onBack={() => setCurrentScreen('profile')} 
                         methods={paymentMethods} 
                         transactions={transactions} 
                         onAdd={handleAddPaymentMethod}
                       />
                    )}
                    {currentScreen === 'profile-security' && <ProfileSecurityScreen onBack={() => setCurrentScreen('profile')} />}
                    {currentScreen === 'profile-settings' && <ProfileSettingsScreen onBack={() => setCurrentScreen('profile')} isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} onFaceRegClick={() => setIsFaceRegOpen(true)} isFaceEnabled={isFaceEnabled} onToggleFace={() => setIsFaceEnabled(!isFaceEnabled)} />}
                    {currentScreen === 'notifications' && (
                      <NotificationsScreen 
                        onBack={() => setCurrentScreen('profile')} 
                        notifications={notifications} 
                        onRead={(id) => setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n))}
                      />
                    )}
                    {!['admin-dashboard', 'admin-sellers', 'sellers-approval', 'admin-payments', 'payments-validation', 'admin-orders', 'admin-transfers', 'admin-refunds', 'admin-subscriptions', 'admin-reports', 'admin-audit', 'profile', 'profile-info', 'profile-addresses', 'profile-payments', 'profile-security', 'profile-settings', 'notifications'].includes(currentScreen) && (
                      <PlaceholderScreen screen={currentScreen} role={role} icon={getActiveMenu().find((m: any) => m.id === currentScreen)?.icon} />
                    )}
                  </>
                )}
             </motion.div>
          </AnimatePresence>
        </div>

      </main>

      {/* --- MOBILE MORE MENU OVERLAY --- */}
      <AnimatePresence>
        {isMoreMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMoreMenuOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] md:hidden"
            />
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className={cn(
                "fixed bottom-0 left-0 right-0 z-[70] md:hidden rounded-t-[2rem] p-6 pb-12 shadow-2xl",
                isDarkMode ? "bg-gray-900" : "bg-white"
              )}
            >
              <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6 opacity-50" />
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-black">Explorar Mais</h3>
                <button onClick={() => setIsMoreMenuOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-all">
                  <X size={20} />
                </button>
              </div>
              <div className="grid grid-cols-3 gap-y-8 gap-x-4">
                {getActiveMenu().filter((item: any) => !item.hidden).slice(4).map((item: any) => (
                  <button 
                    key={item.id}
                    onClick={() => { setCurrentScreen(item.id); setIsMoreMenuOpen(false); }}
                    className="flex flex-col items-center gap-2 group text-center"
                  >
                    <div className={cn(
                      "w-12 h-12 rounded-2xl flex items-center justify-center transition-all relative",
                      currentScreen === item.id ? "bg-primary text-white shadow-lg shadow-primary/30" : isDarkMode ? "bg-gray-800 text-gray-400" : "bg-gray-50 text-gray-500"
                    )}>
                      <item.icon size={22} />
                      {item.badge && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[8px] font-black w-4 h-4 rounded-full flex items-center justify-center border-2 border-white">
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <span className={cn(
                      "text-[9px] font-black uppercase tracking-widest leading-tight px-1",
                      currentScreen === item.id ? "text-primary" : "text-gray-500"
                    )}>{item.label}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* --- MOBILE BOTTOM NAVBAR --- */}
      <nav className={cn(
        "md:hidden fixed bottom-0 left-0 right-0 backdrop-blur-lg border-t px-4 py-3 flex justify-around items-center z-50 transition-colors duration-300",
        isDarkMode ? "bg-gray-900/90 border-gray-800" : "bg-white/90 border-gray-100"
      )}>
          {/* First 2 items */}
          {getActiveMenu().filter((item: any) => !item.hidden).slice(0, 2).map((item: any) => (
            <NavbarMobileItem 
              key={item.id}
              icon={item.icon}
              label={item.label}
              active={currentScreen === item.id && !isMoreMenuOpen}
              onClick={() => { setCurrentScreen(item.id); setIsMoreMenuOpen(false); }}
              isDarkMode={isDarkMode}
              activeColor={role === 'SELLER' ? brandColor : undefined}
            />
          ))}

          {/* Center Plus Button (3rd position) */}
          {getActiveMenu().filter((item: any) => !item.hidden).length > 4 && (
            <NavbarMobileItem 
              icon={isMoreMenuOpen ? X : Plus}
              label="Mais"
              active={isMoreMenuOpen}
              onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
              isDarkMode={isDarkMode}
              activeColor={role === 'SELLER' ? brandColor : undefined}
            />
          )}

          {/* Next 2 items (3rd and 4th from data, which become 4th and 5th in UI) */}
          {getActiveMenu().filter((item: any) => !item.hidden).slice(2, 4).map((item: any) => (
            <NavbarMobileItem 
              key={item.id}
              icon={item.icon}
              label={item.label}
              active={currentScreen === item.id && !isMoreMenuOpen}
              onClick={() => { setCurrentScreen(item.id); setIsMoreMenuOpen(false); }}
              isDarkMode={isDarkMode}
              activeColor={role === 'SELLER' ? brandColor : undefined}
            />
          ))}
        </nav>
      
      <FaceLoginModal 
        isOpen={isFaceLoginOpen} 
        onClose={() => setIsFaceLoginOpen(false)} 
        onAuthSuccess={(user) => {
          setUserInfo(prev => ({ ...prev, ...user }));
          handleFinalLogin();
        }} 
      />

      <FaceRegistrationModal 
        isOpen={isFaceRegOpen} 
        onClose={() => setIsFaceRegOpen(false)} 
        userId="current-user"
        onComplete={() => {
          setIsFaceEnabled(true);
          alert('Biometria registada com sucesso!');
        }} 
      />
    </div>
    </ToastProvider>
  );
}
