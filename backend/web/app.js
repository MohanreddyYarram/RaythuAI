
/* ═══════════════════════════════════════
   RYTUAI — APP.JS
═══════════════════════════════════════ */

const API = ''
let currentPhone = ''

/* ══════════════════════════════════════
   TOAST NOTIFICATION (replaces alert)
══════════════════════════════════════ */
function showToast(msg, type) {
  var existing = document.getElementById('rytu-toast')
  if (existing) existing.remove()

  var color = type === 'error' ? '#e74c3c' : '#1a6e35'
  var icon = type === 'error' ? '❌' : '✅'

  var toast = document.createElement('div')
  toast.id = 'rytu-toast'
  toast.style.cssText = [
    'position:fixed;bottom:90px;left:50%;transform:translateX(-50%);',
    'background:' + color + ';color:white;',
    'padding:12px 20px;border-radius:12px;',
    'font-size:14px;font-weight:700;font-family:Nunito,sans-serif;',
    'z-index:99999;white-space:nowrap;',
    'box-shadow:0 4px 20px rgba(0,0,0,0.2);',
    'animation:fadeInUp 0.3s ease;'
  ].join('')
  toast.textContent = icon + ' ' + msg

  var style = document.createElement('style')
  style.textContent = '@keyframes fadeInUp{from{opacity:0;transform:translateX(-50%) translateY(10px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}'
  document.head.appendChild(style)

  document.body.appendChild(toast)
  setTimeout(function() { if (toast.parentNode) toast.remove() }, 3000)
}

/* ══════════════════════════════════════
   INIT
══════════════════════════════════════ */
window.onload = function () {
  const token = localStorage.getItem('rytuai_token')
  if (token) {
    showApp()
  }
}

function showApp() {
  document.getElementById('login-screen').style.display = 'none'
  document.getElementById('app').style.display = 'flex'
  setTimeout(loadFarmerData, 200)
}

function loadFarmerData() {
  const farmerData = localStorage.getItem('rytuai_farmer')
  if (!farmerData) return

  try {
    const farmer = JSON.parse(farmerData)
    if (!farmer || !farmer.name) return

    const greeting = 'నమస్కారం, ' + farmer.name + ' గారు 🙏'

    // Update every possible greeting element
    var greetEls = document.querySelectorAll(
      '#farmer-greeting, #farmer-greeting-desktop'
    )
    greetEls.forEach(function(el) { el.textContent = greeting })

    var topEl = document.getElementById('topbar-farmer-name')
    if (topEl) topEl.textContent = farmer.name

    var sbEl = document.getElementById('sidebar-farmer-name')
    if (sbEl) sbEl.textContent = farmer.name

  } catch (e) {
    console.log('loadFarmerData error:', e)
  }
}

/* ══════════════════════════════════════
   NAVIGATION
══════════════════════════════════════ */
var currentScreen = 'home'

var screenTitles = {
  home: 'Home',
  detect: 'Detect Disease',
  result: 'AI Result',
  shop: 'Rytu Shop',
  roadmap: 'Crop Roadmap',
  tracker: 'Farm Tracker'
}

function switchScreen(name) {
  currentScreen = name

  // Hide all screens
  document.querySelectorAll('.screen').forEach(function(s) {
    s.classList.remove('active')
  })

  // Show target
  var screen = document.getElementById('screen-' + name)
  if (screen) {
    screen.classList.add('active')
    screen.scrollTop = 0
  }

  // Topbar title
  var titleEl = document.getElementById('topbar-title')
  if (titleEl) titleEl.textContent = screenTitles[name] || ''

  // Sidebar active
  document.querySelectorAll('.s-item').forEach(function(s) {
    s.classList.remove('active')
  })
  var sItem = document.getElementById('s-' + name)
  if (sItem) sItem.classList.add('active')

  // Bottom nav — update ALL nav items on the page
  // Mark active based on which screen they go to
  document.querySelectorAll('.nav-item').forEach(function(n) {
    n.classList.remove('active')
    var onclick = n.getAttribute('onclick') || ''
    if (onclick.indexOf("'" + name + "'") !== -1 ||
        onclick.indexOf('"' + name + '"') !== -1) {
      n.classList.add('active')
    }
  })
  if (name === 'tracker') {
         if (typeof loadActivities === 'function') loadActivities()
    }


}

function goBack() {
  switchScreen('home')
}

/* ══════════════════════════════════════
   LOGIN
══════════════════════════════════════ */
function showLoginError(msg) {
  var el = document.getElementById('login-error')
  if (!el) return
  el.textContent = msg
  el.style.display = 'block'
  setTimeout(function() { el.style.display = 'none' }, 4000)
}

function showLoginLoading(text) {
  document.getElementById('step-phone').style.display = 'none'
  document.getElementById('step-otp').style.display = 'none'
  document.getElementById('step-register').style.display = 'none'
  var loading = document.getElementById('login-loading')
  var loadingText = document.getElementById('loading-text')
  if (loading) loading.style.display = 'block'
  if (loadingText) loadingText.textContent = text
}

function hideLoginLoading() {
  var loading = document.getElementById('login-loading')
  if (loading) loading.style.display = 'none'
}

function showStep(id) {
  hideLoginLoading()
  var el = document.getElementById(id)
  if (el) {
    el.style.display = 'flex'
    el.style.flexDirection = 'column'
  }
}

async function sendOTP() {
  var phone = document.getElementById('login-phone').value.trim()
  if (phone.length !== 10) {
    showLoginError('Please enter a valid 10-digit mobile number')
    return
  }
  currentPhone = phone
  showLoginLoading('Sending OTP...')
  try {
    var response = await fetch(API + '/auth/send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: phone })
    })
    var data = await response.json()
    if (response.ok) {
      showStep('step-otp')
      var hint = document.getElementById('otp-sent-to')
      if (hint) hint.textContent = 'OTP sent to ' + phone
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
  var otp = document.getElementById('login-otp').value.trim()
  if (otp.length !== 6) {
    showLoginError('Please enter the 6-digit OTP')
    return
  }
  showLoginLoading('Verifying OTP...')
  try {
    var response = await fetch(API + '/auth/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: currentPhone, otp: otp })
    })
    var data = await response.json()
    if (response.ok) {
      localStorage.setItem('rytuai_token', data.token)
      localStorage.setItem('rytuai_phone', currentPhone)
      if (data.farmer) {
        localStorage.setItem('rytuai_farmer', JSON.stringify(data.farmer))
        showApp()
      } else {
        showRegistrationStep()
      }
    } else {
      showStep('step-otp')
      showLoginError(data.message || 'Invalid OTP')
    }
  } catch (err) {
    showStep('step-otp')
    showLoginError('Cannot connect to server')
  }
}

function backToPhone() {
  document.getElementById('step-otp').style.display = 'none'
  showStep('step-phone')
  var otpEl = document.getElementById('login-otp')
  if (otpEl) otpEl.value = ''
}

function showRegistrationStep() {
  document.getElementById('step-phone').style.display = 'none'
  document.getElementById('step-otp').style.display = 'none'
  document.getElementById('login-loading').style.display = 'none'
  var reg = document.getElementById('step-register')
  if (reg) {
    reg.style.display = 'flex'
    reg.style.flexDirection = 'column'
  }
  var ls = document.getElementById('login-screen')
  if (ls) ls.scrollTop = 0
}

function backToOTP() {
  document.getElementById('step-register').style.display = 'none'
  showStep('step-otp')
}

async function registerFarmer() {
  var name = document.getElementById('reg-name').value.trim()
  var village = document.getElementById('reg-village').value.trim()
  var district = document.getElementById('reg-district').value.trim()
  var land_acres = document.getElementById('reg-acres').value
  var crop_type = document.getElementById('reg-crop').value
  var sowing_date = document.getElementById('reg-sowing').value

  if (!name || !village || !district) {
    showLoginError('Please fill name, village and district')
    return
  }
  showLoginLoading('Saving your profile...')
  try {
    var response = await fetch(API + '/farmers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + localStorage.getItem('rytuai_token')
      },
      body: JSON.stringify({
        name: name, phone: currentPhone,
        village: village, district: district,
        land_acres: parseFloat(land_acres) || 0,
        crop_type: crop_type, sowing_date: sowing_date
      })
    })
    var data = await response.json()
    if (response.ok) {
      var farmer = data.farmer || data.Farmer || {
        name: name, phone: currentPhone,
        village: village, district: district,
        land_acres: parseFloat(land_acres) || 0,
        crop_type: crop_type, sowing_date: sowing_date
      }
      localStorage.setItem('rytuai_farmer', JSON.stringify(farmer))
      showApp()
    } else {
      showRegistrationStep()
      showLoginError(data.message || 'Registration failed')
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
  var menu = document.getElementById('profile-menu')
  if (!menu) return
  var isVisible = menu.style.display === 'block'
  if (!isVisible) {
    var farmerData = localStorage.getItem('rytuai_farmer')
    if (farmerData) {
      try {
        var farmer = JSON.parse(farmerData)
        var n = document.getElementById('menu-farmer-name')
        var p = document.getElementById('menu-farmer-phone')
        var d = document.getElementById('menu-farmer-details')
        if (n) n.textContent = farmer.name || '—'
        if (p) p.textContent = farmer.phone || '—'
        if (d) d.textContent = (farmer.crop_type || 'Crop') + ' · ' + (farmer.village || 'Village')
      } catch (e) {}
    }
    menu.style.display = 'block'
  } else {
    menu.style.display = 'none'
  }
}

function closeProfileMenu() {
  var menu = document.getElementById('profile-menu')
  if (menu) menu.style.display = 'none'
}

function openSettings() {
  closeProfileMenu()
  showToast('Settings coming soon!', 'info')
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
  var farmerData = localStorage.getItem('rytuai_farmer')
  if (!farmerData) { showToast('Please login again', 'error'); return }

  try {
    var farmer = JSON.parse(farmerData)
    var nd = document.getElementById('profile-name-display')
    var pd = document.getElementById('profile-phone-display')
    if (nd) nd.textContent = farmer.name || '—'
    if (pd) pd.textContent = farmer.phone || '—'

    function setVal(id, val) {
      var el = document.getElementById(id)
      if (el) el.value = val || ''
    }
    setVal('edit-name', farmer.name)
    setVal('edit-village', farmer.village)
    setVal('edit-district', farmer.district)
    setVal('edit-acres', farmer.land_acres)
    setVal('edit-crop', farmer.crop_type)
    setVal('edit-sowing', farmer.sowing_date)

    var screen = document.getElementById('profile-screen')
    if (screen) { screen.style.display = 'block'; screen.scrollTop = 0 }
  } catch (e) {
    showToast('Error loading profile', 'error')
  }
}

function closeProfile() {
  var screen = document.getElementById('profile-screen')
  if (screen) screen.style.display = 'none'
}

async function saveProfile() {
  var farmerData = localStorage.getItem('rytuai_farmer')
  if (!farmerData) { showToast('Please login again', 'error'); return }

  var farmer = JSON.parse(farmerData)
  var phone = farmer.phone

  function getVal(id) {
    var el = document.getElementById(id)
    return el ? el.value.trim() : ''
  }

  var name = getVal('edit-name')
  var village = getVal('edit-village')
  var district = getVal('edit-district')
  var land_acres = getVal('edit-acres')
  var crop_type = getVal('edit-crop')
  var sowing_date = getVal('edit-sowing')

  if (!name || !village || !district) {
    showToast('Please fill name, village and district', 'error')
    return
  }

  var saveBtn = document.querySelector('.fs-save')
  if (saveBtn) { saveBtn.textContent = 'Saving...'; saveBtn.disabled = true }

  try {
    var response = await fetch(API + '/farmers/' + phone, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + localStorage.getItem('rytuai_token')
      },
      body: JSON.stringify({
        name: name, village: village, district: district,
        land_acres: parseFloat(land_acres) || 0,
        crop_type: crop_type, sowing_date: sowing_date
      })
    })

    var data = await response.json()

    if (response.ok) {
      var updated = Object.assign({}, farmer, {
        name: name, village: village, district: district,
        land_acres: parseFloat(land_acres) || 0,
        crop_type: crop_type, sowing_date: sowing_date
      })
      localStorage.setItem('rytuai_farmer', JSON.stringify(updated))
      loadFarmerData()
      showToast('Profile updated successfully!', 'success')
      setTimeout(closeProfile, 1500)
    } else {
      showToast(data.message || 'Update failed', 'error')
    }
  } catch (err) {
    showToast('Cannot connect to server', 'error')
  } finally {
    if (saveBtn) { saveBtn.textContent = 'Save'; saveBtn.disabled = false }
  }
}

/* ══════════════════════════════════════
   IMAGE UPLOAD + CAMERA
══════════════════════════════════════ */
var uploadedImages = { 0: null, 1: null, 2: null, 3: null }
var slotLabels = ['Leaf Photo', 'Stem Photo', 'Full Plant', 'Extra']

function triggerUpload(idx) {
  var isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
  if (isMobile) {
    showUploadChoice(idx)
  } else {
    document.getElementById('file-' + idx).click()
  }
}

function showUploadChoice(idx) {
  var existing = document.getElementById('upload-choice')
  if (existing) existing.remove()
  var existingBd = document.getElementById('upload-backdrop')
  if (existingBd) existingBd.remove()

  var backdrop = document.createElement('div')
  backdrop.id = 'upload-backdrop'
  backdrop.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:9998;'
  backdrop.onclick = function() { closeUploadChoice() }

  var choice = document.createElement('div')
  choice.id = 'upload-choice'
  choice.style.cssText = 'position:fixed;bottom:0;left:0;right:0;background:white;border-radius:20px 20px 0 0;padding:24px 20px;z-index:9999;box-shadow:0 -4px 20px rgba(0,0,0,0.15);'

  choice.innerHTML = '<div style="text-align:center;margin-bottom:20px;"><div style="width:40px;height:4px;background:#e0e0e0;border-radius:2px;margin:0 auto 16px;"></div><div style="font-size:15px;font-weight:800;">Upload Photo</div></div>' +
    '<button onclick="openCamera(' + idx + ')" style="width:100%;padding:16px;background:#1a6e35;color:white;border:none;border-radius:14px;font-size:15px;font-weight:800;font-family:Nunito,sans-serif;cursor:pointer;margin-bottom:10px;display:block;">📷 Take Photo with Camera</button>' +
    '<button onclick="openGallery(' + idx + ')" style="width:100%;padding:16px;background:#f8f8f8;color:#1a1a1a;border:1.5px solid #e0e0e0;border-radius:14px;font-size:15px;font-weight:800;font-family:Nunito,sans-serif;cursor:pointer;margin-bottom:10px;display:block;">🖼️ Choose from Gallery</button>' +
    '<button onclick="closeUploadChoice()" style="width:100%;padding:14px;background:transparent;color:#888;border:none;font-size:14px;font-weight:700;font-family:Nunito,sans-serif;cursor:pointer;display:block;">Cancel</button>'

  document.body.appendChild(backdrop)
  document.body.appendChild(choice)
}

function closeUploadChoice() {
  var c = document.getElementById('upload-choice')
  if (c) c.remove()
  var b = document.getElementById('upload-backdrop')
  if (b) b.remove()
}

function openCamera(idx) {
  closeUploadChoice()
  var input = document.createElement('input')
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
  var input = document.createElement('input')
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
  var reader = new FileReader()
  reader.onload = function(e) {
    uploadedImages[idx] = e.target.result
    updateSlotUI(idx, e.target.result)
    updateUploadCount()
    updateAnalyzeBtn()
  }
  reader.readAsDataURL(file)
}

function updateSlotUI(idx, base64) {
  var slot = document.getElementById('slot-' + idx)
  if (!slot) return
  slot.classList.add('filled')
  slot.innerHTML = '<img src="' + base64 + '" style="width:100%;height:100%;object-fit:cover;border-radius:12px;" />' +
    '<div style="position:absolute;top:6px;right:6px;background:#1a6e35;color:white;border-radius:50%;width:22px;height:22px;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:800;">✓</div>' +
    '<div style="position:absolute;bottom:0;left:0;right:0;background:rgba(26,110,53,0.85);color:white;font-size:10px;font-weight:800;text-align:center;padding:4px;border-radius:0 0 12px 12px;">' + slotLabels[idx] + '</div>'
}

function countUploaded() {
  return Object.values(uploadedImages).filter(function(v) { return v !== null }).length
}

function updateUploadCount() {
  var n = countUploaded()
  var el = document.getElementById('upload-count-msg')
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
  var btn = document.getElementById('analyze-btn')
  if (!btn) return
  btn.disabled = countUploaded() < 1
}

/* ══════════════════════════════════════
   AI DETECTION
══════════════════════════════════════ */
async function analyzeImages() {
  if (countUploaded() < 1) {
    showToast('Please upload at least 1 photo', 'error')
    return
  }

  switchScreen('result')

  var loading = document.getElementById('result-loading')
  var error = document.getElementById('result-error')
  var content = document.getElementById('result-content')

  if (loading) loading.style.display = 'flex'
  if (error) error.style.display = 'none'
  if (content) content.style.display = 'none'

  try {
    var formData = new FormData()
    Object.values(uploadedImages)
      .filter(function(v) { return v !== null })
      .forEach(function(base64, index) {
        var byteStr = atob(base64.split(',')[1])
        var mime = base64.split(',')[0].split(':')[1].split(';')[0]
        var ab = new ArrayBuffer(byteStr.length)
        var ia = new Uint8Array(ab)
        for (var i = 0; i < byteStr.length; i++) ia[i] = byteStr.charCodeAt(i)
        var blob = new Blob([ab], { type: mime })
        formData.append('photos', blob, 'photo' + index + '.jpg')
      })

    var response = await fetch(API + '/detect', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + localStorage.getItem('rytuai_token') },
      body: formData
    })

    var data = await response.json()
    if (loading) loading.style.display = 'none'

    if (response.ok) {
      renderResult(data.result)
    } else {
      throw new Error(data.message || 'Detection failed')
    }
  } catch (err) {
    if (loading) loading.style.display = 'none'
    if (error) { error.style.display = 'flex'; error.style.flexDirection = 'column' }
    var errMsg = document.getElementById('error-msg')
    if (errMsg) errMsg.textContent = err.message || 'Something went wrong'
  }
}

function renderResult(r) {
  var content = document.getElementById('result-content')
  if (content) content.style.display = 'block'

  var headerDiv = document.getElementById('result-header-div')
  if (headerDiv) headerDiv.className = r.healthy ? 'result-hero healthy' : 'result-hero'

  function setText(id, val) {
    var el = document.getElementById(id)
    if (el) el.textContent = val || '—'
  }

  setText('r-emoji', r.healthy ? '✅' : '🦠')
  setText('r-disease', r.disease)
  setText('r-telugu', r.teluguName)
  setText('r-confidence', r.confidence + ' · ' + countUploaded() + ' images')
  setText('r-sev-val', r.severity)
  setText('r-spread-val', r.spread)
  setText('r-treat-val', r.treatWithin)
  setText('r-what', r.whatIsThis)
  setText('r-symptoms', r.symptomsFound)
  setText('r-prevention', r.prevention)

  var pestDiv = document.getElementById('r-pesticides')
  if (pestDiv) {
    pestDiv.innerHTML = (r.pesticides || []).map(function(p) {
      var disc = Math.round((1 - p.priceRytu / p.priceMRP) * 100)
      return '<div class="pest-item" onclick="switchScreen(\'shop\')">' +
        '<div class="pest-icon">' + (p.icon || '🧴') + '</div>' +
        '<div class="pest-info"><div class="pest-name">' + p.name + '</div>' +
        '<div class="pest-brand">' + p.brand + '</div></div>' +
        '<div class="pest-price-col"><div class="price">₹' + p.priceRytu + '</div>' +
        '<div class="mrp">₹' + p.priceMRP + '</div>' +
        '<div class="discount">' + disc + '% OFF</div></div></div>'
    }).join('')
  }
}

function logout() {
  localStorage.clear()
  window.location.replace('/')
}

/* ══════════════════════════════════════
   TRACKER SYSTEM
══════════════════════════════════════ */

var currentEditActivityId = null
var allActivities = []

var typeConfig = {
  irrigation: { icon: '💧', color: 'type-irrigation', label: 'Irrigation' },
  spray:      { icon: '🧴', color: 'type-spray',      label: 'Spray' },
  fertilizer: { icon: '🌱', color: 'type-fertilizer', label: 'Fertilizer' },
  harvest:    { icon: '🌾', color: 'type-harvest',    label: 'Harvest' },
  labour:     { icon: '👨‍🌾', color: 'type-labour',    label: 'Labour' },
  shop:       { icon: '🛒', color: 'type-shop',       label: 'Purchase' },
  other:      { icon: '📝', color: 'type-other',      label: 'Other' }
}

// Load activities when tracker screen opens


async function loadActivities() {
  var farmerData = localStorage.getItem('rytuai_farmer')
  if (!farmerData) return

  var farmer = JSON.parse(farmerData)
  var phone = farmer.phone

  var listEl = document.getElementById('activities-list')
  if (!listEl) return

  listEl.innerHTML = '<div id="activities-loading" style="text-align:center;padding:40px;color:#888;"><div style="font-size:32px;margin-bottom:8px;">⏳</div><div style="font-size:13px;font-weight:700;">Loading activities...</div></div>'

  try {
    var response = await fetch(API + '/activities/' + phone, {
      headers: { 'Authorization': 'Bearer ' + localStorage.getItem('rytuai_token') }
    })
    var data = await response.json()

    if (response.ok) {
      allActivities = data.activities || []
      renderActivities(allActivities)
      updateTrackerStats(allActivities)
    } else {
      listEl.innerHTML = '<div style="text-align:center;padding:40px;color:#e74c3c;font-weight:700;">Error loading activities</div>'
    }
  } catch (err) {
    listEl.innerHTML = '<div style="text-align:center;padding:40px;color:#e74c3c;font-weight:700;">Cannot connect to server</div>'
  }
}

function updateTrackerStats(activities) {
  // Unique days
  var days = new Set(activities.map(function(a) { return a.date })).size
  var tasks = activities.length
  var totalCost = activities.reduce(function(sum, a) {
    return sum + (parseFloat(a.cost) || 0)
  }, 0)

  var daysEl = document.getElementById('stat-days')
  var tasksEl = document.getElementById('stat-tasks')
  var costEl = document.getElementById('stat-cost')

  if (daysEl) daysEl.textContent = days
  if (tasksEl) tasksEl.textContent = tasks
  if (costEl) costEl.textContent = totalCost >= 1000
    ? '₹' + (totalCost / 1000).toFixed(1) + 'k'
    : '₹' + totalCost
}

function renderActivities(activities) {
  var listEl = document.getElementById('activities-list')
  if (!listEl) return

  if (!activities || activities.length === 0) {
    listEl.innerHTML = '<div class="tracker-empty">' +
      '<div class="tracker-empty-icon">📋</div>' +
      '<div class="tracker-empty-title">No activities yet</div>' +
      '<div class="tracker-empty-sub">Start logging your daily farm work</div>' +
      '<button onclick="openAddActivity()" style="background:#1a6e35;color:white;border:none;border-radius:12px;padding:12px 24px;font-size:14px;font-weight:800;font-family:Nunito,sans-serif;cursor:pointer;">➕ Add First Activity</button>' +
      '</div>'
    return
  }

  // Group by date
  var grouped = {}
  activities.forEach(function(a) {
    var date = a.date
    if (!grouped[date]) grouped[date] = []
    grouped[date].push(a)
  })

  var html = ''
  Object.keys(grouped).forEach(function(date) {
    // Format date nicely
    var d = new Date(date + 'T00:00:00')
    var today = new Date().toISOString().split('T')[0]
    var yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]

    var dateLabel = ''
    if (date === today) {
      dateLabel = 'Today'
    } else if (date === yesterday) {
      dateLabel = 'Yesterday'
    } else {
      dateLabel = d.toLocaleDateString('en-IN', {
        day: 'numeric', month: 'short', year: 'numeric'
      })
    }

    html += '<div class="date-group-header">' + dateLabel + '</div>'

    grouped[date].forEach(function(activity) {
      var config = typeConfig[activity.type] || typeConfig['other']
      var isShop = activity.source === 'shop'

      html += '<div class="activity-card">' +
        '<div class="activity-card-header">' +
        '<div class="activity-type-icon ' + config.color + '">' + config.icon + '</div>' +
        '<div class="activity-card-info">' +
        '<div class="activity-card-title">' + activity.title +
        (isShop ? '<span class="shop-badge-activity">🛒 Shop</span>' : '') +
        '</div>' +
        '<div class="activity-card-date">' + config.label +
        (activity.quantity ? ' · ' + activity.quantity + ' ' + (activity.unit || '') : '') +
        '</div>' +
        '</div>' +
        (activity.cost > 0 ? '<div class="activity-card-cost">₹' + activity.cost + '</div>' : '') +
        '</div>'

      if (activity.description) {
        html += '<div class="activity-card-desc">' + activity.description + '</div>'
      }

      // Don't show edit/delete for shop purchases
      if (!isShop) {
        html += '<div class="activity-card-footer">' +
          '<button class="activity-action-btn activity-edit-btn" onclick="openEditActivity(' + activity.id + ')">✏️ Edit</button>' +
          '<button class="activity-action-btn activity-delete-btn" onclick="deleteActivity(' + activity.id + ')">🗑️ Delete</button>' +
          '</div>'
      }

      html += '</div>'
    })
  })

  listEl.innerHTML = html
}

// ── ADD ACTIVITY ──
function openAddActivity() {
  currentEditActivityId = null
  var titleEl = document.getElementById('activity-screen-title')
  if (titleEl) titleEl.textContent = 'Add Activity'

  // Reset all fields
  document.getElementById('activity-type').value = ''
  document.getElementById('activity-date').value = new Date().toISOString().split('T')[0]
  document.getElementById('activity-title').value = ''
  document.getElementById('activity-desc').value = ''
  document.getElementById('activity-cost').value = ''
  document.getElementById('activity-quantity').value = ''
  document.getElementById('activity-unit').value = ''

  // Reset type chips
  document.querySelectorAll('.type-chip').forEach(function(c) {
    c.classList.remove('selected')
  })

  var screen = document.getElementById('activity-screen')
  if (screen) { screen.style.display = 'block'; screen.scrollTop = 0 }
}

// ── EDIT ACTIVITY ──
function openEditActivity(id) {
  var activity = allActivities.find(function(a) { return a.id === id })
  if (!activity) return

  currentEditActivityId = id
  var titleEl = document.getElementById('activity-screen-title')
  if (titleEl) titleEl.textContent = 'Edit Activity'

  // Fill fields
  document.getElementById('activity-type').value = activity.type || ''
  document.getElementById('activity-date').value = activity.date || ''
  document.getElementById('activity-title').value = activity.title || ''
  document.getElementById('activity-desc').value = activity.description || ''
  document.getElementById('activity-cost').value = activity.cost || ''
  document.getElementById('activity-quantity').value = activity.quantity || ''
  document.getElementById('activity-unit').value = activity.unit || ''

  // Select type chip
  document.querySelectorAll('.type-chip').forEach(function(c) {
    c.classList.remove('selected')
    if (c.getAttribute('data-type') === activity.type) {
      c.classList.add('selected')
    }
  })

  var screen = document.getElementById('activity-screen')
  if (screen) { screen.style.display = 'block'; screen.scrollTop = 0 }
}

function selectType(type) {
  document.getElementById('activity-type').value = type
  document.querySelectorAll('.type-chip').forEach(function(c) {
    c.classList.remove('selected')
  })
  var chip = document.querySelector('[data-type="' + type + '"]')
  if (chip) chip.classList.add('selected')
}

function closeActivityScreen() {
  var screen = document.getElementById('activity-screen')
  if (screen) screen.style.display = 'none'
}

// ── SAVE ACTIVITY ──
async function saveActivity() {
  var type = document.getElementById('activity-type').value
  var date = document.getElementById('activity-date').value
  var title = document.getElementById('activity-title').value.trim()
  var desc = document.getElementById('activity-desc').value.trim()
  var cost = document.getElementById('activity-cost').value
  var quantity = document.getElementById('activity-quantity').value.trim()
  var unit = document.getElementById('activity-unit').value

  if (!type) { showToast('Please select activity type', 'error'); return }
  if (!title) { showToast('Please enter a title', 'error'); return }
  if (!date) { showToast('Please select a date', 'error'); return }

  var farmerData = localStorage.getItem('rytuai_farmer')
  if (!farmerData) { showToast('Please login again', 'error'); return }
  var farmer = JSON.parse(farmerData)

  var saveBtn = document.getElementById('activity-save-btn')
  if (saveBtn) { saveBtn.textContent = 'Saving...'; saveBtn.disabled = true }

  try {
    var url = API + '/activities'
    var method = 'POST'

    if (currentEditActivityId) {
      url = API + '/activities/' + currentEditActivityId
      method = 'PUT'
    }

    var response = await fetch(url, {
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + localStorage.getItem('rytuai_token')
      },
      body: JSON.stringify({
        farmer_id: farmer.phone,
        date: date,
        type: type,
        title: title,
        description: desc,
        cost: parseFloat(cost) || 0,
        quantity: quantity,
        unit: unit,
        source: 'manual'
      })
    })

    var data = await response.json()

    if (response.ok) {
      showToast(
        currentEditActivityId ? 'Activity updated!' : 'Activity added!',
        'success'
      )
      closeActivityScreen()
      loadActivities()
    } else {
      showToast(data.message || 'Failed to save', 'error')
    }
  } catch (err) {
    showToast('Cannot connect to server', 'error')
  } finally {
    if (saveBtn) { saveBtn.textContent = 'Save'; saveBtn.disabled = false }
  }
}

// ── DELETE ACTIVITY ──
async function deleteActivity(id) {
  if (!confirm('Delete this activity?')) return

  try {
    var response = await fetch(API + '/activities/' + id, {
      method: 'DELETE',
      headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('rytuai_token')
      }
    })

    if (response.ok) {
      showToast('Activity deleted', 'success')
      loadActivities()
    } else {
      showToast('Failed to delete', 'error')
    }
  } catch (err) {
    showToast('Cannot connect to server', 'error')
  }
}

// ── AUTO ADD FROM SHOP ──
async function addShopActivityToTracker(item, price) {
  var farmerData = localStorage.getItem('rytuai_farmer')
  if (!farmerData) return

  var farmer = JSON.parse(farmerData)

  try {
    await fetch(API + '/activities', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + localStorage.getItem('rytuai_token')
      },
      body: JSON.stringify({
        farmer_id: farmer.phone,
        date: new Date().toISOString().split('T')[0],
        type: 'spray',
        title: 'Purchased: ' + item,
        description: 'Ordered from Rytu Shop',
        cost: parseFloat(price) || 0,
        source: 'shop'
      })
    })
  } catch (err) {
    console.log('Auto tracker error:', err)
  }
}

/* ══════════════════════════════════════
   PULL TO REFRESH
══════════════════════════════════════ */
(function() {
  var startY = 0
  var threshold = 80
  var refreshing = false

  // Find the active screen
  function getActiveScreen() {
    return document.querySelector('.screen.active')
  }

  // Show refresh indicator
  function showRefreshIndicator() {
    var existing = document.getElementById('pull-refresh')
    if (existing) return

    var indicator = document.createElement('div')
    indicator.id = 'pull-refresh'
    indicator.style.cssText = [
      'position:fixed;top:56px;left:50%;',
      'transform:translateX(-50%);',
      'background:#1a6e35;color:white;',
      'padding:8px 20px;border-radius:0 0 20px 20px;',
      'font-size:13px;font-weight:700;',
      'font-family:Nunito,sans-serif;',
      'z-index:9999;',
      'display:flex;align-items:center;gap:8px;'
    ].join('')
    indicator.innerHTML = '<div id="pull-spinner" style="width:16px;height:16px;border:2px solid rgba(255,255,255,0.3);border-top-color:white;border-radius:50%;animation:spin 0.8s linear infinite;"></div> Refreshing...'
    document.body.appendChild(indicator)
  }

  function hideRefreshIndicator() {
    var indicator = document.getElementById('pull-refresh')
    if (indicator) indicator.remove()
  }

  // Touch start
  document.addEventListener('touchstart', function(e) {
    var screen = getActiveScreen()
    if (!screen) return
    if (screen.scrollTop === 0) {
      startY = e.touches[0].clientY
    } else {
      startY = 0
    }
  }, { passive: true })

  // Touch end
  document.addEventListener('touchend', function(e) {
    if (!startY || refreshing) return

    var endY = e.changedTouches[0].clientY
    var diff = endY - startY

    if (diff > threshold) {
      refreshing = true
      showRefreshIndicator()

      // Reload current screen data
      var screen = getActiveScreen()
      if (screen) {
        var screenId = screen.id

        if (screenId === 'screen-tracker') {
          if (typeof loadActivities === 'function') loadActivities()
        }
      }

      // Reload page after short delay
      setTimeout(function() {
        hideRefreshIndicator()
        refreshing = false
        window.location.reload()
      }, 1000)
    }

    startY = 0
  }, { passive: true })
})()