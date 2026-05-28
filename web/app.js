// -- Global State---
const API = ""
const uploadedImages = { 0: null, 1: null, 2: null, 3: null }
const labels = ['Leaf', 'Stem', 'Whole Plant', 'Extra']
// ── LOGIN SYSTEM ──
let currentPhone = ''
 
function showError(msg) {
  const el = document.getElementById('login-error')
  el.textContent = msg
  el.style.display = 'block'
  setTimeout(() => el.style.display = 'none', 4000)
}
 
function showLoading(text) {
  document.getElementById('step-phone').style.display = 'none'
  document.getElementById('step-otp').style.display = 'none'
  document.getElementById('login-loading').style.display = 'block'
  document.getElementById('loading-text').textContent = text
}
 
function hideLoading() {
  document.getElementById('login-loading').style.display = 'none'
}
 
async function sendOTP() {
  const phone = document.getElementById('login-phone').value.trim()
  if (phone.length !== 10) {
    showError('Please enter a valid 10-digit mobile number')
    return
  }
  currentPhone = phone
  showLoading('Sending OTP...')
  try {
    const response = await fetch(`${API}/auth/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone })
    })
    const data = await response.json()
    hideLoading()
    if (response.ok) {
      document.getElementById('step-otp').style.display = 'block'
      document.getElementById('otp-sent-to').textContent = 
        `OTP sent to ${phone}`
    } else {
      document.getElementById('step-phone').style.display = 'block'
      showError(data.message || 'Failed to send OTP')
    }
  } catch (err) {
    hideLoading()
    document.getElementById('step-phone').style.display = 'block'
    showError('Cannot connect to server. Make sure backend is running.')
  }
}
 
async function verifyOTP() {
  const otp = document.getElementById('login-otp').value.trim()
  if (otp.length !== 6) {
    showError('Please enter the 6-digit OTP')
    return
  }
  showLoading('Verifying OTP...')
  try {
    const response = await fetch(`${API}/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: currentPhone, otp })
    })
    const data = await response.json()
    hideLoading()
    if (response.ok) {
      localStorage.setItem('rytuai_token', data.token)
      localStorage.setItem('rytuai_phone', currentPhone)
      if (data.farmer) {
        const nameEl = document.querySelector('.header-subtitle')
        if (nameEl) {
          nameEl.textContent = `నమస్కారం, ${data.farmer.name} గారు 🙏`
        }
      }
      document.getElementById('login-screen').style.display = 'none'
    } else {
      document.getElementById('step-otp').style.display = 'block'
      showError(data.message || 'Invalid OTP')
    }
  } catch (err) {
    hideLoading()
    document.getElementById('step-otp').style.display = 'block'
    showError('Cannot connect to server.')
  }
}
 
function backToPhone() {
  document.getElementById('step-otp').style.display = 'none'
  document.getElementById('step-phone').style.display = 'block'
  document.getElementById('login-otp').value = ''
}
 
// Check if already logged in
window.onload = function() {
  //const token = localStorage.getItem('rytuai_token')
  //if (token) {
  document.getElementById('login-screen').style.display = 'none'
  
}
 
 
function switchScreen(name) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.querySelectorAll('.sidebar-item').forEach(n => n.classList.remove('active'));
 
  document.getElementById('screen-' + name).classList.add('active');
  const navEl = document.getElementById('nav-' + name);
  if (navEl) navEl.classList.add('active');
 
  // sidebar
  document.querySelectorAll('.sidebar-item').forEach(item => {
    if (item.getAttribute('onclick') && item.getAttribute('onclick').includes("'" + name + "'")) {
      item.classList.add('active');
    }
  });
}

function showResult() {
  switchScreen('result');
}

// ── IMAGE UPLOAD SYSTEM ──

 
function triggerUpload(idx) {
  document.getElementById('file-' + idx).click()
}
 
function handleUpload(idx, input) {
  const file = input.files[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = (e) => {
    const base64 = e.target.result
    uploadedImages[idx] = base64
    updateSlot(idx, base64)
    updateCountMsg()
    checkAnalyzeReady()
  }
  reader.readAsDataURL(file)
}
 
function updateSlot(idx, base64) {
  const slot = document.getElementById('slot-' + idx)
  slot.classList.add('filled')
  slot.innerHTML = `
    <img src="${base64}" 
      style="width:100%;height:100%;object-fit:cover;border-radius:8px;" />
    <div class="check">✓</div>
    <div style="position:absolute;bottom:4px;left:0;right:0;
      text-align:center;font-size:9px;font-weight:800;
      color:var(--green);background:rgba(255,255,255,0.85);
      padding:2px 0;">${labels[idx]}</div>
  `
}
 
function countUploaded() {
  return Object.values(uploadedImages).filter(v => v !== null).length
}
 
function updateCountMsg() {
  const n = countUploaded()
  const el = document.getElementById('upload-count-msg')
  if (!el) return
  if (n >= 1) {
    el.style.color = 'var(--green)'
    el.textContent = `✅ ${n} photo(s) uploaded — ready to analyze!`
  } else {
    el.style.color = 'var(--muted)'
    el.textContent = `0 photos uploaded`
  }
}
 
function checkAnalyzeReady() {
  const btn = document.getElementById('analyze-btn')
  if (!btn) return
  if (countUploaded() >= 1) {
    btn.style.opacity = '1'
    btn.style.cursor = 'pointer'
  } else {
    btn.style.opacity = '0.4'
    btn.style.cursor = 'not-allowed'
  }
}
 
// ── REAL AI DETECTION ──
async function analyzeImages() {
  if (countUploaded() < 1) {
    alert('Please upload at least 1 photo')
    return
  }
 
  switchScreen('result')
 
  document.getElementById('result-loading').style.display = 'flex'
  document.getElementById('result-error').style.display = 'none'
  document.getElementById('result-content').style.display = 'none'
 
  try {
    // Create form data with photos
    const formData = new FormData()
 
    Object.values(uploadedImages)
      .filter(v => v !== null)
      .forEach((base64, index) => {
        const byteString = atob(base64.split(',')[1])
        const mimeType = base64.split(',')[0].split(':')[1].split(';')[0]
        const ab = new ArrayBuffer(byteString.length)
        const ia = new Uint8Array(ab)
        for (let i = 0; i < byteString.length; i++) {
          ia[i] = byteString.charCodeAt(i)
        }
        const blob = new Blob([ab], { type: mimeType })
        formData.append('photos', blob, `photo${index}.jpg`)
      })
 
    // Send to backend
    const response = await fetch(`${API}/detect`, {
      method: 'POST',
      body: formData
    })
 
    const data = await response.json()
 
    if (response.ok) {
      renderResult(data.result)
    } else {
      throw new Error(data.message || 'Detection failed')
    }
 
  } catch (err) {
    document.getElementById('result-loading').style.display = 'none'
    document.getElementById('result-error').style.display = 'block'
    document.getElementById('error-msg').textContent =
      err.message || 'Something went wrong. Please try again.'
  }
}
 
// ── RENDER RESULT ──
function renderResult(r) {
  document.getElementById('result-loading').style.display = 'none'
  document.getElementById('result-content').style.display = 'block'
 
  const headerDiv = document.getElementById('result-header-div')
  if (headerDiv) {
    headerDiv.className = r.healthy ? 'result-header healthy' : 'result-header'
  }
 
  const emoji = document.getElementById('r-emoji')
  if (emoji) emoji.textContent = r.healthy ? '✅' : '🦠'
 
  const disease = document.getElementById('r-disease')
  if (disease) disease.textContent = r.disease
 
  const telugu = document.getElementById('r-telugu')
  if (telugu) telugu.textContent = r.teluguName || ''
 
  const confidence = document.getElementById('r-confidence')
  if (confidence) {
    confidence.textContent =
      `${r.confidence} Confidence · ${countUploaded()} images analysed`
  }
 
  const sevVal = document.getElementById('r-sev-val')
  if (sevVal) sevVal.textContent = r.severity
 
  const spreadVal = document.getElementById('r-spread-val')
  if (spreadVal) spreadVal.textContent = r.spread
 
  const treatVal = document.getElementById('r-treat-val')
  if (treatVal) treatVal.textContent = r.treatWithin
 
  const what = document.getElementById('r-what')
  if (what) what.textContent = r.whatIsThis
 
  const symptoms = document.getElementById('r-symptoms')
  if (symptoms) {
    symptoms.innerHTML = r.symptomsFound.replace(/\n/g, '<br>')
  }
 
  const prevention = document.getElementById('r-prevention')
  if (prevention) {
    prevention.innerHTML = r.prevention.replace(/\n/g, '<br>')
  }
 
  // Pesticides
  const pestDiv = document.getElementById('r-pesticides')
  if (pestDiv) {
    pestDiv.innerHTML = ''
    ;(r.pesticides || []).forEach(p => {
      const disc = Math.round((1 - p.priceRytu / p.priceMRP) * 100)
      pestDiv.innerHTML += `
        <div class="pest-item" onclick="switchScreen('shop')">
          <div class="pest-icon">${p.icon || '🧴'}</div>
          <div class="pest-info">
            <div class="pest-name">${p.name}</div>
            <div class="pest-brand">${p.brand} · Rytu Shop</div>
          </div>
          <div class="pest-price">
            <div class="price">₹${p.priceRytu}</div>
            <div class="mrp">₹${p.priceMRP}</div>
            <div class="discount">${disc}% OFF</div>
          </div>
        </div>`
    })
  }
}
 