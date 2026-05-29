/* ═══════════════════════════════════════
   RYTUAI — APP.JS
   All frontend logic
═══════════════════════════════════════ */

const API = ''
let currentPhone = ''

/* ══════════════════════════════════════
   INIT
══════════════════════════════════════ */
window.onload = function () {
  const token = localStorage.getItem('rytuai_token')
  if (token) {
    showApp()
    loadFarmerGreeting()
  }
}

function showApp() {
  document.getElementById('login-screen').style.display = 'none'
  document.getElementById('app').style.display = 'flex'
}

function loadFarmerGreeting() {
  const farmerData = localStorage.getItem('rytuai_farmer')
  if (!farmerData) return
  const farmer = JSON.parse(farmerData)
  const el = document.getElementById('farmer-greeting')
  if (el && farmer.name) {
    el.textContent = `నమస్కారం, ${farmer.name} గారు 🙏`
  }
}

/* ══════════════════════════════════════
   NAVIGATION
══════════════════════════════════════ */
const screenTitles = {
  home: 'Home',
  detect: 'Detect Disease',
  result: 'AI Result',
  shop: 'Rytu Shop',
  roadmap: 'Crop Roadmap',
  tracker: 'My Tracker'
}

function switchScreen(name) {
  // Hide all screens
  document.querySelectorAll('.screen').forEach(s => {
    s.classList.remove('active')
  })

  // Remove active from all nav items
  document.querySelectorAll('.nav-item').forEach(n => {
    n.classList.remove('active')
  })

  // Show target screen
  const screen = document.getElementById('screen-' + name)
  if (screen) screen.classList.add('active')

  // Activate nav item
  const navItem = document.getElementById('nav-' + name)
  if (navItem) navItem.classList.add('active')

  // Update topbar title
  const titleEl = document.getElementById('topbar-title')
  if (titleEl) titleEl.textContent = screenTitles[name] || ''

  // Scroll screen to top
  if (screen) screen.scrollTop = 0
}

function goBack() {
  switchScreen('home')
}

/* ══════════════════════════════════════
   LOGIN — OTP SYSTEM
══════════════════════════════════════ */
function showLoginError(msg) {
  const el = document.getElementById('login-error')
  el.textContent = msg
  el.style.display = 'block'
  setTimeout(() => { el.style.display = 'none' }, 4000)
}

function showLoginLoading(text) {
  document.getElementById('step-phone').style.display = 'none'
  document.getElementById('step-otp').style.display = 'none'
  document.getElementById('step-register').style.display = 'none'
  document.getElementById('login-loading').style.display = 'block'
  document.getElementById('loading-text').textContent = text
}

function hideLoginLoading() {
  document.getElementById('login-loading').style.display = 'none'
}

async function sendOTP() {
  const phone = document.getElementById('login-phone').value.trim()
  if (phone.length !== 10) {
    showLoginError('Please enter a valid 10-digit mobile number')
    return
  }

  currentPhone = phone
  showLoginLoading('Sending OTP...')

  try {
    const response = await fetch(`${API}/auth/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone })
    })

    const data = await response.json()
    hideLoginLoading()

    if (response.ok) {
      document.getElementById('step-otp').style.display = 'flex'
      document.getElementById('step-otp').style.flexDirection = 'column'
      document.getElementById('otp-sent-to').textContent =
        `OTP sent to ${phone}`
      document.getElementById('login-otp').focus()
    } else {
      document.getElementById('step-phone').style.display = 'flex'
      document.getElementById('step-phone').style.flexDirection = 'column'
      showLoginError(data.message || 'Failed to send OTP')
    }

  } catch (err) {
    hideLoginLoading()
    document.getElementById('step-phone').style.display = 'flex'
    document.getElementById('step-phone').style.flexDirection = 'column'
    showLoginError('Cannot connect to server')
  }
}

async function verifyOTP() {
  const otp = document.getElementById('login-otp').value.trim()
  if (otp.length !== 6) {
    showLoginError('Please enter the 6-digit OTP')
    return
  }

  showLoginLoading('Verifying OTP...')

  try {
    const response = await fetch(`${API}/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: currentPhone, otp })
    })

    const data = await response.json()
    hideLoginLoading()

    if (response.ok) {
      localStorage.setItem('rytuai_token', data.token)
      localStorage.setItem('rytuai_phone', currentPhone)

      if (data.farmer) {
        localStorage.setItem('rytuai_farmer', JSON.stringify(data.farmer))
        showApp()
        loadFarmerGreeting()
      } else {
        // New farmer
        showRegistrationStep()
      }

    } else {
      document.getElementById('step-otp').style.display = 'flex'
      document.getElementById('step-otp').style.flexDirection = 'column'
      showLoginError(data.message || 'Invalid OTP. Please try again')
    }

  } catch (err) {
    hideLoginLoading()
    document.getElementById('step-otp').style.display = 'flex'
    document.getElementById('step-otp').style.flexDirection = 'column'
    showLoginError('Cannot connect to server')
  }
}

function backToPhone() {
  document.getElementById('step-otp').style.display = 'none'
  document.getElementById('step-phone').style.display = 'flex'
  document.getElementById('step-phone').style.flexDirection = 'column'
  document.getElementById('login-otp').value = ''
}

function showRegistrationStep() {
  document.getElementById('step-phone').style.display = 'none'
  document.getElementById('step-otp').style.display = 'none'
  document.getElementById('step-register').style.display = 'flex'
  document.getElementById('step-register').style.flexDirection = 'column'
  document.getElementById('login-screen').scrollTop = 0
}

function backToOTP() {
  document.getElementById('step-register').style.display = 'none'
  document.getElementById('step-otp').style.display = 'flex'
  document.getElementById('step-otp').style.flexDirection = 'column'
}

async function registerFarmer() {
  const name = document.getElementById('reg-name').value.trim()
  const village = document.getElementById('reg-village').value.trim()
  const district = document.getElementById('reg-district').value.trim()
  const land_acres = document.getElementById('reg-acres').value
  const crop_type = document.getElementById('reg-crop').value
  const sowing_date = document.getElementById('reg-sowing').value

  if (!name || !village || !district) {
    showLoginError('Please fill name, village and district')
    return
  }

  showLoginLoading('Saving your profile...')

  try {
    const response = await fetch(`${API}/farmers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('rytuai_token')}`
      },
      body: JSON.stringify({
        name,
        phone: currentPhone,
        village,
        district,
        land_acres: parseFloat(land_acres) || 0,
        crop_type,
        sowing_date
      })
    })

    const data = await response.json()
    hideLoginLoading()

    if (response.ok) {
      const farmer = data.farmer || data.Farmer || { name, phone: currentPhone, village, district }
      localStorage.setItem('rytuai_farmer', JSON.stringify(farmer))
      showApp()
      loadFarmerGreeting()
    } else {
      document.getElementById('step-register').style.display = 'flex'
      document.getElementById('step-register').style.flexDirection = 'column'
      showLoginError(data.message || 'Registration failed')
    }

  } catch (err) {
    hideLoginLoading()
    document.getElementById('step-register').style.display = 'flex'
    document.getElementById('step-register').style.flexDirection = 'column'
    showLoginError('Cannot connect to server')
  }
}

/* ══════════════════════════════════════
   PROFILE MENU
══════════════════════════════════════ */
function toggleProfileMenu() {
  const menu = document.getElementById('profile-menu')
  const isVisible = menu.style.display === 'block'

  if (!isVisible) {
    // Load farmer data
    const farmerData = localStorage.getItem('rytuai_farmer')
    if (farmerData) {
      const farmer = JSON.parse(farmerData)
      const nameEl = document.getElementById('menu-farmer-name')
      const phoneEl = document.getElementById('menu-farmer-phone')
      const detailEl = document.getElementById('menu-farmer-details')
      if (nameEl) nameEl.textContent = farmer.name || '—'
      if (phoneEl) phoneEl.textContent = farmer.phone || '—'
      if (detailEl) detailEl.textContent =
        `${farmer.crop_type || 'Crop'} · ${farmer.village || 'Village'}`
    }
    menu.style.display = 'block'
  } else {
    menu.style.display = 'none'
  }
}

function closeProfileMenu() {
  document.getElementById('profile-menu').style.display = 'none'
}

function openSettings() {
  closeProfileMenu()
  alert('Settings coming soon!')
}

function openOrders() {
  closeProfileMenu()
  switchScreen('shop')
}

/* ══════════════════════════════════════
   EDIT PROFILE
══════════════════════════════════════ */
function openEditProfile() {
  closeProfileMenu()

  const farmerData = localStorage.getItem('rytuai_farmer')
  if (!farmerData) {
    alert('Please login again')
    return
  }

  const farmer = JSON.parse(farmerData)

  // Set display info
  const nameDisp = document.getElementById('profile-name-display')
  const phoneDisp = document.getElementById('profile-phone-display')
  if (nameDisp) nameDisp.textContent = farmer.name || '—'
  if (phoneDisp) phoneDisp.textContent = farmer.phone || '—'

  // Pre-fill fields safely
  function setVal(id, val) {
    const el = document.getElementById(id)
    if (el) el.value = val || ''
  }

  setVal('edit-name', farmer.name)
  setVal('edit-village', farmer.village)
  setVal('edit-district', farmer.district)
  setVal('edit-acres', farmer.land_acres)
  setVal('edit-crop', farmer.crop_type)
  setVal('edit-sowing', farmer.sowing_date)

  // Show profile screen
  const screen = document.getElementById('profile-screen')
  screen.style.display = 'block'
  screen.scrollTop = 0
}

function closeProfile() {
  document.getElementById('profile-screen').style.display = 'none'
}

async function saveProfile() {
  const farmerData = localStorage.getItem('rytuai_farmer')
  if (!farmerData) {
    alert('Please login again')
    return
  }

  const farmer = JSON.parse(farmerData)
  const phone = farmer.phone

  // Safe getValue helper
  function getVal(id) {
    const el = document.getElementById(id)
    return el ? el.value.trim() : ''
  }

  const name = getVal('edit-name')
  const village = getVal('edit-village')
  const district = getVal('edit-district')
  const land_acres = getVal('edit-acres')
  const crop_type = getVal('edit-crop')
  const sowing_date = getVal('edit-sowing')

  if (!name || !village || !district) {
    alert('Please fill name, village and district')
    return
  }

  // Show saving state
  const saveBtn = document.querySelector('.fs-save')
  if (saveBtn) { saveBtn.textContent = 'Saving...'; saveBtn.disabled = true }

  try {
    const response = await fetch(`${API}/farmers/${phone}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('rytuai_token')}`
      },
      body: JSON.stringify({
        name, village, district,
        land_acres: parseFloat(land_acres) || 0,
        crop_type, sowing_date
      })
    })

    const data = await response.json()

    if (response.ok) {
      // Update localStorage
      const updated = {
        ...farmer, name, village, district,
        land_acres: parseFloat(land_acres) || 0,
        crop_type, sowing_date
      }
      localStorage.setItem('rytuai_farmer', JSON.stringify(updated))

      // Update greeting
      const greetEl = document.getElementById('farmer-greeting')
      if (greetEl) greetEl.textContent = `నమస్కారం, ${name} గారు 🙏`

      // Update profile display
      const nameDisp = document.getElementById('profile-name-display')
      if (nameDisp) nameDisp.textContent = name

      alert('✅ Profile updated successfully!')
      closeProfile()

    } else {
      alert(data.message || 'Update failed. Please try again.')
    }

  } catch (err) {
    console.log('Save error:', err)
    alert('Cannot connect to server. Please try again.')
  } finally {
    if (saveBtn) { saveBtn.textContent = 'Save'; saveBtn.disabled = false }
  }
}

/* ══════════════════════════════════════
   IMAGE UPLOAD
══════════════════════════════════════ */
const uploadedImages = { 0: null, 1: null, 2: null, 3: null }
const slotLabels = ['Leaf Photo', 'Stem Photo', 'Full Plant', 'Extra']

function triggerUpload(idx) {
  document.getElementById('file-' + idx).click()
}

function handleUpload(idx, input) {
  const file = input.files[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = (e) => {
    uploadedImages[idx] = e.target.result
    updateSlotUI(idx, e.target.result)
    updateUploadCount()
    updateAnalyzeBtn()
  }
  reader.readAsDataURL(file)
}

function updateSlotUI(idx, base64) {
  const slot = document.getElementById('slot-' + idx)
  if (!slot) return
  slot.classList.add('filled')
  slot.innerHTML = `
    <img src="${base64}"
      style="width:100%;height:100%;object-fit:cover;border-radius:12px;" />
    <div style="position:absolute;top:6px;right:6px;
      background:var(--green);color:white;border-radius:50%;
      width:22px;height:22px;display:flex;align-items:center;
      justify-content:center;font-size:12px;font-weight:800;">✓</div>
    <div style="position:absolute;bottom:0;left:0;right:0;
      background:rgba(26,110,53,0.85);color:white;
      font-size:10px;font-weight:800;text-align:center;
      padding:4px;border-radius:0 0 12px 12px;">
      ${slotLabels[idx]}
    </div>
  `
}

function countUploaded() {
  return Object.values(uploadedImages).filter(v => v !== null).length
}

function updateUploadCount() {
  const n = countUploaded()
  const el = document.getElementById('upload-count-msg')
  if (!el) return
  if (n > 0) {
    el.textContent = `✅ ${n} photo${n > 1 ? 's' : ''} ready to analyze`
    el.classList.add('ready')
  } else {
    el.textContent = 'Tap any slot to upload a photo'
    el.classList.remove('ready')
  }
}

function updateAnalyzeBtn() {
  const btn = document.getElementById('analyze-btn')
  if (!btn) return
  const n = countUploaded()
  btn.disabled = n < 1
}

/* ══════════════════════════════════════
   AI DETECTION
══════════════════════════════════════ */
async function analyzeImages() {
  if (countUploaded() < 1) {
    alert('Please upload at least 1 photo')
    return
  }

  switchScreen('result')

  // Show loading
  const loading = document.getElementById('result-loading')
  const error = document.getElementById('result-error')
  const content = document.getElementById('result-content')
  if (loading) loading.style.display = 'flex'
  if (error) error.style.display = 'none'
  if (content) content.style.display = 'none'

  try {
    // Build FormData
    const formData = new FormData()
    Object.values(uploadedImages)
      .filter(v => v !== null)
      .forEach((base64, index) => {
        const byteString = atob(base64.split(',')[1])
        const mime = base64.split(',')[0].split(':')[1].split(';')[0]
        const ab = new ArrayBuffer(byteString.length)
        const ia = new Uint8Array(ab)
        for (let i = 0; i < byteString.length; i++) {
          ia[i] = byteString.charCodeAt(i)
        }
        const blob = new Blob([ab], { type: mime })
        formData.append('photos', blob, `photo${index}.jpg`)
      })

    const response = await fetch(`${API}/detect`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('rytuai_token')}`
      },
      body: formData
    })

    const data = await response.json()
    if (loading) loading.style.display = 'none'

    if (response.ok) {
      renderResult(data.result)
    } else {
      throw new Error(data.message || 'Detection failed')
    }

  } catch (err) {
    if (loading) loading.style.display = 'none'
    if (error) error.style.display = 'flex'
    if (error) error.style.flexDirection = 'column'
    const errMsg = document.getElementById('error-msg')
    if (errMsg) errMsg.textContent = err.message || 'Something went wrong'
  }
}

function renderResult(r) {
  const content = document.getElementById('result-content')
  if (content) content.style.display = 'block'

  // Header
  const headerDiv = document.getElementById('result-header-div')
  if (headerDiv) {
    headerDiv.className = r.healthy ? 'result-hero healthy' : 'result-hero'
  }

  function setText(id, val) {
    const el = document.getElementById(id)
    if (el) el.textContent = val || '—'
  }

  setText('r-emoji', r.healthy ? '✅' : '🦠')
  setText('r-disease', r.disease)
  setText('r-telugu', r.teluguName)
  setText('r-confidence', `${r.confidence} · ${countUploaded()} images`)
  setText('r-sev-val', r.severity)
  setText('r-spread-val', r.spread)
  setText('r-treat-val', r.treatWithin)
  setText('r-what', r.whatIsThis)
  setText('r-symptoms', r.symptomsFound)
  setText('r-prevention', r.prevention)

  // Pesticides
  const pestDiv = document.getElementById('r-pesticides')
  if (pestDiv) {
    pestDiv.innerHTML = (r.pesticides || []).map(p => {
      const disc = Math.round((1 - p.priceRytu / p.priceMRP) * 100)
      return `
        <div class="pest-item" onclick="switchScreen('shop')">
          <div class="pest-icon">${p.icon || '🧴'}</div>
          <div class="pest-info">
            <div class="pest-name">${p.name}</div>
            <div class="pest-brand">${p.brand} · Rytu Shop</div>
          </div>
          <div class="pest-price-col">
            <div class="price">₹${p.priceRytu}</div>
            <div class="mrp">₹${p.priceMRP}</div>
            <div class="discount">${disc}% OFF</div>
          </div>
        </div>
      `
    }).join('')
  }
}

/* ══════════════════════════════════════
   LOGOUT
══════════════════════════════════════ */
function logout() {
  localStorage.clear()
  window.location.replace('/')
}