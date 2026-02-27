// ==================== DATA INITIALIZATION ====================

// Initialize localStorage with default data if empty
if (!localStorage.getItem('trains')) {
  const defaultTrains = [
    {
      id: '12301',
      name: 'Rajdhani Express',
      from: 'New Delhi',
      to: 'Mumbai Central',
      departure: '16:00',
      arrival: '08:30',
      duration: '16h 30m',
      seats: {
        sleeper: 120,
        ac3: 72,
        ac2: 48,
        ac1: 24
      },
      fare: {
        sleeper: 850,
        ac3: 1850,
        ac2: 2450,
        ac1: 3850
      },
      days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    },
    {
      id: '12627',
      name: 'Karnataka Express',
      from: 'New Delhi',
      to: 'Bangalore',
      departure: '19:20',
      arrival: '05:40',
      duration: '34h 20m',
      seats: {
        sleeper: 180,
        ac3: 96,
        ac2: 64,
        ac1: 32
      },
      fare: {
        sleeper: 750,
        ac3: 1650,
        ac2: 2250,
        ac1: 3450
      },
      days: ['Mon', 'Wed', 'Fri', 'Sun']
    },
    {
      id: '12345',
      name: 'Shatabdi Express',
      from: 'New Delhi',
      to: 'Lucknow',
      departure: '06:00',
      arrival: '12:30',
      duration: '6h 30m',
      seats: {
        sleeper: 0,
        ac3: 150,
        ac2: 100,
        ac1: 50
      },
      fare: {
        sleeper: 0,
        ac3: 1250,
        ac2: 1650,
        ac1: 2450
      },
      days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    },
    {
      id: '12951',
      name: 'Mumbai Rajdhani',
      from: 'Mumbai Central',
      to: 'New Delhi',
      departure: '16:35',
      arrival: '08:30',
      duration: '15h 55m',
      seats: {
        sleeper: 0,
        ac3: 120,
        ac2: 80,
        ac1: 40
      },
      fare: {
        sleeper: 0,
        ac3: 1890,
        ac2: 2550,
        ac1: 3950
      },
      days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    },
    {
      id: '12801',
      name: 'Purushottam Express',
      from: 'New Delhi',
      to: 'Puri',
      departure: '20:55',
      arrival: '04:30',
      duration: '31h 35m',
      seats: {
        sleeper: 200,
        ac3: 120,
        ac2: 80,
        ac1: 40
      },
      fare: {
        sleeper: 680,
        ac3: 1580,
        ac2: 2180,
        ac1: 3380
      },
      days: ['Tue', 'Thu', 'Sat']
    }
  ];
  localStorage.setItem('trains', JSON.stringify(defaultTrains));
}

// Updated users with Venila and Varshini
if (!localStorage.getItem('users')) {
  const defaultUsers = [
    {
      id: 'USR001',
      name: 'Venila',
      email: 'venila@example.com',
      password: 'pass123',
      mobile: '9876543210',
      bookings: []
    },
    {
      id: 'USR002',
      name: 'Varshini',
      email: 'varshini@example.com',
      password: 'pass123',
      mobile: '9876543211',
      bookings: []
    }
  ];
  localStorage.setItem('users', JSON.stringify(defaultUsers));
}

if (!localStorage.getItem('bookings')) {
  localStorage.setItem('bookings', JSON.stringify([]));
}

if (!localStorage.getItem('currentUser')) {
  localStorage.setItem('currentUser', JSON.stringify(null));
}

// ==================== GLOBAL VARIABLES ====================

let currentUser = JSON.parse(localStorage.getItem('currentUser'));
let trains = JSON.parse(localStorage.getItem('trains'));
let users = JSON.parse(localStorage.getItem('users'));
let bookings = JSON.parse(localStorage.getItem('bookings'));
let pendingBooking = null;
let selectedSeatType = null;
let currentTrainId = null;

// ==================== UTILITY FUNCTIONS ====================

function saveToStorage() {
  localStorage.setItem('users', JSON.stringify(users));
  localStorage.setItem('trains', JSON.stringify(trains));
  localStorage.setItem('bookings', JSON.stringify(bookings));
  localStorage.setItem('currentUser', JSON.stringify(currentUser));
}

function generatePNR() {
  return 'PNR' + Math.floor(Math.random() * 10000000000).toString().padStart(10, '0');
}

function showModal(modalId) {
  document.getElementById(modalId).style.display = 'flex';
}

function hideModal(modalId) {
  document.getElementById(modalId).style.display = 'none';
}

function showNotification(message, type = 'success') {
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.innerHTML = `
    <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-exclamation-triangle'}"></i>
    <span>${message}</span>
  `;
  document.body.appendChild(notification);
  setTimeout(() => notification.remove(), 3000);
}

// ==================== LOGIN FUNCTION ====================

function handleLogin() {
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value.trim();
  const role = document.getElementById('loginRole').value;
  
  if (!email || !password) {
    showNotification('Please enter email and password', 'error');
    return;
  }
  
  if (role === 'admin') {
    if (email === 'admin@railreserve.com' && password === 'admin123') {
      currentUser = {
        id: 'ADMIN001',
        name: 'RailReserve Admin',
        email: email,
        role: 'admin'
      };
      saveToStorage();
      hideModal('loginModal');
      renderAdminDashboard();
      showNotification('Welcome to RailReserve Admin Panel', 'success');
    } else {
      showNotification('Invalid email or password', 'error');
    }
  } else {
    const user = users.find(u => 
      u.email.toLowerCase() === email.toLowerCase() && 
      u.password === password
    );
    
    if (user) {
      currentUser = user;
      saveToStorage();
      hideModal('loginModal');
      
      const pendingTrainId = sessionStorage.getItem('pendingTrainId');
      if (pendingTrainId) {
        sessionStorage.removeItem('pendingTrainId');
        showSeatSelection(pendingTrainId);
      } else {
        renderUserDashboard();
      }
      
      showNotification(`Welcome to RailReserve, ${user.name}!`, 'success');
    } else {
      showNotification('Invalid email or password', 'error');
    }
  }
}

// ==================== REGISTER FUNCTION ====================

function handleRegister() {
  const name = document.getElementById('regName').value.trim();
  const email = document.getElementById('regEmail').value.trim().toLowerCase();
  const mobile = document.getElementById('regMobile').value.trim();
  const password = document.getElementById('regPassword').value.trim();
  
  if (!name || !email || !mobile || !password) {
    showNotification('All fields are required', 'error');
    return;
  }
  
  if (mobile.length !== 10 || isNaN(mobile)) {
    showNotification('Please enter a valid 10-digit mobile number', 'error');
    return;
  }
  
  if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
    showNotification('Email already registered', 'error');
    return;
  }
  
  const newUser = {
    id: 'USR' + Math.floor(Math.random() * 1000).toString().padStart(3, '0'),
    name: name,
    email: email,
    mobile: mobile,
    password: password,
    bookings: []
  };
  
  users.push(newUser);
  currentUser = newUser;
  saveToStorage();
  
  hideModal('registerModal');
  
  const pendingTrainId = sessionStorage.getItem('pendingTrainId');
  if (pendingTrainId) {
    sessionStorage.removeItem('pendingTrainId');
    showSeatSelection(pendingTrainId);
  } else {
    renderUserDashboard();
  }
  
  showNotification('Registration successful!', 'success');
}

// ==================== PAGE RENDERING ====================

function renderHomePage() {
  const main = document.getElementById('main-content');
  main.innerHTML = `
    <section class="hero">
      <div class="hero-content">
        <h1>RailReserve - Smart Train Booking</h1>
        <p>Book train tickets anywhere, anytime with RailReserve</p>
        <div class="search-box">
          <input type="text" id="searchFrom" placeholder="From Station" value="New Delhi">
          <input type="text" id="searchTo" placeholder="To Station" value="Mumbai">
          <input type="date" id="searchDate" value="${new Date().toISOString().split('T')[0]}">
          <button id="searchTrainsBtn"><i class="fas fa-search"></i> Search Trains</button>
        </div>
      </div>
    </section>

    <section class="features">
      <div class="feature-card">
        <i class="fas fa-shield-alt"></i>
        <h3>Safe & Secure</h3>
        <p>100% secure booking with RailReserve</p>
      </div>
      <div class="feature-card">
        <i class="fas fa-clock"></i>
        <h3>Instant Confirmation</h3>
        <p>Get instant PNR and booking confirmation</p>
      </div>
      <div class="feature-card">
        <i class="fas fa-headset"></i>
        <h3>24/7 Support</h3>
        <p>RailReserve helpline for any assistance</p>
      </div>
      <div class="feature-card">
        <i class="fas fa-wifi"></i>
        <h3>Free Cancellation</h3>
        <p>Cancel tickets online with easy refund</p>
      </div>
    </section>

    <section class="trains-container">
      <h2 class="section-title"><i class="fas fa-train"></i> Popular Trains</h2>
      <div id="popularTrains"></div>
    </section>
  `;

  displayPopularTrains();
  
  document.getElementById('searchTrainsBtn').addEventListener('click', searchTrains);
}

function displayPopularTrains() {
  const container = document.getElementById('popularTrains');
  const popularTrains = trains.slice(0, 5);
  
  container.innerHTML = popularTrains.map(train => `
    <div class="train-card fade-in">
      <div class="train-info">
        <div class="train-name">
          <i class="fas fa-train"></i> ${train.name} (${train.id})
        </div>
        <div class="train-route">
          <span><i class="fas fa-circle"></i> ${train.from}</span>
          <i class="fas fa-arrow-right"></i>
          <span><i class="fas fa-map-marker-alt"></i> ${train.to}</span>
        </div>
        <div class="train-timings">
          <span><i class="fas fa-clock"></i> ${train.departure}</span>
          <span>→</span>
          <span><i class="fas fa-clock"></i> ${train.arrival}</span>
          <span><i class="fas fa-hourglass-half"></i> ${train.duration}</span>
        </div>
        <div class="seat-info">
          ${Object.entries(train.seats).map(([type, count]) => 
            count > 0 ? `<span class="seat-type">${type.toUpperCase()}: ${count}</span>` : ''
          ).join('')}
        </div>
      </div>
      <button class="book-btn" onclick="initiateBooking('${train.id}')">
        <i class="fas fa-ticket-alt"></i> Book Now
      </button>
    </div>
  `).join('');
}

function searchTrains() {
  const from = document.getElementById('searchFrom').value.toLowerCase();
  const to = document.getElementById('searchTo').value.toLowerCase();
  
  const filtered = trains.filter(train => 
    train.from.toLowerCase().includes(from) && 
    train.to.toLowerCase().includes(to)
  );
  
  const container = document.getElementById('popularTrains');
  
  if (filtered.length === 0) {
    container.innerHTML = '<div class="no-results">No trains found for this route</div>';
    return;
  }
  
  container.innerHTML = filtered.map(train => `
    <div class="train-card fade-in">
      <div class="train-info">
        <div class="train-name">
          <i class="fas fa-train"></i> ${train.name} (${train.id})
        </div>
        <div class="train-route">
          <span><i class="fas fa-circle"></i> ${train.from}</span>
          <i class="fas fa-arrow-right"></i>
          <span><i class="fas fa-map-marker-alt"></i> ${train.to}</span>
        </div>
        <div class="train-timings">
          <span><i class="fas fa-clock"></i> ${train.departure}</span>
          <span>→</span>
          <span><i class="fas fa-clock"></i> ${train.arrival}</span>
          <span><i class="fas fa-hourglass-half"></i> ${train.duration}</span>
        </div>
        <div class="seat-info">
          ${Object.entries(train.seats).map(([type, count]) => 
            count > 0 ? `<span class="seat-type">${type.toUpperCase()}: ${count}</span>` : ''
          ).join('')}
        </div>
      </div>
      <button class="book-btn" onclick="initiateBooking('${train.id}')">
        <i class="fas fa-ticket-alt"></i> Book Now
      </button>
    </div>
  `).join('');
}

// ==================== BOOKING FLOW - FIXED VERSION ====================

function initiateBooking(trainId) {
  if (!currentUser) {
    sessionStorage.setItem('pendingTrainId', trainId);
    showModal('bookingPromptModal');
    return;
  }
  
  showSeatSelection(trainId);
}

function showSeatSelection(trainId) {
  currentTrainId = trainId;
  const train = trains.find(t => t.id === trainId);
  
  if (!document.getElementById('seatSelectionModal')) {
    createSeatSelectionModal(train);
  } else {
    updateSeatSelectionModal(train);
  }
  
  showModal('seatSelectionModal');
}

function createSeatSelectionModal(train) {
  const modal = document.createElement('div');
  modal.id = 'seatSelectionModal';
  modal.className = 'modal';
  
  const seatOptions = Object.entries(train.seats)
    .filter(([type, count]) => count > 0)
    .map(([type, count]) => `
      <div class="seat-option" onclick="handleSeatSelection('${type}', ${count})">
        <div class="seat-type-header">
          <i class="fas ${type.includes('ac') ? 'fa-wind' : 'fa-bed'}"></i>
          <h3>${type.toUpperCase()}</h3>
        </div>
        <div class="seat-details">
          <p>Available: <span class="available-count">${count}</span></p>
          <p>Fare: <span class="fare-amount">₹${train.fare[type]}</span></p>
        </div>
        <div class="seat-select-hint">
          <i class="fas fa-hand-pointer"></i> Click to select
        </div>
      </div>
    `).join('');
  
  modal.innerHTML = `
    <div class="modal-content seat-selection-modal">
      <span class="close" onclick="hideModal('seatSelectionModal')">&times;</span>
      <div class="modal-header">
        <i class="fas fa-chair"></i>
        <h2>Select Seat Type - ${train.name}</h2>
        <p class="train-route-modal">${train.from} → ${train.to}</p>
      </div>
      <div class="modal-body">
        <div class="seat-options-grid">
          ${seatOptions}
        </div>
        <div class="passenger-details-section">
          <h3><i class="fas fa-users"></i> Passenger Details</h3>
          <div class="form-group">
            <label><i class="fas fa-user"></i> Passenger Name</label>
            <input type="text" id="passengerName" value="${currentUser.name}" placeholder="Enter passenger name">
          </div>
          <div class="form-group">
            <label><i class="fas fa-phone"></i> Mobile Number</label>
            <input type="text" id="passengerMobile" value="${currentUser.mobile}" placeholder="Enter mobile number">
          </div>
          <div class="form-group">
            <label><i class="fas fa-users"></i> Number of Passengers</label>
            <select id="passengerCount">
              <option value="1">1 Passenger</option>
              <option value="2">2 Passengers</option>
              <option value="3">3 Passengers</option>
              <option value="4">4 Passengers</option>
              <option value="5">5 Passengers</option>
              <option value="6">6 Passengers</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
}

function updateSeatSelectionModal(train) {
  const modal = document.getElementById('seatSelectionModal');
  if (!modal) return;
  
  modal.querySelector('.modal-header h2').textContent = `Select Seat Type - ${train.name}`;
  modal.querySelector('.train-route-modal').textContent = `${train.from} → ${train.to}`;
  
  const seatOptionsGrid = modal.querySelector('.seat-options-grid');
  seatOptionsGrid.innerHTML = Object.entries(train.seats)
    .filter(([type, count]) => count > 0)
    .map(([type, count]) => `
      <div class="seat-option" onclick="handleSeatSelection('${type}', ${count})">
        <div class="seat-type-header">
          <i class="fas ${type.includes('ac') ? 'fa-wind' : 'fa-bed'}"></i>
          <h3>${type.toUpperCase()}</h3>
        </div>
        <div class="seat-details">
          <p>Available: <span class="available-count">${count}</span></p>
          <p>Fare: <span class="fare-amount">₹${train.fare[type]}</span></p>
        </div>
        <div class="seat-select-hint">
          <i class="fas fa-hand-pointer"></i> Click to select
        </div>
      </div>
    `).join('');
}

// NEW FUNCTION: Handle seat selection and directly proceed to payment
function handleSeatSelection(seatType, availableSeats) {
  const passengerCount = parseInt(document.getElementById('passengerCount').value);
  const passengerName = document.getElementById('passengerName').value;
  const passengerMobile = document.getElementById('passengerMobile').value;
  
  // Validate passenger details
  if (!passengerName || !passengerMobile) {
    showNotification('Please fill passenger details first', 'error');
    return;
  }
  
  // Check seat availability
  if (availableSeats < passengerCount) {
    showNotification(`Only ${availableSeats} seats available. Please reduce passenger count or select another class.`, 'error');
    return;
  }
  
  // Confirm selection
  if (confirm(`Proceed to payment for ${passengerCount} passenger(s) in ${seatType.toUpperCase()} class?`)) {
    selectedSeatType = seatType;
    proceedToPayment();
  }
}

function proceedToPayment() {
  const train = trains.find(t => t.id === currentTrainId);
  
  if (!train) {
    showNotification('Train not found', 'error');
    return;
  }
  
  const passengerName = document.getElementById('passengerName').value;
  const passengerMobile = document.getElementById('passengerMobile').value;
  const passengerCount = parseInt(document.getElementById('passengerCount').value);
  
  if (!selectedSeatType) {
    showNotification('Please select a seat type', 'error');
    return;
  }
  
  // Store pending booking
  pendingBooking = {
    trainId: train.id,
    trainName: train.name,
    from: train.from,
    to: train.to,
    departure: train.departure,
    arrival: train.arrival,
    passengerName: passengerName,
    passengerMobile: passengerMobile,
    passengerCount: passengerCount,
    seatType: selectedSeatType,
    fare: train.fare[selectedSeatType] * passengerCount,
    journeyDate: document.getElementById('searchDate')?.value || new Date().toISOString().split('T')[0]
  };
  
  // Show payment modal
  hideModal('seatSelectionModal');
  showPaymentModal();
}

function showPaymentModal() {
  const paymentDetails = document.getElementById('paymentDetails');
  paymentDetails.innerHTML = `
    <div class="payment-summary">
      <h3><i class="fas fa-receipt"></i> Booking Summary</h3>
      <div class="summary-item">
        <span>Train:</span>
        <span>${pendingBooking.trainName} (${pendingBooking.trainId})</span>
      </div>
      <div class="summary-item">
        <span>Route:</span>
        <span>${pendingBooking.from} → ${pendingBooking.to}</span>
      </div>
      <div class="summary-item">
        <span>Passenger:</span>
        <span>${pendingBooking.passengerName}</span>
      </div>
      <div class="summary-item">
        <span>Seat Type:</span>
        <span>${pendingBooking.seatType.toUpperCase()}</span>
      </div>
      <div class="summary-item">
        <span>Passengers:</span>
        <span>${pendingBooking.passengerCount}</span>
      </div>
      <div class="summary-item total">
        <span>Total Amount:</span>
        <span class="total-amount">₹${pendingBooking.fare}</span>
      </div>
    </div>
  `;
  
  showModal('paymentModal');
}

function processPayment() {
  const cardNumber = document.getElementById('cardNumber').value;
  const cardExpiry = document.getElementById('cardExpiry').value;
  const cardCvv = document.getElementById('cardCvv').value;
  const cardName = document.getElementById('cardName').value;
  
  if (!cardNumber || !cardExpiry || !cardCvv || !cardName) {
    showNotification('Please fill all payment details', 'error');
    return;
  }
  
  showNotification('Processing payment...', 'info');
  
  setTimeout(() => {
    const train = trains.find(t => t.id === pendingBooking.trainId);
    
    if (train.seats[pendingBooking.seatType] < pendingBooking.passengerCount) {
      const pnr = generatePNR();
      const booking = {
        ...pendingBooking,
        pnr: pnr,
        bookingDate: new Date().toISOString(),
        status: 'waitlist',
        waitlistNumber: Math.floor(Math.random() * 50) + 1,
        userId: currentUser.id,
        paymentId: 'PAY' + Math.random().toString(36).substring(2, 10).toUpperCase()
      };
      
      bookings.push(booking);
      currentUser.bookings.push(pnr);
      saveToStorage();
      
      hideModal('paymentModal');
      showNotification(`Payment successful! You've been waitlisted. PNR: ${pnr}`, 'warning');
    } else {
      train.seats[pendingBooking.seatType] -= pendingBooking.passengerCount;
      
      const pnr = generatePNR();
      const booking = {
        ...pendingBooking,
        pnr: pnr,
        bookingDate: new Date().toISOString(),
        status: 'confirmed',
        coach: pendingBooking.seatType.toUpperCase() + Math.floor(Math.random() * 10),
        seat: Math.floor(Math.random() * 100) + 1,
        userId: currentUser.id,
        paymentId: 'PAY' + Math.random().toString(36).substring(2, 10).toUpperCase()
      };
      
      bookings.push(booking);
      currentUser.bookings.push(pnr);
      saveToStorage();
      
      hideModal('paymentModal');
      showNotification(`Payment successful! Booking confirmed. PNR: ${pnr}`, 'success');
    }
    
    pendingBooking = null;
    selectedSeatType = null;
    currentTrainId = null;
    
    localStorage.setItem('trains', JSON.stringify(trains));
    
  }, 2000);
}

// ==================== PNR FUNCTIONS ====================

function checkPNR() {
  const pnrInput = document.getElementById('pnrInput').value;
  const resultDiv = document.getElementById('pnrResult');
  
  const booking = bookings.find(b => b.pnr === pnrInput);
  
  if (!booking) {
    resultDiv.innerHTML = '<div class="error-message">Invalid PNR number</div>';
    return;
  }
  
  const statusClass = booking.status === 'confirmed' ? 'status-confirmed' : 
                      booking.status === 'waitlist' ? 'status-waitlist' : 'status-cancelled';
  
  resultDiv.innerHTML = `
    <div class="booking-details">
      <h3><i class="fas fa-ticket-alt"></i> PNR: ${booking.pnr}</h3>
      <table class="pnr-table">
        <tr>
          <td><strong>Train:</strong></td>
          <td>${booking.trainName} (${booking.trainId})</td>
        </tr>
        <tr>
          <td><strong>From:</strong></td>
          <td>${booking.from}</td>
        </tr>
        <tr>
          <td><strong>To:</strong></td>
          <td>${booking.to}</td>
        </tr>
        <tr>
          <td><strong>Departure:</strong></td>
          <td>${booking.departure}</td>
        </tr>
        <tr>
          <td><strong>Arrival:</strong></td>
          <td>${booking.arrival}</td>
        </tr>
        <tr>
          <td><strong>Passenger:</strong></td>
          <td>${booking.passengerName}</td>
        </tr>
        <tr>
          <td><strong>Seat Type:</strong></td>
          <td>${booking.seatType.toUpperCase()}</td>
        </tr>
        <tr>
          <td><strong>Passengers:</strong></td>
          <td>${booking.passengerCount}</td>
        </tr>
        <tr>
          <td><strong>Fare:</strong></td>
          <td>₹${booking.fare}</td>
        </tr>
        <tr>
          <td><strong>Payment ID:</strong></td>
          <td>${booking.paymentId || 'N/A'}</td>
        </tr>
        <tr>
          <td><strong>Status:</strong></td>
          <td><span class="booking-status ${statusClass}">${booking.status.toUpperCase()}</span></td>
        </tr>
        ${booking.waitlistNumber ? `<tr><td><strong>Waitlist No:</strong></td><td>WL ${booking.waitlistNumber}</td></tr>` : ''}
        ${booking.coach ? `<tr><td><strong>Coach/Seat:</strong></td><td>${booking.coach} / ${booking.seat}</td></tr>` : ''}
      </table>
    </div>
  `;
}

// ==================== USER DASHBOARD ====================

function renderUserDashboard() {
  const main = document.getElementById('main-content');
  const userBookings = bookings.filter(b => b.userId === currentUser.id);
  
  main.innerHTML = `
    <div class="user-dashboard">
      <div class="user-header">
        <div>
          <h1><i class="fas fa-user-circle"></i> Welcome, ${currentUser.name}</h1>
          <p><i class="fas fa-envelope"></i> ${currentUser.email} | <i class="fas fa-phone"></i> ${currentUser.mobile}</p>
        </div>
        <div class="user-badge">
          <i class="fas fa-star"></i> RailReserve Member
        </div>
      </div>
      
      <div class="booking-history">
        <h2><i class="fas fa-history"></i> My Bookings</h2>
        <div id="userBookings">
          ${userBookings.length === 0 ? '<p class="no-bookings">No bookings yet</p>' : ''}
          ${userBookings.map(booking => `
            <div class="booking-item fade-in">
              <div>
                <h3><i class="fas fa-train"></i> ${booking.trainName} (${booking.trainId})</h3>
                <p>
                  <i class="fas fa-calendar"></i> ${new Date(booking.journeyDate).toLocaleDateString()} |
                  <i class="fas fa-clock"></i> ${booking.departure} - ${booking.arrival} |
                  <i class="fas fa-users"></i> ${booking.passengerCount} Passenger(s)
                </p>
                <p><i class="fas fa-ticket"></i> PNR: ${booking.pnr}</p>
                <p><i class="fas fa-credit-card"></i> Payment ID: ${booking.paymentId || 'N/A'}</p>
              </div>
              <div>
                <span class="booking-status ${booking.status === 'confirmed' ? 'status-confirmed' : 'status-waitlist'}">
                  ${booking.status.toUpperCase()}
                </span>
                <p class="fare"><i class="fas fa-rupee-sign"></i> ${booking.fare}</p>
                ${booking.status !== 'cancelled' ? `
                  <button class="btn-secondary" onclick="cancelBooking('${booking.pnr}')">
                    <i class="fas fa-times"></i> Cancel
                  </button>
                ` : ''}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

function cancelBooking(pnr) {
  if (confirm('Are you sure you want to cancel this booking?')) {
    const bookingIndex = bookings.findIndex(b => b.pnr === pnr);
    if (bookingIndex !== -1) {
      const booking = bookings[bookingIndex];
      
      if (booking.status === 'confirmed') {
        const train = trains.find(t => t.id === booking.trainId);
        if (train) {
          train.seats[booking.seatType] += booking.passengerCount;
        }
      }
      
      booking.status = 'cancelled';
      saveToStorage();
      
      showNotification('Booking cancelled successfully', 'success');
      renderUserDashboard();
    }
  }
}

// ==================== ADMIN DASHBOARD ====================

function renderAdminDashboard() {
  const main = document.getElementById('main-content');
  
  main.innerHTML = `
    <div class="admin-dashboard">
      <div class="admin-sidebar">
        <h3><i class="fas fa-train"></i> RailReserve Admin</h3>
        <ul>
          <li class="active" onclick="showAdminSection('trains')">
            <i class="fas fa-subway"></i> Manage Trains
          </li>
          <li onclick="showAdminSection('bookings')">
            <i class="fas fa-ticket-alt"></i> View Bookings
          </li>
          <li onclick="showAdminSection('waitlist')">
            <i class="fas fa-clock"></i> Waitlist
          </li>
          <li onclick="showAdminSection('reports')">
            <i class="fas fa-chart-bar"></i> Reports
          </li>
          <li onclick="showAdminSection('users')">
            <i class="fas fa-users"></i> Users
          </li>
        </ul>
      </div>
      <div class="admin-content" id="adminContent">
        ${renderTrainManagement()}
      </div>
    </div>
  `;
}

function showAdminSection(section) {
  const content = document.getElementById('adminContent');
  const sidebarItems = document.querySelectorAll('.admin-sidebar li');
  sidebarItems.forEach(item => item.classList.remove('active'));
  event.target.closest('li').classList.add('active');
  
  switch(section) {
    case 'trains':
      content.innerHTML = renderTrainManagement();
      break;
    case 'bookings':
      content.innerHTML = renderAllBookings();
      break;
    case 'waitlist':
      content.innerHTML = renderWaitlist();
      break;
    case 'reports':
      content.innerHTML = renderReports();
      break;
    case 'users':
      content.innerHTML = renderUsers();
      break;
  }
}

function renderTrainManagement() {
  return `
    <h2><i class="fas fa-subway"></i> Manage Trains</h2>
    
    <div class="admin-form">
      <h3>Add New Train</h3>
      <div class="form-row">
        <input type="text" id="trainName" placeholder="Train Name">
        <input type="text" id="trainNumber" placeholder="Train Number">
      </div>
      <div class="form-row">
        <input type="text" id="trainFrom" placeholder="From Station">
        <input type="text" id="trainTo" placeholder="To Station">
      </div>
      <div class="form-row">
        <input type="time" id="trainDeparture" placeholder="Departure">
        <input type="time" id="trainArrival" placeholder="Arrival">
        <input type="text" id="trainDuration" placeholder="Duration (e.g., 16h 30m)">
      </div>
      <div class="form-row">
        <input type="number" id="sleeperSeats" placeholder="Sleeper Seats">
        <input type="number" id="ac3Seats" placeholder="AC 3 Tier">
        <input type="number" id="ac2Seats" placeholder="AC 2 Tier">
        <input type="number" id="ac1Seats" placeholder="AC 1st Class">
      </div>
      <div class="form-row">
        <input type="number" id="sleeperFare" placeholder="Sleeper Fare">
        <input type="number" id="ac3Fare" placeholder="AC 3 Fare">
        <input type="number" id="ac2Fare" placeholder="AC 2 Fare">
        <input type="number" id="ac1Fare" placeholder="AC 1 Fare">
      </div>
      <button class="btn-primary" onclick="addNewTrain()">Add Train</button>
    </div>
    
    <h3>Existing Trains</h3>
    <div id="trainList">
      ${trains.map(train => `
        <div class="train-card">
          <div>
            <h4>${train.name} (${train.id})</h4>
            <p>${train.from} → ${train.to}</p>
            <p>Departure: ${train.departure} | Arrival: ${train.arrival}</p>
          </div>
          <button class="btn-secondary" onclick="deleteTrain('${train.id}')">Delete</button>
        </div>
      `).join('')}
    </div>
  `;
}

function addNewTrain() {
  const newTrain = {
    id: document.getElementById('trainNumber').value,
    name: document.getElementById('trainName').value,
    from: document.getElementById('trainFrom').value,
    to: document.getElementById('trainTo').value,
    departure: document.getElementById('trainDeparture').value,
    arrival: document.getElementById('trainArrival').value,
    duration: document.getElementById('trainDuration').value,
    seats: {
      sleeper: parseInt(document.getElementById('sleeperSeats').value) || 0,
      ac3: parseInt(document.getElementById('ac3Seats').value) || 0,
      ac2: parseInt(document.getElementById('ac2Seats').value) || 0,
      ac1: parseInt(document.getElementById('ac1Seats').value) || 0
    },
    fare: {
      sleeper: parseInt(document.getElementById('sleeperFare').value) || 0,
      ac3: parseInt(document.getElementById('ac3Fare').value) || 0,
      ac2: parseInt(document.getElementById('ac2Fare').value) || 0,
      ac1: parseInt(document.getElementById('ac1Fare').value) || 0
    },
    days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  };
  
  trains.push(newTrain);
  saveToStorage();
  showNotification('Train added successfully', 'success');
  renderAdminDashboard();
}

function deleteTrain(trainId) {
  if (confirm('Are you sure you want to delete this train?')) {
    trains = trains.filter(t => t.id !== trainId);
    saveToStorage();
    showNotification('Train deleted', 'success');
    renderAdminDashboard();
  }
}

function renderAllBookings() {
  return `
    <h2><i class="fas fa-ticket-alt"></i> All Bookings</h2>
    <div class="bookings-list">
      ${bookings.map(booking => `
        <div class="booking-item">
          <div>
            <p><strong>PNR:</strong> ${booking.pnr}</p>
            <p><strong>Train:</strong> ${booking.trainName}</p>
            <p><strong>Passenger:</strong> ${booking.passengerName}</p>
            <p><strong>Payment ID:</strong> ${booking.paymentId || 'N/A'}</p>
          </div>
          <div>
            <span class="booking-status ${booking.status === 'confirmed' ? 'status-confirmed' : 'status-waitlist'}">
              ${booking.status}
            </span>
            <p><strong>Fare:</strong> ₹${booking.fare}</p>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

function renderWaitlist() {
  const waitlistBookings = bookings.filter(b => b.status === 'waitlist');
  
  return `
    <h2><i class="fas fa-clock"></i> Waitlist Management</h2>
    ${waitlistBookings.length === 0 ? '<p>No waitlist entries</p>' : ''}
    ${waitlistBookings.map(booking => `
      <div class="booking-item">
        <div>
          <p><strong>PNR:</strong> ${booking.pnr}</p>
          <p><strong>Train:</strong> ${booking.trainName}</p>
          <p><strong>Waitlist:</strong> WL ${booking.waitlistNumber}</p>
          <p><strong>Payment ID:</strong> ${booking.paymentId}</p>
        </div>
        <button class="btn-primary" onclick="confirmWaitlist('${booking.pnr}')">
          Confirm if seats available
        </button>
      </div>
    `).join('')}
  `;
}

function renderReports() {
  const totalBookings = bookings.length;
  const confirmedBookings = bookings.filter(b => b.status === 'confirmed').length;
  const waitlistBookings = bookings.filter(b => b.status === 'waitlist').length;
  const totalRevenue = bookings.reduce((sum, b) => sum + b.fare, 0);
  
  return `
    <h2><i class="fas fa-chart-bar"></i> RailReserve Reports</h2>
    <div class="reports-grid">
      <div class="report-card">
        <h3>Total Bookings</h3>
        <p class="report-number">${totalBookings}</p>
      </div>
      <div class="report-card">
        <h3>Confirmed</h3>
        <p class="report-number">${confirmedBookings}</p>
      </div>
      <div class="report-card">
        <h3>Waitlist</h3>
        <p class="report-number">${waitlistBookings}</p>
      </div>
      <div class="report-card">
        <h3>Total Revenue</h3>
        <p class="report-number">₹${totalRevenue}</p>
      </div>
    </div>
  `;
}

function renderUsers() {
  return `
    <h2><i class="fas fa-users"></i> RailReserve Users</h2>
    <div class="users-list">
      ${users.map(user => `
        <div class="user-card">
          <h3>${user.name}</h3>
          <p><i class="fas fa-envelope"></i> ${user.email}</p>
          <p><i class="fas fa-phone"></i> ${user.mobile}</p>
          <p><i class="fas fa-ticket"></i> Bookings: ${user.bookings.length}</p>
        </div>
      `).join('')}
    </div>
  `;
}

function confirmWaitlist(pnr) {
  const booking = bookings.find(b => b.pnr === pnr);
  const train = trains.find(t => t.id === booking.trainId);
  
  if (train.seats[booking.seatType] >= booking.passengerCount) {
    train.seats[booking.seatType] -= booking.passengerCount;
    booking.status = 'confirmed';
    booking.coach = booking.seatType.toUpperCase() + Math.floor(Math.random() * 10);
    booking.seat = Math.floor(Math.random() * 100) + 1;
    delete booking.waitlistNumber;
    
    saveToStorage();
    showNotification(`Booking ${pnr} confirmed`, 'success');
    renderAdminDashboard();
  } else {
    showNotification('Insufficient seats available', 'error');
  }
}

function logout() {
  currentUser = null;
  localStorage.setItem('currentUser', JSON.stringify(null));
  sessionStorage.removeItem('pendingTrainId');
  renderHomePage();
  showNotification('Logged out successfully', 'success');
  
  updateNavForLogout();
}

function updateNavForLogout() {
  const navLinks = document.getElementById('navLinks');
  const existingLogout = document.querySelector('.logout-btn');
  if (existingLogout) existingLogout.remove();
  
  const loginBtn = document.getElementById('loginBtn');
  if (loginBtn) loginBtn.style.display = 'flex';
}

// ==================== EVENT LISTENERS ====================

document.addEventListener('DOMContentLoaded', () => {
  renderHomePage();
  
  document.getElementById('menuToggle').addEventListener('click', () => {
    document.getElementById('navLinks').classList.toggle('show');
  });
  
  document.getElementById('loginBtn').addEventListener('click', () => {
    showModal('loginModal');
  });
  
  document.getElementById('submitLogin').addEventListener('click', handleLogin);
  
  document.getElementById('showRegister').addEventListener('click', (e) => {
    e.preventDefault();
    hideModal('loginModal');
    showModal('registerModal');
  });
  
  document.getElementById('submitRegister').addEventListener('click', handleRegister);
  
  document.getElementById('promptLogin').addEventListener('click', () => {
    hideModal('bookingPromptModal');
    showModal('loginModal');
  });
  
  document.getElementById('promptRegister').addEventListener('click', () => {
    hideModal('bookingPromptModal');
    showModal('registerModal');
  });
  
  document.getElementById('checkPnrBtn').addEventListener('click', checkPNR);
  
  document.getElementById('processPayment').addEventListener('click', processPayment);
  
  document.querySelectorAll('.close').forEach(closeBtn => {
    closeBtn.addEventListener('click', (e) => {
      e.target.closest('.modal').style.display = 'none';
    });
  });
  
  document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const href = link.getAttribute('href');
      
      if (href === '#pnr') {
        showModal('pnrModal');
      } else if (href === '#home') {
        renderHomePage();
      } else if (href === '#trains') {
        renderHomePage();
        document.getElementById('searchFrom').scrollIntoView({ behavior: 'smooth' });
      } else if (href === '#contact') {
        showNotification('RailReserve Support: 1800-RAILRES', 'info');
      } else if (href === '#holidays') {
        showNotification('Holiday packages coming soon!', 'info');
      }
      
      document.querySelectorAll('.nav-links a').forEach(l => l.classList.remove('active'));
      link.classList.add('active');
    });
  });
  
  if (currentUser) {
    const navLinks = document.getElementById('navLinks');
    const loginBtn = document.getElementById('loginBtn');
    
    if (loginBtn) loginBtn.style.display = 'none';
    
    const logoutBtn = document.createElement('button');
    logoutBtn.className = 'login-btn logout-btn';
    logoutBtn.innerHTML = '<i class="fas fa-sign-out-alt"></i> Logout';
    logoutBtn.onclick = logout;
    navLinks.appendChild(logoutBtn);
    
    if (currentUser.role === 'admin') {
      renderAdminDashboard();
    } else {
      renderUserDashboard();
    }
  }
});

window.onclick = (event) => {
  if (event.target.classList.contains('modal')) {
    event.target.style.display = 'none';
  }
};

document.addEventListener('input', function(e) {
  if (e.target.id === 'cardNumber') {
    e.target.value = e.target.value.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim();
  }
  if (e.target.id === 'cardExpiry') {
    e.target.value = e.target.value.replace(/\//g, '').replace(/(.{2})/g, '$1/').trim();
  }
});