
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
  setTimeout(loadGreetingAndWeather, 300)

  //Restore last screen
  var lastScreen = localStorage.getItem('rytuai_screen') || 'home'
  switchScreen(lastScreen)
}

function loadFarmerData() {
  const farmerData = localStorage.getItem('rytuai_farmer')
  if (!farmerData) return

  try {
    const farmer = JSON.parse(farmerData)
    if (!farmer || !farmer.name) return

    // ── Greeting ──
    var greeting = 'నమస్కారం, ' + farmer.name + ' గారు 🙏'
    document.querySelectorAll('#farmer-greeting, #farmer-greeting-desktop')
      .forEach(function(el) { el.textContent = greeting })

    var topEl = document.getElementById('topbar-farmer-name')
    if (topEl) topEl.textContent = farmer.name

    var sbEl = document.getElementById('sidebar-farmer-name')
    if (sbEl) sbEl.textContent = farmer.name

    // ── Crop Name ──
    var cropNameEl = document.querySelector('.crop-name')
    if (cropNameEl && farmer.crop_type) {
      cropNameEl.textContent = farmer.crop_type
    }

    // ── Crop Meta (sowing date + acres) ──
    var cropMetaEl = document.querySelector('.crop-meta')
    if (cropMetaEl) {
      var acres = farmer.land_acres || '—'
      if (farmer.sowing_date) {
        var sowDate = new Date(farmer.sowing_date + 'T00:00:00')
        var sowFormatted = sowDate.toLocaleDateString('en-IN', {
          day: 'numeric', month: 'short', year: '2-digit'
        })
        cropMetaEl.textContent = 'Sowed: ' + sowFormatted + ' · ' + acres + ' acres'
      } else {
        cropMetaEl.textContent = acres + ' acres'
      }
    }

    // ── Crop Stage + Progress ──
    if (farmer.sowing_date) {
      var sowDate2 = new Date(farmer.sowing_date + 'T00:00:00')
      var today = new Date()
      var daysDiff = Math.floor((today - sowDate2) / (1000 * 60 * 60 * 24))

      var stage = ''
      var progress = 0

      if (daysDiff < 30) {
        stage = 'Seedling Stage'; progress = 10
      } else if (daysDiff < 60) {
        stage = 'Vegetative Stage'; progress = 25
      } else if (daysDiff < 90) {
        stage = 'Flowering Stage'; progress = 50
      } else if (daysDiff < 120) {
        stage = 'Fruit Development'; progress = 75
      } else if (daysDiff < 150) {
        stage = 'Harvest Ready'; progress = 90
      } else {
        stage = 'Season Complete'; progress = 100
      }

      var stageEl = document.querySelector('.crop-stage, .crop-badge')
      if (stageEl) stageEl.textContent = stage

      var progressEl = document.querySelector('.crop-progress-fill')
      if (progressEl) progressEl.style.width = progress + '%'

      var progressLabel = document.querySelector('.crop-progress-label')
      if (progressLabel) {
        progressLabel.textContent = 'Season Progress — ' + progress + '%'
      }
    }

  } catch(e) {
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
  feed: 'Feed',
  tracker: 'Farm Tracker'
}

function switchScreen(name) {
  
  localStorage.setItem('rytuai_screen',name)
  document.querySelectorAll('.screen').forEach(function(s){
    s.classList.remove('active')
  })
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

  if (name === 'feed') {
      if (typeof loadFeed === 'function') loadFeed()
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
    var dateKey = a.date ? a.date.toString().substring(0, 10) : 'Unknown'
    if (!grouped[dateKey]) grouped[dateKey] = []
    grouped[dateKey].push(a)
  })

  var todayStr = new Date().toISOString().substring(0, 10)
  var yesterdayDate = new Date()
  yesterdayDate.setDate(yesterdayDate.getDate() - 1)
  var yesterdayStr = yesterdayDate.toISOString().substring(0, 10)

  var html = ''

  Object.keys(grouped).forEach(function(dateKey) {
    var dateLabel = ''

    if (dateKey === 'Unknown') {
      dateLabel = 'Unknown Date'
    } else if (dateKey === todayStr) {
      dateLabel = 'Today'
    } else if (dateKey === yesterdayStr) {
      dateLabel = 'Yesterday'
    } else {
      // Format: 31 May 2026
      var parts = dateKey.split('-')
      var year = parts[0]
      var month = parts[1]
      var day = parts[2]
      var months = ['Jan','Feb','Mar','Apr','May','Jun',
                    'Jul','Aug','Sep','Oct','Nov','Dec']
      dateLabel = parseInt(day) + ' ' + months[parseInt(month) - 1] + ' ' + year
    }

    html += '<div class="date-group-header">' + dateLabel + '</div>'

    grouped[dateKey].forEach(function(activity) {
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
  var confirmed = await showConfirm('Delete this activity')
  if(!confirmed) return

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

function showConfirm(msg) {
  return new Promise(function(resolve) {
    var old = document.getElementById('rytu-confirm')
    if (old) old.remove()

    var box = document.createElement('div')
    box.id = 'rytu-confirm'
    box.style.cssText = 'position:fixed;bottom:90px;left:16px;right:16px;background:white;border-radius:16px;padding:20px;z-index:99999;box-shadow:0 8px 32px rgba(0,0,0,0.2);border:1.5px solid #e8e0d0;'
    box.innerHTML =
      '<div style="font-size:15px;font-weight:800;color:#1a1a1a;margin-bottom:16px;text-align:center;">' + msg + '</div>' +
      '<div style="display:flex;gap:10px;">' +
      '<button onclick="document.getElementById(\'rytu-confirm\').remove();window._confirmResolve(false);" style="flex:1;padding:12px;background:#f8f8f8;color:#555;border:1.5px solid #e0e0e0;border-radius:10px;font-size:14px;font-weight:700;font-family:Nunito,sans-serif;cursor:pointer;">Cancel</button>' +
      '<button onclick="document.getElementById(\'rytu-confirm\').remove();window._confirmResolve(true);" style="flex:1;padding:12px;background:#e74c3c;color:white;border:none;border-radius:10px;font-size:14px;font-weight:700;font-family:Nunito,sans-serif;cursor:pointer;">Delete</button>' +
      '</div>'

    window._confirmResolve = resolve
    document.body.appendChild(box)
  })
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
   PULL TO REFRESH — FIXED
   Replace the existing pull to refresh
   code in app.js with this
══════════════════════════════════════ */
(function() {
  var startY = 0
  var threshold = 80
  var refreshing = false
  var indicator = null

  function getActiveScreen() {
    return document.querySelector('.screen.active')
  }

  function getActiveScreenName() {
    var screen = getActiveScreen()
    if (!screen) return 'home'
    return screen.id.replace('screen-', '')
  }

  function showIndicator() {
    if (indicator) return
    indicator = document.createElement('div')
    indicator.style.cssText = [
      'position:fixed;top:56px;left:50%;',
      'transform:translateX(-50%);',
      'background:#1a6e35;color:white;',
      'padding:8px 20px;border-radius:0 0 16px 16px;',
      'font-size:13px;font-weight:700;',
      'font-family:Nunito,sans-serif;',
      'z-index:9999;',
      'display:flex;align-items:center;gap:8px;',
      'white-space:nowrap;'
    ].join('')
    indicator.innerHTML = '<div style="width:14px;height:14px;border:2px solid rgba(255,255,255,0.3);border-top-color:white;border-radius:50%;animation:spin 0.8s linear infinite;"></div> Refreshing...'
    document.body.appendChild(indicator)
  }

  function hideIndicator() {
    if (indicator) {
      indicator.remove()
      indicator = null
    }
  }

  // Refresh only current screen data — NO page reload
  function refreshCurrentScreen() {
    var name = getActiveScreenName()

    switch(name) {
      case 'tracker':
        if (typeof loadActivities === 'function') loadActivities()
        break
      case 'shop':
        if (typeof loadStores === 'function') loadStores()
        break
      case 'home':
        if (typeof loadFarmerData === 'function') loadFarmerData()
        if (typeof loadGreetingAndWeather === 'function') loadGreetingAndWeather()
        break
      case 'detect':
        // Reset upload slots
        Object.keys(uploadedImages).forEach(function(k) {
          uploadedImages[k] = null
        })
        if (typeof updateCountMsg === 'function') updateCountMsg()
        if (typeof checkAnalyzeReady === 'function') checkAnalyzeReady()
        // Reset slot UI
        for (var i = 0; i < 4; i++) {
          var slot = document.getElementById('slot-' + i)
          if (slot) {
            slot.classList.remove('filled')
            slot.innerHTML = '<div class="slot-plus">+</div>' +
              '<div class="slot-label">' + (['Leaf Photo','Stem Photo','Full Plant','Extra'][i]) + '</div>'
          }
        }
        break
      default:
        // For roadmap — nothing to refresh
        break
    }

    showToast('Refreshed!', 'success')
  }

  document.addEventListener('touchstart', function(e) {
    var screen = getActiveScreen()
    if (!screen) return
    if (screen.scrollTop === 0) {
      startY = e.touches[0].clientY
    } else {
      startY = 0
    }
  }, { passive: true })

  document.addEventListener('touchmove', function(e) {
    if (!startY || refreshing) return
    var diff = e.touches[0].clientY - startY
    if (diff > 40) {
      showIndicator()
    }
  }, { passive: true })

  document.addEventListener('touchend', function(e) {
    if (!startY || refreshing) {
      hideIndicator()
      startY = 0
      return
    }

    var endY = e.changedTouches[0].clientY
    var diff = endY - startY

    if (diff > threshold) {
      refreshing = true
      setTimeout(function() {
        refreshCurrentScreen()
        hideIndicator()
        refreshing = false
      }, 800)
    } else {
      hideIndicator()
    }

    startY = 0
  }, { passive: true })
})()

/* ══════════════════════════════════════
   DYNAMIC GREETING + WEATHER
══════════════════════════════════════ */
async function loadGreetingAndWeather() {
  // ── Dynamic Greeting ──
  var hour = new Date().getHours()
  var greeting = ''

  if (hour < 12) {
    greeting = 'Good morning'
  } else if (hour < 17) {
    greeting = 'Good afternoon'
  } else {
    greeting = 'Good evening'
  }

  var subEl = document.querySelector('.dh-sub')
  if (subEl) subEl.textContent = greeting + ' — here\'s your farm overview'

  var mobSubEl = document.querySelector('.home-subtext')
  if (mobSubEl) mobSubEl.textContent = greeting + ', farmer'

  // ── Get real location then weather ──
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      async function(position) {
        var lat = position.coords.latitude
        var lon = position.coords.longitude

        // Get city name
        try {
          var geoRes = await fetch(
            'https://nominatim.openstreetmap.org/reverse?lat=' +
            lat + '&lon=' + lon + '&format=json'
          )
          var geoData = await geoRes.json()
          var city = geoData.address.city ||
                     geoData.address.town ||
                     geoData.address.village ||
                     geoData.address.district ||
                     'Your Location'
          await fetchWeather(lat, lon, city)
        } catch(e) {
          await fetchWeather(lat, lon, 'Your Location')
        }
      },
      async function(err) {
        // Location denied — use Guntur default
        await fetchWeather(16.3008, 80.4428, 'Guntur')
      },
      { timeout: 5000 }
    )
  } else {
    await fetchWeather(16.3008, 80.4428, 'Guntur')
  }
}

async function fetchWeather(lat, lon, city) {
  try {
    var url = 'https://api.open-meteo.com/v1/forecast' +
      '?latitude=' + lat +
      '&longitude=' + lon +
      '&current=temperature_2m,relative_humidity_2m,weathercode' +
      '&timezone=Asia/Kolkata'

    var response = await fetch(url)
    var data = await response.json()

    if (data && data.current) {
      var temp = Math.round(data.current.temperature_2m)
      var humidity = data.current.relative_humidity_2m
      var code = data.current.weathercode
      var weatherInfo = getWeatherInfo(code)

      var alert = humidity > 75
        ? 'High humidity — watch for fungal diseases'
        : humidity > 60
        ? 'Moderate humidity — monitor your crop'
        : 'Good weather for farming today'

      // Mobile
      var tempEl = document.querySelector('.weather-temp')
      var descEl = document.querySelector('.weather-desc')
      if (tempEl) tempEl.textContent = temp + '°C · ' + city
      if (descEl) descEl.textContent = alert

      // Desktop
      var dhTemp = document.querySelector('.dh-temp')
      var dhLoc = document.querySelector('.dh-loc')
      var dhAlert = document.querySelector('.dh-weather-alert')
      if (dhTemp) dhTemp.textContent = temp + '°C'
      if (dhLoc) dhLoc.textContent = city + ' · ' + humidity + '% humidity'
      if (dhAlert) dhAlert.textContent = '⚠️ ' + alert

      // Icon
      var iconEl = document.querySelector('.weather-icon')
      if (iconEl) iconEl.textContent = weatherInfo.icon

      console.log('Weather:', temp + '°C at ' + city)
    }
  } catch(err) {
    console.log('Weather error:', err.message)
  }
}

function getWeatherInfo(code) {
  if (code === 0) return { icon: '☀️', desc: 'Clear sky' }
  if (code <= 2) return { icon: '🌤️', desc: 'Partly cloudy' }
  if (code <= 3) return { icon: '☁️', desc: 'Cloudy' }
  if (code <= 49) return { icon: '🌫️', desc: 'Foggy' }
  if (code <= 59) return { icon: '🌧️', desc: 'Drizzle' }
  if (code <= 69) return { icon: '🌧️', desc: 'Rain' }
  if (code <= 79) return { icon: '❄️', desc: 'Snow' }
  if (code <= 84) return { icon: '🌦️', desc: 'Rain showers' }
  if (code <= 99) return { icon: '⛈️', desc: 'Thunderstorm' }
  return { icon: '⛅', desc: 'Partly cloudy' }
}

/* ══════════════════════════════════════
   RYTUAI SHOP — FRONTEND JS
══════════════════════════════════════ */

// ── SHOP STATE ──
var cart = []
var currentStoreId = null
var currentStoreName = ''
var allProducts = []

// Load shop when screen opens
var _origSwitchScreen = switchScreen
switchScreen = function(name) {
  _origSwitchScreen(name)
  if (name === 'shop') loadStores()
}

// ── LOAD STORES ──
async function loadStores() {
  var shopBody = document.getElementById('shop-body-content')
  if (!shopBody) return

  var farmerData = localStorage.getItem('rytuai_farmer')
  var district = ''
  if (farmerData) {
    try {
      var farmer = JSON.parse(farmerData)
      district = farmer.district || ''
    } catch(e) {}
  }

  shopBody.innerHTML = '<div style="text-align:center;padding:40px;color:#888;"><div style="font-size:32px;">⏳</div><div style="font-size:13px;font-weight:700;margin-top:8px;">Loading stores...</div></div>'

  try {
    var url = API + '/shop/stores'
    if (district) url += '?district=' + encodeURIComponent(district)

    var response = await fetch(url, {
      headers: { 'Authorization': 'Bearer ' + localStorage.getItem('rytuai_token') }
    })
    var data = await response.json()

    if (response.ok && data.stores && data.stores.length > 0) {
      renderStores(data.stores)
    } else {
      renderStores([])
    }
  } catch(err) {
    shopBody.innerHTML = '<div style="text-align:center;padding:40px;color:#e74c3c;font-weight:700;">Cannot connect to server</div>'
  }
}

function renderStores(stores) {
  var shopBody = document.getElementById('shop-body-content')
  if (!shopBody) return

  if (stores.length === 0) {
    shopBody.innerHTML = '<div style="text-align:center;padding:48px 24px;">' +
      '<div style="font-size:48px;margin-bottom:12px;">🏪</div>' +
      '<div style="font-size:16px;font-weight:800;color:#1a2e1e;">No stores available</div>' +
      '<div style="font-size:13px;color:#888;margin-top:6px;">Stores coming soon in your area</div>' +
      '</div>'
    return
  }

  var html = '<div class="section-label">🏪 Stores Near You</div>'

  stores.forEach(function(store) {
    html += '<div class="store-card-big" onclick="openStore(' + store.id + ', \'' + store.name.replace(/'/g, '') + '\')">' +
      '<div class="store-card-top">' +
      '<div class="store-icon">🏪</div>' +
      '<div class="store-card-info">' +
      '<div class="store-card-name">' + store.name + '</div>' +
      '<div class="store-card-addr">' + (store.address || '') + '</div>' +
      '<div class="store-card-meta">' +
      '<span class="store-tag">📍 ' + (store.district || '') + '</span>' +
      '<span class="store-tag">🕐 ' + store.open_time + '–' + store.close_time + '</span>' +
      '<span class="store-tag">🚚 ' + store.delivery_radius_km + 'km radius</span>' +
      '</div>' +
      '</div>' +
      '<div style="font-size:20px;color:#1a6e35;">›</div>' +
      '</div>' +
      '</div>'
  })

  shopBody.innerHTML = html
}

// ── OPEN STORE ──
async function openStore(storeId, storeName) {
  currentStoreId = storeId
  currentStoreName = storeName

  var shopBody = document.getElementById('shop-body-content')
  if (!shopBody) return

  shopBody.innerHTML = '<div style="display:flex;align-items:center;gap:10px;padding:16px;">' +
    '<button onclick="loadStores()" style="background:none;border:none;font-size:20px;cursor:pointer;color:#1a6e35;">←</button>' +
    '<div style="font-size:15px;font-weight:800;">' + storeName + '</div>' +
    '</div>' +
    '<div style="text-align:center;padding:40px;color:#888;"><div style="font-size:32px;">⏳</div><div style="font-size:13px;font-weight:700;margin-top:8px;">Loading products...</div></div>'

  try {
    var response = await fetch(API + '/shop/products/' + storeId, {
      headers: { 'Authorization': 'Bearer ' + localStorage.getItem('rytuai_token') }
    })
    var data = await response.json()

    if (response.ok) {
      allProducts = data.products || []
      renderProducts(allProducts, storeId, storeName)
    }
  } catch(err) {
    showToast('Cannot load products', 'error')
  }
}

function renderProducts(products, storeId, storeName) {
  var shopBody = document.getElementById('shop-body-content')
  if (!shopBody) return

  // Get unique categories
  var categories = ['All']
  products.forEach(function(p) {
    if (p.category && categories.indexOf(p.category) === -1) {
      categories.push(p.category)
    }
  })

  var html = '<div style="display:flex;align-items:center;gap:10px;padding:12px 16px 8px;">' +
    '<button onclick="loadStores()" style="background:#f0f7f2;border:none;border-radius:8px;padding:8px 14px;font-size:13px;font-weight:700;cursor:pointer;color:#1a6e35;">← Back</button>' +
    '<div style="font-size:15px;font-weight:800;flex:1;">' + storeName + '</div>' +
    '</div>'

  // Category filter
  html += '<div class="category-row" style="padding:0 16px 8px;">'
  categories.forEach(function(cat) {
    html += '<div class="cat' + (cat === 'All' ? ' active' : '') + '" onclick="filterProducts(\'' + cat + '\')" id="cat-' + cat.replace(/\s/g,'-') + '">' + cat + '</div>'
  })
  html += '</div>'

  html += '<div id="product-list-container" style="padding:0 16px 16px;">'
  html += renderProductList(products)
  html += '</div>'

  shopBody.innerHTML = html
  updateCartBar()
}

function renderProductList(products) {
  if (products.length === 0) {
    return '<div style="text-align:center;padding:40px;color:#888;font-weight:700;">No products in this category</div>'
  }

  var html = ''
  products.forEach(function(p) {
    var disc = p.mrp ? Math.round((1 - p.price / p.mrp) * 100) : 0
    var inCart = cart.find(function(c) { return c.id === p.id })
    var qty = inCart ? inCart.qty : 0

    html += '<div class="product-item" id="product-' + p.id + '">' +
      '<div class="product-icon">' + getCategoryIcon(p.category) + '</div>' +
      '<div class="product-info">' +
      '<div class="product-name">' + p.name + '</div>' +
      '<div class="product-brand">' + (p.brand || '') + ' · ' + (p.unit || '') + '</div>' +
      '<div class="product-prices">' +
      '<span class="product-price">₹' + p.price + '</span>' +
      (p.mrp ? '<span class="product-mrp">₹' + p.mrp + '</span>' : '') +
      (disc > 0 ? '<span class="product-disc">' + disc + '% OFF</span>' : '') +
      '</div>' +
      '</div>' +
      '<div id="qty-ctrl-' + p.id + '">' +
      (qty === 0
        ? '<button class="add-btn" onclick="addToCart(' + p.id + ', \'' + p.name.replace(/'/g,'') + '\', ' + p.price + ')">Add</button>'
        : '<div class="qty-ctrl">' +
          '<button onclick="decreaseQty(' + p.id + ')">−</button>' +
          '<span>' + qty + '</span>' +
          '<button onclick="increaseQty(' + p.id + ', \'' + p.name.replace(/'/g,'') + '\', ' + p.price + ')">+</button>' +
          '</div>'
      ) +
      '</div>' +
      '</div>'
  })
  return html
}

function getCategoryIcon(category) {
  var icons = {
    'Insecticide': '🧴',
    'Fungicide': '🧪',
    'Fertilizer': '🪣',
    'Bio-pesticide': '🌿',
    'Seeds': '🌱',
    'Equipment': '🔧'
  }
  return icons[category] || '📦'
}

function filterProducts(category) {
  // Update active tab
  document.querySelectorAll('.cat').forEach(function(c) {
    c.classList.remove('active')
  })
  var catEl = document.getElementById('cat-' + category.replace(/\s/g,'-'))
  if (catEl) catEl.classList.add('active')

  var filtered = category === 'All'
    ? allProducts
    : allProducts.filter(function(p) { return p.category === category })

  var container = document.getElementById('product-list-container')
  if (container) container.innerHTML = renderProductList(filtered)
}

// ── CART ──
function addToCart(id, name, price) {
  var existing = cart.find(function(c) { return c.id === id })
  if (existing) {
    existing.qty++
  } else {
    cart.push({ id: id, name: name, price: price, qty: 1 })
  }
  updateQtyCtrl(id)
  updateCartBar()
  showToast(name + ' added to cart', 'success')
}

function increaseQty(id, name, price) {
  var existing = cart.find(function(c) { return c.id === id })
  if (existing) {
    existing.qty++
  } else {
    cart.push({ id: id, name: name, price: price, qty: 1 })
  }
  updateQtyCtrl(id)
  updateCartBar()
}

function decreaseQty(id) {
  var existing = cart.find(function(c) { return c.id === id })
  if (!existing) return
  existing.qty--
  if (existing.qty <= 0) {
    cart = cart.filter(function(c) { return c.id !== id })
  }
  updateQtyCtrl(id)
  updateCartBar()
}

function updateQtyCtrl(id) {
  var ctrl = document.getElementById('qty-ctrl-' + id)
  if (!ctrl) return
  var item = cart.find(function(c) { return c.id === id })
  var qty = item ? item.qty : 0
  var product = allProducts.find(function(p) { return p.id === id })
  var name = product ? product.name.replace(/'/g,'') : ''
  var price = product ? product.price : 0

  if (qty === 0) {
    ctrl.innerHTML = '<button class="add-btn" onclick="addToCart(' + id + ', \'' + name + '\', ' + price + ')">Add</button>'
  } else {
    ctrl.innerHTML = '<div class="qty-ctrl">' +
      '<button onclick="decreaseQty(' + id + ')">−</button>' +
      '<span>' + qty + '</span>' +
      '<button onclick="increaseQty(' + id + ', \'' + name + '\', ' + price + ')">+</button>' +
      '</div>'
  }
}

function cartTotal() {
  return cart.reduce(function(sum, item) {
    return sum + (item.price * item.qty)
  }, 0)
}

function cartCount() {
  return cart.reduce(function(sum, item) {
    return sum + item.qty
  }, 0)
}

function updateCartBar() {
  var bar = document.getElementById('cart-bar')
  if (!bar) return

  if (cart.length === 0) {
    bar.style.display = 'none'
    return
  }

  bar.style.display = 'flex'
  var countEl = document.getElementById('cart-count')
  var totalEl = document.getElementById('cart-total')
  if (countEl) countEl.textContent = cartCount() + ' item' + (cartCount() > 1 ? 's' : '')
  if (totalEl) totalEl.textContent = '₹' + cartTotal()
}

// ── CART SCREEN ──
function openCart() {
  var screen = document.getElementById('cart-screen')
  if (!screen) return

  //Pre-fill delivery address from farmer profile
  

  //Set store name
  var storeNameEl = document.getElementById('cart-store-name')
  if(storeNameEl) storeNameEl.textContent = currentStoreName

  renderCartScreen()
  screen.style.display = 'block'
  screen.scrollTop = 0
  fillAddressFromProfile()
}

function closeCart() {
  var screen = document.getElementById('cart-screen')
  if (screen) screen.style.display = 'none'
}

function renderCartScreen() {
  var container = document.getElementById('cart-items-container')
  if (!container) return

  if (cart.length === 0) {
    container.innerHTML = '<div style="text-align:center;padding:48px 24px;">' +
      '<div style="font-size:48px;margin-bottom:12px;">🛒</div>' +
      '<div style="font-size:16px;font-weight:800;">Cart is empty</div>' +
      '</div>'
    return
  }

  var html = ''
  cart.forEach(function(item) {
    html += '<div style="display:flex;align-items:center;gap:12px;padding:14px;background:white;border-radius:12px;margin-bottom:10px;border:1.5px solid #e8e0d0;">' +
      '<div style="flex:1;">' +
      '<div style="font-size:14px;font-weight:800;">' + item.name + '</div>' +
      '<div style="font-size:12px;color:#888;margin-top:2px;">₹' + item.price + ' each</div>' +
      '</div>' +
      '<div class="qty-ctrl">' +
      '<button onclick="cartDecrease(' + item.id + ')">−</button>' +
      '<span>' + item.qty + '</span>' +
      '<button onclick="cartIncrease(' + item.id + ')">+</button>' +
      '</div>' +
      '<div style="font-size:15px;font-weight:900;color:#1a6e35;min-width:60px;text-align:right;">₹' + (item.price * item.qty) + '</div>' +
      '</div>'
  })

  // Total
  html += '<div style="background:#1a6e35;border-radius:12px;padding:16px;margin-top:8px;">' +
    '<div style="display:flex;justify-content:space-between;color:white;">' +
    '<div style="font-size:14px;font-weight:700;">Total Amount</div>' +
    '<div style="font-size:18px;font-weight:900;">₹' + cartTotal() + '</div>' +
    '</div>' +
    '</div>'

  container.innerHTML = html
}

function cartDecrease(id) {
  decreaseQty(id)
  renderCartScreen()
  updateCartBar()
}

function cartIncrease(id) {
  var item = cart.find(function(c) { return c.id === id })
  if (item) {
    item.qty++
    renderCartScreen()
    updateCartBar()
  }
}

// ── PLACE ORDER ──
async function placeOrder() {
  if (cart.length === 0) {
    showToast('Cart is empty', 'error')
    return
  }

  var farmerData = localStorage.getItem('rytuai_farmer')
  if (!farmerData) {
    showToast('Please login again', 'error')
    return
  }

  var farmer = JSON.parse(farmerData)
  // Get address and notes
  var address =''
  var notes =''
  var deliveryAddressEl = document.getElementById('delivery-address')
  var orderNotesEl = document.getElementById('order-notes')
  if(deliveryAddressEl) address = deliveryAddressEl.value.trim()
  if(orderNotesEl) notes = orderNotesEl.value.trim()
  if(!address){
    showToast('Please enter delivery address','error')
    if(deliveryAddressEl) deliveryAddressEl.focus()
      return
  }

  var placeBtn = document.getElementById('place-order-btn')
  if (placeBtn) { placeBtn.textContent = 'Placing Order...'; placeBtn.disabled = true }

  try {
    var response = await fetch(API + '/shop/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + localStorage.getItem('rytuai_token')
      },
      body: JSON.stringify({
        farmer_id: farmer.phone,
        farmer_name: farmer.name,
        farmer_phone: farmer.phone,
        store_id: currentStoreId,
        items: cart,
        total_amount: cartTotal(),
        delivery_address: address,
        notes: notes
      })
    })

    var data = await response.json()

    if (response.ok) {
      // Clear cart
      cart = []
      if (deliveryAddressEl) deliveryAddressEl.value =''
      if (orderNotesEl) orderNotesEl.value =''
      updateCartBar()
      closeCart()

      // Show success
      showOrderSuccess(data.order)
    } else {
      showToast(data.message || 'Order failed', 'error')
    }
     
  } catch(err) {
    console.log('Full error: ',err)
    showToast('Cannot connect to server',+ err.message, 'error')
  } finally {
    if (placeBtn) { placeBtn.textContent = 'Place Order'; placeBtn.disabled = false }
  }
}

function showOrderSuccess(order) {
  var screen = document.getElementById('order-success-screen')
  if (!screen) return

  var idEl = document.getElementById('order-id')
  if (idEl) idEl.textContent = '#' + (order ? order.id : '—')

  screen.style.display = 'block'
}

function closeOrderSuccess() {
  var screen = document.getElementById('order-success-screen')
  if (screen) screen.style.display = 'none'
  switchScreen('home')
}

// ── ADD FROM SHOP TO TRACKER (called from shop buttons) ──
async function addToTrackerFromShop(name, price) {
  addToCart(0, name, price)
}

//Function to get geoLocation
function getLocationForDelivery(){
  var addressEl = document.getElementById('delivery-address')
  if(!addressEl) return
  
  var originalValue = addressEl.value
  addressEl.placeholder = '📍 Detecting your location...'
  addressEl.disabled = true

  if(!navigator.geolocation){
    addressEl.value = originalValue
    addressEl.disabled = false
    showToast('Location not supported on this device','error')
    return
  }
  navigator.geolocation.getCurrentPosition(
    async function(position){
      var lat = position.coords.latitude
      var lon = position.coords.longitude

      try{
        var res = await fetch(
          'https://nominatim.openstreetmap.org/reverse?lat=' +
          lat + '&lon=' + lon + '&format=json'
        )
        var data = await res.json()
        var addr = data.address

        //Build address string
        var parts = []
        if(addr.village || addr.town || addr.city){
          parts.push(addr.village || addr.town || addr.city)
        }
        if(addr.county || addr.state_district){
          parts.push(addr.county || addr.state_distric)
        }
        if (addr.state) parts.push(addr.state)
        
        var fullAddress = parts.join(', ')

        addressEl.value = fullAddress
        addressEl.disabled = false
        
        showToast('Current Location detected!', 'sucess')
      }catch(e){
        addressEl.value = originalValue
        addressEl.disabled = false
        showToast('Could not detect location','error')
      }
    },
    function(err){

      addressEl.value = originalValue
        addressEl.disabled = false
        showToast('Location acsess denied','error')
    },
    { timeout: 8000}
  )

}
function fillAddressFromProfile(){
  var farmerData = localStorage.getItem('rytuai_farmer')
  if (!farmerData) return
  var farmer = JSON.parse(farmerData)
  var addressEl = document.getElementById('delivery-address')
  if (addressEl){
    var parts = []
    if (farmer.village) parts.push(farmer.village)
    if(farmer.district) parts.push(farmer.district)
    if (farmer.name) parts.push('('+farmer.name+ ')')
    addressEl.value = parts.join(', ')
    
  }
}
/* ══════════════════════════════════════
   FEED SCREEN — Complete JS
   Paste at bottom of web/app.js
══════════════════════════════════════ */

// ── Market prices (Agmarknet format) ──
var CROP_PRICES = [
  { crop: 'Chilli', icon: '🌶️', unit: 'per quintal', market: 'Guntur APMC' },
  { crop: 'Paddy', icon: '🌾', unit: 'per quintal', market: 'Nellore APMC' },
  { crop: 'Cotton', icon: '🌿', unit: 'per quintal', market: 'Kurnool APMC' },
  { crop: 'Groundnut', icon: '🥜', unit: 'per quintal', market: 'Anantapur APMC' },
  { crop: 'Maize', icon: '🌽', unit: 'per quintal', market: 'Nizamabad APMC' },
  { crop: 'Tomato', icon: '🍅', unit: 'per quintal', market: 'Madanapalle APMC' }
]

// ── Farming tips based on season ──
var FARMING_TIPS = [
  {
    icon: '💧',
    title: 'Irrigation Tip',
    desc: 'Water your chilli crop early morning or late evening. Avoid midday irrigation to reduce evaporation loss by 30%.'
  },
  {
    icon: '🐛',
    title: 'Thrips Alert',
    desc: 'Thrips population increases in dry weather. Spray Spinosad 45% SC at 0.3ml/litre water. Repeat after 7 days.'
  },
  {
    icon: '🌱',
    title: 'Fertilizer Schedule',
    desc: 'Apply DAP 50kg/acre at flowering stage. Foliar spray of 00:52:34 fertilizer improves fruit set significantly.'
  },
  {
    icon: '☀️',
    title: 'Sunlight Management',
    desc: 'Chilli needs 6-8 hours of direct sunlight. Ensure proper spacing (60cm x 45cm) for maximum sun exposure.'
  },
  {
    icon: '🔬',
    title: 'Disease Prevention',
    desc: 'Spray Mancozeb 75% WP at 2.5g/litre water to prevent Anthracnose disease. Spray after every rain.'
  },
  {
    icon: '📅',
    title: 'Harvest Timing',
    desc: 'Harvest chilli when 60-70% fruits turn red. Early morning harvest maintains color and quality better.'
  }
]

// ── Government schemes ──
var GOVT_SCHEMES = [
  {
    title: 'PM-KISAN Samman Nidhi',
    desc: '₹6,000 per year direct benefit transfer to farmer families in 3 installments of ₹2,000 each.',
    link: 'https://pmkisan.gov.in'
  },
  {
    title: 'AP Rythu Bharosa',
    desc: 'Andhra Pradesh government provides ₹13,500 per year to each farmer family for farming inputs.',
    link: 'https://apagrisnet.gov.in'
  },
  {
    title: 'Fasal Bima Yojana',
    desc: 'Crop insurance scheme. Get compensation for crop loss due to natural calamities, pests or diseases.',
    link: 'https://pmfby.gov.in'
  },
  {
    title: 'Kisan Credit Card',
    desc: 'Get credit up to ₹3 lakhs at 4% interest rate for farming needs. Apply at any bank branch.',
    link: 'https://www.nabard.org'
  }
]

// ── Load Feed ──
async function loadFeed() {
  await Promise.all([
    loadFeedWeather(),
    loadFeedPrices(),
    loadFeedTips(),
    loadFeedNews(),
    loadFeedSchemes()
  ])
}

// ── Weather for Feed ──
async function loadFeedWeather() {
  var weatherDiv = document.getElementById('feed-weather-today')
  var forecastDiv = document.getElementById('feed-weather-forecast')
  if (!weatherDiv) return

  try {
    // Get location
    var lat = 16.3008
    var lon = 80.4428
    var cityName = 'Guntur'

    // Try GPS
    var locationDetected = false
    if (navigator.geolocation) {
      await new Promise(function(resolve) {
        navigator.geolocation.getCurrentPosition(
          async function(pos) {
            try{
              lat = pos.coords.latitude
              lon = pos.coords.longitude
              locationDetected = true
            
              var geoRes = await fetch(
                'https://nominatim.openstreetmap.org/reverse?lat=' + lat + '&lon=' + lon + '&format=json'
              )
              var geoData = await geoRes.json()
              var addr = geoData.address
              cityName = addr.village|| addr.town ||addr.city||
                         addr.county || addr.state_district || 'Your Location'
              console.log('Feed GPS location',cityName, lat, lon)
            } catch(e) {
              console.log('Reverse geocode error:',e.message)
            }
            resolve()
          },
          function(err){
            console.log('GPS error: ',err.code, err.message)

           resolve() 
          },
          { timeout: 10000,
            maximumAge:300000,
            enableHighAccuracy:false 

          }
        )
      })
    }
    if(!locationDetected){
      console.log('Using default Guntur location')
    }

    // Fetch weather + forecast
    var url = 'https://api.open-meteo.com/v1/forecast' +
      '?latitude=' + lat +
      '&longitude=' + lon +
      '&current=temperature_2m,relative_humidity_2m,weathercode,windspeed_10m,precipitation' +
      '&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_sum' +
      '&timezone=Asia/Kolkata' +
      '&forecast_days=7'

    var res = await fetch(url)
    var data = await res.json()

    if (data && data.current) {
      var c = data.current
      var temp = Math.round(c.temperature_2m)
      var humidity = c.relative_humidity_2m
      var wind = Math.round(c.windspeed_10m)
      var rain = c.precipitation || 0
      var wInfo = getWeatherInfo(c.weathercode)

      // Farming alert
      var alertHtml = ''
      if (humidity > 80) {
        alertHtml = '<div class="wtc-alert">⚠️ Very high humidity — High risk of fungal diseases. Spray fungicide today.</div>'
      } else if (humidity > 65) {
        alertHtml = '<div class="wtc-alert">⚠️ Moderate humidity — Monitor crop for disease symptoms.</div>'
      } else if (rain > 5) {
        alertHtml = '<div class="wtc-alert">🌧️ Rain expected — Avoid pesticide spray today. Wait 24 hours after rain.</div>'
      }

      weatherDiv.innerHTML =
        '<div class="wtc-top">' +
        '<div>' +
        '<div class="wtc-temp">' + temp + '°C</div>' +
        '<div class="wtc-desc">' + wInfo.desc + '</div>' +
        '<div class="wtc-location">📍 ' + cityName + '</div>' +
        '</div>' +
        '<div class="wtc-icon">' + wInfo.icon + '</div>' +
        '</div>' +
        '<div class="wtc-details">' +
        '<div class="wtc-detail">💧 ' + humidity + '% humidity</div>' +
        '<div class="wtc-detail">💨 ' + wind + ' km/h wind</div>' +
        '<div class="wtc-detail">🌧️ ' + rain + 'mm rain</div>' +
        '</div>' +
        alertHtml

      // 7-day forecast
      if (data.daily) {
        var days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
        var forecastHtml = ''
        for (var i = 0; i < 7; i++) {
          var d = new Date(data.daily.time[i] + 'T00:00:00')
          var dayName = i === 0 ? 'Today' : days[d.getDay()]
          var maxT = Math.round(data.daily.temperature_2m_max[i])
          var minT = Math.round(data.daily.temperature_2m_min[i])
          var rainSum = data.daily.precipitation_sum[i] || 0
          var dInfo = getWeatherInfo(data.daily.weathercode[i])

          forecastHtml +=
            '<div class="forecast-day">' +
            '<div class="fc-day">' + dayName + '</div>' +
            '<div class="fc-icon">' + dInfo.icon + '</div>' +
            '<div class="fc-temp">' + maxT + '°/' + minT + '°</div>' +
            (rainSum > 0 ? '<div class="fc-rain">🌧 ' + rainSum + 'mm</div>' : '') +
            '</div>'
        }
        if (forecastDiv) forecastDiv.innerHTML = forecastHtml
      }
    }
  } catch(e) {
    weatherDiv.innerHTML = '<div style="text-align:center;padding:20px;color:#888;">Weather unavailable</div>'
    console.log('Feed weather error:', e.message)
  }
}

// ── Market Prices ──
async function loadFeedPrices() {
  var pricesDiv = document.getElementById('feed-prices')
  if (!pricesDiv) return

  // Static prices for now — in future connect to Agmarknet API
  // These are approximate current Guntur market prices
  var prices = [
    { crop: 'Chilli (Teja)', icon: '🌶️', price: 18500, change: +500, unit: 'per quintal', market: 'Guntur APMC' },
    { crop: 'Paddy (Sona)', icon: '🌾', price: 2200, change: -50, unit: 'per quintal', market: 'Nellore APMC' },
    { crop: 'Cotton', icon: '🌿', price: 6800, change: +200, unit: 'per quintal', market: 'Kurnool APMC' },
    { crop: 'Groundnut', icon: '🥜', price: 5200, change: 0, unit: 'per quintal', market: 'Anantapur APMC' },
    { crop: 'Maize', icon: '🌽', price: 1850, change: -30, unit: 'per quintal', market: 'Nizamabad APMC' },
    { crop: 'Tomato', icon: '🍅', price: 1200, change: +300, unit: 'per quintal', market: 'Madanapalle APMC' }
  ]

  var html = prices.map(function(p) {
    var changeClass = p.change > 0 ? 'price-up' : p.change < 0 ? 'price-down' : 'price-same'
    var changeText = p.change > 0 ? '▲ ₹' + p.change : p.change < 0 ? '▼ ₹' + Math.abs(p.change) : '— No change'
    var changeLabel = p.change > 0 ? 'Up from yesterday' : p.change < 0 ? 'Down from yesterday' : 'Same as yesterday'

    return '<div class="price-card">' +
      '<div class="price-crop">' + p.icon + ' ' + p.crop + '</div>' +
      '<div class="price-value">₹' + p.price.toLocaleString('en-IN') + '</div>' +
      '<div class="price-unit">' + p.unit + '</div>' +
      '<div class="price-change ' + changeClass + '">' + changeText + ' · ' + changeLabel + '</div>' +
      '<div class="price-market">📍 ' + p.market + '</div>' +
      '</div>'
  }).join('')

  pricesDiv.innerHTML = html
}

// ── Farming Tips ──
function loadFeedTips() {
  var tipsDiv = document.getElementById('feed-tips')
  if (!tipsDiv) return

  // Show 3 random tips
  var shuffled = FARMING_TIPS.sort(function() { return Math.random() - 0.5 }).slice(0, 3)

  tipsDiv.innerHTML = shuffled.map(function(tip) {
    return '<div class="tip-card">' +
      '<div class="tip-icon">' + tip.icon + '</div>' +
      '<div>' +
      '<div class="tip-title">' + tip.title + '</div>' +
      '<div class="tip-desc">' + tip.desc + '</div>' +
      '</div>' +
      '</div>'
  }).join('')
}

// ── Agriculture News ──
async function loadFeedNews() {
  var newsDiv = document.getElementById('feed-news')
  if (!newsDiv) return

  // Static curated news for now
  // In future — connect to NewsAPI with agriculture filter
  var news = [
    {
      source: 'The Hindu Agriculture',
      title: 'Chilli prices surge in Guntur market — farmers benefit from higher demand',
      desc: 'Guntur chilli prices rose by 15% this week due to increased export demand from China and South East Asia.',
      time: '2 hours ago',
      url: 'https://www.thehindu.com'
    },
    {
      source: 'Deccan Chronicle',
      title: 'AP government announces ₹500 crore package for drought-affected farmers',
      desc: 'The Andhra Pradesh government has announced financial assistance for farmers in 8 districts affected by drought conditions.',
      time: '5 hours ago',
      url: 'https://www.deccanchronicle.com'
    },
    {
      source: 'Krishi Jagran',
      title: 'New pest-resistant chilli variety developed by ICAR — 40% higher yield',
      desc: 'ICAR has developed a new thrips-resistant chilli variety suitable for Andhra Pradesh conditions with 40% higher yield.',
      time: '1 day ago',
      url: 'https://krishijagran.com'
    },
    {
      source: 'Financial Express',
      title: 'Monsoon forecast: Normal rainfall predicted for Andhra Pradesh this Kharif',
      desc: 'IMD predicts normal monsoon for AP this season. Good news for chilli and paddy farmers planning Kharif sowing.',
      time: '1 day ago',
      url: 'https://www.financialexpress.com'
    }
  ]

  newsDiv.innerHTML = news.map(function(n) {
    return '<div class="news-card" onclick="window.open(\'' + n.url + '\', \'_blank\')">' +
      '<div class="news-source">' + n.source + '</div>' +
      '<div class="news-title">' + n.title + '</div>' +
      '<div class="news-desc">' + n.desc + '</div>' +
      '<div class="news-time">🕐 ' + n.time + '</div>' +
      '</div>'
  }).join('')
}

// ── Government Schemes ──
function loadFeedSchemes() {
  var schemesDiv = document.getElementById('feed-schemes')
  if (!schemesDiv) return

  schemesDiv.innerHTML = GOVT_SCHEMES.map(function(s) {
    return '<div class="scheme-card">' +
      '<div class="scheme-title">' + s.title + '</div>' +
      '<div class="scheme-desc">' + s.desc + '</div>' +
      '<button class="scheme-btn" onclick="window.open(\'' + s.link + '\', \'_blank\')">Learn More →</button>' +
      '</div>'
  }).join('')
}