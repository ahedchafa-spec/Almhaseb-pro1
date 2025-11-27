
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import POS from './components/POS';
import Inventory from './components/Inventory';
import Invoices from './components/Invoices';
import Debts from './components/Debts';
import Expenses from './components/Expenses';
import Reports from './components/Reports';
import AIAssistant from './components/AIAssistant';
import Settings from './components/Settings';
import Login from './components/Login';
import WhatsAppView from './components/WhatsAppView';
import TitleBar from './components/TitleBar'; // Import TitleBar
import { View, Product, Customer, Invoice, Expense, User } from './types';
import * as storage from './services/storageService';
import { Menu, X, Lock, User as UserIcon, MessageCircle } from 'lucide-react';

// Optional PIN Lock Screen component (Secondary security layer)
const PinLock = ({ onUnlock }: { onUnlock: () => void }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const security = storage.getSecurityConfig();

  const handlePin = (val: string) => {
    if (pin.length < 4) {
      const newPin = pin + val;
      setPin(newPin);
      if (newPin.length === 4) {
        if (newPin === security.pin) {
          onUnlock();
        } else {
          setError(true);
          setTimeout(() => { setPin(''); setError(false); }, 500);
        }
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/95 z-[70] flex flex-col items-center justify-center text-white backdrop-blur-sm top-8">
      <div className="mb-8 text-center">
        <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-700">
          <Lock className="w-8 h-8 text-emerald-400" />
        </div>
        <h2 className="text-xl font-bold">التطبيق مقفل</h2>
        <p className="text-slate-400 text-sm mt-1">أدخل رمز PIN للمتابعة</p>
      </div>
      <div className="flex gap-3 mb-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className={`w-3 h-3 rounded-full transition-colors ${i < pin.length ? (error ? 'bg-rose-500' : 'bg-emerald-500') : 'bg-slate-700'}`}></div>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-4 w-64 dir-ltr">
        {[1,2,3,4,5,6,7,8,9].map(n => (
          <button key={n} onClick={() => handlePin(n.toString())} className="h-16 rounded-xl bg-slate-800 hover:bg-slate-700 font-bold text-xl transition-colors border border-slate-700/50">{n}</button>
        ))}
        <div className="h-16"></div>
        <button onClick={() => handlePin('0')} className="h-16 rounded-xl bg-slate-800 hover:bg-slate-700 font-bold text-xl transition-colors border border-slate-700/50">0</button>
        <button onClick={() => setPin(prev => prev.slice(0,-1))} className="h-16 rounded-xl bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 font-bold text-sm transition-colors">مسح</button>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<View>(View.DASHBOARD);
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isPinLocked, setIsPinLocked] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  
  // Floating WhatsApp State
  const [isWhatsAppOpen, setWhatsAppOpen] = useState(false);

  // Initialize and Load Data
  useEffect(() => {
    storage.initializeData();
    
    // Check for logged in user (Async for Remote DB support)
    const initSession = async () => {
      const user = await storage.checkSession();
      setCurrentUser(user);
      
      // Check Secondary Security (PIN) only if user is logged in
      if (user) {
        const security = storage.getSecurityConfig();
        if (security.isEnabled) {
          setIsPinLocked(true);
        }
      }
    };
    initSession();
    
    // Initial data load
    refreshData();
  }, []);

  const refreshData = () => {
    setProducts(storage.getProducts());
    setCustomers(storage.getCustomers());
    setInvoices(storage.getInvoices());
    setExpenses(storage.getExpenses());
  };

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    setIsLoginModalOpen(false);
    refreshData();
    
    // Check PIN lock after login
    const security = storage.getSecurityConfig();
    if (security.isEnabled) {
      setIsPinLocked(true);
    }
  };

  const handleLogout = () => {
    storage.logout();
    setCurrentUser(null);
    setIsPinLocked(false);
    setSidebarOpen(false);
  };

  const handleInvoiceCreated = () => {
    refreshData();
    setCurrentView(View.INVOICES); 
  };
  
  const handleCustomerAdded = () => {
    refreshData();
  };

  const handleProductUpdate = (p: Product) => {
    const newProducts = products.map(prod => prod.id === p.id ? p : prod);
    storage.saveProducts(newProducts);
    refreshData();
  };

  const handleProductAdd = (p: Product) => {
    const newProducts = [...products, p];
    storage.saveProducts(newProducts);
    refreshData();
  };

  const handleProductDelete = (id: string) => {
    if(confirm('هل أنت متأكد من حذف المنتج؟')) {
      const newProducts = products.filter(p => p.id !== id);
      storage.saveProducts(newProducts);
      refreshData();
    }
  };

  const renderView = () => {
    switch (currentView) {
      case View.DASHBOARD:
        return <Dashboard invoices={invoices} products={products} customers={customers} onNavigate={setCurrentView} />;
      case View.POS:
        return <POS 
          products={products} 
          customers={customers} 
          onInvoiceCreated={handleInvoiceCreated} 
          onCustomerAdded={handleCustomerAdded}
        />;
      case View.INVENTORY:
        return <Inventory products={products} onAddProduct={handleProductAdd} onUpdateProduct={handleProductUpdate} onDeleteProduct={handleProductDelete} />;
      case View.INVOICES:
        return <Invoices invoices={invoices} />;
      case View.DEBTS:
        return <Debts customers={customers} invoices={invoices} />;
      case View.EXPENSES:
        return <Expenses expenses={expenses} onExpensesChange={refreshData} />;
      case View.REPORTS:
        return <Reports invoices={invoices} expenses={expenses} products={products} />;
      case View.WHATSAPP:
        return <WhatsAppView customers={customers} />;
      case View.AI_ASSISTANT:
        return <AIAssistant products={products} invoices={invoices} customers={customers} />;
      case View.SETTINGS:
        return <Settings />;
      default:
        return <div className="p-10">الصفحة قيد الإنشاء</div>;
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-900 font-sans overflow-hidden select-none">
      {/* 1. Custom Title Bar */}
      <TitleBar />

      {/* 2. Main App Area */}
      <div className="flex flex-1 overflow-hidden bg-slate-50 relative rounded-t-xl mx-1 mb-1 shadow-2xl border border-slate-800">
        
        {/* Optional Login Modal */}
        {isLoginModalOpen && (
          <Login 
            onLoginSuccess={handleLoginSuccess} 
            onCancel={() => setIsLoginModalOpen(false)} 
          />
        )}

        {/* Secondary PIN Lock Overlay */}
        {isPinLocked && <PinLock onUnlock={() => setIsPinLocked(false)} />}

        {/* Floating WhatsApp Button */}
        {!isPinLocked && (
          <button
            onClick={() => setWhatsAppOpen(true)}
            className="fixed bottom-6 left-6 z-40 p-3 bg-[#25D366] text-white rounded-full shadow-2xl hover:bg-[#128C7E] hover:scale-110 transition-all duration-300 group"
            title="وتساب ويب"
          >
            <MessageCircle className="w-6 h-6" />
            <span className="absolute left-full ml-2 top-1/2 -translate-y-1/2 bg-slate-800 text-white text-xs font-bold px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
              واتساب
            </span>
          </button>
        )}

        {/* Floating WhatsApp Modal/Overlay */}
        {isWhatsAppOpen && (
          <div className="fixed inset-0 z-[60] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in duration-200">
             {/* Backdrop click to close */}
             <div className="absolute inset-0" onClick={() => setWhatsAppOpen(false)}></div>
             
             <div className="bg-white w-full max-w-2xl h-[600px] rounded-3xl shadow-2xl relative overflow-hidden flex flex-col animate-in slide-in-from-bottom-5 duration-300">
                <WhatsAppView 
                  customers={customers} 
                  isEmbedded={true} 
                  onClose={() => setWhatsAppOpen(false)} 
                />
             </div>
          </div>
        )}

        {/* Mobile Sidebar Overlay */}
        {isSidebarOpen && (
          <div className="fixed inset-0 bg-slate-900/50 z-40 backdrop-blur-sm md:hidden" onClick={() => setSidebarOpen(false)}></div>
        )}
        
        {/* Sidebar Container */}
        <div className={`fixed inset-y-0 right-0 z-50 w-64 bg-slate-900 transform transition-transform duration-300 ease-in-out shadow-2xl md:relative md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="absolute top-4 left-4 md:hidden">
             <button onClick={() => setSidebarOpen(false)} className="text-slate-400 hover:text-white">
               <X className="w-6 h-6" />
             </button>
          </div>
          <Sidebar 
            currentView={currentView} 
            onChangeView={(v) => { setCurrentView(v); setSidebarOpen(false); }} 
            onLock={() => setIsPinLocked(true)}
            user={currentUser}
            onLogout={handleLogout}
            onLogin={() => setIsLoginModalOpen(true)}
          />
        </div>

        <main className="flex-1 flex flex-col h-full overflow-hidden relative w-full bg-slate-50/50">
          {/* Internal Header for View Title */}
          <div className="bg-white/80 backdrop-blur-sm px-6 py-3 flex items-center justify-between border-b border-slate-200 no-print shadow-sm z-20 sticky top-0">
            <div className="flex items-center gap-4">
              <button onClick={() => setSidebarOpen(true)} className="md:hidden p-2 -mr-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                <Menu className="w-6 h-6" />
              </button>
              <h1 className="font-bold text-lg text-slate-800">
                {currentView === View.DASHBOARD ? 'المحاسب الذكي' : 
                 currentView === View.POS ? 'نقطة البيع' :
                 currentView === View.INVENTORY ? 'المخزون' :
                 currentView === View.INVOICES ? 'الفواتير' :
                 currentView === View.DEBTS ? 'الديون' :
                 currentView === View.EXPENSES ? 'المصاريف' :
                 currentView === View.REPORTS ? 'التقارير' :
                 currentView === View.WHATSAPP ? 'واتساب ويب' :
                 currentView === View.AI_ASSISTANT ? 'المساعد الذكي' : 
                 currentView === View.SETTINGS ? 'الإعدادات' : 'التطبيق'}
              </h1>
            </div>
            <div className="flex items-center gap-2">
               {currentUser ? (
                 <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-sm border border-emerald-200">
                    {currentUser.name.charAt(0)}
                 </div>
               ) : (
                 <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center">
                    <UserIcon className="w-4 h-4" />
                 </div>
               )}
            </div>
          </div>

          {/* View Content */}
          <div className="flex-1 overflow-hidden relative">
            {renderView()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
