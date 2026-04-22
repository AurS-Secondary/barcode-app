const app = document.getElementById("app");
const beep = new Audio("https://actions.google.com/sounds/v1/alarms/beep_short.ogg");
const errorSound = new Audio("https://actions.google.com/sounds/v1/alarms/notification.ogg");
// import { PaymentModal } from "./payment_ui.js";


class PaymentModal {
    /**
     * Memanggil UI Payment Success dengan proteksi Shadow DOM
     * @param {Object} data - Data transaksi (invoice, amount, received, method, onClose)
     */
    static show({ invoice, amount, received, method, onClose }) {
        // 1. Buat kontainer utama di luar jangkauan CSS global
        const host = document.createElement('div');
        host.id = 'ps-modal-host';
        host.style.position = 'fixed';
        host.style.zIndex = '999999';
        document.body.appendChild(host);

        // 2. Buat Shadow Root
        const shadow = host.attachShadow({ mode: 'open' });

        // 3. Format Waktu & Mata Uang
        const dateString = new Date().toLocaleDateString('id-ID', { 
            day: '2-digit', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
        
        // Helper untuk format rupiah otomatis
        const formatRp = (num) => new Intl.NumberFormat('id-ID').format(num);
        
        // Kalkulasi Kembalian
        const change = received - amount;
        const changeText = change >= 0 ? `Rp ${formatRp(change)}` : 'Uang Kurang!';
        const changeColor = change >= 0 ? 'text-green-500' : 'text-red-500';

        // 4. Masukkan Tailwind & Custom CSS ke dalam Shadow
        
        // Kita passing variabel 'received' (uang yang diterima) ke fungsi cetak struk

        
        shadow.innerHTML = `
            <style>
                @import url('https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css');

                :host { font-family: ui-sans-serif, system-ui, -apple-system, sans-serif; }

                .ps-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; padding: 1rem; animation: fadeIn 0.3s ease; }
                .ps-modal { background: white; width: 100%; max-width: 26rem; border-radius: 1.5rem; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.3); overflow: hidden; position: relative; animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
                
                /* Checkmark Animation */
                .checkmark { width: 72px; height: 72px; border-radius: 50%; display: block; stroke-width: 2.5; stroke: #fff; margin: 0 auto 1rem auto; box-shadow: inset 0px 0px 0px #22c55e; animation: fill .4s ease-in-out .4s forwards, scale .3s ease-in-out .9s both; }
                .checkmark__circle { stroke-dasharray: 166; stroke-dashoffset: 166; stroke-width: 2.5; stroke: #22c55e; fill: none; animation: stroke 0.6s forwards; }
                .checkmark__check { transform-origin: 50% 50%; stroke-dasharray: 48; stroke-dashoffset: 48; animation: stroke 0.3s 0.8s forwards; }

                @keyframes stroke { 100% { stroke-dashoffset: 0; } }
                @keyframes scale { 0%, 100% { transform: none; } 50% { transform: scale3d(1.1, 1.1, 1); } }
                @keyframes fill { 100% { box-shadow: inset 0px 0px 0px 40px #22c55e; } }
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

                @media print {
                    .no-print { display: none !important; }
                    .ps-overlay { background: white; position: absolute; padding: 0; display: block;}
                    .ps-modal { box-shadow: none; border: none; width: 100%; max-width: 100%; margin: 0; padding: 0;}
                }
            </style>

            <div class="ps-overlay">
                <div class="ps-modal p-6">
                    <button id="close-x" class="no-print absolute top-5 right-5 text-gray-400 hover:text-gray-700 transition-colors" style="background:none; border:none; cursor:pointer;">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>

                    <div class="pt-4 pb-6">
                        <svg class="checkmark" viewBox="0 0 52 52"><circle class="checkmark__circle" cx="26" cy="26" r="25"/><path class="checkmark__check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/></svg>
                        
                        <div class="text-center mb-6">
                            <h2 class="text-2xl font-bold text-gray-800 m-0 tracking-tight">Pembayaran Sukses</h2>
                            <p class="text-gray-500 mt-1 text-sm">${dateString}</p>
                        </div>

                        <div class="bg-white border-2 border-gray-100 p-5 rounded-2xl shadow-sm mb-4">
                            <div class="flex justify-between items-center mb-2">
                                <span class="text-gray-500 font-medium">Total Pembelian</span>
                                <span class="font-bold text-gray-800 text-lg">Rp ${formatRp(amount)}</span>
                            </div>
                            <div class="flex justify-between items-center mb-4">
                                <span class="text-gray-500 font-medium">Tunai Diterima</span>
                                <span class="font-bold text-gray-800 text-lg">Rp ${formatRp(received)}</span>
                            </div>
                            
                            <div class="border-t border-dashed border-gray-300 pt-4 flex justify-between items-end">
                                <span class="text-gray-800 font-bold text-3xl">Kembalian</span>
                                <span class="font-black ${changeColor} text-3xl tracking-tight">${changeText}</span>
                            </div>
                        </div>

                        <div class="bg-gray-50 px-5 py-4 rounded-xl space-y-2">
                            <div class="flex justify-between items-center text-sm">
                                <span class="text-gray-400">Nomor Invoice</span>
                                <span class="font-semibold text-gray-600">#${invoice}</span>
                            </div>
                            <div class="flex justify-between items-center text-sm">
                                <span class="text-gray-400">Metode</span>
                                <span class="font-semibold text-gray-600">${method}</span>
                            </div>
                        </div>
                    </div>

                    <div class="space-y-3 no-print">
                        <button id="btn-printout" class="w-full flex items-center justify-center gap-2 bg-green-500 text-white font-bold py-3.5 rounded-xl shadow-md hover:bg-green-600 transition-all active:scale-95" style="cursor:pointer; border:none;">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                            Cetak Struk
                        </button>
                        <button id="btn-back" class="w-full text-gray-500 font-semibold py-2 hover:text-gray-800 transition-colors" style="background:none; border:none; cursor:pointer; text-align:center;">
                            Tutup
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.style.overflow = 'hidden';

        const removeModal = () => {
            host.remove();
            document.body.style.overflow = 'auto';
            if (onClose) onClose();
        };

        // Event listener diikat secara langsung (aman dari Shadow DOM)
        shadow.getElementById('close-x').onclick = removeModal;
        shadow.getElementById('btn-back').onclick = removeModal;
        shadow.getElementById('btn-printout').onclick = () => {
    processDataStruk(received);
          
};
    }
}

class PaymentManager {
    constructor() {
        this.host = null;
        this.shadow = null;
        this.resolve = null;
        this.currentInput = "0";
    }

    async open() {
        return new Promise((resolve) => {
            this.resolve = resolve;
            this._createShadowHost();
            this._renderMethodSelection();
        });
    }

    _createShadowHost() {
        if (this.host) this.host.remove();
        
        this.host = document.createElement('div');
        this.host.id = 'payment-manager-root';
        this.host.style.position = 'fixed';
        this.host.style.zIndex = '999999';
        document.body.appendChild(this.host);

        this.shadow = this.host.attachShadow({ mode: 'open' });
        
        const style = document.createElement('style');
        style.textContent = `
            @import url('https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css');
            :host { font-family: ui-sans-serif, system-ui, -apple-system, sans-serif; }
            .ps-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; padding: 1rem; animation: psFadeIn 0.2s ease forwards; }
            .ps-modal { background: white; border-radius: 1.5rem; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1); width: 100%; max-width: 22rem; overflow: hidden; animation: psZoomIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
            
            /* Animasi hanya saat modal pertama kali muncul */
            
            /* Animasi Geter (Shake) */
@keyframes psShake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-8px); }
    50% { transform: translateX(8px); }
    75% { transform: translateX(-8px); }
}
.ps-shake { animation: psShake 0.4s ease-in-out; }

/* Animasi Notif Pop-up */
@keyframes psToastIn {
    from { opacity: 0; transform: translateY(10px) scale(0.9); }
    to { opacity: 1; transform: translateY(0) scale(1); }
}
.ps-toast {
    position: absolute;
    top: 15px;
    left: 50%;
    transform: translateX(-50%);
    background: #ef4444;
    color: white;
    padding: 8px 16px;
    border-radius: 999px;
    font-size: 0.75rem;
    font-weight: bold;
    box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
    z-index: 100;
    white-space: nowrap;
    animation: psToastIn 0.3s ease forwards;
}
            
            @keyframes psFadeIn { from { opacity: 0; } to { opacity: 1; } }
            @keyframes psZoomIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
            
            button { cursor: pointer; border: none; outline: none; transition: all 0.1s; }
            button:active { transform: scale(0.96); opacity: 0.8; }
            .numpad-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.5rem; }
        `;
        this.shadow.appendChild(style);

        // Overlay tetap (static)
        this.overlay = document.createElement('div');
        this.overlay.className = 'ps-overlay';
        this.shadow.appendChild(this.overlay);

        // Konten modal yang akan di-update isinya (tanpa memicu animasi wrapper)
        this.modalContent = document.createElement('div');
        this.modalContent.className = 'ps-modal';
        this.overlay.appendChild(this.modalContent);
    }

    _formatRupiah(number) {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency', currency: 'IDR', minimumFractionDigits: 0
        }).format(number);
    }

    _close(value = null) {
        if (this.host) {
            this.host.remove();
            this.host = null;
            if (this.resolve) {
                this.resolve(value);
            }
        }
    }

    _renderMethodSelection() {
        this.modalContent.innerHTML = `
            <div class="p-6 border-b border-gray-100">
                <h3 class="text-lg font-bold text-gray-800 m-0">Metode Pembayaran</h3>
            </div>
            <div class="p-4">
                <button id="methodCash" class="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-blue-50 border border-gray-200 rounded-2xl group text-left">
                    <div class="flex items-center gap-4">
                        <div class="p-3 bg-green-100 text-green-600 rounded-full group-hover:bg-blue-600 group-hover:text-white">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                        </div>
                        <span class="font-bold text-gray-700">Tunai / Cash</span>
                    </div>
                </button>
            </div>
            <div class="p-4 bg-gray-50 text-right">
                <button id="cancelBtn" class="px-6 py-2 font-bold text-gray-400 bg-transparent">Batal</button>
            </div>
        `;

        this.shadow.getElementById('methodCash').onclick = () => this._renderCashInput();
        this.shadow.getElementById('cancelBtn').onclick = () => this._close(null);
    }

    _renderCashInput() {
        this.currentInput = "0";
        this._updateInputUI();
    }

    _updateInputUI() {
        // Kita hanya mengubah innerHTML dari modalContent agar animasi CSS psZoomIn tidak terpicu lagi
        this.modalContent.innerHTML = `
            <div class="p-6 bg-blue-600 text-white">
                <h3 class="text-xs uppercase font-bold opacity-70 mb-1">Uang Diterima</h3>
                <div class="text-3xl font-bold truncate">${this._formatRupiah(parseInt(this.currentInput))}</div>
            </div>
            
            <div class="p-4 bg-gray-50">
                <div class="numpad-grid">
                    ${[1, 2, 3, 4, 5, 6, 7, 8, 9, '000', 0, 'DEL'].map(val => `
                        <button class="numpad-btn h-14 bg-white border border-gray-200 rounded-xl text-xl font-bold text-gray-700 active:bg-blue-600 active:text-white shadow-sm" data-val="${val}">
                            ${val === 'DEL' ? '⌫' : val}
                        </button>
                    `).join('')}
                </div>
            </div>

            <div class="p-4 flex gap-3 bg-white">
                <button id="backToMethod" class="flex-1 py-4 font-bold text-gray-400 bg-gray-50 rounded-2xl">Batal</button>
                <button id="confirmCash" class="flex-[2] py-4 font-bold bg-green-500 text-white rounded-2xl shadow-lg">Konfirmasi</button>
            </div>
        `;

        // Pasang kembali listener karena innerHTML baru saja diganti
        this.shadow.querySelectorAll('.numpad-btn').forEach(btn => {
            btn.onclick = (e) => {
                e.preventDefault();
                const val = btn.getAttribute('data-val');
                if (val === 'DEL') {
                    this.currentInput = this.currentInput.slice(0, -1);
                    if (this.currentInput === "" || this.currentInput === "-") this.currentInput = "0";
                } else {
                    if (this.currentInput === "0") {
                        if (val !== '000') this.currentInput = val.toString();
                    } else {
                        this.currentInput += val.toString();
                    }
                }
                if (this.currentInput.length > 12) this.currentInput = this.currentInput.slice(0, 12);
                this._updateInputUI();
            };
        });

        this.shadow.getElementById('backToMethod').onclick = () => this._renderMethodSelection();
        
        // Perbaikan: Gunakan onclick yang memanggil _close dengan nilai input
        this.shadow.getElementById('confirmCash').onclick = () => {
    const finalValue = parseInt(this.currentInput);

    if (finalValue <= 0) {
        // 1. Ambil elemen kartu untuk efek getar
        const modal = this.modalContent;
        modal.classList.add('ps-shake');
   
        // 2. Cek apakah notif sudah ada, jika belum buat baru
        if (!this.shadow.querySelector('.ps-toast')) {
            const toast = document.createElement('div');
            toast.className = 'ps-toast';
            toast.innerText = '⚠️ Nominal tidak boleh nol!';
            
            // Masukkan ke dalam modal (di bagian paling atas konten biru)
            this.modalContent.prepend(toast);
    const display = this.shadow.querySelector('.text-3xl');
display.style.color = '#fecaca'; // Merah muda pucat
setTimeout(() => display.style.color = 'white', 400);  
            // Hapus notif setelah 2 detik
            setTimeout(() => {
                toast.style.opacity = '0';
                toast.style.transition = '0.3s';
                setTimeout(() => toast.remove(), 300);
            }, 2000);
        }

        // 3. Hapus class getar setelah animasi selesai agar bisa dipicu lagi
        setTimeout(() => {
            modal.classList.remove('ps-shake');
        }, 400);
        
        return; // Jangan tutup modal
    }

    this._close(finalValue); 
};
    }
}



if (!('BarcodeDetector' in window)) {
  UI.showPopup("Browser ini tidak mendukung fitur scan barcode", "error");
}



// Gunakan async/await
async function bayar(nostruk, pembelian) {
const payment = new PaymentManager();
    const nominal = await payment.open();
    
    if (nominal !== null) {
     PaymentModal.show({
    invoice: nostruk,
    amount: pembelian, //pembelian
    received: nominal, //uang terima
    method: "Tunai"
});
        // Lanjutkan ke logic sukses Anda di sini
   
    }
}

async function testingpack() {
// Contoh skenario kasir menerima pembayaran
bayar()
}
 
const THEME_KEY = "kasir-theme";

function applyThemeIcon() {
  const btn = document.getElementById("themeToggle");
  if (!btn) return;

  const isLight = document.body.classList.contains("light");
  btn.textContent = isLight ? "🌙" : "☀️";
  btn.setAttribute("aria-label", isLight ? "Aktifkan mode gelap" : "Aktifkan mode terang");
}

function animateThemeIcon() {
  const btn = document.getElementById("themeToggle");
  if (!btn) return;

  btn.classList.remove("theme-pop");
  void btn.offsetWidth;
  btn.classList.add("theme-pop");

  setTimeout(() => {
    btn.classList.remove("theme-pop");
  }, 250);
}

function toggleTheme() {
  document.body.classList.toggle("light");
  localStorage.setItem(
    THEME_KEY,
    document.body.classList.contains("light") ? "light" : "dark"
  );

  animateThemeIcon();
  applyThemeIcon();
}

(function initTheme() {
  const saved = localStorage.getItem(THEME_KEY);
  if (saved === "light") {
    document.body.classList.add("light");
  } else {
    document.body.classList.remove("light");
  }

  const header = document.querySelector(".header");
  if (header && !document.getElementById("themeToggle")) {
    header.insertAdjacentHTML(
      "beforeend",
      `<button id="themeToggle" class="theme-toggle" type="button" onclick="toggleTheme()">☀️</button>`
    );
  }

  applyThemeIcon();
})();


/* ================= 1. STATE & CORE ================= */
const State = {
  mode: "idle",
  cart: [],
  scanLock: false,
  lastCode: null,      
  lastScanTime: 0      
};

const Utils = {
  formatRupiah: (value) => {
    return String(value).replace(/\D/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  },
  playSuccessSound: () => {
    beep.currentTime = 0;
    beep.play().catch(() => {});
    UI.flashScreen();
  },
  buatBarisRapi: (kiri, kanan) => {
    const total = 32;
    const space = total - (String(kiri).length + String(kanan).length);
    return space < 1 ? `${kiri} ${kanan}` : kiri + " ".repeat(space) + kanan;
  },
  playErrorSound: () => {
    errorSound.currentTime = 0;
    errorSound.play().catch(() => {});
    if (navigator.vibrate) navigator.vibrate(200); 
  }
};

/* ================= 2. API REQUESTS ================= */
const API = {
  async getProduct(barcode) {
    try {
      const res = await fetch(`/products/${barcode}`);
      return res.ok ? await res.json() : null;
    } catch { return null; }
  },
  async getAllProducts() {
    try {
      const res = await fetch("/products");
      return res.ok ? await res.json() : [];
    } catch { return []; }
  },
  async saveProduct(data) {
    await fetch("/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
  },
  async updateProduct(barcode, data) {
    const res = await fetch(`/products/${barcode}`, {
      method: "PUT", 
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    return res.ok;
  },
  async deleteProduct(barcode) {
    await fetch(`/products/${barcode}`, { method: "DELETE" });
  }
};

/* ================= 3. UI COMPONENTS ================= */
const UI = {
  popupTimeout: null,

  flashScreen() {
    const d = document.createElement("div");
    d.style = "position:fixed;inset:0;background:white;opacity:0.5;z-index:999;";
    document.body.appendChild(d);
    setTimeout(() => d.remove(), 120);
  },

  showPopup(message, type = "error") {
    let popup = document.getElementById("topPopup");
    if (!popup) {
      popup = document.createElement("div");
      popup.id = "topPopup";
      popup.style = "position:fixed;top:-80px;left:50%;transform:translateX(-50%);padding:10px 14px;border-radius:10px;z-index:9999;font-size:14px;transition:0.3s;color:white;";
      document.body.appendChild(popup);
    }
    clearTimeout(this.popupTimeout);
    
    if (type === "error") {
      popup.classList.add("popup-error"); 
    } else {
      popup.classList.remove("popup-error"); 
    }
    
    popup.style.background = type === "success" ? "#16a34a" : "#dc2626";
    popup.innerText = message;
    popup.style.top = "20px";
    this.popupTimeout = setTimeout(() => popup.style.top = "-80px", 1500);
  },

  render(html) {
    app.innerHTML = html;
  },
  


  // TAMBAHKAN FUNGSI INI
  showConfirm(pesan, onConfirm) {
    // Buat elemen pembungkus (background gelap)
    const overlay = document.createElement("div");
    overlay.className = "modal-bg fade-in";
    overlay.style.zIndex = "99999"; // Pastikan tampil paling depan

    // Isi HTML untuk kotaknya
    overlay.innerHTML = `
      <div class="modal animate-modal font-inter" style="max-width: 320px; text-align: center; padding: 25px 20px;">
        <div style="font-size: 40px; margin-bottom: 10px;">⚠️</div>
        <h3 style="margin-bottom: 10px; font-size: 18px; color: #f8fafc; ">KONFIRMASI?</h3>
        <p style="margin-bottom: 25px; color: #94a3b8; font-size: 14px; line-height: 1.5;">${pesan}</p>
        <div style="display: flex; gap: 10px;">
          <button class="btn cancel-btn" id="btnCancel">Batal</button>
          <button class="btn" id="btnConfirm" style="background: #ef4444; color: white;">Ya, Lanjutkan</button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    // Event jika tombol batal diklik (tutup modal saja)
    overlay.querySelector("#btnCancel").onclick = () => {
      overlay.remove();
    };

    // Event jika tombol konfirmasi diklik
    overlay.querySelector("#btnConfirm").onclick = () => {
      overlay.remove(); // Tutup modal
      if (onConfirm) onConfirm(); // Jalankan fungsi yang diminta
    };
  }
};

/* ================= 4. SCANNER MODULE ================= */
const Scanner = {
  stream: null,
  detector: new BarcodeDetector({ formats: ["ean_13", "ean_8", "code_128"] }),
  animationId: null,

  async start(videoEl, onDetect) {
    this.stop(); 
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "environment" } 
      });
      videoEl.srcObject = this.stream;
      await videoEl.play();
      this.loop(videoEl, onDetect);
    } catch (err) {
      Utils.playErrorSound();
      UI.showPopup("Kamera tidak dapat diakses", "error");
    }
  },

  stop() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    if (this.stream) {
      this.stream.getTracks().forEach(t => t.stop());
      this.stream = null;
    }
  },

  loop(videoEl, onDetect) {
    if (!document.body.contains(videoEl)) {
      this.stop();
      return;
    }

    this.detector.detect(videoEl).then(codes => {
      if (codes.length && !State.scanLock) {
        onDetect(codes[0].rawValue);
      }
    }).catch(() => {});

    this.animationId = requestAnimationFrame(() => this.loop(videoEl, onDetect));
  }
};

/* ================= 5. FEATURES: CHECK PRODUCT ================= */
async function showScan() {
  State.mode = "scan";
  Scanner.stop();

  UI.render(`
    <div class="card fade-in">
      <h3>Scan Produk (Cek Harga)</h3>
      <div style="position:relative; overflow:hidden; border-radius:12px;">
        <video id="video" style="width:100%; display:block;"></video>
        
        <div id="priceOverlay" class="fade-in" style="display:none; position:absolute; inset:0; background:rgba(255,255,255,0.95); flex-direction:column; align-items:center; justify-content:center; text-align:center; padding:20px; z-index:10; color: #000;">
          <h2 id="pNama" style="margin: 5px 0 15px 0; font-weight: bold; color: #000;"></h2>
          <h1 id="pHarga" style="color:#16a34a; margin:0 0 20px 0; font-size: 2.5rem;"></h1>
          <button class="btn" onclick="closePriceOverlay()" style="width:80%;">TUTUP (SCAN LAGI)</button>
        </div>
      </div>
      <button class="btn cancel-btn" onclick="loadList()" style="margin-top:15px;">Kembali ke Menu</button>
    </div>
  `);

  Scanner.start(document.getElementById("video"), async (code) => {
    if (State.scanLock) return;
    State.scanLock = true;
    
    const p = await API.getProduct(code);
    if (p) {
      Utils.playSuccessSound();
      const imgHtml = p.image ? `<img src="${p.image}" style="width:120px; height:120px; border-radius:10px; object-fit:cover; margin-bottom:10px;">` : "";
      
      document.getElementById("priceOverlay").innerHTML = `
        ${imgHtml}
        <small style="color: #666;">Nama Barang:</small>
        <h2 style="margin: 5px 0 15px 0; font-weight: bold;">${p.nama}</h2>
        <small style="color: #666;">Harga Retail:</small>
        <h1 style="color:#16a34a; margin:0 0 20px 0; font-size: 2.5rem;">Rp ${Utils.formatRupiah(p.harga)}</h1>
        <button class="btn" onclick="closePriceOverlay()" style="width:80%;">TUTUP (SCAN LAGI)</button>
      `;
      document.getElementById("priceOverlay").style.display = "flex";
    } else {
      Utils.playErrorSound();
      UI.showPopup("Produk tidak terdaftar!");
      setTimeout(() => { State.scanLock = false; }, 2000);
    }
  });
}

function closePriceOverlay() {
  document.getElementById("priceOverlay").style.display = "none";
  State.scanLock = false; 
}

/* ================= 6. FEATURES: CART & PAYMENT ================= */
const Cart = {
  render() {
    // Hitung Total Keseluruhan
    const totalHarga = State.cart.reduce((sum, item) => sum + (item.harga * item.qty), 0);

    UI.render(`
      <div class="card fade-in">
<h3 class="section-title">List Keranjang</h3>
        ${State.cart.length === 0 ? "<p>Belum ada barang</p>" : ""}
        
        ${State.cart.map((item, i) => `
          <div class="cart-item" id="cart-${item.barcode}" style="display:flex; justify-content:space-between; align-items:center; padding:12px; gap:10px;">
            <div style="display:flex; align-items:center; gap:10px; flex:1;">
              <img src="${item.image || 'https://via.placeholder.com/50'}" 
                   style="width:45px; height:45px; border-radius:8px; object-fit:cover; border:1px solid #eee;">
              <div>
                <b style="font-size:14px; display:block; line-height:1.2;">${item.nama}</b>
                <small style="color: #22c55e;">Rp ${Utils.formatRupiah(item.harga)}/pcs</small>
              </div>
            </div>
            
            <div style="display:flex; align-items:center; gap:10px;">
              <div class="qty-box">
                <button class="qty-btn" onclick="Cart.changeQty(${i}, -1)">−</button>
                <div class="qty-value">${item.qty}</div>
                <button class="qty-btn" onclick="Cart.changeQty(${i}, 1)">+</button>
              </div>
              <button onclick="Cart.remove(${i})" style="background:none; border:none; color:#dc2626; font-size:18px; padding:0 5px; cursor:pointer;">✕</button>
            </div>
          </div>
        `).join("")}
        
        ${State.cart.length > 0 ? `
        <div class="cart-total-box">
          <span style="font-size: 16px; color: #4ade80;">Total Belanja:</span>
          <span style="font-size: 20px; font-weight: bold; color: #22c55e;">Rp ${Utils.formatRupiah(totalHarga)}</span>
        </div>
        ` : ""}
      </div>
      
      <div class="bottom-space"></div>
      <div class="fab-small-right" onclick="showScanForPayment()">+</div>
      <div class="fab-small-left" onclick="Cart.reset()">RESET</div>
      <div class="fab-pay" onclick="showCheckoutModal()">BAYAR</div>
    `);
  },

  add(product, barcode) {
    const index = State.cart.findIndex(i => i.barcode === barcode);
    if (index !== -1) {
      State.cart[index].qty += 1;
    } else {
      State.cart.push({ 
        barcode, nama: product.nama, harga: product.harga, image: product.image, qty: 1 
      });
    }
    this.render(); 
  },

changeQty(index, delta) {
    if (!State.cart[index]) return;
    const newQty = State.cart[index].qty + delta;
    
    if (newQty > 0) {
      State.cart[index].qty = newQty;
      this.updateUIOnly(index); // Panggil fungsi update angka yang tadi kita buat
    } else {
      // Jika qty menjadi 0, munculkan konfirmasi hapus
      UI.showConfirm(`Hapus ${State.cart[index].nama} dari keranjang?`, () => {
        State.cart.splice(index, 1);
        this.render(); // Render ulang untuk menghapus baris barang
      });
    }
  },
  
  // Fungsi baru agar tidak reload page
  updateUIOnly(index) {
    const item = State.cart[index];
    const itemEl = document.getElementById(`cart-${item.barcode}`);
    
    if (itemEl) {
      // 1. Update angka quantity di baris tersebut
      const qtyVal = itemEl.querySelector('.qty-value');
      if (qtyVal) qtyVal.innerText = item.qty;

      // 2. Update Total Harga di bagian bawah (tanpa render ulang)
      const totalHarga = State.cart.reduce((sum, i) => sum + (i.harga * i.qty), 0);
      const totalBox = document.querySelector('.cart-total-box span:last-child');
      if (totalBox) {
        totalBox.innerText = `Rp ${Utils.formatRupiah(totalHarga)}`;
      }
    }
  },

remove(index) {
    if (confirm(`Hapus ${State.cart[index].nama}?`)) {
      State.cart.splice(index, 1);
      this.render(); // Untuk hapus baris, kita baru render ulang
    }
  },

reset() {
    // Panggil UI.showConfirm(pesan, fungsi_yang_dijalankan)
    UI.showConfirm("Apakah Anda yakin ingin mengosongkan semua barang di keranjang?", () => {
      State.cart = []; 
      this.render();
      UI.showPopup("Keranjang berhasil dikosongkan", "success");
    });
  }


};

function showPaymentPage() {
  Scanner.stop(); 
  State.mode = "payment";
  State.scanLock = false;
  Cart.render();
}

async function showScanForPayment() {
  State.mode = "payment_scan";
  UI.render(`
    <div class="card fade-in">
      <h3>Scan Tambah Keranjang</h3>
      <video id="video" style="width:100%;border-radius:12px;"></video>
      <button class="btn cancel-btn" onclick="showPaymentPage()" style="margin-top:10px;">Selesai Scan</button>
    </div>
  `);

  Scanner.start(document.getElementById("video"), async (code) => {
    const now = Date.now();
    if (State.scanLock) return;
    if (code === State.lastCode && (now - State.lastScanTime) < 2000) return; 

    State.scanLock = true;
    State.lastCode = code;
    State.lastScanTime = now;

    const p = await API.getProduct(code);

    if (p) {
      Utils.playSuccessSound();
      Cart.add(p, code);
      setTimeout(() => {
        State.scanLock = false;
        showPaymentPage();
      }, 300); 
    } else {
      Utils.playErrorSound();
      UI.showPopup("Produk tidak terdaftar!");
      setTimeout(() => { 
        State.scanLock = false; 
        State.lastCode = null; 
      }, 2000);
    }
  });
}

/* ================= 6.5. CHECKOUT MODAL (VERIFIKASI PEMBAYARAN) ================= */
function showCheckoutModal() {
  if (State.cart.length === 0) {
    Utils.playErrorSound();
    return UI.showPopup("Keranjang masih kosong!", "error");
  }

  const totalHarga = State.cart.reduce((sum, item) => sum + (item.harga * item.qty), 0);
  
  // Render list barang untuk popup
  const itemListHtml = State.cart.map(item => `
    <div class="checkout-item">
      <div style="flex:1;">
        <div style="font-weight:bold; color:var(--text-primary);">${item.nama}</div>
        <div style="color:#64748b; font-size:12px;">Rp ${Utils.formatRupiah(item.harga)} x ${item.qty}</div>
      </div>
      <div style="font-weight:bold; color:#16a34a;">Rp ${Utils.formatRupiah(item.harga * item.qty)}</div>
    </div>
  `).join("");

  app.insertAdjacentHTML("beforeend", `
    <div class="modal-bg fade-in" id="checkoutModal">
      <div class="modal checkout-modal animate-modal">
        <h3 style="text-align:center; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px;">Verifikasi Pembayaran</h3>
        
        <div class="checkout-list">
          ${itemListHtml}
        </div>

        <div style="background:#f1f5f9; padding:15px; border-radius:10px; text-align:center; margin-bottom:15px;">
          <div style="color:#64748b; font-size:14px; margin-bottom:5px;">Total Pembelian:</div>
          <div style="font-size:24px; font-weight:bold; color:#0f172a;">Rp ${Utils.formatRupiah(totalHarga)}</div>
        </div>

        <div style="display:flex; gap:10px;">
          <button class="btn cancel-btn" onclick="document.getElementById('checkoutModal').remove()">Batal</button>
          <button class="btn" style="background:#16a34a;" onclick="confirmPayment()">Konfirmasi</button>
        </div>
      </div>
    </div>
  `);
}

function confirmPayment() {
  const data = getRealCartData()
  
  document.getElementById("checkoutModal").remove();
//   PaymentModal.show({
//   invoice: data.noStruk,
//   amount: formattedHarga,
//   method: "Cash"
// })
bayar(data.noStruk, data.total)
 // showPrintPage();
}

/* ================= 7. FEATURES: PRODUCT LIST ================= */
async function loadList() {
  Scanner.stop(); 
  State.mode = "idle";
  State.scanLock = false;
 
  const data = await API.getAllProducts();

  UI.render(`
    <div class="card fade-in"><h3>Daftar Produk</h3></div>
    ${data.map(p => `
      <div class="card fade-in" onclick="openModal('${p.barcode}')" style="display:flex; align-items:center; gap:15px;">
        <img src="${p.image || 'https://via.placeholder.com/50'}" style="width:50px; height:50px; border-radius:8px; object-fit:cover;">
        <div>
          <b>${p.nama}</b><br>Rp ${Utils.formatRupiah(p.harga)}<br><small>${p.barcode}</small>
        </div>
      </div>
    `).join("")}
    <div class="bottom-space"></div>
    <div class="fab" onclick="showScanForAdd()">+</div>
  `);
}

async function showScanForAdd() {
  State.mode = "add";
  UI.render(`
    <div class="card fade-in">
      <h3>Scan Produk Baru</h3>
      <video id="video" style="width:100%;border-radius:12px;"></video>
      <button class="btn cancel-btn" onclick="loadList()" style="margin-top:10px;">Batal</button>
    </div>
  `);

  Scanner.start(document.getElementById("video"), (code) => {
    Scanner.stop();
    Utils.playSuccessSound();
    showAddForm(code);
  });
}

async function showAddForm(barcode) {
  const allProducts = await API.getAllProducts();
  const isDuplicate = allProducts.some(p => p.barcode === barcode);

  if (isDuplicate) {
    Utils.playErrorSound();
    UI.showPopup("Gagal: Produk ini sudah terdaftar!", "error");
    return loadList(); 
  }

  UI.render(`
    <div class="card fade-in">
      <h3>Tambah Produk Baru</h3>
      
      <div id="imgPreviewContainer" style="width:100%; height:300px; background:#f1f5f9; border-radius:12px; margin-bottom:15px; display:flex; align-items:center; justify-content:center; overflow:hidden; border: 2px dashed #cbd5e1;">
        <img id="imgView" src="" style="display:none; width:100%; height:100%; object-fit:cover;">
        <span id="imgPlaceholder" style="color:#94a3b8;">Preview Gambar (Portrait)</span>
      </div>

      <label class="label">Link Gambar (URL)</label>
      <input id="imgUrl" class="input" placeholder="https://..." 
        oninput="const v=this.value; const img=document.getElementById('imgView'); if(v){img.src=v; img.style.display='block'; document.getElementById('imgPlaceholder').style.display='none';}else{img.style.display='none'; document.getElementById('imgPlaceholder').style.display='flex';}">
      
      <label class="label">Nama Produk</label>
      <input id="nama" class="input" placeholder="Masukkan nama barang">
      
      <label class="label">Harga Jual</label>
      <input class="input" id="harga" placeholder="Rp 0" readonly
        onclick="Numpad.open('', val => document.getElementById('harga').value = Utils.formatRupiah(val))"/>
      
      <button class="btn" onclick="saveNewProduct('${barcode}')">Simpan Produk</button>
      <button class="btn cancel-btn" onclick="loadList()" style="margin-top:8px;">Batal</button>
    </div>
  `);
}

async function saveNewProduct(barcode) {
  const nama = document.getElementById("nama").value.trim();
  const hargaRaw = document.getElementById("harga").value.replace(/\D/g, "");
  const image = document.getElementById("imgUrl").value.trim();

  if (!nama || !hargaRaw || hargaRaw === "0") {
    Utils.playErrorSound();
    return UI.showPopup("Nama dan Harga harus diisi!", "error");
  }

  await API.saveProduct({ 
    barcode, 
    nama, 
    harga: parseInt(hargaRaw),
    image: image || "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTkvallQ5ZGN8H0RHyH6fe91ycZ2NbnLPmx9x-2_NqnBQ&s=10" 
  });
  
  UI.showPopup("Produk berhasil disimpan!", "success");
  loadList();
}

/* ================= 8. FEATURES: EDIT MODAL ================= */
async function openModal(barcode) {
  const p = await API.getProduct(barcode);
  if (!p) return;

  app.insertAdjacentHTML("beforeend", `
    <div class="modal-bg fade-in" id="modal">
      <div class="modal animate-modal">
        <button class="exit-btn" onclick="document.getElementById('modal').remove()">✕</button>
        <h3>Edit Produk</h3>
        <div class="input-group">
          <label class="label">Barcode</label>
          <input class="input" value="${p.barcode}" disabled>
        </div>
        <div class="input-group">
          <label class="label">URL Gambar</label>
          <input id="mImage" class="input" value="${p.image || ''}">
          <label class="label">Nama Produk</label>
          <input id="mNama" class="input" value="${p.nama}">
        </div>
        <input id="mHarga" class="input" readonly value="${Utils.formatRupiah(p.harga)}"
          onclick="Numpad.open(this.value, val => document.getElementById('mHarga').value = Utils.formatRupiah(val))"/>
        <div class="modal-actions">
          <button class="save-btn" onclick="saveEdit('${p.barcode}')">Simpan</button>
          <button class="delete-btn" onclick="deleteProduct('${p.barcode}')">Hapus</button>
        </div>
      </div>
    </div>
  `);
}

async function saveEdit(barcode) {
  const nama = document.getElementById("mNama").value.trim();
  const image = document.getElementById("mImage").value.trim(); 
  const hargaRaw = document.getElementById("mHarga").value;
  
  const hargaBersih = parseInt(hargaRaw.replace(/\D/g, ""));

  if (!nama || isNaN(hargaBersih) || hargaBersih === 0) {
    Utils.playErrorSound();
    return UI.showPopup("Nama dan Harga tidak boleh kosong!", "error");
  }

  await API.updateProduct(barcode, { 
    nama: nama, 
    harga: hargaBersih,
    image: image 
  });

  document.getElementById("modal").remove();
  UI.showPopup("Perubahan berhasil disimpan", "success");
  loadList();
}

async function deleteProduct(barcode) {
  // Tutup modal edit dulu biar rapi
  document.getElementById("modal").remove(); 

  // Munculkan modal konfirmasi
  UI.showConfirm("Yakin ingin menghapus produk ini dari database secara permanen?", async () => {
    await API.deleteProduct(barcode);
    UI.showPopup("Produk dihapus", "success");
    loadList();
  });
}

/* ================= 9. NUMPAD MODULE ================= */
const Numpad = {
  value: "",
  callback: null,

  open(initial = "", callback) {
    this.value = initial.replace(/\D/g, "");
    this.callback = callback;
    
    const el = document.createElement("div");
    el.className = "numpad-bg fade-in";
    el.id = "numpadContainer";
    el.innerHTML = `
      <div class="numpad animate-modal" id="numpadBox">
        <div id="numpadDisplay" class="numpad-display">0</div>
        <div class="numpad-grid">
          ${[1, 2, 3, 4, 5, 6, 7, 8, 9, ".", 0, "⌫"].map(v => `
            <div class="numpad-btn ${v === "⌫" ? "numpad-del" : ""}" onclick="Numpad.press('${v}')">${v}</div>
          `).join("")}
        </div>
        <div style="display:flex;gap:8px;margin-top:10px;">
          <button class="btn" onclick="Numpad.close(true)">OK</button>
        </div>
      </div>
    `;
    document.body.appendChild(el);
    this.render();

    el.addEventListener("click", (e) => {
      if (e.target === el) this.close(true);
    });
  },

  press(v) {
    if (v === "⌫") this.value = this.value.slice(0, -1);
    else if (v !== ".") this.value += v;
    this.render();
  },

  render() {
    const d = document.getElementById("numpadDisplay");
    if (d) d.innerText = Utils.formatRupiah(this.value) || "0";
  },

  close(save = false) {
    const val = this.value === "" ? 0 : parseInt(this.value);
    if (save && this.callback) this.callback(val);
    document.getElementById("numpadContainer")?.remove();
  }
};

/* ================= 10. PRINT / STRUK MODULE ================= */
function generateTeksStruk(data, received) {
  
  
  let text = `\n        TOKO ANUGRAH MAHAKAM          \n`;
  text += `Jl. Poros No.135, Sabe\nKec. Belopa Utara\nKab. Luwu, Sulawesi Selatan\nTelp : 082333100333\n\n`;
  text += Utils.buatBarisRapi(`No: ${data.noStruk}`, data.tanggal) + "\n";
  text += Utils.buatBarisRapi(`Kasir: ${data.kasir}`, data.waktu) + "\n";
  text += `Pelanggan: ${data.pelanggan}\n`;
  text += "--------------------------------\n";

  let totalQty = 0;
  data.items.forEach(item => {
    text += `${item.nama}\n`;
    text += Utils.buatBarisRapi(`${Utils.formatRupiah(item.harga)} x ${item.qty}`, `= ${Utils.formatRupiah(item.subtotal)}`) + "\n";
    totalQty += item.qty;
  });

  text += "--------------------------------\n";
  text += `TOTAL QTY : ${totalQty}\n`
  text += Utils.buatBarisRapi(`\n Total`, Utils.formatRupiah(data.total)) + "\n";
  
  // Penambahan bagian Pembayaran dan Kembalian
// Kalkulasi ulang kembalian berdasarkan total belanja
  const kembalian = received - data.total;
  text += Utils.buatBarisRapi(`\n Bayar(Cash)`, Utils.formatRupiah(received)) + "\n";
  text += Utils.buatBarisRapi(`\n Kembalian`, Utils.formatRupiah(kembalian)) + "\n";

  text += "\nTerimakasih telah berbelanja !!!\n\n";

  return text;
}

function getRealCartData() {
  const totalHarga = State.cart.reduce((sum, item) => sum + (item.harga * item.qty), 0);
  
  const strukItems = State.cart.map(item => ({
    nama: item.nama,
    harga: item.harga,
    qty: item.qty,
    subtotal: item.harga * item.qty
  }));

  return {
    noStruk: Math.floor(1000 + Math.random() * 9000).toString(), // Generate nomor acak
    tanggal: new Date().toLocaleDateString('id-ID'),
    waktu: new Date().toLocaleTimeString('id-ID'),
    kasir: "Anugrah Mahakam",
    pelanggan: "Umum",
    items: strukItems,
    total: totalHarga
  };
}

function processDataStruk(received) {
  const data = getRealCartData();
  const preview = generateTeksStruk(data, received);
  showPrintPage(preview);
}

function showPrintPage(data) {
  document.getElementById("ps-modal-host")?.remove();
  document.body.style.overflow = "auto";
  Scanner.stop();
  State.mode = "print";

  // 1. Bersihkan data dari karakter yang bisa merusak HTML (seperti tanda kutip)
  // Kita simpan di State global supaya aman dan mudah diambil
  State.lastPrintData = data;

  UI.render(`
    <div class="card fade-in">
      <h3>Struk Pembayaran</h3>
      <pre class="print-preview struk">${data}</pre>
      <button class="btn" onclick="handleCetak()" style="background:#16a34a; margin-bottom: 10px;">Cetak Struk</button>
      <button class="btn cancel-btn" onclick="selesaiTransaksi()">Selesai</button>
    </div>
  `);
}

// 2. Buat fungsi perantara (Wrapper)
function handleCetak() {
  if (State.lastPrintData) {
    testPrint(State.lastPrintData);
  } else {
    console.error("Data print tidak ditemukan di State!");
  }
}

// 3. Fungsi print kamu yang asli
function testPrint(data) {
  window.location.href = `rawbt:${encodeURIComponent(data)}`;
}



function selesaiTransaksi() {
  State.cart = []; // Kosongkan keranjang setelah selesai cetak
  showPaymentPage(); // Kembali ke halaman awal kasir
}