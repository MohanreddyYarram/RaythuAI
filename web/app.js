
/* ═══════════════════════════════════════
   RYTUAI — APP.JS
   Complete frontend logic
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
    loadFarmerData()
  }
}

function showApp() {
  document.getElementById('login-screen').style.display = 'none'
  document.getElementById('app').style.display = 'flex'
}

function loadFarmerData() {
  const farmerData = localStorage.getItem('rytuai_farmer')
  if (!farmerData) return

  try {
    const farmer = JSON.parse(farmerData)
    if (!farmer || !farmer.name) return

    const greeting = 'నమస్కారం, ' + farmer.name + ' గారు 🙏'

    const el = document.getElementById('farmer-greeting')
    if (el) el.textContent = greeting

    const elD = document.getElementById('farmer-greeting-desktop')
    if (elD) elD.textContent = greeting

    const topEl = document.getElementById('topbar-farmer-name')
    if (topEl) topEl.textContent = farmer.name

    const sbEl = document.getElementById('sidebar-farmer-name')
    if (sbEl) sbEl.textContent = farmer.name

  } catch (e) {
    console.log('loadFarmerData error:', e)
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
  tracker: 'Farm Tracker'
}

function switchScreen(name) {
  document.querySelectorAll('.screen').forEach(function(s) {
    s.classList.remove('active')
  })

  const screen = document.getElementById('screen-' + name)
  if (screen) {
    screen.classList.add('active')
    screen.scrollTop = 0
  }

  const titleEl = document.getElementById('topbar-title')
  if (titleEl) titleEl.textContent = screenTitles[name] || ''

  document.querySelectorAll('.s-item').forEach(function(s) {
    s.classList.remove('active')
  })
  const sItem = document.getElementById('s-' + name)
  if (sItem) sItem.classList.add('active')

  document.querySelectorAll('.nav-item').forEach(function(n) {
    n.classList.remove('active')
  })
  const navItem = document.getElementById('nav-' + name)
  if (navItem) navItem.classList.add('active')
}

function goBack() {
  switchScreen('home')
}

/* ══════════════════════════════════════
   LOGIN — OTP SYSTEM
══════════════════════════════════════ */
function showLoginError(msg) {
  const el = document.getElementById('login-error')
  if (!el) return
  el.textContent = msg
  el.style.display = 'block'
  setTimeout(function() { el.style.display = 'none' }, 4000)
}

function showLoginLoading(text) {
  document.getElementById('step-phone').style.display = 'none'
  document.getElementById('step-otp').style.display = 'none'
  document.getElementById('step-register').style.display = 'none'
  const loading = document.getElementById('login-loading')
  const loadingText = document.getElementById('loading-text')
  if (loading) loading.style.display = 'block'
  if (loadingText) loadingText.textContent = text
}

function hideLoginLoading() {
  const loading = document.getElementById('login-loading')
  if (loading) loading.style.display = 'none'
}

function showStep(id) {
  hideLoginLoading()
  const el = document.getElementById(id)
  if (el) {
    el.style.display = 'flex'
    el.style.flexDirection = 'column'
  }
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
    const response = await fetch(API + '/auth/send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: phone })
    })

    const data = await response.json()

    if (response.ok) {
      showStep('step-otp')
      const hint = document.getElementById('otp-sent-to')
      if (hint) hint.textContent = 'OTP sent to ' + phone
      const otpInput = document.getElementById('login-otp')
      if (otpInput) otpInput.focus()
    } else {
      showStep('step-phone')
      showLoginError(data.message || 'Failed to send OTP')
    }
  } catch (err) {
    showStep('step-phone')
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
    const response = await fetch(API + '/auth/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: currentPhone, otp: otp })
    })

    const data = await response.json()

    if (response.ok) {
      localStorage.setItem('rytuai_token', data.token)
      localStorage.setItem('rytuai_phone', currentPhone)

      if (data.farmer) {
        localStorage.setItem('rytuai_farmer', JSON.stringify(data.farmer))
        showApp()
        loadFarmerData()
      } else {
        showRegistrationStep()
      }
    } else {
      showStep('step-otp')
      showLoginError(data.message || 'Invalid OTP. Please try again')
    }
  } catch (err) {
    showStep('step-otp')
    showLoginError('Cannot connect to server')
  }
}

function backToPhone() {
  document.getElementById('step-otp').style.display = 'none'
  showStep('step-phone')
  const otpEl = document.getElementById('login-otp')
  if (otpEl) otpEl.value = ''
}

function showRegistrationStep() {
  document.getElementById('step-phone').style.display = 'none'
  document.getElementById('step-otp').style.display = 'none'
  document.getElementById('login-loading').style.display = 'none'
  const reg = document.getElementById('step-register')
  if (reg) {
    reg.style.display = 'flex'
    reg.style.flexDirection = 'column'
  }
  const loginScreen = document.getElementById('login-screen')
  if (loginScreen) loginScreen.scrollTop = 0
}

function backToOTP() {
  document.getElementById('step-register').style.display = 'none'
  showStep('step-otp')
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
    const response = await fetch(API + '/farmers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + localStorage.getItem('rytuai_token')
      },
      body: JSON.stringify({
        name: name,
        phone: currentPhone,
        village: village,
        district: district,
        land_acres: parseFloat(land_acres) || 0,
        crop_type: crop_type,
        sowing_date: sowing_date
      })
    })

    const data = await response.json()

    if (response.ok) {
      const farmer = data.farmer || data.Farmer || {
        name: name,
        phone: currentPhone,
        village: village,
        district: district,
        land_acres: parseFloat(land_acres) || 0,
        crop_type: crop_type,
        sowing_date: sowing_date
      }
      localStorage.setItem('rytuai_farmer', JSON.stringify(farmer))
      showApp()
      loadFarmerData()
    } else {
      showRegistrationStep()
      showLoginError(data.message || 'Registration failed. Please try again.')
    }
  } catch (err) {
    showRegistrationStep()
    showLoginError('Cannot connect to server')
  }
}

/* ══════════════════════════════════════
   PROFILE MENU
══════════════════════════════════════ */
function toggleProfileMenu() {
  const menu = document.getElementById('profile-menu')
  if (!menu) return
  const isVisible = menu.style.display === 'block'

  if (!isVisible) {
    const farmerData = localStorage.getItem('rytuai_farmer')
    if (farmerData) {
      try {
        const farmer = JSON.parse(farmerData)
        const nameEl = document.getElementById('menu-farmer-name')
        const phoneEl = document.getElementById('menu-farmer-phone')
        const detailEl = document.getElementById('menu-farmer-details')
        if (nameEl) nameEl.textContent = farmer.name || '—'
        if (phoneEl) phoneEl.textContent = farmer.phone || '—'
        if (detailEl) detailEl.textContent =
          (farmer.crop_type || 'Crop') + ' · ' + (farmer.village || 'Village')
      } catch (e) {
        console.log('Profile menu error:', e)
      }
    }
    menu.style.display = 'block'
  } else {
    menu.style.display = 'none'
  }
}

function closeProfileMenu() {
  const menu = document.getElementById('profile-menu')
  if (menu) menu.style.display = 'none'
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

  try {
    const farmer = JSON.parse(farmerData)

    const nameDisp = document.getElementById('profile-name-display')
    const phoneDisp = document.getElementById('profile-phone-display')
    if (nameDisp) nameDisp.textContent = farmer.name || '—'
    if (phoneDisp) phoneDisp.textContent = farmer.phone || '—'

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

    const screen = document.getElementById('profile-screen')
    if (screen) {
      screen.style.display = 'block'
      screen.scrollTop = 0
    }
  } catch (e) {
    alert('Error loading profile')
  }
}

function closeProfile() {
  const screen = document.getElementById('profile-screen')
  if (screen) screen.style.display = 'none'
}

async function saveProfile() {
  const farmerData = localStorage.getItem('rytuai_farmer')
  if (!farmerData) {
    alert('Please login again')
    return
  }

  const farmer = JSON.parse(farmerData)
  const phone = farmer.phone

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

  const saveBtn = document.querySelector('.fs-save')
  if (saveBtn) {
    saveBtn.textContent = 'Saving...'
    saveBtn.disabled = true
  }

  try {
    const response = await fetch(API + '/farmers/' + phone, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + localStorage.getItem('rytuai_token')
      },
      body: JSON.stringify({
        name: name,
        village: village,
        district: district,
        land_acres: parseFloat(land_acres) || 0,
        crop_type: crop_type,
        sowing_date: sowing_date
      })
    })

    const data = await response.json()

    if (response.ok) {
      const updated = Object.assign({}, farmer, {
        name: name,
        village: village,
        district: district,
        land_acres: parseFloat(land_acres) || 0,
        crop_type: crop_type,
        sowing_date: sowing_date
      })
      localStorage.setItem('rytuai_farmer', JSON.stringify(updated))
      loadFarmerData()
      alert('Profile updated successfully!')
      closeProfile()
    } else {
      alert(data.message || 'Update failed. Please try again.')
    }
  } catch (err) {
    alert('Cannot connect to server. Please try again.')
  } finally {
    if (saveBtn) {
      saveBtn.textContent = 'Save'
      saveBtn.disabled = false
    }
  }
}

/* ══════════════════════════════════════
   IMAGE UPLOAD + CAMERA
══════════════════════════════════════ */
const uploadedImages = { 0: null, 1: null, 2: null, 3: null }
const slotLabels = ['Leaf Photo', 'Stem Photo', 'Full Plant', 'Extra']

function triggerUpload(idx) {
  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
  if (isMobile) {
    showUploadChoice(idx)
  } else {
    document.getElementById('file-' + idx).click()
  }
}

function showUploadChoice(idx) {
  const existing = document.getElementById('upload-choice')
  if (existing) existing.remove()
  const existingBd = document.getElementById('upload-backdrop')
  if (existingBd) existingBd.remove()

  const backdrop = document.createElement('div')
  backdrop.id = 'upload-backdrop'
  backdrop.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:9998;'
  backdrop.onclick = function() {
    const c = document.getElementById('upload-choice')
    if (c) c.remove()
    backdrop.remove()
  }

  const choice = document.createElement('div')
  choice.id = 'upload-choice'
  choice.style.cssText = [
    'position:fixed;bottom:0;left:0;right:0;',
    'background:white;border-radius:20px 20px 0 0;',
    'padding:24px 20px;z-index:9999;',
    'box-shadow:0 -4px 20px rgba(0,0,0,0.15);'
  ].join('')

  choice.innerHTML = [
    '<div style="text-align:center;margin-bottom:20px;">',
    '<div style="width:40px;height:4px;background:#e0e0e0;border-radius:2px;margin:0 auto 16px;"></div>',
    '<div style="font-size:15px;font-weight:800;color:#1a1a1a;">Upload Photo</div>',
    '</div>',
    '<button onclick="openCamera(' + idx + ')" style="',
    'width:100%;padding:16px;background:#1a6e35;color:white;',
    'border:none;border-radius:14px;font-size:15px;font-weight:800;',
    'font-family:Nunito,sans-serif;cursor:pointer;margin-bottom:10px;display:block;">',
    '📷 Take Photo with Camera',
    '</button>',
    '<button onclick="openGallery(' + idx + ')" style="',
    'width:100%;padding:16px;background:#f8f8f8;color:#1a1a1a;',
    'border:1.5px solid #e0e0e0;border-radius:14px;font-size:15px;font-weight:800;',
    'font-family:Nunito,sans-serif;cursor:pointer;margin-bottom:10px;display:block;">',
    '🖼️ Choose from Gallery',
    '</button>',
    '<button onclick="document.getElementById(\'upload-choice\').remove();document.getElementById(\'upload-backdrop\').remove();" style="',
    'width:100%;padding:14px;background:transparent;color:#888;',
    'border:none;font-size:14px;font-weight:700;',
    'font-family:Nunito,sans-serif;cursor:pointer;display:block;">',
    'Cancel',
    '</button>'
  ].join('')

  document.body.appendChild(backdrop)
  document.body.appendChild(choice)
}

function closeUploadChoice() {
  const c = document.getElementById('upload-choice')
  if (c) c.remove()
  const b = document.getElementById('upload-backdrop')
  if (b) b.remove()
}

function openCamera(idx) {
  closeUploadChoice()
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*'
  input.capture = 'environment'
  input.style.display = 'none'
  input.onchange = function() {
    if (this.files[0]) handleUploadFile(idx, this.files[0])
    if (document.body.contains(input)) document.body.removeChild(input)
  }
  document.body.appendChild(input)
  input.click()
}

function openGallery(idx) {
  closeUploadChoice()
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*'
  input.style.display = 'none'
  input.onchange = function() {
    if (this.files[0]) handleUploadFile(idx, this.files[0])
    if (document.body.contains(input)) document.body.removeChild(input)
  }
  document.body.appendChild(input)
  input.click()
}

function handleUpload(idx, input) {
  if (input.files[0]) handleUploadFile(idx, input.files[0])
}

function handleUploadFile(idx, file) {
  const reader = new FileReader()
  reader.onload = function(e) {
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
  slot.innerHTML = [
    '<img src="' + base64 + '"',
    'style="width:100%;height:100%;object-fit:cover;border-radius:12px;" />',
    '<div style="position:absolute;top:6px;right:6px;',
    'background:#1a6e35;color:white;border-radius:50%;',
    'width:22px;height:22px;display:flex;align-items:center;',
    'justify-content:center;font-size:12px;font-weight:800;">✓</div>',
    '<div style="position:absolute;bottom:0;left:0;right:0;',
    'background:rgba(26,110,53,0.85);color:white;',
    'font-size:10px;font-weight:800;text-align:center;',
    'padding:4px;border-radius:0 0 12px 12px;">',
    slotLabels[idx],
    '</div>'
  ].join('')
}

function countUploaded() {
  return Object.values(uploadedImages).filter(function(v) { return v !== null }).length
}

function updateUploadCount() {
  const n = countUploaded()
  const el = document.getElementById('upload-count-msg')
  if (!el) return
  if (n > 0) {
    el.textContent = n + ' photo' + (n > 1 ? 's' : '') + ' ready to analyze'
    el.classList.add('ready')
  } else {
    el.textContent = 'Tap any slot to upload a photo'
    el.classList.remove('ready')
  }
}

function updateAnalyzeBtn() {
  const btn = document.getElementById('analyze-btn')
  if (!btn) return
  btn.disabled = countUploaded() < 1
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

  const loading = document.getElementById('result-loading')
  const error = document.getElementById('result-error')
  const content = document.getElementById('result-content')

  if (loading) loading.style.display = 'flex'
  if (error) error.style.display = 'none'
  if (content) content.style.display = 'none'

  try {
    const formData = new FormData()
    Object.values(uploadedImages)
      .filter(function(v) { return v !== null })
      .forEach(function(base64, index) {
        const byteStr = atob(base64.split(',')[1])
        const mime = base64.split(',')[0].split(':')[1].split(';')[0]
        const ab = new ArrayBuffer(byteStr.length)
        const ia = new Uint8Array(ab)
        for (let i = 0; i < byteStr.length; i++) {
          ia[i] = byteStr.charCodeAt(i)
        }
        const blob = new Blob([ab], { type: mime })
        formData.append('photos', blob, 'photo' + index + '.jpg')
      })

    const response = await fetch(API + '/detect', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('rytuai_token')
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
    if (error) {
      error.style.display = 'flex'
      error.style.flexDirection = 'column'
    }
    const errMsg = document.getElementById('error-msg')
    if (errMsg) errMsg.textContent = err.message || 'Something went wrong'
  }
}

function renderResult(r) {
  const content = document.getElementById('result-content')
  if (content) content.style.display = 'block'

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
  setText('r-confidence', r.confidence + ' · ' + countUploaded() + ' images analyzed')
  setText('r-sev-val', r.severity)
  setText('r-spread-val', r.spread)
  setText('r-treat-val', r.treatWithin)
  setText('r-what', r.whatIsThis)
  setText('r-symptoms', r.symptomsFound)
  setText('r-prevention', r.prevention)

  const pestDiv = document.getElementById('r-pesticides')
  if (pestDiv) {
    pestDiv.innerHTML = (r.pesticides || []).map(function(p) {
      const disc = Math.round((1 - p.priceRytu / p.priceMRP) * 100)
      return [
        '<div class="pest-item" onclick="switchScreen(\'shop\')">',
        '<div class="pest-icon">' + (p.icon || '🧴') + '</div>',
        '<div class="pest-info">',
        '<div class="pest-name">' + p.name + '</div>',
        '<div class="pest-brand">' + p.brand + ' · Rytu Shop</div>',
        '</div>',
        '<div class="pest-price-col">',
        '<div class="price">₹' + p.priceRytu + '</div>',
        '<div class="mrp">₹' + p.priceMRP + '</div>',
        '<div class="discount">' + disc + '% OFF</div>',
        '</div>',
        '</div>'
      ].join('')
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