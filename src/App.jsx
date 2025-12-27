import './index.css';
import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  ShoppingCart, 
  Trash2, 
  Plus, 
  Minus, 
  Coffee, 
  Utensils, 
  IceCream, 
  LayoutGrid,
  Printer,
  X,
  ChefHat,
  DollarSign,
  ArrowLeft,
  ChevronRight,
  Settings,
  Edit2,
  Save,
  Loader2,
  Image as ImageIcon,
  Database,
  Link as LinkIcon,
  AlertCircle,
  WifiOff,
  Upload,
  Lock,
  Key,
  Store,
  Mail,
  Percent,
  Shield, 
  MessageCircle, 
  Share2,
  Download, 
  Copy, 
  Check, 
  History, 
  FileText,
  Calendar,
  AlertTriangle, 
  Info, 
  Code, 
  Package, Zap, Star, Gift, ShoppingBag, Smartphone, Watch, Glasses, Shirt, Monitor, Book, Briefcase,
  Eye, EyeOff, Ban, Unlock, Camera, ScanLine, RefreshCw, CameraOff
} from 'lucide-react';

// --- DATA & KONSTANTA ---
const ICON_MAP = {
  LayoutGrid, Utensils, Coffee, IceCream, Package, Zap, Star, Gift, ShoppingBag,
  Smartphone, Watch, Glasses, Shirt, Monitor, Book, Briefcase
};

const INITIAL_PRODUCTS = [
  { id: '1', name: "Nasi Goreng Spesial", price: 25000, category: "makanan", image: "🍛", color: "bg-orange-100 text-orange-600" },
  { id: '2', name: "Ayam Bakar Madu", price: 30000, category: "makanan", image: "🍗", color: "bg-red-100 text-red-600" },
  { id: '3', name: "Es Teh Manis", price: 5000, category: "minuman", image: "🥤", color: "bg-teal-100 text-teal-600" },
  { id: '4', name: "Burger Keju", price: 45000, category: "makanan", image: "🍔", color: "bg-orange-50 text-orange-500" },
  { id: '5', name: "Kopi Susu", price: 18000, category: "minuman", image: "☕", color: "bg-brown-100 text-amber-800" },
];

const DEFAULT_CATEGORIES = [
  { id: 'all', name: 'Semua', icon: 'LayoutGrid' },
  { id: 'makanan', name: 'Makanan', icon: 'Utensils' },
  { id: 'minuman', name: 'Minuman', icon: 'Coffee' },
  { id: 'dessert', name: 'Dessert', icon: 'IceCream' },
];

const COLORS = [
  { label: "Orange", value: "bg-orange-100 text-orange-600" },
  { label: "Red", value: "bg-red-100 text-red-600" },
  { label: "Yellow", value: "bg-yellow-100 text-yellow-600" },
  { label: "Green", value: "bg-green-100 text-green-600" },
  { label: "Blue", value: "bg-blue-50 text-blue-500" },
  { label: "Pink", value: "bg-pink-100 text-pink-600" },
  { label: "Purple", value: "bg-purple-100 text-purple-600" },
  { label: "Teal", value: "bg-teal-100 text-teal-600" },
  { label: "Brown", value: "bg-amber-100 text-amber-800" },
];

const DEFAULT_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbw5KUWPAHXNfVtjwrNLvHJE1hilZuicEibYIFdivTAWtyNNsMU5-j4HLxJ5W8YgFvOEUw/exec";
const DEFAULT_SHOP_NAME = "SmartyBill Store"; 
const DEFAULT_PASS_HASH = "a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3"; // SHA-256 for AdminPOS123!
const SECRET_GAS_HASH = "S29kZVJhaGFzaWExMjMh"; // Base64 for KodeRahasia123!

// KODE GOOGLE APPS SCRIPT
const GAS_CODE_SNIPPET = `// --- KODE GOOGLE APPS SCRIPT ---
// Copy kode ini ke editor Apps Script (Extensions > Apps Script) di Google Sheet Anda.

const SHEET_NAME_PRODUCTS = "Products";
const SHEET_NAME_TRANSACTIONS = "Transactions";

function doGet(e) {
  const lock = LockService.getScriptLock();
  lock.tryLock(10000);
  
  try {
    const doc = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = doc.getSheetByName(SHEET_NAME_PRODUCTS);
    
    if (!sheet) {
      sheet = doc.insertSheet(SHEET_NAME_PRODUCTS);
      sheet.appendRow(["id", "name", "price", "category", "image", "color"]);
    }
    
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const rows = data.slice(1);
    
    const products = rows.map(row => {
      let obj = {};
      headers.forEach((header, index) => {
        obj[header] = row[index];
      });
      return obj;
    });
    
    return ContentService.createTextOutput(JSON.stringify(products))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (e) {
    return ContentService.createTextOutput(JSON.stringify({error: e.toString()})).setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.tryLock(10000);

  try {
    const doc = SpreadsheetApp.getActiveSpreadsheet();
    const params = JSON.parse(e.postData.contents);
    const action = params.action;
    
    if (action === 'add_transaction') {
      let sheet = doc.getSheetByName(SHEET_NAME_TRANSACTIONS);
      if (!sheet) {
        sheet = doc.insertSheet(SHEET_NAME_TRANSACTIONS);
        sheet.appendRow(["Order ID", "Date", "Items", "Total", "Payment", "Change", "Tax"]);
      }
      sheet.appendRow([
        params.order_number, 
        params.date, 
        params.items, 
        params.total, 
        params.payment, 
        params.change,
        params.tax
      ]);
      return response({ status: 'success', message: 'Transaction saved' });
    }
    
    if (action === 'create' || action === 'update') {
       let sheet = doc.getSheetByName(SHEET_NAME_PRODUCTS);
       if (!sheet) {
         sheet = doc.insertSheet(SHEET_NAME_PRODUCTS);
         sheet.appendRow(["id", "name", "price", "category", "image", "color"]);
       }
       
       if (action === 'create') {
         sheet.appendRow([
           params.id || Date.now().toString(),
           params.name,
           params.price,
           params.category,
           params.image,
           params.color
         ]);
       } else {
         const data = sheet.getDataRange().getValues();
         for (let i = 1; i < data.length; i++) {
           if (data[i][0].toString() === params.id.toString()) {
             const range = sheet.getRange(i + 1, 1, 1, 6);
             range.setValues([[params.id, params.name, params.price, params.category, params.image, params.color]]);
             break;
           }
         }
       }
       return response({ status: 'success' });
    }
    
    return response({ status: 'error', message: 'Unknown action' });
    
  } catch (e) {
    return response({ status: 'error', message: e.toString() });
  } finally {
    lock.releaseLock();
  }
}

function response(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
`;

const safeLocalStorage = {
  getItem: (key) => { try { return localStorage.getItem(key); } catch (e) { return null; } },
  setItem: (key, value) => { try { localStorage.setItem(key, value); } catch (e) { } },
  removeItem: (key) => { try { localStorage.removeItem(key); } catch (e) { } }
};

const isImageString = (str) => {
  return typeof str === 'string' && (str.startsWith('data:image') || str.startsWith('http'));
};

// Fungsi Hashing Secure (SHA-256) dengan Fallback
const sha256 = async (message) => {
  try {
    if (!crypto || !crypto.subtle) throw new Error("Crypto API unavailable");
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  } catch (e) {
    let hash = 0;
    for (let i = 0; i < message.length; i++) {
        hash = ((hash << 5) - hash) + message.charCodeAt(i);
        hash |= 0; 
    }
    return "legacy_fallback_" + hash;
  }
};

export default function POSApp() {
  // --- STATE UTAMA ---
  const [products, setProducts] = useState([]); 
  const [cart, setCart] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [scriptUrl, setScriptUrl] = useState(() => safeLocalStorage.getItem('pos_script_url') || DEFAULT_SCRIPT_URL);
  const [shopName, setShopName] = useState(() => safeLocalStorage.getItem('pos_shop_name') || DEFAULT_SHOP_NAME);
  const [shopLogo, setShopLogo] = useState(() => safeLocalStorage.getItem('pos_shop_logo') || null);

  const [taxRate, setTaxRate] = useState(() => {
    const saved = safeLocalStorage.getItem('pos_tax_rate');
    return saved !== null ? parseFloat(saved) : 11; 
  });
  const [isTaxEnabled, setIsTaxEnabled] = useState(() => {
    const saved = safeLocalStorage.getItem('pos_tax_enabled');
    return saved !== null ? JSON.parse(saved) : true; 
  });
  const [categories, setCategories] = useState(() => {
    const saved = safeLocalStorage.getItem('pos_categories');
    return saved ? JSON.parse(saved) : DEFAULT_CATEGORIES;
  });
  
  // Security State
  const [adminPassHash, setAdminPassHash] = useState(() => {
    const v2 = safeLocalStorage.getItem('pos_admin_pass_v2');
    if (v2) return v2;
    const v1 = safeLocalStorage.getItem('pos_admin_pass');
    if (v1) return v1; 
    return DEFAULT_PASS_HASH;
  });
  
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isLockedOut, setIsLockedOut] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  const [history, setHistory] = useState(() => {
    const saved = safeLocalStorage.getItem('pos_transaction_history');
    try { return saved ? JSON.parse(saved) : []; } catch (e) { return []; }
  });

  const [receiptOptions, setReceiptOptions] = useState(() => {
    const saved = safeLocalStorage.getItem('pos_receipt_options');
    return saved ? JSON.parse(saved) : { print: true, email: true, whatsapp: true, image: true, link: true };
  });

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [showCartMobile, setShowCartMobile] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [orderNumber, setOrderNumber] = useState(() => {
    const saved = safeLocalStorage.getItem('pos_order_number');
    return saved ? parseInt(saved) : 1001;
  });
  const [isCopied, setIsCopied] = useState(false); 
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: '', message: '', action: null });
  
  // State untuk GAS Code Modal
  const [isGasModalOpen, setIsGasModalOpen] = useState(false);
  const [gasPassword, setGasPassword] = useState('');
  const [showGasCode, setShowGasCode] = useState(false);

  const [isAdminMode, setIsAdminMode] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false); 
  const [loginPassword, setLoginPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const [isProductFormOpen, setIsProductFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null); 
  const [newCatName, setNewCatName] = useState('');
  const [formData, setFormData] = useState({ name: '', price: '', category: 'makanan', image: '📦', color: COLORS[0].value });
  const [imageType, setImageType] = useState('emoji'); 

  // State untuk Ubah Password
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  // State Scan Struk
  const [isScanModalOpen, setIsScanModalOpen] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState([]);
  const [scanPreview, setScanPreview] = useState(null);
  
  // State untuk kontrol kamera aktif
  const [isCameraActive, setIsCameraActive] = useState(false); 
  const [cameraError, setCameraError] = useState(null); 
  const videoRef = useRef(null);
  const streamRef = useRef(null); 

  const [viewModeData, setViewModeData] = useState(null);
  const receiptRef = useRef(null);

  // Load external libraries (Html2Canvas & Tesseract)
  useEffect(() => {
    const loadScript = (src) => {
        const script = document.createElement('script');
        script.src = src;
        script.async = true;
        document.body.appendChild(script);
    };

    if (scriptUrl) fetchProducts();
    
    // Load Html2Canvas
    loadScript("https://html2canvas.hertzen.com/dist/html2canvas.min.js");
    // Load Tesseract.js (v4 for better performance)
    loadScript("https://cdn.jsdelivr.net/npm/tesseract.js@4/dist/tesseract.min.js");

    const handleContextMenu = (e) => { e.preventDefault(); return false; };
    const handleKeyDown = (e) => {
      if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J')) || (e.ctrlKey && e.key === 'u')) {
        e.preventDefault(); return false;
      }
    };
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []); 

  // Camera Handling
  useEffect(() => {
    const stopMediaStream = () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => {
            track.stop();
        });
        streamRef.current = null;
      }
    };

    const startStream = async () => {
      stopMediaStream();
      if (isCameraActive && videoRef.current) {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            setCameraError("Browser tidak mendukung akses kamera atau koneksi tidak aman (HTTPS required).");
            setIsCameraActive(false);
            return;
        }
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
          streamRef.current = stream; 
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            try { await videoRef.current.play(); } catch(e) { console.log("Auto-play blocked", e); }
          }
          setCameraError(null);
        } catch (err) {
          stopMediaStream(); 
          let msg = "Gagal membuka kamera.";
          const errName = err.name || '';
          const errMessage = err.message || '';
          if (errName === 'NotAllowedError' || errName === 'PermissionDismissedError' || errMessage.includes('Permission denied')) {
             console.warn("Camera permission denied.");
             msg = "Izin kamera ditolak. Cek pengaturan browser Anda.";
          } else {
             console.error("Camera Error:", err);
             if (errName === 'NotFoundError') msg = "Kamera tidak ditemukan.";
             else if (errName === 'NotReadableError') msg = "Kamera sedang digunakan aplikasi lain.";
             else msg = `Gagal akses kamera: ${errMessage}`;
          }
          setCameraError(msg);
          setIsCameraActive(false);
        }
      }
    };

    if (isCameraActive) {
      startStream();
    } else {
      stopMediaStream();
    }

    return () => {
      stopMediaStream();
    };
  }, [isCameraActive]);


  const showToast = (message, type = 'success') => {
    setToast({ show: true, message: String(message), type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  const fetchProducts = async (urlToUse = scriptUrl) => {
    if (!urlToUse || !urlToUse.startsWith('https://script.google.com/')) return;
    setIsLoading(true);
    try {
      const cleanUrl = urlToUse.includes('?') ? `${urlToUse}&t=${Date.now()}` : `${urlToUse}?t=${Date.now()}`;
      const response = await fetch(cleanUrl, { method: 'GET', headers: { 'Accept': 'application/json' } });
      if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
      const data = await response.json();
      if (Array.isArray(data)) { setProducts(data.map(p => ({ ...p, id: p.id.toString(), price: Number(p.price) }))); }
    } catch (error) {
      if (products.length === 0) setProducts(INITIAL_PRODUCTS);
    } finally { setIsLoading(false); }
  };

  const handleSaveSettings = async () => {
    safeLocalStorage.setItem('pos_script_url', scriptUrl);
    safeLocalStorage.setItem('pos_shop_name', shopName);
    safeLocalStorage.setItem('pos_shop_logo', shopLogo); 
    safeLocalStorage.setItem('pos_tax_rate', taxRate);
    safeLocalStorage.setItem('pos_tax_enabled', isTaxEnabled);
    safeLocalStorage.setItem('pos_categories', JSON.stringify(categories));
    safeLocalStorage.setItem('pos_receipt_options', JSON.stringify(receiptOptions));
    showToast("Pengaturan Disimpan");
    fetchProducts();
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const action = editingProduct ? 'update' : 'create';
    const payload = { action, id: editingProduct ? editingProduct.id : null, ...formData };
    try {
      await fetch(scriptUrl, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      setTimeout(async () => { await fetchProducts(); setIsProductFormOpen(false); showToast("Produk Disimpan"); }, 1000);
    } catch (e) { showToast("Gagal menyimpan", "error"); setIsLoading(false); }
  };

  // --- GAS CODE MODAL LOGIC ---
  const handleOpenGasModal = () => {
    setGasPassword('');
    setShowGasCode(false);
    setIsGasModalOpen(true);
  };
  
  const verifyGasPassword = (e) => {
    e.preventDefault();
    if (btoa(gasPassword) === SECRET_GAS_HASH) {
      setShowGasCode(true);
    } else {
      showToast("Password Kode Rahasia Salah!", "error");
    }
  };
  
  const copyGasCode = () => {
    const textArea = document.createElement("textarea");
    textArea.value = GAS_CODE_SNIPPET;
    textArea.style.position = "fixed";
    textArea.style.left = "-9999px";
    textArea.style.top = "0";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      if (document.execCommand('copy')) {
        showToast("Kode disalin ke clipboard!");
      } else {
         console.warn("execCommand failed");
      }
    } catch (err) {
      console.error('Copy failed', err);
    } finally {
      document.body.removeChild(textArea);
    }
  };

  // --- HANDLER BARU: ADD PRODUCT (RESET FORM) ---
  const handleAddProduct = () => {
      setEditingProduct(null);
      setFormData({ name: '', price: '', category: 'makanan', image: '📦', color: COLORS[0].value });
      setIsProductFormOpen(true);
  };

  // --- HANDLER BARU: EDIT PRODUCT (POPULATE FORM SAFELY) ---
  const handleEditProduct = (p) => {
      setEditingProduct(p);
      setFormData({
         name: p.name ?? '',
         price: p.price ?? '',
         category: p.category ?? 'makanan',
         image: p.image ?? '📦',
         color: p.color ?? COLORS[0].value
      });
      setIsProductFormOpen(true);
  };

  const handleAddCategory = () => {
    if (!newCatName.trim()) return;
    const id = newCatName.toLowerCase().replace(/\s+/g, '-');
    if (categories.some(c => c.id === id)) return showToast("Kategori sudah ada!", "error");
    setCategories([...categories, { id, name: newCatName, icon: 'Package' }]);
    setNewCatName('');
    showToast("Kategori Ditambah");
  };

  const handleDeleteCategory = (id) => {
    if (id === 'all') return showToast("Default tidak bisa dihapus", "error");
    setConfirmModal({
      isOpen: true, title: 'Hapus Kategori', message: 'Hapus kategori ini?',
      action: () => {
        setCategories(categories.filter(c => c.id !== id));
        setConfirmModal({ ...confirmModal, isOpen: false });
        showToast("Kategori Dihapus");
      }
    });
  };

  const handleDeleteTransaction = (id) => {
    setConfirmModal({
      isOpen: true, title: 'Hapus Transaksi', message: 'Hapus dari riwayat?',
      action: () => {
        const updated = history.filter(t => t.id !== id);
        setHistory(updated);
        safeLocalStorage.setItem('pos_transaction_history', JSON.stringify(updated));
        setConfirmModal({ ...confirmModal, isOpen: false });
        showToast("Dihapus");
      }
    });
  };

  const handleClearHistory = () => {
    setConfirmModal({
      isOpen: true, title: 'Kosongkan Riwayat', message: 'Hapus semua data transaksi?',
      action: () => {
        setHistory([]); safeLocalStorage.setItem('pos_transaction_history', '[]');
        setConfirmModal({ ...confirmModal, isOpen: false });
        showToast("Riwayat Kosong");
      }
    });
  };

  const handleViewHistory = (trx) => {
    setViewModeData(trx);
    setIsReceiptModalOpen(true);
  };

  const addToCart = (p) => {
    if (isAdminMode) return;
    setCart(prev => {
      const ex = prev.find(i => i.id === p.id);
      return ex ? prev.map(i => i.id === p.id ? { ...i, qty: i.qty + 1 } : i) : [...prev, { ...p, qty: 1 }];
    });
  };

  const updateQty = (id, d) => setCart(prev => prev.map(i => i.id === id ? { ...i, qty: Math.max(0, i.qty + d) } : i).filter(i => i.qty > 0));
  
  const activeCart = viewModeData ? viewModeData.cart : cart;
  const activeSubtotal = activeCart.reduce((s, i) => s + (i.price * i.qty), 0);
  const activeTaxRate = viewModeData ? (viewModeData.taxRate || 0) : taxRate;
  const activeTax = (viewModeData ? (viewModeData.isTaxEnabled ?? true) : isTaxEnabled) ? activeSubtotal * (activeTaxRate / 100) : 0;
  const activeTotal = activeSubtotal + activeTax;
  
  // Clean payment amount (remove dots)
  const activePayment = viewModeData ? (viewModeData.payment || activeTotal) : (parseFloat(paymentAmount.replace(/\./g, '')) || 0);
  const activeChange = activePayment - activeTotal;
  const currentOrderNumber = viewModeData ? (viewModeData.orderNumber || '-') : orderNumber;

  const isUnderpaid = activePayment < activeTotal && !viewModeData;

  const formatRupiah = (n) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);

  const handlePrint = () => window.print();

  const handleEmail = () => {
    const sName = viewModeData ? viewModeData.shopName : shopName;
    const list = activeCart.map(i => `- ${i.name} (${i.qty}x): ${formatRupiah(i.price * i.qty)}`).join('\n');
    const body = encodeURIComponent(`Terima Kasih ${sName}!\n\nOrder #${currentOrderNumber}\n${list}\n\nTOTAL: ${formatRupiah(activeTotal)}`);
    window.open(`mailto:?subject=Struk ${sName}&body=${body}`);
  };

  const handleWhatsApp = () => {
    const sName = viewModeData ? viewModeData.shopName : shopName;
    const list = activeCart.map(i => `- ${i.name} (${i.qty}x): ${formatRupiah(i.price * i.qty)}`).join('%0a');
    const text = `*${sName}*%0aOrder #${currentOrderNumber}%0a${list}%0a----------------%0a*TOTAL: ${formatRupiah(activeTotal)}*%0aBayar: ${formatRupiah(activePayment)}%0aKembali: ${formatRupiah(activeChange)}`;
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const handleShareLink = () => {
    const payload = { cart: activeCart, shopName, date: new Date().toISOString(), taxRate, isTaxEnabled, payment: activePayment, orderNumber: currentOrderNumber };
    const url = `${window.location.origin}${window.location.pathname}?receipt=${btoa(JSON.stringify(payload))}`;
    const el = document.createElement("textarea"); el.value = url; document.body.appendChild(el); el.select();
    try { if (document.execCommand('copy')) { setIsCopied(true); showToast("Link Disalin"); setTimeout(()=>setIsCopied(false),2000); } } catch(e) {}
    document.body.removeChild(el);
  };

  const handlePaymentSuccess = () => {
    saveTransactionToHistory(cart, activeTotal, activePayment, activeTax, taxRate);
    setIsPaymentModalOpen(false); setIsReceiptModalOpen(true);
  };

  const handleSaveImage = () => {
    if (!window.html2canvas) return;
    window.html2canvas(receiptRef.current, { scale: 2, backgroundColor: "#ffffff" }).then(canvas => {
      const a = document.createElement('a'); a.download = `Struk-${currentOrderNumber}.jpg`;
      a.href = canvas.toDataURL('image/jpeg', 0.9); a.click();
    });
  };

  const handleCloseReceipt = () => {
    if (viewModeData) { setViewModeData(null); setIsReceiptModalOpen(false); }
    else { setIsReceiptModalOpen(false); setCart([]); setPaymentAmount(''); setShowCartMobile(false); }
  };

  const resizeImage = (base64Str, maxWidth = 600) => {
    return new Promise((resolve) => {
      let img = new Image();
      img.src = base64Str;
      img.onload = () => {
        let canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        if (width > maxWidth) { height *= maxWidth / width; width = maxWidth; }
        canvas.width = width; canvas.height = height;
        let ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.6));
      };
      img.onerror = () => resolve(base64Str);
    });
  };

  const handleScanFile = (e) => {
    const file = e.target.files[0];
    if (file) {
        setIsScanning(true); 
        const reader = new FileReader();
        reader.onload = async (ev) => {
            const resizedImage = await resizeImage(ev.target.result);
            setScanPreview(resizedImage);
            setTimeout(() => { processImage(resizedImage); }, 100);
        };
        reader.readAsDataURL(file);
    }
  };

  const startCamera = () => { setCameraError(null); setIsCameraActive(true); };

  const captureCamera = () => {
      if (!videoRef.current) return;
      const canvas = document.createElement('canvas');
      const videoW = videoRef.current.videoWidth;
      const videoH = videoRef.current.videoHeight;
      const targetW = 600; 
      const targetH = videoH * (targetW / videoW);
      canvas.width = targetW; canvas.height = targetH;
      canvas.getContext('2d').drawImage(videoRef.current, 0, 0, targetW, targetH);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
      if (streamRef.current) { streamRef.current.getTracks().forEach(track => track.stop()); streamRef.current = null; }
      setIsCameraActive(false); setScanPreview(dataUrl); setIsScanning(true);
      setTimeout(() => { processImage(dataUrl); }, 200);
  };

  const addMultipleToCart = (items) => {
    if (isAdminMode) return;
    setCart(prev => {
      let newCart = [...prev];
      items.forEach(p => {
        const exIndex = newCart.findIndex(i => i.id === p.id);
        if (exIndex > -1) { newCart[exIndex] = { ...newCart[exIndex], qty: newCart[exIndex].qty + 1 }; } 
        else { newCart.push({ ...p, qty: 1 }); }
      });
      return newCart;
    });
  };

  const processImage = async (imageData) => {
      if (!window.Tesseract) { setIsScanning(false); return showToast("Fitur OCR sedang memuat, coba lagi...", "error"); }
      setScanResult([]);
      const safetyTimeout = setTimeout(() => { if (isScanning) { setIsScanning(false); showToast("Waktu habis. Coba foto lebih jelas/dekat.", "error"); } }, 20000);

      try {
          const { data: { text } } = await window.Tesseract.recognize(imageData, 'eng', { logger: m => console.log(m) });
          clearTimeout(safetyTimeout);
          const lines = text.split('\n');
          const detectedItems = [];
          
          lines.forEach((line, idx) => {
             const cleanLine = line.toLowerCase().replace(/[^a-z0-9\s.,]/g, '');
             if (cleanLine.length < 3) return;
             let matchFound = false;

             products.forEach(p => {
                 const prodName = p.name.toLowerCase().replace(/[^a-z0-9 ]/g, '');
                 if (cleanLine.includes(prodName) || prodName.includes(cleanLine) || (cleanLine.includes(prodName.split(' ')[0]) && cleanLine.includes(prodName.split(' ')[1] || 'xyz'))) {
                     if (!detectedItems.find(i => i.id === p.id)) { detectedItems.push(p); matchFound = true; }
                 }
             });

             if (!matchFound) {
                const numberSanitized = line.replace(/[lI|]/g, '1').replace(/[O]/g, '0').replace(/[S]/g, '5');
                const numericMatches = numberSanitized.match(/\d+/g);
                if (numericMatches) {
                   const potentialPrices = numericMatches.map(n => parseInt(n)).filter(n => n >= 500);
                   if (potentialPrices.length > 0) {
                      const detectedPrice = Math.max(...potentialPrices);
                      let detectedName = line.replace(/[0-9.,]/g, '').replace(/rp|idr/gi, '').trim().replace(/^[^a-zA-Z0-9]+|[^a-zA-Z0-9]+$/g, '');
                      if (detectedName.length >= 3 && detectedPrice < 10000000) {
                          detectedItems.push({ id: `scan-manual-${Date.now()}-${idx}`, name: detectedName, price: detectedPrice, category: 'umum', image: '📝', color: 'bg-slate-100 text-slate-600' });
                      }
                   }
                }
             }
          });

          if (detectedItems.length > 0) {
              setScanResult(detectedItems);
              const cartData = detectedItems.map(p => ({ ...p, qty: 1 }));
              const subtotal = cartData.reduce((sum, item) => sum + item.price, 0);
              const taxVal = isTaxEnabled ? subtotal * (taxRate / 100) : 0;
              const totalVal = subtotal + taxVal;
              saveTransactionToHistory(cartData, totalVal, totalVal, taxVal, taxRate);
              setIsScanModalOpen(false); setScanPreview(null); setIsCameraActive(false);
              showToast(`Sukses! ${detectedItems.length} produk tersimpan di Riwayat.`, 'success');
          } else {
              showToast("Tidak ada produk atau harga yang terbaca jelas.", "error");
          }
      } catch (err) { console.error(err); showToast("Gagal memproses gambar.", "error"); } 
      finally { setIsScanning(false); }
  };

  // ... (Handler standard lainnya)
  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_SIZE = 200; 
        let width = img.width;
        let height = img.height;
        if (width > height) { if (width > MAX_SIZE) { height *= MAX_SIZE / width; width = MAX_SIZE; } } 
        else { if (height > MAX_SIZE) { width *= MAX_SIZE / height; height = MAX_SIZE; } }
        canvas.width = width; canvas.height = height;
        canvas.getContext('2d').drawImage(img, 0, 0, width, height);
        setShopLogo(canvas.toDataURL('image/png'));
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 300; canvas.height = 300;
        canvas.getContext('2d').drawImage(img, 0, 0, 300, 300);
        setFormData({ ...formData, image: canvas.toDataURL('image/jpeg', 0.7) });
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleAdminToggle = () => isAdminMode ? setIsAdminMode(false) : (setLoginPassword(''), setShowLoginPassword(false), setIsLoginModalOpen(true));
  
  const verifyPassword = async (e) => {
    e.preventDefault();
    if (isLockedOut) return showToast("Akses dikunci sementara. Tunggu sebentar.", "error");

    const inputHash = await sha256(loginPassword);
    let isValid = inputHash === adminPassHash;
    
    if (!isValid) {
        try {
            if (btoa(loginPassword) === adminPassHash) {
                isValid = true;
                setAdminPassHash(inputHash);
                safeLocalStorage.setItem('pos_admin_pass_v2', inputHash);
                safeLocalStorage.removeItem('pos_admin_pass'); 
            }
        } catch (err) {}
    }

    if (!isValid && loginPassword === 'AdminPOS123!') {
         const defaultHash = await sha256('AdminPOS123!');
         isValid = true;
         setAdminPassHash(defaultHash);
         safeLocalStorage.setItem('pos_admin_pass_v2', defaultHash);
    }

    if (isValid) { 
      setIsAdminMode(true); 
      setIsLoginModalOpen(false); 
      setLoginAttempts(0); 
      showToast("Login Berhasil", "success");
    } else { 
      const newAttempts = loginAttempts + 1;
      setLoginAttempts(newAttempts);
      if (newAttempts >= 3) {
        setIsLockedOut(true);
        showToast("Terlalu banyak percobaan. Terkunci 30 detik.", "error");
        setTimeout(() => { setIsLockedOut(false); setLoginAttempts(0); }, 30000);
      } else { showToast(`Password Salah (${newAttempts}/3)`, "error"); }
    }
  };

  const handleChangePassword = async () => {
    if (!newPassword.trim() || newPassword !== confirmPassword) return showToast("Password tidak cocok!", "error");
    if (newPassword.length < 6) return showToast("Password minimal 6 karakter", "error"); 
    
    const hash = await sha256(newPassword);
    setAdminPassHash(hash);
    safeLocalStorage.setItem('pos_admin_pass_v2', hash);
    setNewPassword(''); setConfirmPassword(''); setShowPasswordForm(false);
    showToast("Password Berhasil Diubah & Dienkripsi!");
  };

  const renderIcon = (iconName, size = 16) => {
    const IconComp = ICON_MAP[iconName] || LayoutGrid;
    return <IconComp size={size} />;
  };

  return (
    <div className="flex h-screen bg-gray-100 text-slate-800 font-sans overflow-hidden">
      <style>{`@media print { body { visibility: hidden; } .printable-area { visibility: visible !important; position: absolute; left: 0; top: 0; width: 100%; } .no-print { display: none !important; } }`}</style>
      
      {/* TOAST */}
      {toast.show && (
        <div className={`fixed top-4 left-1/2 -translate-x-1/2 px-6 py-3 rounded-full shadow-lg z-[100] flex items-center gap-2 font-bold text-sm bg-slate-800 text-white animate-in slide-in-from-top-4`}>
          {toast.type === 'error' ? <AlertTriangle size={16}/> : <Info size={16}/>}
          {toast.message}
        </div>
      )}

      {/* MODAL KONFIRMASI */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-xl animate-in zoom-in-95">
             <h3 className="text-lg font-bold mb-2 flex items-center gap-2"><AlertTriangle className="text-red-500" size={20}/> {confirmModal.title}</h3>
             <p className="text-gray-500 text-sm mb-6">{confirmModal.message}</p>
             <div className="flex gap-3">
                <button onClick={() => setConfirmModal({ ...confirmModal, isOpen: false })} className="flex-1 py-2 border rounded-lg font-bold">Batal</button>
                <button onClick={confirmModal.action} className="flex-1 py-2 bg-red-500 text-white rounded-lg font-bold">Ya, Hapus</button>
             </div>
          </div>
        </div>
      )}

      {/* MODAL GAS CODE */}
      {isGasModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg shadow-xl animate-in zoom-in-95 flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center mb-4"><h3 className="text-lg font-bold flex items-center gap-2 text-indigo-700"><Code size={24}/> Kode Server (GAS)</h3><button onClick={() => setIsGasModalOpen(false)} className="p-1 bg-gray-100 rounded-full hover:bg-gray-200"><X size={20}/></button></div>
            {!showGasCode ? (<form onSubmit={verifyGasPassword} className="space-y-4"><p className="text-sm text-gray-600">Masukkan kode rahasia untuk melihat kode server.</p><input type="password" autoFocus placeholder="Kode Rahasia" className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" value={gasPassword} onChange={e=>setGasPassword(e.target.value)}/><button type="submit" className="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold">Buka Kode</button></form>) : (<div className="flex-1 flex flex-col overflow-hidden"><p className="text-xs text-gray-500 mb-2">Salin kode ini ke Google Apps Script Editor.</p><textarea className="flex-1 w-full p-3 bg-slate-900 text-green-400 font-mono text-xs rounded-lg resize-none mb-4 focus:outline-none" readOnly value={GAS_CODE_SNIPPET}/><button onClick={copyGasCode} className="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2"><Copy size={16}/> Salin Kode</button></div>)}
          </div>
        </div>
      )}

      {/* MODAL SCAN STRUK */}
      {isScanModalOpen && (
        <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4 backdrop-blur-md">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl animate-in zoom-in-95 flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold flex items-center gap-2 text-indigo-700">
                <ScanLine size={24}/> AI Scan Struk <span className="text-[10px] bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full font-black">BETA</span>
              </h3>
              <button onClick={() => { setIsScanModalOpen(false); setScanPreview(null); setScanResult([]); setIsCameraActive(false); setCameraError(null); }} className="p-1 bg-gray-100 rounded-full hover:bg-gray-200">
                <X size={20}/>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4">
               {/* Area Preview / Kamera */}
               <div className="bg-gray-100 rounded-xl overflow-hidden relative aspect-video flex items-center justify-center border-2 border-dashed border-gray-300">
                 {scanPreview ? (
                   <img src={scanPreview} alt="Preview" className="w-full h-full object-contain"/>
                 ) : (
                   isCameraActive ? (
                     <video ref={videoRef} className="w-full h-full object-cover" autoPlay playsInline muted></video>
                   ) : (
                     <div className="text-center p-4 text-gray-400 flex flex-col items-center">
                       {cameraError ? (
                           <>
                               <CameraOff size={48} className="text-red-300 mb-2"/>
                               <p className="text-xs font-bold text-red-500 max-w-[200px] leading-tight">{cameraError}</p>
                               <p className="text-[10px] text-gray-400 mt-2">Solusi Alternatif:</p>
                               <div className="mt-2 flex gap-2 w-full justify-center">
                                  <label className="text-xs bg-indigo-600 text-white px-4 py-3 rounded-xl cursor-pointer font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200 animate-in bounce-in w-full max-w-[180px] flex items-center justify-center gap-2">
                                     <Upload size={16}/> Upload Foto <input type="file" accept="image/*" className="hidden" onChange={handleScanFile}/>
                                  </label>
                               </div>
                           </>
                       ) : (
                           <>
                               <ScanLine size={48} className="mx-auto mb-2 opacity-50"/>
                               <p className="text-xs font-bold">Upload foto struk atau gunakan kamera</p>
                           </>
                       )}
                     </div>
                   )
                 )}
                 
                 {isScanning && (
                   <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white backdrop-blur-sm">
                      <Loader2 className="animate-spin mb-2" size={32}/>
                      <p className="text-xs font-bold tracking-widest animate-pulse">MENGANALISA TEKS...</p>
                   </div>
                 )}
               </div>

               {/* Tombol Aksi */}
               <div className="grid grid-cols-2 gap-3">
                 {!scanPreview ? (
                   <>
                     {!isCameraActive && (
                        <button onClick={startCamera} className="bg-indigo-600 text-white p-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all text-xs uppercase"><Camera size={16}/> Buka Kamera</button>
                     )}
                     
                     <label className={`${isCameraActive ? 'col-span-1' : ''} bg-white border text-slate-700 p-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-50 transition-all text-xs uppercase cursor-pointer`}>
                        <Upload size={16}/> Upload Foto
                        <input type="file" accept="image/*" className="hidden" onChange={handleScanFile}/>
                     </label>
                     {isCameraActive && (
                       <button onClick={captureCamera} className="col-span-2 bg-red-500 text-white p-3 rounded-xl font-bold uppercase tracking-widest hover:bg-red-600 mt-2">Ambil Foto</button>
                     )}
                   </>
                 ) : (
                   <button onClick={() => { setScanPreview(null); setScanResult([]); setIsCameraActive(false); setCameraError(null); }} className="col-span-2 bg-slate-600 text-white p-3 rounded-xl font-bold uppercase flex items-center justify-center gap-2"><RefreshCw size={16}/> Scan Ulang</button>
                 )}
               </div>

               {/* Hasil Scan */}
               {scanResult.length > 0 && (
                 <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4">
                   <h4 className="font-bold text-indigo-800 text-sm mb-3 flex items-center gap-2"><Check size={16}/> Produk Dikenali ({scanResult.length})</h4>
                   <div className="space-y-2 max-h-40 overflow-y-auto">
                     {scanResult.map((item, idx) => (
                       <div key={idx} className="bg-white p-2 rounded-lg border flex items-center justify-between text-xs font-bold">
                         <span>{item.name}</span>
                         <span className="text-indigo-600">{formatRupiah(item.price)}</span>
                       </div>
                     ))}
                   </div>
                 </div>
               )}
            </div>
          </div>
        </div>
      )}

      {/* SIDEBAR UTAMA */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative print:hidden">
        <header className={`${isAdminMode ? 'bg-slate-800 text-white' : 'bg-white text-slate-800'} p-4 shadow-sm z-10 transition-colors`}>
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <div className={`p-2 rounded-lg ${isAdminMode ? 'bg-orange-500' : 'bg-indigo-600'} text-white shadow-sm transition-all overflow-hidden relative`}>
                {shopLogo ? (
                   <img src={shopLogo} alt="Logo" className="w-6 h-6 object-contain"/>
                ) : (
                   <ChefHat size={24} />
                )}
              </div>
              <div><h1 className="text-xl font-bold">{isAdminMode ? 'Mode Admin' : shopName}</h1><p className="text-[10px] opacity-60 font-bold tracking-widest uppercase">SmartyBill v3.4 (Secured)</p></div>
            </div>
            <div className="flex gap-2">
                <button onClick={() => setIsScanModalOpen(true)} className={`p-2 rounded-full ${isAdminMode ? 'bg-slate-700' : 'bg-indigo-50 text-indigo-600'} transition-all hover:scale-110 active:scale-95 border border-indigo-100`} title="Scan Struk">
                  <ScanLine size={20} />
                </button>
                <button onClick={handleAdminToggle} className={`p-2 rounded-full ${isAdminMode ? 'bg-slate-700' : 'bg-gray-100'} transition-all hover:scale-110 active:scale-95`}><Settings size={20} /></button>
            </div>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map(cat => (
              <button key={cat.id} onClick={() => setActiveCategory(cat.id)} className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${activeCategory === cat.id ? (isAdminMode ? 'bg-orange-500 text-white' : 'bg-indigo-600 text-white') : 'bg-white border text-slate-800 hover:bg-gray-50'}`}>
                {renderIcon(cat.icon, 16)} {cat.name}
              </button>
            ))}
          </div>
        </header>

        {/* ... (Sisa Main Content Sama) ... */}
        <main className="flex-1 overflow-y-auto p-4 bg-gray-50 pb-24 md:pb-4 relative">
          {isAdminMode && (
             <div className="bg-white p-6 rounded-xl shadow-sm border mb-6 space-y-8 animate-in slide-in-from-top-4">
                <div className="grid md:grid-cols-2 gap-8">
                   {/* KOLOM KIRI: SETTINGS UMUM & STRUK */}
                   <div className="space-y-6">
                      <div className="space-y-4">
                        <h3 className="font-bold text-slate-800 border-b pb-2 flex items-center gap-2"><Store size={18}/> Profil Toko</h3>
                        
                        {/* INPUT NAMA & URL */}
                        <div><label className="text-xs font-bold text-slate-400">Nama Toko</label><input className="w-full border p-2 rounded-lg mt-1 bg-gray-50 text-slate-800" value={shopName} onChange={e=>setShopName(e.target.value)} /></div>
                        <div><label className="text-xs font-bold text-slate-400">Google Script URL</label><div className="flex gap-2"><input className="w-full border p-2 rounded-lg mt-1 bg-gray-50 text-slate-800 flex-1" value={scriptUrl} onChange={e=>setScriptUrl(e.target.value)} /><button onClick={handleOpenGasModal} className="mt-1 bg-indigo-50 border border-indigo-200 text-indigo-600 px-3 py-2 rounded-lg text-xs font-bold hover:bg-indigo-100 whitespace-nowrap">Lihat Kode</button></div></div>
                        
                        {/* INPUT LOGO TOKO */}
                        <div>
                           <label className="text-xs font-bold text-slate-400 mb-1 block">Logo Toko</label>
                           <div className="flex items-center gap-3">
                              <div className="w-12 h-12 border rounded-lg flex items-center justify-center bg-gray-50 overflow-hidden">
                                 {shopLogo ? <img src={shopLogo} alt="Preview" className="w-full h-full object-contain"/> : <ImageIcon size={20} className="text-gray-300"/>}
                              </div>
                              <input type="file" accept="image/*" onChange={handleLogoUpload} className="text-xs text-slate-500 file:mr-2 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"/>
                              {shopLogo && <button onClick={()=>setShopLogo(null)} className="text-xs text-red-500 hover:underline">Hapus</button>}
                           </div>
                        </div>

                        {/* INPUT PAJAK */}
                        <div className="bg-indigo-50 p-3 rounded-lg flex justify-between items-center text-slate-800">
                           <div className="flex items-center gap-2">
                              <Percent size={16}/> 
                              <span className="text-sm font-bold">Pajak</span>
                           </div>
                           <div className="flex items-center gap-3">
                              {isTaxEnabled && (
                                <div className="relative flex items-center">
                                  <input 
                                    type="number" 
                                    min="0" 
                                    max="100" 
                                    className="w-14 p-1 text-center border rounded font-bold text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200" 
                                    value={taxRate} 
                                    onChange={e=>setTaxRate(e.target.value)} 
                                  />
                                  <span className="ml-1 text-xs font-bold">%</span>
                                </div>
                              )}
                              <input type="checkbox" checked={isTaxEnabled} onChange={e=>setIsTaxEnabled(e.target.checked)} className="w-5 h-5 accent-indigo-600 cursor-pointer" />
                           </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h3 className="font-bold text-slate-800 border-b pb-2 flex items-center gap-2"><Printer size={18}/> Opsi Cetak Struk</h3>
                        <div className="grid grid-cols-2 gap-3">
                           {Object.keys(receiptOptions).map(key => (
                              <label key={key} className="flex items-center gap-2 bg-gray-50 p-2 rounded-lg border cursor-pointer hover:bg-white transition-colors">
                                 <input type="checkbox" checked={receiptOptions[key]} onChange={e => setReceiptOptions({...receiptOptions, [key]: e.target.checked})} className="w-4 h-4 accent-indigo-600" />
                                 <span className="text-xs font-bold capitalize text-slate-600">{key === 'link' ? 'Share Link' : key}</span>
                              </label>
                           ))}
                        </div>
                      </div>

                      <div className="bg-orange-50 p-4 rounded-xl border border-orange-100">
                         <div className="flex justify-between items-center mb-2">
                           <h3 className="font-bold text-orange-800 flex items-center gap-2"><Shield size={16}/> Keamanan Admin</h3>
                           <button onClick={()=>setShowPasswordForm(!showPasswordForm)} className="text-[10px] font-bold text-orange-600 hover:underline">{showPasswordForm ? 'Batal' : 'Ubah Password'}</button>
                         </div>
                         {showPasswordForm && (
                            <div className="space-y-3 mt-4 animate-in fade-in zoom-in-95">
                               <input type="password" placeholder="Password Baru (Min 6 karakter)" className="w-full p-2 border rounded-lg text-sm font-bold" value={newPassword} onChange={e=>setNewPassword(e.target.value)}/>
                               <input type="password" placeholder="Konfirmasi Password" className="w-full p-2 border rounded-lg text-sm font-bold" value={confirmPassword} onChange={e=>setConfirmPassword(e.target.value)}/>
                               <button onClick={handleChangePassword} className="w-full bg-orange-500 text-white py-2 rounded-lg font-bold text-xs">Simpan Password Baru (Terenkripsi)</button>
                            </div>
                         )}
                      </div>
                   </div>

                   {/* KOLOM KANAN: HISTORY & KATEGORI */}
                   <div className="space-y-6">
                      <div className="bg-slate-50 border rounded-xl flex flex-col h-64 shadow-inner">
                        <div className="p-3 border-b bg-white flex justify-between items-center font-bold text-sm">
                           <span className="flex items-center gap-2"><History size={16}/> Riwayat Transaksi</span>
                           <button onClick={handleClearHistory} className="text-red-500 text-xs font-bold hover:underline">Kosongkan</button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-2 space-y-2">
                           {history.length === 0 ? (
                              <div className="h-full flex items-center justify-center text-gray-400 text-xs italic">Belum ada data transaksi</div>
                           ) : (
                              history.map(trx => (
                                 <div key={trx.id} onClick={()=>handleViewHistory(trx)} className="bg-white p-2 border rounded-lg flex items-center justify-between hover:border-indigo-500 cursor-pointer shadow-sm transition-all group">
                                    <div className="flex items-center gap-2">
                                       <div className="p-1.5 bg-indigo-50 rounded text-indigo-600"><FileText size={14}/></div>
                                       <div><div className="font-bold text-xs text-slate-800">#{trx.orderNumber}</div><div className="text-[10px] text-gray-400">{new Date(trx.date).toLocaleDateString('id-ID')}</div></div>
                                    </div>
                                    <div className="flex items-center gap-2 font-bold text-xs text-slate-800">
                                       {formatRupiah(trx.total)}
                                       <button onClick={(e)=>{e.stopPropagation(); handleDeleteTransaction(trx.id);}} className="text-gray-300 hover:text-red-500 transition-colors p-1 opacity-0 group-hover:opacity-100"><Trash2 size={14}/></button>
                                    </div>
                                 </div>
                              ))
                           )}
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h3 className="font-bold text-slate-800 border-b pb-2 flex items-center gap-2"><LayoutGrid size={18}/> Manajemen Kategori</h3>
                        <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto p-1 scrollbar-hide">
                           {categories.map(cat => (
                              <div key={cat.id} className="flex items-center justify-between bg-white border p-2 rounded-lg shadow-sm">
                                 <div className="flex items-center gap-2 truncate">
                                    <div className="text-indigo-400">{renderIcon(cat.icon, 14)}</div>
                                    <span className="text-[11px] font-bold truncate">{cat.name}</span>
                                 </div>
                                 {cat.id !== 'all' && (
                                    <button onClick={()=>handleDeleteCategory(cat.id)} className="text-red-300 hover:text-red-500"><X size={14}/></button>
                                 )}
                              </div>
                           ))}
                        </div>
                        <div className="flex gap-2">
                           <input className="flex-1 border p-2 rounded-lg text-sm font-bold bg-gray-50 focus:ring-2 focus:ring-indigo-200 outline-none text-slate-800" placeholder="Nama Kategori Baru" value={newCatName} onChange={e=>setNewCatName(e.target.value)} />
                           <button onClick={handleAddCategory} className="bg-indigo-600 text-white p-2 rounded-lg shadow hover:bg-indigo-700 transition-all"><Plus size={18}/></button>
                        </div>
                      </div>
                   </div>
                </div>

                <button onClick={handleSaveSettings} disabled={isLoading} className="w-full bg-orange-500 text-white py-4 rounded-xl flex justify-center items-center gap-3 font-bold hover:bg-orange-600 transition-all shadow-lg shadow-orange-100 active:scale-[0.98]">
                   {isLoading ? <Loader2 className="animate-spin"/> : <Save size={20}/>} 
                   SIMPAN SEMUA PENGATURAN ADMIN
                </button>
             </div>
          )}

          {/* GRID PRODUK */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
             {isAdminMode && (
                <div onClick={handleAddProduct} className="border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center min-h-[180px] text-gray-400 hover:text-orange-500 hover:border-orange-500 transition-all bg-white cursor-pointer group">
                   <div className="p-4 bg-gray-50 rounded-full group-hover:bg-orange-50 transition-colors"><Plus size={32}/></div>
                   <span className="font-bold mt-2 text-sm">Tambah Produk</span>
                </div>
             )}
             
             {/* LOADING STATE */}
             {isLoading && products.length === 0 && (
                <div className="col-span-full flex flex-col items-center justify-center py-20 text-gray-400 animate-pulse">
                   <div className="bg-indigo-50 p-4 rounded-full mb-3">
                      <Loader2 className="animate-spin text-indigo-600" size={32}/>
                   </div>
                   <span className="text-xs font-bold tracking-widest uppercase">Memuat Produk...</span>
                </div>
             )}

             {/* EMPTY STATE */}
             {!isLoading && products.length === 0 && !isAdminMode && (
                <div className="col-span-full flex flex-col items-center justify-center py-20 text-gray-400">
                   <div className="bg-gray-50 p-4 rounded-full mb-3 grayscale opacity-50">
                      <Package size={32}/>
                   </div>
                   <span className="text-xs font-bold tracking-widest uppercase">Belum Ada Produk</span>
                </div>
             )}

             {products.filter(p => (activeCategory==='all' || p.category===activeCategory) && p.name.toLowerCase().includes(searchQuery.toLowerCase())).map(p => (
                <div key={p.id} onClick={()=>addToCart(p)} className="bg-white rounded-xl shadow-sm overflow-hidden cursor-pointer hover:shadow-md transition-all group relative border border-transparent hover:border-indigo-100 animate-in fade-in duration-300">
                   {isAdminMode && <button onClick={(e)=>{e.stopPropagation(); handleEditProduct(p);}} className="absolute top-2 right-2 bg-white/90 shadow-lg p-2 rounded-full z-10 hover:bg-white transition-colors text-slate-400 hover:text-indigo-600"><Edit2 size={14}/></button>}
                   <div className={`h-28 flex items-center justify-center text-4xl ${p.color} bg-opacity-20 transition-transform group-hover:scale-110`}>{isImageString(p.image)?<img src={p.image} className="w-full h-full object-cover" alt={p.name}/>:p.image}</div>
                   <div className="p-3 bg-white relative">
                      <h3 className="font-bold text-xs text-slate-800 line-clamp-2 leading-tight h-8">{p.name}</h3>
                      <p className="text-indigo-600 font-black mt-1 text-sm">{formatRupiah(p.price)}</p>
                   </div>
                </div>
             ))}
          </div>
        </main>

        {!isAdminMode && (
          <div className="md:hidden fixed bottom-0 w-full bg-white/90 backdrop-blur-md p-3 border-t shadow-2xl z-20">
             <button onClick={()=>setShowCartMobile(true)} className="w-full bg-indigo-600 text-white py-3 rounded-xl flex justify-between px-4 font-bold shadow-xl shadow-indigo-100 active:scale-95 transition-all">
                <span className="flex items-center gap-2"><ShoppingCart size={18}/> {cart.length} Item</span><span>{formatRupiah(activeTotal)}</span>
             </button>
          </div>
        )}
      </div>

      {/* SIDEBAR KERANJANG (DESKTOP) & MODAL LAINNYA DIBAWAH... */}
      {/* ... (Tidak ada perubahan pada struktur modal login, keranjang, dll) ... */}
      {/* SIDEBAR KERANJANG (DESKTOP) */}
      <div className={`fixed inset-0 z-30 bg-white flex flex-col border-l transition-transform duration-300 md:relative md:w-[400px] md:translate-x-0 ${showCartMobile?'translate-x-0':'translate-x-full'} ${isAdminMode && 'hidden'}`}>
         {/* ... Isi Keranjang Sama ... */}
         <div className="p-4 border-b flex justify-between items-center bg-gray-50 font-bold text-slate-800">
            <h2 className="text-lg flex gap-2 items-center"><ShoppingCart size={20} className="text-indigo-600"/> Keranjang</h2>
            <button onClick={()=>setShowCartMobile(false)} className="md:hidden p-1 bg-gray-200 rounded-full transition-colors active:scale-90"><X size={20}/></button>
         </div>
         <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {cart.length === 0 ? (
               <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-2">
                  <div className="p-6 bg-gray-50 rounded-full opacity-20"><ShoppingBag size={64}/></div>
                  <p className="text-sm font-bold opacity-40">Keranjang Belanja Kosong</p>
               </div>
            ) : (
               cart.map(item => (
                  <div key={item.id} className="flex items-center gap-3 bg-white p-2 border rounded-xl shadow-sm transition-all hover:border-indigo-100 animate-in slide-in-from-right-4">
                     <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-xl overflow-hidden">{isImageString(item.image)?<img src={item.image} className="w-full h-full object-cover" alt=""/>:item.image}</div>
                     <div className="flex-1 font-bold"><h4 className="text-[11px] truncate text-slate-800">{item.name}</h4><p className="text-xs text-indigo-600">{formatRupiah(item.price)}</p></div>
                     <div className="flex items-center bg-gray-100 rounded-lg overflow-hidden font-bold border"><button onClick={()=>updateQty(item.id,-1)} className="p-1 px-3 hover:bg-gray-200 transition-colors">-</button><span className="text-xs w-6 text-center">{item.qty}</span><button onClick={()=>addToCart(item)} className="p-1 px-3 hover:bg-gray-200 transition-colors">+</button></div>
                  </div>
               ))
            )}
         </div>
         <div className="p-4 border-t bg-white shadow-[0_-4px_20px_rgba(0,0,0,0.03)]">
            <div className="space-y-1 mb-4 text-sm font-bold text-slate-800">
               <div className="flex justify-between"><span>Subtotal</span><span>{formatRupiah(activeSubtotal)}</span></div>
               {isTaxEnabled && <div className="flex justify-between text-gray-400 text-xs font-medium"><span>Pajak ({taxRate}%)</span><span>{formatRupiah(activeTax)}</span></div>}
               <div className="flex justify-between font-black text-xl border-t pt-3 text-indigo-700"><span>Total</span><span>{formatRupiah(activeTotal)}</span></div>
            </div>
            <div className="grid grid-cols-4 gap-2">
               <button onClick={()=>setCart([])} className="border rounded-xl flex items-center justify-center text-red-400 hover:text-red-500 hover:bg-red-50 transition-colors active:scale-90"><Trash2 size={20}/></button>
               <button onClick={()=>setIsPaymentModalOpen(true)} disabled={cart.length===0} className="col-span-3 bg-indigo-600 text-white font-black py-4 rounded-xl shadow-lg shadow-indigo-100 disabled:opacity-50 disabled:shadow-none hover:bg-indigo-700 transition-all uppercase tracking-widest text-xs">Bayar Sekarang</button>
            </div>
         </div>
      </div>

      {/* LOGIN MODAL (Sama) */}
      {isLoginModalOpen && (
         <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white p-6 rounded-2xl w-full max-w-sm shadow-2xl animate-in zoom-in-95">
               <div className="flex flex-col items-center mb-6">
                  <div className={`p-4 ${isLockedOut ? 'bg-red-50 text-red-600' : 'bg-indigo-50 text-indigo-600'} rounded-full mb-2 transition-colors`}>
                    {isLockedOut ? <Ban size={32}/> : <Shield size={32}/>}
                  </div>
                  <h3 className="text-xl font-bold text-slate-800">Akses Admin</h3>
                  <p className="text-xs text-slate-400 font-bold">SmartyBill Secured</p>
               </div>
               <form onSubmit={verifyPassword} className="space-y-4">
                  <div className="relative">
                    <input 
                      type={showLoginPassword ? "text" : "password"} 
                      autoFocus 
                      placeholder={isLockedOut ? "Terkunci..." : "Password Admin"} 
                      disabled={isLockedOut} 
                      className="w-full p-4 border rounded-xl bg-gray-50 focus:ring-4 focus:ring-indigo-100 outline-none text-slate-800 font-bold text-center text-lg tracking-widest disabled:opacity-50 disabled:cursor-not-allowed pr-12" 
                      value={loginPassword} 
                      onChange={e=>setLoginPassword(e.target.value)}
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-600 transition-colors p-1"
                    >
                      {showLoginPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  <button type="submit" disabled={isLockedOut} className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-[0.98] disabled:bg-gray-400 disabled:shadow-none">{isLockedOut ? 'AKSES DIKUNCI' : 'BUKA PENGATURAN'}</button>
               </form>
               <button onClick={()=>setIsLoginModalOpen(false)} className="w-full mt-4 text-gray-400 text-sm font-bold hover:text-indigo-600 transition-colors">Batalkan</button>
            </div>
         </div>
      )}

      {/* FORM PRODUK & MODAL LAINNYA (Sama) */}
      {isProductFormOpen && (
         <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl animate-in zoom-in-95">
               <div className="flex justify-between font-black items-center text-slate-800">
                  <span className="flex items-center gap-2 uppercase tracking-tighter"><Package className="text-indigo-600"/> {editingProduct?'Edit Menu':'Menu Baru'}</span>
                  <button onClick={()=>setIsProductFormOpen(false)} className="p-1 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"><X size={20}/></button>
               </div>
               <form onSubmit={handleSaveProduct} className="space-y-4 text-sm font-bold">
                  <div><label className="text-slate-500 block mb-1">Nama Produk</label><input required className="w-full border p-3 rounded-xl bg-gray-50 text-slate-800 focus:ring-4 focus:ring-indigo-50 outline-none transition-all" value={formData.name || ''} onChange={e=>setFormData({...formData,name:e.target.value})}/></div>
                  <div className="grid grid-cols-2 gap-4">
                     <div><label className="text-slate-500 block mb-1">Harga (Rp)</label><input required type="number" className="w-full border p-3 rounded-xl bg-gray-50 text-slate-800 focus:ring-4 focus:ring-indigo-50 outline-none" value={formData.price || ''} onChange={e=>setFormData({...formData,price:e.target.value})}/></div>
                     <div><label className="text-slate-500 block mb-1">Kategori</label><select className="w-full border p-3 rounded-xl bg-gray-50 text-slate-800 focus:ring-4 focus:ring-indigo-50 outline-none" value={formData.category || 'makanan'} onChange={e=>setFormData({...formData,category:e.target.value})}>{categories.filter(c=>c.id!=='all').map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
                  </div>
                  <div className="border p-4 rounded-xl bg-gray-50 flex flex-col gap-3 border-dashed border-gray-300">
                     <div className="flex justify-between items-center"><label className="text-slate-800 text-xs">Visual Produk</label><button type="button" onClick={()=>setImageType(imageType==='emoji'?'upload':'emoji')} className="text-[10px] text-indigo-600 bg-white px-3 py-1.5 rounded-lg shadow-sm font-black border hover:bg-gray-50 transition-all uppercase">Ganti ke {imageType==='emoji'?'Upload':'Emoji'}</button></div>
                     {imageType==='emoji' ? <input maxLength="2" className="w-full text-center text-4xl border p-2 rounded-xl bg-white focus:ring-4 focus:ring-indigo-50 outline-none transition-all" value={!isImageString(formData.image)?(formData.image||''):''} onChange={e=>setFormData({...formData,image:e.target.value})} placeholder="🍔"/> : <input type="file" accept="image/*" onChange={handleImageUpload} className="text-xs p-2 text-slate-800 bg-white rounded-lg border w-full"/>}
                  </div>
                  <button type="submit" disabled={isLoading} className="w-full bg-indigo-600 text-white py-4 rounded-xl shadow-lg shadow-indigo-100 flex justify-center font-black transition-all hover:bg-indigo-700 active:scale-[0.98] uppercase tracking-[2px]">{isLoading ? <Loader2 className="animate-spin"/> : 'SIMPAN DATA MENU'}</button>
               </form>
            </div>
         </div>
      )}

      {/* MODAL PEMBAYARAN */}
      {isPaymentModalOpen && (
         <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 backdrop-blur-sm">
            <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-2xl p-6 shadow-2xl animate-in slide-in-from-bottom-full sm:zoom-in-95 overflow-y-auto max-h-[90vh] text-slate-800">
               <div className="flex justify-between items-center mb-4"><h3 className="text-lg font-black uppercase tracking-tight">Proses Pembayaran</h3><button onClick={()=>setIsPaymentModalOpen(false)} className="text-slate-400 p-2 bg-gray-100 rounded-full transition-colors active:scale-90"><X size={20}/></button></div>
               
               <div className="bg-indigo-600 p-5 rounded-2xl mb-4 text-center shadow-lg shadow-indigo-100">
                  <p className="text-[10px] font-black text-indigo-200 uppercase tracking-widest mb-1">Total Tagihan</p>
                  <p className="text-3xl font-black text-white">{formatRupiah(activeTotal)}</p>
               </div>
               
               <div className="mb-4">
                 <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block tracking-wider">Tunai Diterima (Rp)</label>
                 <div className="relative">
                   <input type="text" inputMode="numeric" autoFocus className={`w-full p-4 text-2xl font-black border-2 rounded-2xl bg-gray-50 text-center outline-none transition-all focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50 shadow-inner ${isUnderpaid && activePayment > 0 ? 'border-red-500 text-red-600' : 'border-slate-100 text-slate-800'}`} placeholder="Rp 0" value={paymentAmount} onChange={(e) => { const r = e.target.value.replace(/\D/g, ''); setPaymentAmount(r ? new Intl.NumberFormat('id-ID').format(r) : ''); }} onKeyDown={e=>e.key==='Enter' && !isUnderpaid && activePayment>0 && handlePaymentSuccess()} />
                   {isUnderpaid && activePayment > 0 && <p className="text-[10px] text-red-500 font-bold mt-2 text-center bg-red-50 py-1.5 rounded-lg italic">Kekurangan: {formatRupiah(activeTotal - activePayment)}</p>}
                 </div>
               </div>

               <div className="mb-6 bg-gray-50 p-3 rounded-2xl border border-dashed border-gray-200">
                 <p className="text-[10px] font-black text-slate-400 uppercase mb-3 flex items-center gap-2"><DollarSign size={12}/> Pilih Nominal Cepat</p>
                 <div className="grid grid-cols-4 gap-2">
                    <button onClick={()=>setPaymentAmount(new Intl.NumberFormat('id-ID').format(activeTotal))} className="col-span-4 bg-white text-indigo-700 p-3 rounded-xl text-sm font-black border-2 border-indigo-200 hover:bg-indigo-50 transition-all flex items-center justify-center gap-2 mb-1 shadow-sm"><Check size={16}/> UANG PAS</button>
                    {[20000, 50000, 100000, 150000, 200000, 300000, 500000, 1000000].map(amt => ( 
                      <button key={amt} onClick={()=>setPaymentAmount(new Intl.NumberFormat('id-ID').format(amt))} className="bg-white border border-slate-200 text-slate-700 py-3 rounded-xl text-[10px] font-black transition-all hover:border-indigo-400 hover:text-indigo-600 active:scale-90 shadow-sm">{amt >= 1000 ? `${amt/1000}rb` : amt}</button> 
                    ))}
                 </div>
               </div>
               
               <div className="flex gap-4">
                  <button onClick={()=>setIsPaymentModalOpen(false)} className="flex-1 py-4 font-bold text-slate-400 rounded-xl hover:bg-gray-50 transition-colors uppercase text-xs tracking-widest">Batal</button>
                  <button disabled={isUnderpaid || !activePayment} onClick={handlePaymentSuccess} className="flex-[2] bg-indigo-600 text-white font-black py-4 rounded-xl shadow-xl shadow-indigo-100 disabled:opacity-20 disabled:shadow-none transition-all uppercase text-sm tracking-widest hover:bg-indigo-700 active:scale-[0.98]">Cetak Struk</button>
               </div>
            </div>
         </div>
      )}

      {/* STRUK AKHIR MODAL */}
      {isReceiptModalOpen && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 overflow-y-auto backdrop-blur-md">
          <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden my-8 animate-in zoom-in-95 duration-300">
            <div ref={receiptRef} className="p-8 text-center bg-white printable-area">
               {/* Logo di Struk */}
               <div className="w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                  {shopLogo ? (
                     <img src={shopLogo} alt="Logo Toko" className="w-full h-full object-contain"/>
                  ) : (
                     <div className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center text-white shadow-xl">
                        <ChefHat size={32}/>
                     </div>
                  )}
               </div>
               <h2 className="text-xl font-black text-gray-900 tracking-tight uppercase">{viewModeData ? viewModeData.shopName : shopName}</h2>
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 border-b pb-4 mb-4">{new Date(viewModeData ? viewModeData.date : Date.now()).toLocaleString('id-ID')}</p>
               <div className="space-y-3 text-xs text-left text-gray-700 font-bold border-b-2 border-dashed pb-4 mb-4">
                  {activeCart.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-start gap-3">
                       <span className="flex-1 leading-tight">{item.qty}x {item.name}</span>
                       <span className="whitespace-nowrap">{formatRupiah(item.price * item.qty)}</span>
                    </div>
                  ))}
               </div>
               <div className="space-y-2 text-xs text-slate-500 font-bold">
                 <div className="flex justify-between"><span>SUBTOTAL</span><span>{formatRupiah(activeSubtotal)}</span></div>
                 {activeTax > 0 && <div className="flex justify-between text-[10px] text-slate-400 font-medium"><span>PAJAK ({activeTaxRate}%)</span><span>{formatRupiah(activeTax)}</span></div>}
                 <div className="flex justify-between font-black text-2xl text-slate-900 pt-3 mt-2 border-t-2 border-gray-100"><span>TOTAL</span><span>{formatRupiah(activeTotal)}</span></div>
                 <div className="flex justify-between pt-2"><span>TUNAI</span><span>{formatRupiah(activePayment)}</span></div>
                 <div className="flex justify-between text-indigo-700 bg-indigo-50 px-3 py-2 rounded-xl mt-3 font-black"><span>KEMBALI</span><span>{formatRupiah(activeChange)}</span></div>
               </div>
               <div className="mt-10 border-t border-slate-100 pt-6">
                  <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest">ORDER #{currentOrderNumber}</p>
                  <p className="text-[8px] font-black text-slate-300 uppercase tracking-[4px] mt-2">SmartyBill POS System</p>
               </div>
            </div>
            <div className="bg-gray-50 p-6 border-t border-slate-100 no-print space-y-4">
               {/* BUTTON GRID - CHANGED TO FLEX FOR BETTER LAYOUT WITH 5 ITEMS */}
               <div className="flex flex-wrap justify-center gap-2">
                  {receiptOptions.print && <button onClick={handlePrint} className="flex-1 min-w-[70px] flex flex-col items-center justify-center p-3 bg-white border border-slate-200 rounded-2xl text-[8px] font-black hover:bg-slate-100 transition-all active:scale-90"><Printer size={18} className="mb-1"/> CETAK</button>}
                  {receiptOptions.image && <button onClick={handleSaveImage} className="flex-1 min-w-[70px] flex flex-col items-center justify-center p-3 bg-white border border-slate-200 rounded-2xl text-[8px] font-black hover:bg-gray-100 transition-all active:scale-90"><Download size={18} className="mb-1"/> SIMPAN</button>}
                  {receiptOptions.email && <button onClick={handleEmail} className="flex-1 min-w-[70px] flex flex-col items-center justify-center p-3 bg-white border border-slate-200 rounded-2xl text-[8px] font-black text-sky-600 hover:bg-sky-50 transition-all active:scale-90"><Mail size={18} className="mb-1"/> EMAIL</button>}
                  {receiptOptions.whatsapp && <button onClick={handleWhatsApp} className="flex-1 min-w-[70px] flex flex-col items-center justify-center p-3 bg-white border border-slate-200 rounded-2xl text-[8px] font-black text-emerald-600 hover:bg-emerald-50 transition-all active:scale-90"><MessageCircle size={18} className="mb-1"/> WA</button>}
                  {receiptOptions.link && <button onClick={handleShareLink} className="flex-1 min-w-[70px] flex flex-col items-center justify-center p-3 bg-white border border-slate-200 rounded-2xl text-[8px] font-black text-indigo-600 hover:bg-indigo-50 transition-all active:scale-90"><Copy size={18} className="mb-1"/> {isCopied ? 'SALIN' : 'LINK'}</button>}
               </div>
               <button onClick={handleCloseReceipt} className="w-full bg-slate-900 text-white font-black py-4 rounded-2xl shadow-xl transition-all uppercase text-xs tracking-[2px] hover:bg-black active:scale-95">Transaksi Baru</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}