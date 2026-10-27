/**
 * Beauty Zone Women's Parlour - Interactive Experience
 */

document.addEventListener('DOMContentLoaded', () => {
  initLiveHours();
  initNavbar();
  initCalculator();
  initServiceFilters();
  initBeforeAfterSlider();
  initFaqAccordion();
  initModals();
  initScrollTop();
  initPaymentSystem();
});

/* ===================================================================
   1. Live Working Hours & Dynamic Status
   =================================================================== */
function initLiveHours() {
  const badge = document.getElementById('liveStatusBadge');
  if (!badge) return;

  const now = new Date();
  const currentHour = now.getHours();
  // Operating Hours: 10:00 AM to 9:00 PM (21:00)
  const isOpen = currentHour >= 10 && currentHour < 21;

  if (isOpen) {
    badge.innerHTML = `<span class="pulse-dot"></span> Open Now · Closes 9 PM`;
    badge.style.color = '#4ade80';
    badge.style.background = 'rgba(34, 197, 94, 0.12)';
    badge.style.borderColor = 'rgba(34, 197, 94, 0.3)';
  } else {
    badge.innerHTML = `<span class="pulse-dot" style="background: #fbbf24;"></span> Closed · Opens 10 AM`;
    badge.style.color = '#fbbf24';
    badge.style.background = 'rgba(251, 191, 36, 0.12)';
    badge.style.borderColor = 'rgba(251, 191, 36, 0.3)';
  }
}

/* ===================================================================
   2. Sticky Navbar & Mobile Drawer
   =================================================================== */
function initNavbar() {
  const navbar = document.querySelector('.navbar');
  const toggleBtn = document.getElementById('menuToggleBtn');
  const navLinks = document.getElementById('navLinks');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });

  if (toggleBtn && navLinks) {
    toggleBtn.addEventListener('click', () => {
      navLinks.classList.toggle('active');
      const icon = toggleBtn.querySelector('i') || toggleBtn;
      if (navLinks.classList.contains('active')) {
        toggleBtn.innerHTML = '✕';
      } else {
        toggleBtn.innerHTML = '☰';
      }
    });

    // Close menu when clicking link
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('active');
        toggleBtn.innerHTML = '☰';
      });
    });
  }
}

/* ===================================================================
   3. Interactive Price Calculator & Booking Wizard
   =================================================================== */
const selectedServices = new Map();

function initCalculator() {
  const cards = document.querySelectorAll('.service-choice-card');
  const itemsContainer = document.getElementById('selectedItemsList');
  const totalAmountEl = document.getElementById('calcTotalAmount');
  const emptyNote = document.getElementById('emptyChoiceNote');
  const whatsappBtn = document.getElementById('calcWhatsappBtn');
  const instantBookBtn = document.getElementById('calcInstantBtn');

  cards.forEach(card => {
    card.addEventListener('click', () => {
      const id = card.dataset.id;
      const name = card.dataset.name;
      const price = parseInt(card.dataset.price, 10);

      if (selectedServices.has(id)) {
        selectedServices.delete(id);
        card.classList.remove('selected');
      } else {
        selectedServices.set(id, { name, price });
        card.classList.add('selected');
      }

      updateCalculatorUI();
    });
  });

  function updateCalculatorUI() {
    // Clear list
    itemsContainer.innerHTML = '';
    let total = 0;

    if (selectedServices.size === 0) {
      if (emptyNote) {
        itemsContainer.appendChild(emptyNote);
        emptyNote.style.display = 'block';
      }
    } else {
      if (emptyNote) emptyNote.style.display = 'none';

      selectedServices.forEach((item, id) => {
        total += item.price;
        const row = document.createElement('div');
        row.className = 'summary-item-row';
        row.innerHTML = `
          <span>${item.name}</span>
          <span>₹${item.price.toLocaleString('en-IN')}</span>
        `;
        itemsContainer.appendChild(row);
      });
    }

    if (totalAmountEl) {
      totalAmountEl.textContent = `₹${total.toLocaleString('en-IN')}`;
    }
  }

  // Pre-fill WhatsApp message
  if (whatsappBtn) {
    whatsappBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const nameInput = document.getElementById('calcCustName');
      const phoneInput = document.getElementById('calcCustPhone');
      const dateInput = document.getElementById('calcCustDate');

      const name = nameInput && nameInput.value.trim() ? nameInput.value.trim() : 'Guest Customer';
      const phone = phoneInput && phoneInput.value.trim() ? phoneInput.value.trim() : 'Not provided';
      const date = dateInput && dateInput.value ? dateInput.value : 'Soonest available';

      if (selectedServices.size === 0) {
        showToast('Please select at least one beauty service first!');
        return;
      }

      let serviceListText = '';
      let total = 0;
      selectedServices.forEach(item => {
        serviceListText += `• ${item.name} (₹${item.price.toLocaleString('en-IN')})\n`;
        total += item.price;
      });

      const message = `Hello Beauty Zone Women's Parlour!\n\nI would like to book an appointment:\n` +
        `👤 Name: ${name}\n` +
        `📞 Contact: ${phone}\n` +
        `📅 Preferred Date: ${date}\n\n` +
        `💅 Selected Services:\n${serviceListText}\n` +
        `💰 Estimated Total: ₹${total.toLocaleString('en-IN')}\n\n` +
        `Please confirm slot availability. Thank you!`;

      const encodedMsg = encodeURIComponent(message);
      const whatsappUrl = `https://wa.me/918434956448?text=${encodedMsg}`;
      window.open(whatsappUrl, '_blank');
    });
  }

  // Instant booking & Online payment from calculator
  const payOnlineBtn = document.getElementById('calcPayOnlineBtn');
  if (payOnlineBtn) {
    payOnlineBtn.addEventListener('click', () => {
      const nameInput = document.getElementById('calcCustName');
      const phoneInput = document.getElementById('calcCustPhone');
      const dateInput = document.getElementById('calcCustDate');

      if (selectedServices.size === 0) {
        showToast('Please select at least one beauty service first!');
        return;
      }

      const name = nameInput && nameInput.value.trim() ? nameInput.value.trim() : 'Valued Guest';
      const phone = phoneInput && phoneInput.value.trim() ? phoneInput.value.trim() : '+91 84349 56448';
      const date = dateInput && dateInput.value ? dateInput.value : 'Soonest Available';

      let total = 0;
      let serviceNames = [];
      selectedServices.forEach(item => {
        total += item.price;
        serviceNames.push(item.name);
      });

      const bookingId = 'BZ-' + Math.floor(100000 + Math.random() * 900000);

      openPaymentModal({
        bookingId,
        customerName: name,
        customerPhone: phone,
        appointmentDate: date,
        serviceName: serviceNames.join(', '),
        packageTotal: total,
        initialMode: 'advance'
      });
    });
  }

  // Instant booking confirmation (Pay at Salon)
  if (instantBookBtn) {
    instantBookBtn.addEventListener('click', () => {
      const nameInput = document.getElementById('calcCustName');
      const phoneInput = document.getElementById('calcCustPhone');

      if (selectedServices.size === 0) {
        showToast('Please select at least one service to proceed!');
        return;
      }

      const name = nameInput && nameInput.value.trim() ? nameInput.value.trim() : 'Valued Guest';
      const phone = phoneInput && phoneInput.value.trim() ? phoneInput.value.trim() : '';

      if (!phone) {
        showToast('Please enter your phone number to receive confirmation!');
        if (phoneInput) phoneInput.focus();
        return;
      }

      const bookingId = 'BZ-' + Math.floor(100000 + Math.random() * 900000);
      openConfirmModal(bookingId, name);
    });
  }
}

/* ===================================================================
   4. Services Filter Tabs
   =================================================================== */
function initServiceFilters() {
  const tabBtns = document.querySelectorAll('.tab-btn');
  const cards = document.querySelectorAll('.service-card');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.dataset.filter;

      cards.forEach(card => {
        const category = card.dataset.category;
        if (filter === 'all' || category === filter) {
          card.style.display = 'flex';
          setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
          }, 50);
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
}

/* ===================================================================
   5. Interactive Before & After Slider
   =================================================================== */
function initBeforeAfterSlider() {
  const container = document.getElementById('beforeAfterBox');
  const afterLayer = document.getElementById('afterLayer');
  const handle = document.getElementById('sliderHandle');

  if (!container || !afterLayer || !handle) return;

  let isDragging = false;

  const moveSlider = (clientX) => {
    const rect = container.getBoundingClientRect();
    let posX = clientX - rect.left;
    if (posX < 0) posX = 0;
    if (posX > rect.width) posX = rect.width;

    const percentage = (posX / rect.width) * 100;
    afterLayer.style.width = `${percentage}%`;
    handle.style.left = `${percentage}%`;
  };

  handle.addEventListener('mousedown', () => { isDragging = true; });
  window.addEventListener('mouseup', () => { isDragging = false; });
  window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    moveSlider(e.clientX);
  });

  // Touch Support for mobile phones
  handle.addEventListener('touchstart', () => { isDragging = true; }, { passive: true });
  window.addEventListener('touchend', () => { isDragging = false; });
  window.addEventListener('touchmove', (e) => {
    if (!isDragging || !e.touches[0]) return;
    moveSlider(e.touches[0].clientX);
  });
}

/* ===================================================================
   6. FAQ Accordion
   =================================================================== */
function initFaqAccordion() {
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');

    question.addEventListener('click', () => {
      const isActive = item.classList.contains('active');

      // Close all
      faqItems.forEach(otherItem => {
        otherItem.classList.remove('active');
        const otherAnswer = otherItem.querySelector('.faq-answer');
        if (otherAnswer) otherAnswer.style.maxHeight = null;
      });

      if (!isActive) {
        item.classList.add('active');
        answer.style.maxHeight = answer.scrollHeight + 'px';
      }
    });
  });
}

/* ===================================================================
   7. Modals & Notifications
   =================================================================== */
function initModals() {
  const appointmentModal = document.getElementById('appointmentModal');
  const confirmModal = document.getElementById('confirmModal');
  const paymentModal = document.getElementById('paymentModal');
  const receiptModal = document.getElementById('receiptModal');
  const openButtons = document.querySelectorAll('[data-open-modal="appointment"]');
  const closeButtons = document.querySelectorAll('[data-close-modal]');

  openButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      if (appointmentModal) {
        appointmentModal.classList.add('active');
        document.body.style.overflow = 'hidden';
      }
    });
  });

  closeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      [appointmentModal, confirmModal, paymentModal, receiptModal].forEach(m => {
        if (m) m.classList.remove('active');
      });
      document.body.style.overflow = '';
    });
  });

  // Close on backdrop click
  [appointmentModal, confirmModal, paymentModal, receiptModal].forEach(modal => {
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          modal.classList.remove('active');
          document.body.style.overflow = '';
        }
      });
    }
  });

  // Radio button updates in appointment modal
  const payRadios = document.querySelectorAll('input[name="bookingPayMethod"]');
  const modalSubmitBtnText = document.getElementById('modalSubmitBtnText');
  payRadios.forEach(radio => {
    radio.addEventListener('change', () => {
      document.querySelectorAll('.pay-radio-card').forEach(c => c.classList.remove('active'));
      const card = radio.closest('.pay-radio-card');
      if (card) card.classList.add('active');

      if (modalSubmitBtnText) {
        if (radio.value === 'advance') {
          modalSubmitBtnText.textContent = '💳 Proceed to Secure Payment (₹100)';
        } else if (radio.value === 'full') {
          modalSubmitBtnText.textContent = '💳 Proceed to Secure Payment (Full - 5% Off)';
        } else {
          modalSubmitBtnText.textContent = '✨ Confirm Reservation (Pay at Salon)';
        }
      }
    });
  });

  // Direct modal form submit
  const modalForm = document.getElementById('quickBookingForm');
  if (modalForm) {
    modalForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('modalCustName').value.trim() || 'Valued Customer';
      const phone = document.getElementById('modalCustPhone').value.trim();
      const serviceSelect = document.getElementById('modalCustService');
      const service = serviceSelect ? serviceSelect.value : 'Bridal HD Makeup';
      const date = document.getElementById('modalCustDate').value || 'Upcoming date';
      const payMethod = document.querySelector('input[name="bookingPayMethod"]:checked')?.value || 'advance';

      if (!phone) {
        showToast('Please enter your mobile number!');
        return;
      }

      if (appointmentModal) appointmentModal.classList.remove('active');
      const bookingId = 'BZ-' + Math.floor(100000 + Math.random() * 900000);
      const price = SERVICE_PRICE_MAP[service] || 1500;

      if (payMethod === 'advance' || payMethod === 'full') {
        openPaymentModal({
          bookingId,
          customerName: name,
          customerPhone: phone,
          appointmentDate: date,
          serviceName: service,
          packageTotal: price,
          initialMode: payMethod
        });
      } else {
        openConfirmModal(bookingId, name);
      }
    });
  }

  // Token button from confirm modal
  const btnPayTokenFromConfirm = document.getElementById('btnPayTokenFromConfirm');
  if (btnPayTokenFromConfirm) {
    btnPayTokenFromConfirm.addEventListener('click', () => {
      if (confirmModal) confirmModal.classList.remove('active');
      const nameEl = document.getElementById('confirmedCustName');
      const idEl = document.getElementById('confirmedBookingId');
      openPaymentModal({
        bookingId: idEl ? idEl.textContent : 'BZ-849201',
        customerName: nameEl ? nameEl.textContent : 'Valued Guest',
        customerPhone: '+91 84349 56448',
        appointmentDate: 'Upcoming Date',
        serviceName: 'Salon Treatment',
        packageTotal: 2500,
        initialMode: 'advance'
      });
    });
  }

  // Nav & Footer Quick Pay buttons
  ['navQuickPayBtn', 'navPayLink', 'footerPayLink'].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        openPaymentModal({
          bookingId: 'BZ-' + Math.floor(100000 + Math.random() * 900000),
          customerName: 'Valued Guest',
          customerPhone: '+91 84349 56448',
          appointmentDate: 'Upcoming Date',
          serviceName: 'Bridal HD & Airbrush Makeup',
          packageTotal: 7500,
          initialMode: 'advance'
        });
      });
    }
  });
}

function openConfirmModal(id, name) {
  const confirmModal = document.getElementById('confirmModal');
  const idEl = document.getElementById('confirmedBookingId');
  const nameEl = document.getElementById('confirmedCustName');

  if (idEl) idEl.textContent = id;
  if (nameEl) nameEl.textContent = name;

  if (confirmModal) {
    confirmModal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

/* ===================================================================
   8. Scroll Top & Toast Utility
   =================================================================== */
function initScrollTop() {
  const scrollTopBtn = document.getElementById('scrollTopBtn');
  if (!scrollTopBtn) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 400) {
      scrollTopBtn.classList.add('visible');
    } else {
      scrollTopBtn.classList.remove('visible');
    }
  });

  scrollTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

function showToast(message) {
  let container = document.getElementById('toastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `<span>✨</span><span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    setTimeout(() => toast.remove(), 400);
  }, 3200);
}

// Global helper for quick book button in cards
window.quickBookService = function(serviceName, defaultPrice) {
  const modal = document.getElementById('appointmentModal');
  const serviceSelect = document.getElementById('modalCustService');
  if (serviceSelect) {
    serviceSelect.value = serviceName;
  }
  if (modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
};

/* ===================================================================
   9. Online Payment Gateway & Receipt Engine
   =================================================================== */
const SERVICE_PRICE_MAP = {
  'Bridal HD Makeup': 7500,
  'Royal Gold Bride Package': 12499,
  'Hair Smoothening': 3999,
  'Hydra Facial': 1499,
  'Deluxe Hair Spa': 999,
  'Spa Manicure & Pedicure': 899,
  'Party Glam Makeup': 1800,
  'Bridal Mehendi': 1500,
  'Rica Full Waxing': 1200,
  'Eyebrow & Threading': 80,
  'Silver Bride Package': 6999,
  'Imperial Diamond Package': 18999
};

let currentPaymentState = {
  bookingId: 'BZ-849201',
  customerName: 'Valued Guest',
  customerPhone: '+91 84349 56448',
  appointmentDate: 'Upcoming Date',
  serviceName: 'Bridal HD & Airbrush Makeup',
  packageTotal: 7500,
  discountAmount: 0,
  payableNow: 100,
  paymentType: 'advance',
  selectedMethod: 'upi',
  selectedBank: 'State Bank of India (SBI)',
  upiId: '8434956448@paytm'
};

function initPaymentSystem() {
  // 1. Amount selection buttons (Advance vs Full vs Custom)
  const btnAdvance = document.getElementById('btnModeAdvance');
  const btnFull = document.getElementById('btnModeFull');
  const btnCustom = document.getElementById('btnModeCustom');

  if (btnAdvance) btnAdvance.addEventListener('click', () => setPaymentAmountMode('advance'));
  if (btnFull) btnFull.addEventListener('click', () => setPaymentAmountMode('full'));
  if (btnCustom) btnCustom.addEventListener('click', () => setPaymentAmountMode('custom'));

  // 2. Payment Method Tabs
  const methodTabs = document.querySelectorAll('.pay-tab-nav-btn');
  methodTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      methodTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const targetMethod = tab.dataset.tab;
      currentPaymentState.selectedMethod = targetMethod;

      document.querySelectorAll('.pay-pane').forEach(p => p.classList.remove('active'));
      const activePane = document.getElementById(`tabPane${targetMethod.charAt(0).toUpperCase() + targetMethod.slice(1)}`);
      if (activePane) activePane.classList.add('active');
    });
  });

  // 3. Copy UPI ID Button
  const copyBtn = document.getElementById('copyUpiBtn');
  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(currentPaymentState.upiId).then(() => {
        copyBtn.textContent = '✓ Copied!';
        setTimeout(() => { copyBtn.textContent = '📋 Copy UPI'; }, 2000);
        showToast('UPI ID copied to clipboard: ' + currentPaymentState.upiId);
      }).catch(() => {
        showToast('UPI ID: ' + currentPaymentState.upiId);
      });
    });
  }

  // 4. Bank Selection Chips
  const bankButtons = document.querySelectorAll('.bank-choice-btn');
  const bankLabel = document.getElementById('selectedBankLabel');
  bankButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      bankButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentPaymentState.selectedBank = btn.dataset.bank;
      if (bankLabel) bankLabel.textContent = btn.dataset.bank.split(' ')[0];
    });
  });

  // 5. Virtual Card live preview formatting
  const cardNumInput = document.getElementById('cardInputNumber');
  const cardNameInput = document.getElementById('cardInputName');
  const cardExpInput = document.getElementById('cardInputExpiry');
  const numDisplay = document.getElementById('virtualCardNumDisplay');
  const nameDisplay = document.getElementById('virtualCardNameDisplay');
  const expDisplay = document.getElementById('virtualCardExpDisplay');

  if (cardNumInput && numDisplay) {
    cardNumInput.addEventListener('input', (e) => {
      let val = e.target.value.replace(/\D/g, '').substring(0, 16);
      let formatted = val.match(/.{1,4}/g)?.join(' ') || '';
      e.target.value = formatted;
      numDisplay.textContent = formatted || '•••• •••• •••• 4291';
    });
  }

  if (cardNameInput && nameDisplay) {
    cardNameInput.addEventListener('input', (e) => {
      nameDisplay.textContent = e.target.value.trim().toUpperCase() || 'VALUED GUEST';
    });
  }

  if (cardExpInput && expDisplay) {
    cardExpInput.addEventListener('input', (e) => {
      let val = e.target.value.replace(/\D/g, '').substring(0, 4);
      if (val.length >= 2) {
        val = val.substring(0, 2) + '/' + val.substring(2);
      }
      e.target.value = val;
      expDisplay.textContent = val || '12/28';
    });
  }

  // 6. Confirm UPI payment
  const btnConfirmUpi = document.getElementById('btnConfirmUpiPayment');
  if (btnConfirmUpi) {
    btnConfirmUpi.addEventListener('click', () => {
      const utr = document.getElementById('upiUtrInput')?.value.trim() || '';
      processPayment({
        methodName: 'UPI / QR Code',
        reference: utr ? `UTR-${utr}` : `UPI-${Date.now().toString().slice(-6)}`,
        gateway: 'BHIM UPI Network'
      });
    });
  }

  // 7. Card Form Submit
  const cardForm = document.getElementById('cardPaymentForm');
  if (cardForm) {
    cardForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const num = cardNumInput ? cardNumInput.value.replace(/\s/g, '') : '';
      if (num.length < 12) {
        showToast('Please enter a valid 16-digit card number!');
        return;
      }
      processPayment({
        methodName: 'Debit / Credit Card',
        reference: `CARD-${num.slice(-4)}-${Date.now().toString().slice(-4)}`,
        gateway: 'RuPay / Visa Secure Gateway'
      });
    });
  }

  // 8. Bank Payment Submit
  const btnConfirmBank = document.getElementById('btnConfirmBankPayment');
  if (btnConfirmBank) {
    btnConfirmBank.addEventListener('click', () => {
      processPayment({
        methodName: `Net Banking (${currentPaymentState.selectedBank})`,
        reference: `NB-${Date.now().toString().slice(-6)}`,
        gateway: currentPaymentState.selectedBank
      });
    });
  }

  // 9. Pay at Salon Submit
  const btnConfirmSalon = document.getElementById('btnConfirmSalonPay');
  if (btnConfirmSalon) {
    btnConfirmSalon.addEventListener('click', () => {
      const paymentModal = document.getElementById('paymentModal');
      if (paymentModal) paymentModal.classList.remove('active');
      openConfirmModal(currentPaymentState.bookingId, currentPaymentState.customerName);
    });
  }

  // 10. Print Receipt Action
  const btnPrint = document.getElementById('btnPrintReceipt');
  if (btnPrint) {
    btnPrint.addEventListener('click', () => {
      window.print();
    });
  }

  // 11. WhatsApp Receipt Share
  const btnShareWa = document.getElementById('btnShareWhatsAppReceipt');
  if (btnShareWa) {
    btnShareWa.addEventListener('click', () => {
      const state = currentPaymentState;
      const rcpNum = document.getElementById('rcpNumber')?.textContent || 'BZ-RCP';
      const msg = `✨ *BEAUTY ZONE WOMEN'S PARLOUR* ✨\n` +
        `🧾 *OFFICIAL PAYMENT RECEIPT*\n` +
        `------------------------------------\n` +
        `📋 *Receipt No:* ${rcpNum}\n` +
        `🆔 *Booking ID:* ${state.bookingId}\n` +
        `👤 *Client:* ${state.customerName}\n` +
        `📞 *Contact:* ${state.customerPhone}\n` +
        `📅 *Date:* ${state.appointmentDate}\n` +
        `💆 *Treatment:* ${state.serviceName}\n` +
        `------------------------------------\n` +
        `💵 *Package Total:* ₹${state.packageTotal.toLocaleString('en-IN')}\n` +
        `✅ *Amount Paid Today:* ₹${state.payableNow.toLocaleString('en-IN')} (Verified)\n` +
        `🏷️ *Balance Due at Salon:* ₹${Math.max(0, state.packageTotal - state.discountAmount - state.payableNow).toLocaleString('en-IN')}\n` +
        `------------------------------------\n` +
        `📍 *Location:* Daulatram Chowk, Kadwa, Katihar (Bihar)\n` +
        `💖 *Thank you for booking with Beauty Zone!*`;
      window.open(`https://wa.me/918434956448?text=${encodeURIComponent(msg)}`, '_blank');
    });
  }
}

window.openPaymentModal = function(data) {
  const modal = document.getElementById('paymentModal');
  if (!modal) return;

  const bookingId = data.bookingId || ('BZ-' + Math.floor(100000 + Math.random() * 900000));
  const customerName = data.customerName || 'Valued Guest';
  const customerPhone = data.customerPhone || '+91 84349 56448';
  const appointmentDate = data.appointmentDate || 'Upcoming Date';
  const serviceName = data.serviceName || 'Bridal HD & Airbrush Makeup';
  const packageTotal = parseInt(data.packageTotal, 10) || 7500;

  currentPaymentState.bookingId = bookingId;
  currentPaymentState.customerName = customerName;
  currentPaymentState.customerPhone = customerPhone;
  currentPaymentState.appointmentDate = appointmentDate;
  currentPaymentState.serviceName = serviceName;
  currentPaymentState.packageTotal = packageTotal;

  // Update summary DOM
  const custSumm = document.getElementById('payCustomerSummary');
  const servSumm = document.getElementById('payServiceSummary');
  const fullTotal = document.getElementById('payFullTotalDisplay');
  const salonFull = document.getElementById('salonPayFullTotal');
  const btnFullPrice = document.getElementById('btnModeFullPrice');

  if (custSumm) custSumm.textContent = `${customerName} (${bookingId})`;
  if (servSumm) servSumm.textContent = serviceName;
  if (fullTotal) fullTotal.textContent = `₹${packageTotal.toLocaleString('en-IN')}`;
  if (salonFull) salonFull.textContent = `₹${packageTotal.toLocaleString('en-IN')}`;
  if (btnFullPrice) btnFullPrice.textContent = `₹${Math.round(packageTotal * 0.95).toLocaleString('en-IN')}`;

  const initialMode = data.initialMode || 'advance';
  setPaymentAmountMode(initialMode);

  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
};

function setPaymentAmountMode(mode) {
  currentPaymentState.paymentType = mode;

  const btnAdvance = document.getElementById('btnModeAdvance');
  const btnFull = document.getElementById('btnModeFull');
  const btnCustom = document.getElementById('btnModeCustom');
  [btnAdvance, btnFull, btnCustom].forEach(b => b && b.classList.remove('active'));

  const pkgTotal = currentPaymentState.packageTotal;
  let payable = 100;
  let discount = 0;

  if (mode === 'full') {
    if (btnFull) btnFull.classList.add('active');
    discount = Math.round(pkgTotal * 0.05);
    payable = pkgTotal - discount;
  } else if (mode === 'custom') {
    if (btnCustom) btnCustom.classList.add('active');
    payable = Math.min(500, pkgTotal);
    discount = 0;
  } else {
    // advance
    if (btnAdvance) btnAdvance.classList.add('active');
    payable = Math.min(100, pkgTotal);
    discount = 0;
  }

  currentPaymentState.payableNow = payable;
  currentPaymentState.discountAmount = discount;

  const discountRow = document.getElementById('payDiscountRow');
  const discountVal = document.getElementById('payDiscountAmount');
  if (discountRow) {
    if (discount > 0) {
      discountRow.style.display = 'flex';
      if (discountVal) discountVal.textContent = `-₹${discount.toLocaleString('en-IN')}`;
    } else {
      discountRow.style.display = 'none';
    }
  }

  const payableNowEl = document.getElementById('payPayableNow');
  const balanceRow = document.getElementById('payBalanceRow');
  const balanceVal = document.getElementById('payBalanceAmount');

  if (payableNowEl) payableNowEl.textContent = `₹${payable.toLocaleString('en-IN')}`;
  const remaining = Math.max(0, pkgTotal - discount - payable);
  if (balanceVal) balanceVal.textContent = `₹${remaining.toLocaleString('en-IN')}`;
  if (balanceRow) balanceRow.style.display = remaining > 0 ? 'flex' : 'none';

  // Update text labels with new amount
  document.querySelectorAll('.upiAmountText').forEach(el => {
    el.textContent = `₹${payable.toLocaleString('en-IN')}`;
  });

  // Generate UPI deep link & QR Code
  const upiUrl = `upi://pay?pa=${currentPaymentState.upiId}&pn=Beauty+Zone+Womens+Parlour&mc=7298&am=${payable}&cu=INR&tn=Booking+${currentPaymentState.bookingId}`;
  const qrImg = document.getElementById('upiQrImage');
  if (qrImg) {
    qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(upiUrl)}`;
  }

  // Update UPI App links
  ['gpayIntentBtn', 'phonepeIntentBtn', 'paytmIntentBtn', 'bhimIntentBtn'].forEach(btnId => {
    const el = document.getElementById(btnId);
    if (el) el.href = upiUrl;
  });
}

function processPayment(details) {
  const overlay = document.getElementById('payProcessingOverlay');
  const procTitle = document.getElementById('processingTitle');
  const procSub = document.getElementById('processingSub');

  if (overlay) {
    if (procTitle) procTitle.textContent = 'Processing Secure Payment...';
    if (procSub) procSub.textContent = `Connecting to ${details.gateway || 'Bank Gateway'} & encrypting...`;
    overlay.classList.add('active');
  }

  setTimeout(() => {
    if (overlay) overlay.classList.remove('active');
    const paymentModal = document.getElementById('paymentModal');
    if (paymentModal) paymentModal.classList.remove('active');

    // Play luxury sound chime
    playSuccessChime();

    // Render & Open Receipt Modal
    openReceiptModal(details);
  }, 1250);
}

function openReceiptModal(details) {
  const receiptModal = document.getElementById('receiptModal');
  if (!receiptModal) return;

  const state = currentPaymentState;
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
  const rcpNum = `BZ-RCP-${now.getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

  // Populate receipt elements
  const elRcpNum = document.getElementById('rcpNumber');
  const elRcpDate = document.getElementById('rcpDate');
  const elRcpTime = document.getElementById('rcpTime');
  const elCustName = document.getElementById('rcpCustName');
  const elCustPhone = document.getElementById('rcpCustPhone');
  const elBookingId = document.getElementById('rcpBookingId');
  const elAppDate = document.getElementById('rcpAppDate');
  const elServiceName = document.getElementById('rcpServiceName');
  const elPayMethodLabel = document.getElementById('rcpPaymentMethodLabel');
  const elTotalPkg = document.getElementById('rcpTotalPackagePrice');
  const elSubTotal = document.getElementById('rcpSubTotal');
  const elDiscountRow = document.getElementById('rcpDiscountRow');
  const elDiscountVal = document.getElementById('rcpDiscountVal');
  const elPaidAmount = document.getElementById('rcpPaidAmount');
  const elRemaining = document.getElementById('rcpRemainingBalance');

  if (elRcpNum) elRcpNum.textContent = rcpNum;
  if (elRcpDate) elRcpDate.textContent = dateStr;
  if (elRcpTime) elRcpTime.textContent = timeStr;
  if (elCustName) elCustName.textContent = state.customerName;
  if (elCustPhone) elCustPhone.textContent = state.customerPhone;
  if (elBookingId) elBookingId.textContent = state.bookingId;
  if (elAppDate) elAppDate.textContent = state.appointmentDate;
  if (elServiceName) elServiceName.textContent = state.serviceName;
  if (elPayMethodLabel) elPayMethodLabel.textContent = `Mode: ${details.methodName} (${details.reference})`;
  if (elTotalPkg) elTotalPkg.textContent = `₹${state.packageTotal.toLocaleString('en-IN')}`;
  if (elSubTotal) elSubTotal.textContent = `₹${state.packageTotal.toLocaleString('en-IN')}`;

  if (elDiscountRow) {
    if (state.discountAmount > 0) {
      elDiscountRow.style.display = 'flex';
      if (elDiscountVal) elDiscountVal.textContent = `-₹${state.discountAmount.toLocaleString('en-IN')}`;
    } else {
      elDiscountRow.style.display = 'none';
    }
  }

  if (elPaidAmount) elPaidAmount.textContent = `₹${state.payableNow.toLocaleString('en-IN')}`;
  const remaining = Math.max(0, state.packageTotal - state.discountAmount - state.payableNow);
  if (elRemaining) elRemaining.textContent = `₹${remaining.toLocaleString('en-IN')}`;

  receiptModal.classList.add('active');
  document.body.style.overflow = 'hidden';

  showToast(`🎉 Payment of ₹${state.payableNow.toLocaleString('en-IN')} Received! Slot Guaranteed.`);
}

function playSuccessChime() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15);
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.5);
  } catch (e) {
    // Audio ignored if autoplay policy restricts
  }
}
