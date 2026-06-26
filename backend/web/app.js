
/* ═══════════════════════════════════════
   RYTUAI — APP.JS — CLEAN FINAL VERSION
═══════════════════════════════════════ */

const API = ''
var lastScanResult = null
var currentScreen = 'home'
var screenHistory = ['home']
var currentField = null
var currentFieldId = null
var allFields = []

/* ══════════════════════════════════════
   LANGUAGE SYSTEM
══════════════════════════════════════ */
var currentLang = localStorage.getItem('rytuai_lang') || 'en'

var STRINGS = {
  en: {
    good_morning: 'Good Morning', good_afternoon: 'Good Afternoon', good_evening: 'Good Evening',
    greeting_suffix: ' 🙏', home_sub: 'How is your farm today?',
    nav_home: 'Home', nav_detect: 'Detect', nav_shop: 'Shop', nav_feed: 'Feed', nav_tracker: 'Tracker',
    title_home: 'Home', title_detect: 'Detect Disease', title_result: 'AI Result',
    title_shop: 'Rytu Shop', title_feed: 'Farm Feed', title_tracker: 'Farm Tracker',
    detect_heading: 'Upload crop photos for AI analysis',
    slot_0: 'Leaf Photo', slot_1: 'Stem Photo', slot_2: 'Full Plant', slot_3: 'Extra Photo',
    analyze_btn: '🤖 Analyze with AI', analyzing: 'Analyzing your crop... Please wait 🌿',
    stat_days: 'Days Active', stat_tasks: 'Activities', stat_cost: 'Total Spent',
    add_activity: '➕ Add Today\'s Activity',
    scan_history: '🔬 AI Scan History', activity_history: '📝 Activity History',
    feed_weather: '☀️ Weather Forecast', feed_prices: '💰 Today\'s Market Prices',
    feed_news: '📰 Agriculture News', feed_tips: '🌱 Farming Tips', feed_schemes: '📢 Government Schemes',
    healthy_msg: '✅ Your crop looks healthy!', healthy_telugu: 'మీ పంట ఆరోగ్యంగా ఉంది',
    sowed: 'Sowed', acres: 'acres', seedling: 'Seedling Stage', vegetative: 'Vegetative Stage',
    flowering: 'Flowering Stage', fruit: 'Fruit Development', harvest_stage: 'Harvest Ready',
    complete: 'Season Complete', season_progress: 'Season Progress', add_to_cart: 'Add'
  },
  te: {
    good_morning: 'శుభోదయం', good_afternoon: 'శుభ మధ్యాహ్నం', good_evening: 'శుభ సాయంత్రం',
    greeting_suffix: ' గారు 🙏', home_sub: 'మీ పొలం ఎలా ఉంది?',
    nav_home: 'హోమ్', nav_detect: 'స్కాన్', nav_shop: 'షాప్', nav_feed: 'వార్తలు', nav_tracker: 'ట్రాకర్',
    title_home: 'హోమ్', title_detect: 'తెగులు గుర్తించు', title_result: 'AI ఫలితం',
    title_shop: 'రైతు షాప్', title_feed: 'వ్యవసాయ వార్తలు', title_tracker: 'పొలం ట్రాకర్',
    detect_heading: 'పంట ఫోటో తీసి అప్‌లోడ్ చేయండి',
    slot_0: 'ఆకు ఫోటో', slot_1: 'కాండం ఫోటో', slot_2: 'మొత్తం మొక్క', slot_3: 'అదనపు ఫోటో',
    analyze_btn: '🤖 AI విశ్లేషణ చేయి', analyzing: 'మీ పంటను విశ్లేషిస్తున్నాం... కొంచెం సేపు ఆగండి 🌿',
    stat_days: 'రోజులు', stat_tasks: 'పనులు', stat_cost: 'ఖర్చు',
    add_activity: '➕ పని చేర్చు',
    scan_history: '🔬 AI స్కాన్ చరిత్ర', activity_history: '📝 పని చరిత్ర',
    feed_weather: '☀️ నేటి వాతావరణం', feed_prices: '💰 మార్కెట్ ధరలు',
    feed_news: '📰 వ్యవసాయ వార్తలు', feed_tips: '🌱 వ్యవసాయ చిట్కాలు', feed_schemes: '📢 ప్రభుత్వ పథకాలు',
    healthy_msg: '✅ మీ పంట ఆరోగ్యంగా ఉంది!', healthy_telugu: 'Your crop looks healthy',
    sowed: 'విత్తిన తేదీ', acres: 'ఎకరాలు', seedling: 'మొలక దశ', vegetative: 'పెరుగుదల దశ',
    flowering: 'పూత దశ', fruit: 'కాయ అభివృద్ధి', harvest_stage: 'కోత సిద్ధం',
    complete: 'సీజన్ పూర్తి', season_progress: 'సీజన్ పురోగతి', add_to_cart: 'కార్ట్‌లో చేర్చు'
  }
}

function t(key) {
  var lang = currentLang || 'en'
  return (STRINGS[lang] && STRINGS[lang][key]) || STRINGS['en'][key] || key
}

function selectLanguage(lang) {
  currentLang = lang
  localStorage.setItem('rytuai_lang', lang)
  var ls = document.getElementById('lang-screen')
  if (ls) ls.style.display = 'none'
  updateLangToggleBtn()
  applyLanguage()
  var token = localStorage.getItem('rytuai_token')
  if (token) showApp()
  else { var loginScreen = document.getElementById('login-screen'); if (loginScreen) loginScreen.style.display = 'flex' }
}

function toggleLanguage() {
  currentLang = currentLang === 'te' ? 'en' : 'te'
  localStorage.setItem('rytuai_lang', currentLang)
  updateLangToggleBtn()
  applyLanguage()
  showToast(currentLang === 'te' ? 'తెలుగులో మార్చబడింది ✅' : 'Switched to English ✅')
}

function updateLangToggleBtn() {
  var btn = document.getElementById('lang-toggle-btn')
  if (!btn) return
  if (currentLang === 'te') {
    btn.textContent = '🇮🇳 తెలుగు'
    btn.title = 'Switch to English'
  } else {
    btn.textContent = '🇬🇧 English'
    btn.title = 'తెలుగుకు మార్చు'
  }
}

function applyLanguage() {
  var te = currentLang === 'te'

  // ── TOPBAR ──
  var subtitle = document.querySelector('.topbar-subtitle')
  if (subtitle) subtitle.textContent = te ? 'స్మార్ట్ వ్యవసాయం — ఆంధ్రప్రదేశ్' : 'Smart Farming — Andhra Pradesh'

  // ── BOTTOM NAV ──
  var navHome = document.getElementById('nav-home')
  var navDetect = document.getElementById('nav-detect')
  var navShop = document.getElementById('nav-shop')
  var navFeed = document.getElementById('nav-feed')
  var navTracker = document.getElementById('nav-tracker')
  if (navHome) navHome.textContent = t('nav_home')
  if (navDetect) navDetect.textContent = t('nav_detect')
  if (navShop) navShop.textContent = t('nav_shop')
  if (navFeed) navFeed.textContent = t('nav_feed')
  if (navTracker) navTracker.textContent = t('nav_tracker')

  // ── SIDEBAR ──
  var sbHome = document.getElementById('sb-home')
  var sbDetect = document.getElementById('sb-detect')
  var sbShop = document.getElementById('sb-shop')
  var sbFeed = document.getElementById('sb-feed')
  var sbTracker = document.getElementById('sb-tracker')
  if (sbHome) sbHome.textContent = te ? 'హోమ్' : 'Home'
  if (sbDetect) sbDetect.textContent = te ? 'తెగులు గుర్తించు' : 'Detect Disease'
  if (sbShop) sbShop.textContent = te ? 'రైతు షాప్' : 'Rytu Shop'
  if (sbFeed) sbFeed.textContent = te ? 'వ్యవసాయ వార్తలు' : 'Crop Feed'
  if (sbTracker) sbTracker.textContent = te ? 'నా ట్రాకర్' : 'My Tracker'

  // ── HOME SCREEN ──
  var quickLabel = document.getElementById('quick-actions-label')
  if (quickLabel) quickLabel.textContent = te ? '⚡ త్వరిత చర్యలు' : '⚡ Quick Actions'

  var acDetect = document.getElementById('ac-detect')
  var acDetectSub = document.getElementById('ac-detect-sub')
  if (acDetect) acDetect.textContent = te ? 'తెగులు గుర్తించు' : 'Detect Disease'
  if (acDetectSub) acDetectSub.textContent = te ? 'AI తో పంట స్కాన్ చేయి' : 'Scan your crop with AI'

  var acShop = document.getElementById('ac-shop')
  var acShopSub = document.getElementById('ac-shop-sub')
  if (acShop) acShop.textContent = te ? 'రైతు షాప్' : 'Rytu Shop'
  if (acShopSub) acShopSub.textContent = te ? 'నేరుగా షాపుల నుండి' : 'Order pesticides direct'

  var acFeed = document.getElementById('ac-feed')
  var acFeedSub = document.getElementById('ac-feed-sub')
  if (acFeed) acFeed.textContent = te ? 'వ్యవసాయ వార్తలు' : 'Farm Feed'
  if (acFeedSub) acFeedSub.textContent = te ? 'వార్తలు · ధరలు · చిట్కాలు' : 'Weather · Prices · News'

  var acTracker = document.getElementById('ac-tracker')
  var acTrackerSub = document.getElementById('ac-tracker-sub')
  if (acTracker) acTracker.textContent = te ? 'పొలం ట్రాకర్' : 'Farm Tracker'
  if (acTrackerSub) acTrackerSub.textContent = te ? 'రోజువారీ పని రికార్డ్' : 'Log daily activities'

  var alertLabel = document.getElementById('alert-label')
  var alertTitle = document.getElementById('alert-title')
  var alertDesc = document.getElementById('alert-desc')
  if (alertLabel) alertLabel.textContent = te ? '⚠️ తాజా హెచ్చరిక' : '⚠️ Latest Alert'
  if (alertTitle) alertTitle.textContent = te ? 'మీ ప్రాంతంలో త్రిప్స్ హెచ్చరిక' : 'Thrips Alert in Your Area'
  if (alertDesc) alertDesc.textContent = te ? 'మీ దగ్గర 3 మంది రైతులు త్రిప్స్ నివేదించారు. నేడే మీ పంటను తనిఖీ చేయండి.' : '3 farmers near you reported thrips. Check your crop today.'

  var cropStatusLabel = document.getElementById('crop-status-label')
  if (cropStatusLabel) cropStatusLabel.textContent = te ? '🌶️ నా పంట స్థితి' : '🌶️ My Crop Status'

  var homeSub = document.getElementById('home-subtext')
  if (homeSub) homeSub.textContent = t('home_sub')

  // ── DETECT SCREEN ──
  var detectTitle = document.getElementById('detect-title')
  var detectSub = document.getElementById('detect-sub')
  if (detectTitle) detectTitle.textContent = te ? 'పంట స్కాన్ చేయి' : 'Scan Your Crop'
  if (detectSub) detectSub.textContent = te ? 'AI తెగులు గుర్తింపు కోసం ఫోటోలు అప్‌లోడ్ చేయండి' : 'Upload photos for AI disease detection'

  var uploadTip = document.getElementById('upload-tip')
  if (uploadTip) uploadTip.textContent = te
    ? '📸 అత్యంత ఖచ్చితమైన AI నిర్ధారణ కోసం వివిధ కోణాల నుండి స్పష్టమైన క్లోజప్ ఫోటోలు తీయండి'
    : '📸 Take clear close-up photos from different angles for the most accurate AI diagnosis'

  // Slot labels
  for (var i = 0; i < 4; i++) {
    var lbl = document.getElementById('slot-label-' + i)
    if (lbl) lbl.textContent = t('slot_' + i)
  }

  var analyzeBtn = document.getElementById('analyze-btn')
  if (analyzeBtn) analyzeBtn.textContent = t('analyze_btn')

  var uploadMsg = document.getElementById('upload-count-msg')
  if (uploadMsg && uploadMsg.textContent.includes('Tap') || (uploadMsg && uploadMsg.textContent.includes('ట్యాప్'))) {
    uploadMsg.textContent = te ? 'ఫోటో అప్‌లోడ్ చేయడానికి ట్యాప్ చేయండి' : 'Tap any slot to upload a photo'
  }

  // ── RESULT SCREEN ──
  var loaderText = document.getElementById('loader-text')
  var loaderSub = document.getElementById('loader-sub')
  if (loaderText) loaderText.textContent = te ? 'మీ పంటను విశ్లేషిస్తున్నాం...' : 'Analyzing your crop...'
  if (loaderSub) loaderSub.textContent = te ? 'AI మీ ఫోటోలను పరిశీలిస్తోంది' : 'AI is examining your photos'

  var errorTitle = document.getElementById('error-title')
  if (errorTitle) errorTitle.textContent = te ? 'విశ్లేషణ విఫలమైంది' : 'Analysis Failed'

  var tryAgainBtn = document.getElementById('try-again-btn')
  if (tryAgainBtn) tryAgainBtn.textContent = te ? 'మళ్ళీ ప్రయత్నించు' : 'Try Again'

  var chipSev = document.getElementById('chip-sev')
  var chipSpread = document.getElementById('chip-spread')
  var chipTreat = document.getElementById('chip-treat')
  if (chipSev) chipSev.textContent = te ? 'తీవ్రత' : 'Severity'
  if (chipSpread) chipSpread.textContent = te ? 'వ్యాప్తి' : 'Spread'
  if (chipTreat) chipTreat.textContent = te ? 'చికిత్స చేయండి' : 'Treat Within'

  var whatTitle = document.getElementById('what-title')
  var symptomsTitle = document.getElementById('symptoms-title')
  var pesticidesTitle = document.getElementById('pesticides-title')
  var preventionTitle = document.getElementById('prevention-title')
  if (whatTitle) whatTitle.textContent = te ? 'ఇది ఏమిటి? — What Is This?' : 'What Is This? — ఏమిటిది?'
  if (symptomsTitle) symptomsTitle.textContent = te ? 'లక్షణాలు — Symptoms Found' : 'Symptoms Found — లక్షణాలు'
  if (pesticidesTitle) pesticidesTitle.textContent = te ? '💊 సూచించిన మందులు' : '💊 Recommended Pesticides'
  if (preventionTitle) preventionTitle.textContent = te ? 'నివారణ చర్యలు — Prevention Tips' : 'Prevention Tips — నివారణ చర్యలు'

  var orderShopBtn = document.getElementById('order-shop-btn')
  var scanAgainBtn = document.getElementById('scan-again-btn')
  if (orderShopBtn) orderShopBtn.textContent = te ? '🛒 షాపులో ఆర్డర్ చేయి' : '🛒 Order from Shop'
  if (scanAgainBtn) scanAgainBtn.textContent = te ? '🔄 మళ్ళీ స్కాన్ చేయి' : '🔄 Scan Again'

  // ── SHOP SCREEN ──
  var shopTitle = document.getElementById('shop-title')
  var shopSub = document.getElementById('shop-sub')
  if (shopTitle) shopTitle.textContent = te ? '🏪 రైతు షాప్' : '🏪 Rytu Shop'
  if (shopSub) shopSub.textContent = te ? 'నేరుగా షాపుల నుండి · మధ్యవర్తులు లేరు' : 'Direct from franchise stores · No middlemen'

  // ── FEED SCREEN ──
  var feedHeroTitle = document.getElementById('feed-hero-title')
  var feedHeroSub = document.getElementById('feed-hero-sub')
  if (feedHeroTitle) feedHeroTitle.textContent = te ? '🌾 వ్యవసాయ వార్తలు' : '🌾 Farm Feed'
  if (feedHeroSub) feedHeroSub.textContent = te ? 'వాతావరణం · ధరలు · వార్తలు · చిట్కాలు' : 'Weather · Prices · News · Tips'

  var feedWeatherTitle = document.getElementById('feed-weather-title')
  var feedPricesTitle = document.getElementById('feed-prices-title')
  var feedTipsTitle = document.getElementById('feed-tips-title')
  var feedNewsTitle = document.getElementById('feed-news-title')
  var feedSchemesTitle = document.getElementById('feed-schemes-title')
  if (feedWeatherTitle) feedWeatherTitle.textContent = t('feed_weather')
  if (feedPricesTitle) feedPricesTitle.textContent = t('feed_prices')
  if (feedTipsTitle) feedTipsTitle.textContent = t('feed_tips')
  if (feedNewsTitle) feedNewsTitle.textContent = t('feed_news')
  if (feedSchemesTitle) feedSchemesTitle.textContent = t('feed_schemes')

  // ── TRACKER SCREEN ──
  var trackerTitle = document.getElementById('tracker-title')
  var trackerSub = document.getElementById('tracker-sub')
  if (trackerTitle) trackerTitle.textContent = te ? '📋 పొలం ట్రాకర్' : '📋 Farm Tracker'
  if (trackerSub) trackerSub.textContent = te ? 'మీ పని రికార్డ్ — రోజువారీ పొలం పనులు' : 'మీ పని రికార్డ్ — Daily farm activities'

  var statDaysLabel = document.getElementById('stat-days-label')
  var statTasksLabel = document.getElementById('stat-tasks-label')
  var statCostLabel = document.getElementById('stat-cost-label')
  if (statDaysLabel) statDaysLabel.textContent = t('stat_days')
  if (statTasksLabel) statTasksLabel.textContent = t('stat_tasks')
  if (statCostLabel) statCostLabel.textContent = t('stat_cost')

  var addActivityBtn = document.getElementById('add-activity-btn')
  if (addActivityBtn) addActivityBtn.textContent = t('add_activity')

  var scanHistoryLabel = document.getElementById('scan-history-label')
  var activityHistoryLabel = document.getElementById('activity-history-label')
  if (scanHistoryLabel) scanHistoryLabel.textContent = t('scan_history')
  if (activityHistoryLabel) activityHistoryLabel.textContent = t('activity_history')

  // ── ACTIVITY SCREEN ──
  var activityTypeLabel = document.getElementById('activity-type-label')
  if (activityTypeLabel) activityTypeLabel.textContent = te ? 'పని రకం' : 'Activity Type'

  var dateLabel = document.getElementById('date-label')
  var titleLabel = document.getElementById('title-label')
  var descLabel = document.getElementById('desc-label')
  var costLabel = document.getElementById('cost-label')
  var qtyLabel = document.getElementById('qty-label')
  var unitLabel = document.getElementById('unit-label')
  if (dateLabel) dateLabel.textContent = te ? 'తేది' : 'Date'
  if (titleLabel) titleLabel.textContent = te ? 'శీర్షిక' : 'Title'
  if (descLabel) descLabel.textContent = te ? 'వివరణ (ఐచ్ఛికం)' : 'Description (optional)'
  if (costLabel) costLabel.textContent = te ? 'ఖర్చు (₹)' : 'Cost (₹)'
  if (qtyLabel) qtyLabel.textContent = te ? 'పరిమాణం' : 'Quantity'
  if (unitLabel) unitLabel.textContent = te ? 'యూనిట్' : 'Unit'

  var saveActivityBtn = document.getElementById('save-activity-btn')
  if (saveActivityBtn) saveActivityBtn.textContent = te ? '✅ పని సేవ్ చేయి' : '✅ Save Activity'

  // Activity type chips
  var typeIrrigation = document.getElementById('type-irrigation')
  var typeSpray = document.getElementById('type-spray')
  var typeFertilizer = document.getElementById('type-fertilizer')
  var typeHarvest = document.getElementById('type-harvest')
  var typeLabour = document.getElementById('type-labour')
  var typeOther = document.getElementById('type-other')
  if (typeIrrigation) typeIrrigation.textContent = te ? 'నీటిపారుదల' : 'Irrigation'
  if (typeSpray) typeSpray.textContent = te ? 'పిచికారీ' : 'Spray'
  if (typeFertilizer) typeFertilizer.textContent = te ? 'ఎరువు' : 'Fertilizer'
  if (typeHarvest) typeHarvest.textContent = te ? 'కోత' : 'Harvest'
  if (typeLabour) typeLabour.textContent = te ? 'కూలీ పని' : 'Labour'
  if (typeOther) typeOther.textContent = te ? 'ఇతర' : 'Other'

  // ── CART SCREEN ──
  var cartScreenTitle = document.getElementById('cart-screen-title')
  if (cartScreenTitle) cartScreenTitle.textContent = te ? 'నా కార్ట్' : 'My Cart'

  var deliveryLabel = document.getElementById('delivery-address-label')
  if (deliveryLabel) deliveryLabel.textContent = te ? '📍 డెలివరీ చిరునామా' : '📍 Delivery Address'

  var notesLabel = document.getElementById('notes-label')
  if (notesLabel) notesLabel.textContent = te ? '📝 గమనికలు (ఐచ్ఛికం)' : '📝 Notes (optional)'

  var placeOrderBtn = document.getElementById('place-order-btn')
  if (placeOrderBtn && !placeOrderBtn.disabled) {
    placeOrderBtn.textContent = te ? '🛒 ఆర్డర్ చేయి' : '🛒 Place Order'
  }

  // ── PROFILE MENU ──
  var menuEditProfile = document.getElementById('menu-edit-profile')
  var menuSettings = document.getElementById('menu-settings')
  var menuOrders = document.getElementById('menu-orders')
  var menuLogout = document.getElementById('menu-logout')
  if (menuEditProfile) menuEditProfile.textContent = te ? 'ప్రొఫైల్ సవరించు' : 'Edit Profile'
  if (menuSettings) menuSettings.textContent = te ? 'సెట్టింగులు' : 'Settings'
  if (menuOrders) menuOrders.textContent = te ? 'నా ఆర్డర్లు' : 'My Orders'
  if (menuLogout) menuLogout.textContent = te ? 'లాగ్అవుట్' : 'Logout'

  // ── PROFILE SCREEN ──
  var profileScreenTitle = document.getElementById('profile-screen-title')
  if (profileScreenTitle) profileScreenTitle.textContent = te ? 'ప్రొఫైల్ సవరించు' : 'Edit Profile'

  var profileSaveBtn = document.getElementById('profile-save-btn')
  if (profileSaveBtn) profileSaveBtn.textContent = te ? '✅ మార్పులు సేవ్ చేయి' : '✅ Save Changes'

  var logoutBtn = document.getElementById('logout-btn')
  if (logoutBtn) logoutBtn.textContent = te ? '🚪 లాగ్అవుట్' : '🚪 Logout'

  // ── MY ORDERS SCREEN ──
  var myOrdersTitle = document.getElementById('my-orders-title')
  if (myOrdersTitle) myOrdersTitle.textContent = te ? 'నా ఆర్డర్లు' : 'My Orders'

  // ── ORDER SUCCESS ──
  var orderPlacedTitle = document.getElementById('order-placed-title')
  var backHomeBtn = document.getElementById('back-home-btn')
  var viewOrdersBtn = document.getElementById('view-orders-btn')
  if (orderPlacedTitle) orderPlacedTitle.textContent = te ? 'ఆర్డర్ చేయబడింది!' : 'Order Placed!'
  if (backHomeBtn) backHomeBtn.textContent = te ? '🏠 హోమ్‌కి వెళ్ళు' : '🏠 Back to Home'
  if (viewOrdersBtn) viewOrdersBtn.textContent = te ? '📦 నా ఆర్డర్లు చూడు' : '📦 View My Orders'

  // ── TOPBAR TITLE ──
  var titleEl = document.getElementById('topbar-title')
  if (titleEl && currentScreen) {
    var titleMap = {
      home: t('title_home'), detect: t('title_detect'),
      result: t('title_result'), shop: t('title_shop'),
      feed: t('title_feed'), tracker: t('title_tracker')
    }
    titleEl.textContent = titleMap[currentScreen] || ''
  }

  // ── LANG TOGGLE BTN ──
  updateLangToggleBtn()

  // ── RELOAD FARMER DATA ──
  loadFarmerData()

  // ── RELOAD FEED IF ON FEED SCREEN ──
  if (currentScreen === 'feed') loadFeed()
}

/* ══════════════════════════════════════
   TOAST
══════════════════════════════════════ */
function showToast(msg, type) {
  var existing = document.getElementById('rytu-toast')
  if (existing) existing.remove()
  var color = type === 'error' ? '#e74c3c' : '#1a6e35'
  var icon = type === 'error' ? '❌' : '✅'
  var toast = document.createElement('div')
  toast.id = 'rytu-toast'
  toast.style.cssText = 'position:fixed;bottom:90px;left:50%;transform:translateX(-50%);background:' + color + ';color:white;padding:12px 20px;border-radius:12px;font-size:14px;font-weight:700;font-family:Nunito,sans-serif;z-index:99999;white-space:nowrap;box-shadow:0 4px 20px rgba(0,0,0,0.2);animation:fadeInUp 0.3s ease;'
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
window.onload = function() {
  // Hide everything first
  var loginScreen = document.getElementById('login-screen')
  var app = document.getElementById('app')
  var langScreen = document.getElementById('lang-screen')
 
  if (loginScreen) loginScreen.style.display = 'none'
  if (app) app.style.display = 'none'
  if (langScreen) langScreen.style.display = 'none'
 
  currentLang = localStorage.getItem('rytuai_lang')
 
  if (!currentLang) {
    // First time user — show language screen
    if (langScreen) langScreen.style.display = 'flex'
    return
  }
 
  // Language already selected
  updateLangToggleBtn()
  var token = localStorage.getItem('rytuai_token')
  if (token) {
    showApp()
  } else {
    if (loginScreen) loginScreen.style.display = 'flex'
  }
}

function showApp() {
  var loginScreen = document.getElementById('login-screen')
  if (loginScreen) loginScreen.style.display = 'none'
  var app = document.getElementById('app')
  if (app) app.style.display = 'flex'

  // BUG FIX: correct localStorage key
  currentFieldId = parseInt(localStorage.getItem('rytuai_current_field')) || null

  applyLanguage()
  setTimeout(function() { loadFields() }, 300)  // ← slightly longer delay
  setTimeout(loadFarmerData, 100)
  setTimeout(loadGreetingAndWeather, 500)
  var lastScreen = localStorage.getItem('rytuai_screen') || 'home'
  switchScreen(lastScreen)
}


/* ══════════════════════════════════════
   FARMER DATA — BUG FIXED
══════════════════════════════════════ */
/**function loadFarmerData() {
  var farmerData = localStorage.getItem('rytuai_farmer')
  if (!farmerData) return
  try {
    
    var farmer = JSON.parse(farmerData)
    var currentField = allFields.find(function(f){
      return f.id === currentFieldId
    }) || allFields[0] || farmer
    if (!farmer || !farmer.name) return
    var hour = new Date().getHours()
    var greeting = hour < 12 ? t('good_morning') : hour < 17 ? t('good_afternoon') : t('good_evening')
    var fullGreeting = greeting + ', ' + farmer.name + t('greeting_suffix')
    document.querySelectorAll('#farmer-greeting, #farmer-greeting-desktop').forEach(function(el) { el.textContent = fullGreeting })
    var topEl = document.getElementById('topbar-farmer-name'); if (topEl) topEl.textContent = farmer.name
    var sbEl = document.getElementById('sidebar-farmer-name'); if (sbEl) sbEl.textContent = farmer.name
    var menuName = document.getElementById('menu-farmer-name'); if (menuName) menuName.textContent = farmer.name
    var menuPhone = document.getElementById('menu-farmer-phone'); if (menuPhone) menuPhone.textContent = farmer.phone
    var menuDetails = document.getElementById('menu-farmer-details'); if (menuDetails) menuDetails.textContent = (farmer.crop_type || '') + ' · ' + (farmer.village || '')
    var subEl = document.querySelector('.home-subtext'); if (subEl) subEl.textContent = t('home_sub')
    var cropNameEl = document.querySelector('.crop-name'); if (cropNameEl && farmer.crop_type) cropNameEl.textContent = farmer.crop_type
    var cropMetaEl = document.querySelector('.crop-meta')
    if (cropMetaEl) {
      var acres = farmer.land_acres || '—'
      if (farmer.sowing_date) {
        var sowDate = new Date(farmer.sowing_date + 'T00:00:00')
        var sowFormatted = sowDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })
        cropMetaEl.textContent = t('sowed') + ': ' + sowFormatted + ' · ' + acres + ' ' + t('acres')
      } else { cropMetaEl.textContent = acres + ' ' + t('acres') }
    }
    if (farmer.sowing_date) {
      var sowDate2 = new Date(farmer.sowing_date + 'T00:00:00')
      var daysDiff = Math.floor((new Date() - sowDate2) / (1000 * 60 * 60 * 24))
      var stage = '', progress = 0
      if (daysDiff < 30) { stage = t('seedling'); progress = 10 }
      else if (daysDiff < 60) { stage = t('vegetative'); progress = 25 }
      else if (daysDiff < 90) { stage = t('flowering'); progress = 50 }
      else if (daysDiff < 120) { stage = t('fruit'); progress = 75 }
      else if (daysDiff < 150) { stage = t('harvest_stage'); progress = 90 }
      else { stage = t('complete'); progress = 100 }
      var stageEl = document.querySelector('.crop-stage, .crop-badge'); if (stageEl) stageEl.textContent = stage
      var progressEl = document.querySelector('.crop-progress-fill'); if (progressEl) progressEl.style.width = progress + '%'
      var progressLabel = document.querySelector('.crop-progress-label'); if (progressLabel) progressLabel.textContent = t('season_progress') + ' — ' + progress + '%'
    }
  } catch(e) { console.log('loadFarmerData error:', e) }
}*/
function loadFarmerData() {
  var farmerStr = localStorage.getItem('rytuai_farmer')
  if (!farmerStr) return
  var farmer = JSON.parse(farmerStr)

  var currentField = allFields.find(function(f) {
    return f.id === currentFieldId
  }) || allFields[0] || farmer

  var hour = new Date().getHours()
  var greeting = hour < 12 ? t('good_morning') :
                 hour < 17 ? t('good_afternoon') : t('good_evening')

  // Greeting
  var greetEl = document.getElementById('farmer-greeting')
  if (greetEl) greetEl.textContent = greeting + ', ' + farmer.name + t('greeting_suffix')
  var greetDesktop = document.getElementById('farmer-greeting-desktop')
  if (greetDesktop) greetDesktop.textContent = greeting + ', ' + farmer.name + t('greeting_suffix')

  // Topbar
  var topEl = document.getElementById('topbar-farmer-name')
  if (topEl) topEl.textContent = farmer.name

  // Crop name
  var cropEl = document.querySelector('.crop-name')
  if (cropEl) cropEl.textContent = '🌾 ' + (currentField.crop_type || farmer.crop_type || 'Chilli')

  // Crop meta
  var cropMetaEl = document.querySelector('.crop-meta')
  if (cropMetaEl) {
    var parts = []
    if (currentField.land_acres) parts.push(currentField.land_acres + ' ' + t('acres'))
    if (currentField.village) parts.push(currentField.village)
    cropMetaEl.textContent = parts.join(' · ')
  }

  // Sowing date
  var sowingEl = document.getElementById('home-sowing-date')
  if (sowingEl && currentField.sowing_date) {
    var sowDate = new Date(currentField.sowing_date + 'T00:00:00')
    sowingEl.textContent = t('sowed') + ': ' + sowDate.toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: '2-digit'
    })
  }

  // Village
  var villageEl = document.getElementById('home-village')
  if (villageEl) villageEl.textContent = currentField.village || farmer.village || '—'

  // Growth stage
  var sowingDate = currentField.sowing_date || farmer.sowing_date
  if (sowingDate) {
    var days = Math.floor(
      (new Date() - new Date(sowingDate + 'T00:00:00')) / (1000 * 60 * 60 * 24)
    )
    var stage, progress

    if (days < 0)   { stage = t('seedling'); progress = 0 }
    else if (days < 30)  { stage = t('seedling'); progress = 10 }
    else if (days < 60)  { stage = t('vegetative'); progress = 25 }
    else if (days < 90)  { stage = t('flowering'); progress = 50 }
    else if (days < 120) { stage = t('fruit'); progress = 75 }
    else if (days < 150) { stage = t('harvest_stage'); progress = 90 }
    else { stage = t('complete'); progress = 100 }

    var stageEl = document.querySelector('.crop-badge')
    if (stageEl) stageEl.textContent = stage

    var progressEl = document.querySelector('.crop-progress-fill')
    if (progressEl) progressEl.style.width = progress + '%'

    var progressLabel = document.querySelector('.crop-progress-label')
    if (progressLabel) progressLabel.textContent = t('season_progress') + ' — ' + progress + '%'

    // Days active stat
    var daysEl = document.getElementById('home-stat-days')
    if (daysEl) daysEl.textContent = Math.max(0, days)
  }

  // Load activities for home stats
  loadHomeStats(farmer.phone)
}

// Load activities count and cost for home screen
async function loadHomeStats(phone) {
  try {
    var fieldParam = currentFieldId ? '?field_id=' + currentFieldId : ''
    var res = await fetch(API + '/activities/' + phone + fieldParam, {
      headers: { 'Authorization': 'Bearer ' + localStorage.getItem('rytuai_token') }
    })
    var data = await res.json()

    if (res.ok && data.activities) {
      var activities = data.activities
      var totalCost = activities.reduce(function(sum, a) {
        return sum + (parseFloat(a.cost) || 0)
      }, 0)

      var tasksEl = document.getElementById('home-stat-tasks')
      if (tasksEl) tasksEl.textContent = activities.length

      var costEl = document.getElementById('home-stat-cost')
      if (costEl) costEl.textContent = totalCost >= 1000
        ? '₹' + (totalCost / 1000).toFixed(1) + 'k'
        : '₹' + totalCost
    }
  } catch(e) {
    console.log('Home stats error:', e.message)
  }
}

/* ══════════════════════════════════════
   NAVIGATION
══════════════════════════════════════ */
function switchScreen(name) {
  localStorage.setItem('rytuai_screen', name)
  if (name !== currentScreen) { screenHistory.push(name); if (screenHistory.length > 10) screenHistory.shift() }
  currentScreen = name
  document.querySelectorAll('.screen').forEach(function(s) { s.classList.remove('active') })
  var screen = document.getElementById('screen-' + name)
  if (screen) { screen.classList.add('active'); screen.scrollTop = 0 }
  var titleMap = { home: t('title_home'), detect: t('title_detect'), result: t('title_result'), shop: t('title_shop'), feed: t('title_feed'), tracker: t('title_tracker') }
  var titleEl = document.getElementById('topbar-title'); if (titleEl) titleEl.textContent = titleMap[name] || ''
  document.querySelectorAll('.s-item').forEach(function(s) { s.classList.remove('active') })
  var sItem = document.getElementById('s-' + name); if (sItem) sItem.classList.add('active')
  document.querySelectorAll('.nav-item').forEach(function(n) {
    n.classList.remove('active')
    var onclick = n.getAttribute('onclick') || ''
    if (onclick.indexOf("'" + name + "'") !== -1 || onclick.indexOf('"' + name + '"') !== -1) n.classList.add('active')
  })
  if (name === 'tracker') { if (typeof loadActivities === 'function') loadActivities(); setTimeout(function() { if (typeof loadScanHistory === 'function') loadScanHistory() }, 500) }
  if (name === 'detect') { if (typeof loadScanCount === 'function') loadScanCount() }
  if (name === 'feed') { if (typeof loadFeed === 'function') loadFeed() }
  if (name === 'shop') { setTimeout(function() { if (typeof loadStores === 'function') loadStores() }, 100) }
}

function goBack() {
  screenHistory.pop()
  var previous = screenHistory[screenHistory.length - 1] || 'home'
  currentScreen = previous
  document.querySelectorAll('.screen').forEach(function(s) { s.classList.remove('active') })
  var screen = document.getElementById('screen-' + previous)
  if (screen) { screen.classList.add('active'); screen.scrollTop = 0 }
  localStorage.setItem('rytuai_screen', previous)
}

/* ══════════════════════════════════════
   LOGIN
══════════════════════════════════════ */
function showLoginError(msg) {
  var el = document.getElementById('login-error'); if (!el) return
  el.textContent = msg; el.style.background = ''; el.style.color = ''; el.style.border = ''
  el.style.display = 'block'
  setTimeout(function() { el.style.display = 'none' }, 4000)
}

function showLoginLoading(text) {
  var steps = ['step-login','step-signup','step-forgot','step-reset']
  steps.forEach(function(s) { var el = document.getElementById(s); if (el) el.style.display = 'none' })
  var loading = document.getElementById('login-loading'); var loadingText = document.getElementById('loading-text')
  if (loading) loading.style.display = 'block'; if (loadingText) loadingText.textContent = text
}

function hideLoginLoading() { var loading = document.getElementById('login-loading'); if (loading) loading.style.display = 'none' }

function showStep(id) {
  var steps = ['step-login','step-signup','step-forgot','step-reset']
  steps.forEach(function(s) { var el = document.getElementById(s); if (el) el.style.display = 'none' })
  hideLoginLoading()
  var el = document.getElementById(id); if (el) { el.style.display = 'flex'; el.style.flexDirection = 'column' }
  var err = document.getElementById('login-error'); if (err) err.style.display = 'none'
}

function togglePassword(id) { var input = document.getElementById(id); if (!input) return; input.type = input.type === 'password' ? 'text' : 'password' }

async function loginWithPassword() {
  var phone = document.getElementById('login-phone').value.trim()
  var password = document.getElementById('login-password').value
  if (phone.length !== 10) { showLoginError('Please enter valid 10-digit number'); return }
  if (!password) { showLoginError('Please enter your password'); return }
  showLoginLoading('Logging in...')
  try {
    var response = await fetch(API + '/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ phone, password }) })
    var data = await response.json(); hideLoginLoading()
    if (response.ok) {
      if (data.pending) { showStep('step-login'); showLoginError('⏳ Account pending approval. We will call you within 24 hours.'); return }
      localStorage.setItem('rytuai_token', data.token); localStorage.setItem('rytuai_phone', phone); localStorage.setItem('rytuai_farmer', JSON.stringify(data.farmer)); showApp()
    } else { showStep('step-login'); showLoginError(data.message || 'Login failed') }
  } catch(err) { hideLoginLoading(); showStep('step-login'); showLoginError('Cannot connect to server') }
}

var registrationPhone = ''
var registrationEmail = ''

async function registerWithPassword() {
  var phone = document.getElementById('reg-phone').value.trim()
  var name = document.getElementById('reg-name').value.trim()
  var email = document.getElementById('reg-email').value.trim()
  var village = document.getElementById('reg-village').value.trim()
  var district = document.getElementById('reg-district').value.trim()
  var land_acres = document.getElementById('reg-acres').value
  var crop_type = document.getElementById('reg-crop').value
  var sowing_date = document.getElementById('reg-sowing').value
  var password = document.getElementById('reg-password').value
  var confirmPassword = document.getElementById('reg-confirm-password').value

  // Validate
  if (!phone || phone.length !== 10 || isNaN(phone)) {
    showLoginError('📱 Please enter valid 10-digit mobile number')
    document.getElementById('reg-phone').focus()
    return
  }
  if (!name || name.length < 2) {
    showLoginError('👤 Please enter your full name')
    document.getElementById('reg-name').focus()
    return
  }
  if (!email || !email.includes('@')) {
    showLoginError('📧 Please enter valid Gmail address')
    document.getElementById('reg-email').focus()
    return
  }
  if (!village) {
    showLoginError('🏘️ Please enter your village')
    document.getElementById('reg-village').focus()
    return
  }
  if (!district) {
    showLoginError('📍 Please enter your district')
    document.getElementById('reg-district').focus()
    return
  }
  if (!land_acres || parseFloat(land_acres) <= 0) {
    showLoginError('🌾 Please enter land area in acres')
    document.getElementById('reg-acres').focus()
    return
  }
  if (!crop_type) {
    showLoginError('🌱 Please select crop type')
    return
  }
  if (!password || password.length < 8) {
    showLoginError('🔒 Password must be at least 8 characters')
    document.getElementById('reg-password').focus()
    return
  }
  if (!/[A-Z]/.test(password)) {
    showLoginError('🔒 Password must have at least one capital letter')
    document.getElementById('reg-password').focus()
    return
  }
  if (!/[0-9]/.test(password)) {
    showLoginError('🔒 Password must have at least one number')
    document.getElementById('reg-password').focus()
    return
  }
  if (!/[!@#$%^&*]/.test(password)) {
    showLoginError('🔒 Password must have at least one special character')
    document.getElementById('reg-password').focus()
    return
  }
  if (password !== confirmPassword) {
    showLoginError('🔒 Passwords do not match')
    document.getElementById('reg-confirm-password').focus()
    return
  }

  registrationPhone = phone
  registrationEmail = email

  showLoginLoading(currentLang === 'te'
    ? 'OTP పంపుతున్నాం...'
    : 'Sending OTP to your Gmail...')

  try {
    var response = await fetch(API + '/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phone, name, email, village, district,
        land_acres: parseFloat(land_acres) || 0,
        crop_type, sowing_date, password
      })
    })
    var data = await response.json()
    hideLoginLoading()

    if (response.ok) {
      // Show OTP verification step
      showStep('step-verify-otp')
      var emailDisplay = document.getElementById('verify-email-display')
      if (emailDisplay) emailDisplay.textContent = email
    } else {
      showStep('step-signup')
      showLoginError(data.message || 'Registration failed')
    }
  } catch(err) {
    hideLoginLoading()
    showStep('step-signup')
    showLoginError(currentLang === 'te'
      ? '❌ సర్వర్‌కు కనెక్ట్ అవడం సాధ్యం కాలేదు'
      : '❌ Cannot connect to server')
  }
}

// Verify registration OTP
async function verifyRegistrationOTP() {
  var otp = document.getElementById('verify-otp-code').value.trim()

  if (otp.length !== 6) {
    showLoginError(currentLang === 'te'
      ? '6 అంకెల OTP నమోదు చేయండి'
      : 'Please enter 6-digit OTP')
    return
  }

  showLoginLoading(currentLang === 'te'
    ? 'OTP నిర్ధారిస్తున్నాం...'
    : 'Verifying OTP...')

  try {
    var response = await fetch(API + '/auth/verify-registration-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phone: registrationPhone,
        otp: otp
      })
    })
    var data = await response.json()
    hideLoginLoading()

    if (response.ok) {
      // Auto login after verification
      localStorage.setItem('rytuai_token', data.token)
      localStorage.setItem('rytuai_phone', registrationPhone)
      localStorage.setItem('rytuai_farmer', JSON.stringify(data.farmer))
      showApp()
      showToast(currentLang === 'te'
        ? '✅ ఖాతా విజయవంతంగా తయారైంది!'
        : '✅ Account created successfully!')
    } else {
      showLoginError(data.message || 'Invalid OTP')
    }
  } catch(err) {
    hideLoginLoading()
    showLoginError(currentLang === 'te'
      ? 'సర్వర్‌కు కనెక్ట్ అవడం సాధ్యం కాలేదు'
      : 'Cannot connect to server')
  }
}

async function resendRegistrationOTP() {
  showLoginLoading('Resending OTP...')
  try {
    await fetch(API + '/auth/resend-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phone: registrationPhone,
        email: registrationEmail,
        type: 'registration'
      })
    })
    hideLoginLoading()
    showToast('OTP resent to ' + registrationEmail)
  } catch(err) {
    hideLoginLoading()
    showLoginError('Cannot resend OTP')
  }
}

// ── EMAIL OTP LOGIN ──
var loginOTPPhone = ''

async function sendLoginOTP() {
  var email = document.getElementById('login-email-input').value.trim()

  if (!email || !email.includes('@')) {
    showLoginError(currentLang === 'te'
      ? 'సరైన Gmail చిరునామా నమోదు చేయండి'
      : 'Please enter valid Gmail address')
    return
  }

  showLoginLoading(currentLang === 'te'
    ? 'OTP పంపుతున్నాం...'
    : 'Sending OTP...')

  try {
    var response = await fetch(API + '/auth/send-login-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    })
    var data = await response.json()
    hideLoginLoading()

    if (response.ok) {
      loginOTPPhone = data.phone
      document.getElementById('email-otp-send-section').style.display = 'none'
      document.getElementById('email-otp-verify-section').style.display = 'block'
      var display = document.getElementById('login-otp-email-display')
      if (display) display.textContent = email
      showToast(currentLang === 'te'
        ? '✅ OTP Gmail కి పంపబడింది!'
        : '✅ OTP sent to your Gmail!')
    } else {
      showLoginError(data.message || 'Failed to send OTP')
    }
  } catch(err) {
    hideLoginLoading()
    showLoginError(currentLang === 'te'
      ? 'సర్వర్‌కు కనెక్ట్ అవడం సాధ్యం కాలేదు'
      : 'Cannot connect to server')
  }
}

async function verifyLoginOTP() {
  var otp = document.getElementById('login-otp-code').value.trim()

  if (otp.length !== 6) {
    showLoginError(currentLang === 'te'
      ? '6 అంకెల OTP నమోదు చేయండి'
      : 'Please enter 6-digit OTP')
    return
  }

  showLoginLoading(currentLang === 'te'
    ? 'లాగిన్ అవుతున్నాం...'
    : 'Logging in...')

  try {
    var response = await fetch(API + '/auth/verify-login-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: loginOTPPhone, otp })
    })
    var data = await response.json()
    hideLoginLoading()

    if (response.ok) {
      localStorage.setItem('rytuai_token', data.token)
      localStorage.setItem('rytuai_phone', loginOTPPhone)
      localStorage.setItem('rytuai_farmer', JSON.stringify(data.farmer))
      showApp()
    } else {
      showLoginError(data.message || 'Invalid OTP')
    }
  } catch(err) {
    hideLoginLoading()
    showLoginError(currentLang === 'te'
      ? 'సర్వర్‌కు కనెక్ట్ అవడం సాధ్యం కాలేదు'
      : 'Cannot connect to server')
  }
}

var forgotPhone = ''
async function sendResetOTP() {
  var phone = document.getElementById('forgot-phone').value.trim()
  if (phone.length !== 10) { showLoginError('Please enter valid 10-digit number'); return }
  forgotPhone = phone; showLoginLoading('Sending OTP...')
  try {
    var response = await fetch(API + '/auth/forgot-password', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ phone }) })
    var data = await response.json(); hideLoginLoading()
    if (response.ok) { showStep('step-reset'); showLoginError('OTP sent!') }
    else { showStep('step-forgot'); showLoginError(data.message || 'Failed to send OTP') }
  } catch(err) { hideLoginLoading(); showStep('step-forgot'); showLoginError('Cannot connect to server') }
}

async function resetPassword() {
  var otp = document.getElementById('reset-otp').value.trim()
  var newPassword = document.getElementById('reset-new-password').value
  if (otp.length !== 6) { showLoginError('Please enter 6-digit OTP'); return }
  if (!newPassword || newPassword.length < 8) { showLoginError('Password must be at least 8 characters'); return }
  showLoginLoading('Resetting password...')
  try {
    var response = await fetch(API + '/auth/reset-password', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ phone: forgotPhone, otp, new_password: newPassword }) })
    var data = await response.json(); hideLoginLoading()
    if (response.ok) { showStep('step-login'); showLoginError('Password reset! Please login.') }
    else { showStep('step-reset'); showLoginError(data.message || 'Reset failed') }
  } catch(err) { hideLoginLoading(); showStep('step-reset'); showLoginError('Cannot connect to server') }
}

/* ══════════════════════════════════════
   PROFILE
══════════════════════════════════════ */
function toggleProfileMenu() {
  var menu = document.getElementById('profile-menu'); if (!menu) return
  if (menu.style.display === 'block') { menu.style.display = 'none'; return }
  var farmerData = localStorage.getItem('rytuai_farmer')
  if (farmerData) {
    try {
      var farmer = JSON.parse(farmerData)
      var n = document.getElementById('menu-farmer-name'); if (n) n.textContent = farmer.name || '—'
      var p = document.getElementById('menu-farmer-phone'); if (p) p.textContent = farmer.phone || '—'
      var d = document.getElementById('menu-farmer-details'); if (d) d.textContent = (farmer.crop_type || '') + ' · ' + (farmer.village || '')
    } catch(e) {}
  }
  menu.style.display = 'block'
}

function closeProfileMenu() { var menu = document.getElementById('profile-menu'); if (menu) menu.style.display = 'none' }
function openSettings() { closeProfileMenu(); showToast('Settings coming soon!') }
function openOrders() { closeProfileMenu(); loadMyOrders(); var screen = document.getElementById('my-orders-screen'); if (screen) { screen.style.display = 'block'; screen.scrollTop = 0 } }

function openEditProfile() {
  closeProfileMenu()
  var farmerData = localStorage.getItem('rytuai_farmer'); if (!farmerData) { showToast('Please login again', 'error'); return }
  try {
    var farmer = JSON.parse(farmerData)
    var nd = document.getElementById('profile-name-display'); if (nd) nd.textContent = farmer.name || '—'
    var pd = document.getElementById('profile-phone-display'); if (pd) pd.textContent = farmer.phone || '—'
    function setVal(id, val) { var el = document.getElementById(id); if (el) el.value = val || '' }
    setVal('edit-name', farmer.name); setVal('edit-village', farmer.village); setVal('edit-district', farmer.district)
    setVal('edit-acres', farmer.land_acres); setVal('edit-crop', farmer.crop_type); setVal('edit-sowing', farmer.sowing_date)
    var screen = document.getElementById('profile-screen'); if (screen) { screen.style.display = 'block'; screen.scrollTop = 0 }
  } catch(e) { showToast('Error loading profile', 'error') }
}

function closeProfile() { var screen = document.getElementById('profile-screen'); if (screen) screen.style.display = 'none' }

async function saveProfile() {
  var farmerData = localStorage.getItem('rytuai_farmer'); if (!farmerData) { showToast('Please login again', 'error'); return }
  var farmer = JSON.parse(farmerData)
  function getVal(id) { var el = document.getElementById(id); return el ? el.value.trim() : '' }
  var name = getVal('edit-name'), village = getVal('edit-village'), district = getVal('edit-district')
  var land_acres = getVal('edit-acres'), crop_type = getVal('edit-crop'), sowing_date = getVal('edit-sowing')
  if (!name || !village || !district) { showToast('Please fill name, village and district', 'error'); return }
  var saveBtn = document.querySelector('#profile-screen .fs-save')
  if (saveBtn) { saveBtn.textContent = 'Saving...'; saveBtn.disabled = true }
  try {
    var response = await fetch(API + '/farmers/' + farmer.phone, { method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + localStorage.getItem('rytuai_token') }, body: JSON.stringify({ name, village, district, land_acres: parseFloat(land_acres) || 0, crop_type, sowing_date }) })
    var data = await response.json()
    if (response.ok) {
      var updated = Object.assign({}, farmer, { name, village, district, land_acres: parseFloat(land_acres) || 0, crop_type, sowing_date })
      localStorage.setItem('rytuai_farmer', JSON.stringify(updated)); loadFarmerData(); showToast('Profile updated!'); setTimeout(closeProfile, 1500)
    } else { showToast(data.message || 'Update failed', 'error') }
  } catch(err) { showToast('Cannot connect to server', 'error') }
  finally { if (saveBtn) { saveBtn.textContent = 'Save'; saveBtn.disabled = false } }
}

function logout() { localStorage.clear(); window.location.replace('/') }

/* ══════════════════════════════════════
   IMAGE UPLOAD
══════════════════════════════════════ */
var uploadedImages = { 0: null, 1: null, 2: null, 3: null }
var slotLabels = ['Leaf Photo', 'Stem Photo', 'Full Plant', 'Extra']

function triggerUpload(idx) {
  var isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
  if (isMobile) showUploadChoice(idx)
  else document.getElementById('file-' + idx).click()
}

function showUploadChoice(idx) {
  var existing = document.getElementById('upload-choice'); if (existing) existing.remove()
  var existingBd = document.getElementById('upload-backdrop'); if (existingBd) existingBd.remove()
  var backdrop = document.createElement('div'); backdrop.id = 'upload-backdrop'
  backdrop.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:9998;'
  backdrop.onclick = closeUploadChoice
  var choice = document.createElement('div'); choice.id = 'upload-choice'
  choice.style.cssText = 'position:fixed;bottom:0;left:0;right:0;background:white;border-radius:20px 20px 0 0;padding:24px 20px;z-index:9999;'
  choice.innerHTML = '<div style="text-align:center;margin-bottom:20px;"><div style="width:40px;height:4px;background:#e0e0e0;border-radius:2px;margin:0 auto 16px;"></div><div style="font-size:15px;font-weight:800;">Upload Photo</div></div>' +
    '<button onclick="openCamera(' + idx + ')" style="width:100%;padding:16px;background:#1a6e35;color:white;border:none;border-radius:14px;font-size:15px;font-weight:800;font-family:Nunito,sans-serif;cursor:pointer;margin-bottom:10px;display:block;">📷 Take Photo</button>' +
    '<button onclick="openGallery(' + idx + ')" style="width:100%;padding:16px;background:#f8f8f8;color:#1a1a1a;border:1.5px solid #e0e0e0;border-radius:14px;font-size:15px;font-weight:800;font-family:Nunito,sans-serif;cursor:pointer;margin-bottom:10px;display:block;">🖼️ Choose from Gallery</button>' +
    '<button onclick="closeUploadChoice()" style="width:100%;padding:14px;background:transparent;color:#888;border:none;font-size:14px;font-weight:700;font-family:Nunito,sans-serif;cursor:pointer;display:block;">Cancel</button>'
  document.body.appendChild(backdrop); document.body.appendChild(choice)
}

function closeUploadChoice() {
  var c = document.getElementById('upload-choice'); if (c) c.remove()
  var b = document.getElementById('upload-backdrop'); if (b) b.remove()
}

function openCamera(idx) {
  closeUploadChoice()
  var input = document.createElement('input'); input.type = 'file'; input.accept = 'image/*'; input.capture = 'environment'; input.style.display = 'none'
  input.onchange = function() { if (this.files[0]) handleUploadFile(idx, this.files[0]); if (document.body.contains(input)) document.body.removeChild(input) }
  document.body.appendChild(input); input.click()
}

function openGallery(idx) {
  closeUploadChoice()
  var input = document.createElement('input'); input.type = 'file'; input.accept = 'image/*'; input.style.display = 'none'
  input.onchange = function() { if (this.files[0]) handleUploadFile(idx, this.files[0]); if (document.body.contains(input)) document.body.removeChild(input) }
  document.body.appendChild(input); input.click()
}

function handleUpload(idx, input) { if (input.files[0]) handleUploadFile(idx, input.files[0]) }

function handleUploadFile(idx, file) {
  var reader = new FileReader()
  reader.onload = function(e) { uploadedImages[idx] = e.target.result; updateSlotUI(idx, e.target.result); updateUploadCount(); updateAnalyzeBtn() }
  reader.readAsDataURL(file)
}

function updateSlotUI(idx, base64) {
  var slot = document.getElementById('slot-' + idx); if (!slot) return
  slot.classList.add('filled')
  slot.innerHTML = '<img src="' + base64 + '" style="width:100%;height:100%;object-fit:cover;border-radius:12px;" />' +
    '<div style="position:absolute;top:6px;right:6px;background:#1a6e35;color:white;border-radius:50%;width:22px;height:22px;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:800;">✓</div>' +
    '<div style="position:absolute;bottom:0;left:0;right:0;background:rgba(26,110,53,0.85);color:white;font-size:10px;font-weight:800;text-align:center;padding:4px;border-radius:0 0 12px 12px;">' + slotLabels[idx] + '</div>'
}

function countUploaded() { return Object.values(uploadedImages).filter(function(v) { return v !== null }).length }

function updateUploadCount() {
  var n = countUploaded(); var el = document.getElementById('upload-count-msg'); if (!el) return
  if (n > 0) { el.textContent = n + ' photo' + (n > 1 ? 's' : '') + ' ready to analyze'; el.classList.add('ready') }
  else { el.textContent = 'Tap any slot to upload a photo'; el.classList.remove('ready') }
}

function updateAnalyzeBtn() { var btn = document.getElementById('analyze-btn'); if (!btn) return; btn.disabled = countUploaded() < 1 }

/* ══════════════════════════════════════
   AI DETECTION
══════════════════════════════════════ */
function compressImage(base64, quality) {
  return new Promise(function(resolve) {
    var img = new Image()
    img.onload = function() {
      var canvas = document.createElement('canvas'); var maxW = 600
      var ratio = Math.min(maxW / img.width, maxW / img.height)
      canvas.width = img.width * (ratio < 1 ? ratio : 1); canvas.height = img.height * (ratio < 1 ? ratio : 1)
      var ctx = canvas.getContext('2d'); ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      resolve(canvas.toDataURL('image/jpeg', quality || 0.7))
    }
    img.src = base64
  })
}

async function analyzeImages() {
  if (countUploaded() < 1) { showToast('Please upload at least 1 photo', 'error'); return }
  switchScreen('result')
  var loading = document.getElementById('result-loading')
  var error = document.getElementById('result-error')
  var content = document.getElementById('result-content')
  if (loading) loading.style.display = 'flex'
  if (error) error.style.display = 'none'
  if (content) content.style.display = 'none'
  var loaderText = document.querySelector('.loader-text')
  if (loaderText) loaderText.textContent = t('analyzing')

  try {
    // ── Step 1: Compress images ──
    var compressedImages = []
    var imagesToProcess = Object.values(uploadedImages).filter(function(v) { return v !== null })
    for (var i = 0; i < imagesToProcess.length; i++) {
      compressedImages.push(await compressImage(imagesToProcess[i], 0.7))
    }

    // ── Step 2: Build FormData ONCE ──
    var formData = new FormData()
    compressedImages.forEach(function(base64, index) {
      var byteStr = atob(base64.split(',')[1])
      var ab = new ArrayBuffer(byteStr.length)
      var ia = new Uint8Array(ab)
      for (var j = 0; j < byteStr.length; j++) ia[j] = byteStr.charCodeAt(j)
      formData.append('photos', new Blob([ab], { type: 'image/jpeg' }), 'photo' + index + '.jpg')
    })

    // ── Step 3: Add field_id ──
    if (currentFieldId) {
      formData.append('field_id', currentFieldId)
    }

    // ── Step 4: Send to API ──
    var response = await fetch(API + '/detect', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + localStorage.getItem('rytuai_token') },
      body: formData
    })
    var data = await response.json()
    if (loading) loading.style.display = 'none'

    if (response.status === 429) {
      if (error) error.style.display = 'none'
      if (content) content.style.display = 'none'
      showScanUpgradeUI()
      return
    }

    if (response.ok) {
      cachedScans = null
      lastScanLoadTime = 0
      lastScanResult = data.result
      uploadedImages = { 0: null, 1: null, 2: null, 3: null }
      for (var i = 0; i < 4; i++) {
        var slot = document.getElementById('slot-' + i)
        if (slot) {
          slot.classList.remove('filled')
          slot.innerHTML = '<div class="slot-plus">+</div><div class="slot-label">' + t('slot_' + i) + '</div>'
        }
      }
      updateUploadCount()
      updateAnalyzeBtn()
      renderResult(data.result)
    } else {
      throw new Error(data.message || 'Detection failed')
    }
  } catch(err) {
    if (loading) loading.style.display = 'none'
    if (error) { error.style.display = 'flex'; error.style.flexDirection = 'column' }
    var errMsg = document.getElementById('error-msg')
    if (errMsg) errMsg.textContent = err.message || 'Something went wrong'
  }
}

async function loadScanCount() {
  var farmerData = localStorage.getItem('rytuai_farmer'); if (!farmerData) return
  var farmer = JSON.parse(farmerData)
  try {
    var res = await fetch(API + '/detect/scan-count/' + farmer.phone, { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('rytuai_token') } })
    var data = await res.json()
    if (res.ok) {
      var countEl = document.getElementById('scan-count-display')
      if (countEl) {
        var used = data.count || 0; var remaining = 2 - used
        countEl.innerHTML = '<div style="background:' + (remaining <= 1 ? '#fff3cd' : '#e8f5ee') + ';border-radius:10px;padding:10px 14px;margin-bottom:12px;font-size:12px;font-weight:700;text-align:center;color:' + (remaining <= 1 ? '#856404' : '#1a6e35') + ';">🔬 ' + used + '/2 scans used this month · ' + remaining + ' remaining</div>'
      }
    }
  } catch(e) {}
}

function renderResult(r) {
  lastScanResult = r
  var content = document.getElementById('result-content'); if (content) content.style.display = 'block'
  var headerDiv = document.getElementById('result-header-div'); if (headerDiv) headerDiv.className = r.healthy ? 'result-hero healthy' : 'result-hero'
  function setText(id, val) { var el = document.getElementById(id); if (el) el.textContent = val || '—' }
  setText('r-emoji', r.healthy ? '✅' : '🦠'); setText('r-disease', r.disease); setText('r-telugu', r.teluguName)
  setText('r-confidence', (r.confidence || '') + (r.images_count ? ' · ' + r.images_count + ' images' : ''))
  setText('r-sev-val', r.severity); setText('r-spread-val', r.spread); setText('r-treat-val', r.treatWithin)
  setText('r-what', r.whatIsThis); setText('r-symptoms', r.symptomsFound); setText('r-prevention', r.prevention)
  setText('r-what-telugu', r.whatIsThisTelugu); setText('r-symptoms-telugu', r.symptomsFoundTelugu); setText('r-prevention-telugu', r.preventionTelugu)
  var teluguCard = document.getElementById('telugu-summary-card'); var teluguSummaryEl = document.getElementById('r-telugu-summary')
  if (teluguSummaryEl && r.teluguSummary) { teluguSummaryEl.textContent = r.teluguSummary; if (teluguCard) teluguCard.style.display = 'block' }
  var pestDiv = document.getElementById('r-pesticides')
  if (pestDiv) {
    pestDiv.innerHTML = (r.pesticides || []).map(function(p) {
      var disc = p.priceMRP ? Math.round((1 - p.priceRytu / p.priceMRP) * 100) : 0
      return '<div class="pest-item"><div class="pest-icon">' + (p.icon || '🧴') + '</div><div class="pest-info"><div class="pest-name">' + p.name + '</div><div class="pest-brand">' + (p.brand || '') + '</div>' +
        (p.usage ? '<div style="font-size:11px;color:#555;margin-top:2px;">📋 ' + p.usage + '</div>' : '') +
        (p.usageTelugu ? '<div style="font-size:11px;color:#1a6e35;font-family:Tiro Telugu,serif;margin-top:2px;">📋 ' + p.usageTelugu + '</div>' : '') +
        '</div><div class="pest-price-col"><div class="price">₹' + (p.priceRytu || 0) + '</div>' +
        (p.priceMRP ? '<div class="mrp">₹' + p.priceMRP + '</div>' : '') + (disc > 0 ? '<div class="discount">' + disc + '% OFF</div>' : '') + '</div></div>'
    }).join('')
  }
  setTimeout(function() { if (typeof addScanActionButtons === 'function') addScanActionButtons(r) }, 300)
}

function resetAndScan() {
  lastScanResult = null; uploadedImages = { 0: null, 1: null, 2: null, 3: null }
  for (var i = 0; i < 4; i++) { var slot = document.getElementById('slot-' + i); if (slot) { slot.classList.remove('filled'); slot.innerHTML = '<div class="slot-plus">+</div><div class="slot-label">' + t('slot_' + i) + '</div>' } }
  updateUploadCount(); updateAnalyzeBtn(); switchScreen('detect')
}

/* ══════════════════════════════════════
   TRACKER
══════════════════════════════════════ */
var currentEditActivityId = null
var allActivities = []
var typeConfig = {
  irrigation: { icon: '💧', color: 'type-irrigation', label: 'Irrigation' },
  spray: { icon: '🧴', color: 'type-spray', label: 'Spray' },
  fertilizer: { icon: '🌱', color: 'type-fertilizer', label: 'Fertilizer' },
  harvest: { icon: '🌾', color: 'type-harvest', label: 'Harvest' },
  labour: { icon: '👨‍🌾', color: 'type-labour', label: 'Labour' },
  shop: { icon: '🛒', color: 'type-shop', label: 'Purchase' },
  other: { icon: '📝', color: 'type-other', label: 'Other' }
}

async function loadActivities() {
  var farmerData = localStorage.getItem('rytuai_farmer'); if (!farmerData) return
  var farmer = JSON.parse(farmerData)
  var trackerSub = document.getElementById('tracker-sub')
  if (trackerSub && currentFieldId) {
    var activeField = allFields.find(function(f) { return f.id === currentFieldId })
    if (activeField) {
      trackerSub.textContent = currentLang === 'te'
        ? '🌾 ' + activeField.field_name + ' — ' + activeField.crop_type
        : '🌾 ' + activeField.field_name + ' — ' + activeField.crop_type
    }
  }

  var listEl = document.getElementById('activities-list'); if (!listEl) return
  listEl.innerHTML = '<div style="padding:16px;">' + [1,2,3].map(function() { return '<div style="background:#f0f0f0;border-radius:12px;height:80px;margin-bottom:10px;animation:pulse 1.5s infinite;"></div>' }).join('') + '</div><style>@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}</style>'
  try {
    // Add field_id to request if field is selected
   var fieldParam = currentFieldId ? '?field_id=' + currentFieldId : ''
   var response = await fetch(API + '/activities/' + farmer.phone + fieldParam, {
   headers: { 'Authorization': 'Bearer ' + localStorage.getItem('rytuai_token') }
})
    var data = await response.json()
    if (response.ok) { allActivities = data.activities || []; renderActivities(allActivities); updateTrackerStats(allActivities) }
    else listEl.innerHTML = '<div style="text-align:center;padding:40px;color:#e74c3c;font-weight:700;">Error loading activities</div>'
  } catch(err) { listEl.innerHTML = '<div style="text-align:center;padding:40px;color:#e74c3c;font-weight:700;">Cannot connect to server</div>' }
}

function updateTrackerStats(activities) {
  var days = new Set(activities.map(function(a) { return a.date })).size
  var tasks = activities.length
  var totalCost = activities.reduce(function(sum, a) { return sum + (parseFloat(a.cost) || 0) }, 0)
  var daysEl = document.getElementById('stat-days'); if (daysEl) daysEl.textContent = days
  var tasksEl = document.getElementById('stat-tasks'); if (tasksEl) tasksEl.textContent = tasks
  var costEl = document.getElementById('stat-cost'); if (costEl) costEl.textContent = totalCost >= 1000 ? '₹' + (totalCost / 1000).toFixed(1) + 'k' : '₹' + totalCost
}

function renderActivities(activities) {
  var listEl = document.getElementById('activities-list'); if (!listEl) return
  if (!activities || activities.length === 0) {
    listEl.innerHTML = '<div class="tracker-empty"><div class="tracker-empty-icon">📋</div><div class="tracker-empty-title">No activities yet</div><div class="tracker-empty-sub">Start logging your daily farm work</div><button onclick="openAddActivity()" style="background:#1a6e35;color:white;border:none;border-radius:12px;padding:12px 24px;font-size:14px;font-weight:800;font-family:Nunito,sans-serif;cursor:pointer;">➕ Add First Activity</button></div>'
    return
  }
  var grouped = {}
  activities.forEach(function(a) { var dk = a.date ? a.date.toString().substring(0, 10) : 'Unknown'; if (!grouped[dk]) grouped[dk] = []; grouped[dk].push(a) })
  var todayStr = new Date().toISOString().substring(0, 10)
  var yesterdayDate = new Date(); yesterdayDate.setDate(yesterdayDate.getDate() - 1); var yesterdayStr = yesterdayDate.toISOString().substring(0, 10)
  var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  var html = ''
  Object.keys(grouped).forEach(function(dk) {
    var dateLabel = dk === 'Unknown' ? 'Unknown Date' : dk === todayStr ? 'Today' : dk === yesterdayStr ? 'Yesterday' : (function() { var parts = dk.split('-'); return parseInt(parts[2]) + ' ' + months[parseInt(parts[1]) - 1] + ' ' + parts[0] })()
    html += '<div class="date-group-header">' + dateLabel + '</div>'
    grouped[dk].forEach(function(activity) {
      var config = typeConfig[activity.type] || typeConfig['other']; var isShop = activity.source === 'shop'
      html += '<div class="activity-card"><div class="activity-card-header"><div class="activity-type-icon ' + config.color + '">' + config.icon + '</div><div class="activity-card-info"><div class="activity-card-title">' + activity.title + (isShop ? '<span class="shop-badge-activity">🛒 Shop</span>' : '') + '</div><div class="activity-card-date">' + config.label + (activity.quantity ? ' · ' + activity.quantity + ' ' + (activity.unit || '') : '') + '</div></div>' + (activity.cost > 0 ? '<div class="activity-card-cost">₹' + activity.cost + '</div>' : '') + '</div>'
      if (activity.description) html += '<div class="activity-card-desc">' + activity.description + '</div>'
      if (!isShop) html += '<div class="activity-card-footer"><button class="activity-action-btn activity-edit-btn" onclick="openEditActivity(' + activity.id + ')">✏️ Edit</button><button class="activity-action-btn activity-delete-btn" onclick="deleteActivity(' + activity.id + ')">🗑️ Delete</button></div>'
      html += '</div>'
    })
  })
  listEl.innerHTML = html
}

function openAddActivity() {
  currentEditActivityId = null
  var titleEl = document.getElementById('activity-screen-title'); if (titleEl) titleEl.textContent = 'Add Activity'
  document.getElementById('activity-type').value = ''
  document.getElementById('activity-date').value = new Date().toISOString().split('T')[0]
  document.getElementById('activity-title').value = ''
  document.getElementById('activity-desc').value = ''
  document.getElementById('activity-cost').value = ''
  document.getElementById('activity-quantity').value = ''
  document.getElementById('activity-unit').value = ''
  document.querySelectorAll('.type-chip').forEach(function(c) { c.classList.remove('selected') })
  var screen = document.getElementById('activity-screen'); if (screen) { screen.style.display = 'block'; screen.scrollTop = 0 }
}

function openEditActivity(id) {
  var activity = allActivities.find(function(a) { return a.id === id }); if (!activity) return
  currentEditActivityId = id
  var titleEl = document.getElementById('activity-screen-title'); if (titleEl) titleEl.textContent = 'Edit Activity'
  document.getElementById('activity-type').value = activity.type || ''
  document.getElementById('activity-date').value = activity.date || ''
  document.getElementById('activity-title').value = activity.title || ''
  document.getElementById('activity-desc').value = activity.description || ''
  document.getElementById('activity-cost').value = activity.cost || ''
  document.getElementById('activity-quantity').value = activity.quantity || ''
  document.getElementById('activity-unit').value = activity.unit || ''
  document.querySelectorAll('.type-chip').forEach(function(c) { c.classList.remove('selected'); if (c.getAttribute('data-type') === activity.type) c.classList.add('selected') })
  var screen = document.getElementById('activity-screen'); if (screen) { screen.style.display = 'block'; screen.scrollTop = 0 }
}

function selectType(type) {
  document.getElementById('activity-type').value = type
  document.querySelectorAll('.type-chip').forEach(function(c) { c.classList.remove('selected') })
  var chip = document.querySelector('[data-type="' + type + '"]'); if (chip) chip.classList.add('selected')
}

function closeActivityScreen() { var screen = document.getElementById('activity-screen'); if (screen) screen.style.display = 'none' }

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
        date, type, title,
        description: desc,
        cost: parseFloat(cost) || 0,
        quantity, unit,
        source: 'manual',
        field_id: currentFieldId || null
      })
    })

    var data = await response.json()
    if (response.ok) {
      showToast(currentEditActivityId ? 'Activity updated!' : 'Activity added!')
      closeActivityScreen()
      loadActivities()
    } else {
      showToast(data.message || 'Failed to save', 'error')
    }
  } catch(err) {
    showToast('Cannot connect to server', 'error')
  } finally {
    if (saveBtn) { saveBtn.textContent = 'Save'; saveBtn.disabled = false }
  }
}
async function deleteActivity(id) {
  var confirmed = await showConfirm('Delete this activity'); if (!confirmed) return
  try {
    var response = await fetch(API + '/activities/' + id, { method: 'DELETE', headers: { 'Authorization': 'Bearer ' + localStorage.getItem('rytuai_token') } })
    if (response.ok) { showToast('Activity deleted'); loadActivities() } else showToast('Failed to delete', 'error')
  } catch(err) { showToast('Cannot connect to server', 'error') }
}

function showConfirm(msg) {
  return new Promise(function(resolve) {
    var old = document.getElementById('rytu-confirm'); if (old) old.remove()
    var box = document.createElement('div'); box.id = 'rytu-confirm'
    box.style.cssText = 'position:fixed;bottom:90px;left:16px;right:16px;background:white;border-radius:16px;padding:20px;z-index:99999;box-shadow:0 8px 32px rgba(0,0,0,0.2);border:1.5px solid #e8e0d0;'
    box.innerHTML = '<div style="font-size:15px;font-weight:800;color:#1a1a1a;margin-bottom:16px;text-align:center;">' + msg + '</div><div style="display:flex;gap:10px;"><button onclick="document.getElementById(\'rytu-confirm\').remove();window._confirmResolve(false);" style="flex:1;padding:12px;background:#f8f8f8;color:#555;border:1.5px solid #e0e0e0;border-radius:10px;font-size:14px;font-weight:700;font-family:Nunito,sans-serif;cursor:pointer;">Cancel</button><button onclick="document.getElementById(\'rytu-confirm\').remove();window._confirmResolve(true);" style="flex:1;padding:12px;background:#e74c3c;color:white;border:none;border-radius:10px;font-size:14px;font-weight:700;font-family:Nunito,sans-serif;cursor:pointer;">Delete</button></div>'
    window._confirmResolve = resolve; document.body.appendChild(box)
  })
}

// ══════════════════════════════════════
// FIELD MANAGEMENT
// ══════════════════════════════════════

/* ══════════════════════════════════════
   PULL TO REFRESH + SWIPE NAV (combined)
══════════════════════════════════════ */
;(function() {
  var startY = 0, swipeStartX = 0, threshold = 80, refreshing = false, indicator = null

  function getActiveScreen() { return document.querySelector('.screen.active') }
  function getActiveScreenName() { var s = getActiveScreen(); return s ? s.id.replace('screen-', '') : 'home' }

  function showIndicator() {
    if (indicator) return
    indicator = document.createElement('div')
    indicator.style.cssText = 'position:fixed;top:56px;left:50%;transform:translateX(-50%);background:#1a6e35;color:white;padding:8px 20px;border-radius:0 0 16px 16px;font-size:13px;font-weight:700;font-family:Nunito,sans-serif;z-index:9999;display:flex;align-items:center;gap:8px;white-space:nowrap;'
    indicator.innerHTML = '<div style="width:14px;height:14px;border:2px solid rgba(255,255,255,0.3);border-top-color:white;border-radius:50%;animation:spin 0.8s linear infinite;"></div> Refreshing...'
    document.body.appendChild(indicator)
  }

  function hideIndicator() { if (indicator) { indicator.remove(); indicator = null } }

  function doRefresh() {
    var name = getActiveScreenName()
    if (name === 'tracker') { if (typeof loadActivities === 'function') loadActivities() }
    else if (name === 'shop') { if (typeof loadStores === 'function') loadStores() }
    else if (name === 'home') { if (typeof loadFarmerData === 'function') loadFarmerData(); if (typeof loadGreetingAndWeather === 'function') loadGreetingAndWeather() }
    else if (name === 'feed') { if (typeof loadFeed === 'function') loadFeed() }
    showToast('Refreshed!')
  }

  document.addEventListener('touchstart', function(e) {
    swipeStartX = e.touches[0].clientX
    var s = getActiveScreen(); if (!s) return
    startY = s.scrollTop === 0 ? e.touches[0].clientY : 0
  }, { passive: true })

  document.addEventListener('touchmove', function(e) {
    if (!startY || refreshing) return
    if (e.touches[0].clientY - startY > 40) showIndicator()
  }, { passive: true })

  document.addEventListener('touchend', function(e) {
    var swipeEndX = e.changedTouches[0].clientX
    var distX = swipeEndX - swipeStartX
    var distY = Math.abs(e.changedTouches[0].clientY - startY)

    // Swipe right → go back
    if (distX > 80 && distY < 100 && currentScreen !== 'home') {
      var tgt = e.target
      var insideOverlay = tgt.closest && (tgt.closest('#cart-screen') || tgt.closest('#activity-screen') || tgt.closest('#profile-screen') || tgt.closest('#my-orders-screen') || tgt.closest('#order-success-screen'))
      if (!insideOverlay) { goBack(); startY = 0; return }
    }

    if (!startY || refreshing) { hideIndicator(); startY = 0; return }
    var diff = e.changedTouches[0].clientY - startY
    if (diff > threshold) { refreshing = true; setTimeout(function() { doRefresh(); hideIndicator(); refreshing = false }, 800) }
    else hideIndicator()
    startY = 0
  }, { passive: true })
})()

/* ══════════════════════════════════════
   WEATHER
══════════════════════════════════════ */
async function loadGreetingAndWeather() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      async function(position) {
        var lat = position.coords.latitude, lon = position.coords.longitude
        try {
          var geoRes = await fetch('https://nominatim.openstreetmap.org/reverse?lat=' + lat + '&lon=' + lon + '&format=json')
          var geoData = await geoRes.json()
          var city = geoData.address.city || geoData.address.town || geoData.address.village || 'Your Location'
          await fetchWeather(lat, lon, city)
        } catch(e) { await fetchWeather(lat, lon, 'Your Location') }
      },
      async function() { await fetchWeather(16.3008, 80.4428, 'Guntur') },
      { timeout: 5000 }
    )
  } else { await fetchWeather(16.3008, 80.4428, 'Guntur') }
}

async function fetchWeather(lat, lon, city) {
  try {
    var url = 'https://api.open-meteo.com/v1/forecast?latitude=' + lat + '&longitude=' + lon + '&current=temperature_2m,relative_humidity_2m,weathercode&timezone=Asia/Kolkata'
    var response = await fetch(url); var data = await response.json()
    if (data && data.current) {
      var temp = Math.round(data.current.temperature_2m), humidity = data.current.relative_humidity_2m
      var weatherInfo = getWeatherInfo(data.current.weathercode)
      var alert = humidity > 75 ? 'High humidity — watch for fungal diseases' : humidity > 60 ? 'Moderate humidity — monitor your crop' : 'Good weather for farming today'
      var tempEl = document.querySelector('.weather-temp'); if (tempEl) tempEl.textContent = temp + '°C · ' + city
      var descEl = document.querySelector('.weather-desc'); if (descEl) descEl.textContent = alert
      var dhTemp = document.querySelector('.dh-temp'); if (dhTemp) dhTemp.textContent = temp + '°C'
      var dhLoc = document.querySelector('.dh-loc'); if (dhLoc) dhLoc.textContent = city + ' · ' + humidity + '% humidity'
      var dhAlert = document.querySelector('.dh-weather-alert'); if (dhAlert) dhAlert.textContent = '⚠️ ' + alert
      var iconEl = document.querySelector('.weather-icon'); if (iconEl) iconEl.textContent = weatherInfo.icon
    }
  } catch(err) { console.log('Weather error:', err.message) }
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
   SHOP
══════════════════════════════════════ */
var cart = [], currentStoreId = null, currentStoreName = '', allProducts = []

async function loadStores() {
  var shopBody = document.getElementById('shop-body-content'); if (!shopBody) return
  shopBody.innerHTML = '<div style="text-align:center;padding:40px;color:#888;"><div style="font-size:32px;">⏳</div><div style="font-size:13px;font-weight:700;margin-top:8px;">Loading stores...</div></div>'
  try {
    var response = await fetch(API + '/shop/stores', { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('rytuai_token') } })
    var data = await response.json()
    renderStores(response.ok && data.stores && data.stores.length > 0 ? data.stores : [])
  } catch(err) { shopBody.innerHTML = '<div style="text-align:center;padding:40px;color:#e74c3c;font-weight:700;">Cannot connect to server</div>' }
}

function renderStores(stores) {
  var shopBody = document.getElementById('shop-body-content'); if (!shopBody) return
  if (stores.length === 0) { shopBody.innerHTML = '<div style="text-align:center;padding:48px 24px;"><div style="font-size:48px;margin-bottom:12px;">🏪</div><div style="font-size:16px;font-weight:800;color:#1a2e1e;">No stores available</div><div style="font-size:13px;color:#888;margin-top:6px;">Stores coming soon in your area</div></div>'; return }
  var html = '<div class="section-label">🏪 Stores Near You</div>'
  stores.forEach(function(store) {
    html += '<div class="store-card-big" onclick="openStore(' + store.id + ', \'' + store.name.replace(/'/g, '') + '\')"><div class="store-card-top"><div class="store-icon">🏪</div><div class="store-card-info"><div class="store-card-name">' + store.name + '</div><div class="store-card-addr">' + (store.address || '') + '</div><div class="store-card-meta"><span class="store-tag">📍 ' + (store.district || '') + '</span><span class="store-tag">🕐 ' + store.open_time + '–' + store.close_time + '</span><span class="store-tag">🚚 ' + store.delivery_radius_km + 'km</span></div></div><div style="font-size:20px;color:#1a6e35;">›</div></div></div>'
  })
  shopBody.innerHTML = html
}

async function openStore(storeId, storeName) {
  currentStoreId = storeId; currentStoreName = storeName
  var shopBody = document.getElementById('shop-body-content'); if (!shopBody) return
  shopBody.innerHTML = '<div style="display:flex;align-items:center;gap:10px;padding:16px;"><button onclick="loadStores()" style="background:none;border:none;font-size:20px;cursor:pointer;color:#1a6e35;">←</button><div style="font-size:15px;font-weight:800;">' + storeName + '</div></div><div style="text-align:center;padding:40px;color:#888;"><div style="font-size:32px;">⏳</div></div>'
  try {
    var response = await fetch(API + '/shop/products/' + storeId, { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('rytuai_token') } })
    var data = await response.json()
    if (response.ok) { allProducts = data.products || []; renderProducts(allProducts, storeId, storeName) }
  } catch(err) { showToast('Cannot load products', 'error') }
}

function renderProducts(products, storeId, storeName) {
  var shopBody = document.getElementById('shop-body-content'); if (!shopBody) return
  var categories = ['All']; products.forEach(function(p) { if (p.category && categories.indexOf(p.category) === -1) categories.push(p.category) })
  var html = '<div style="display:flex;align-items:center;gap:10px;padding:12px 16px 8px;"><button onclick="loadStores()" style="background:#f0f7f2;border:none;border-radius:8px;padding:8px 14px;font-size:13px;font-weight:700;cursor:pointer;color:#1a6e35;">← Back</button><div style="font-size:15px;font-weight:800;flex:1;">' + storeName + '</div></div>'
  html += '<div class="category-row" style="padding:0 16px 8px;">'
  categories.forEach(function(cat) { html += '<div class="cat' + (cat === 'All' ? ' active' : '') + '" onclick="filterProducts(\'' + cat + '\')" id="cat-' + cat.replace(/\s/g,'-') + '">' + cat + '</div>' })
  html += '</div><div id="product-list-container" style="padding:0 16px 16px;">' + renderProductList(products) + '</div>'
  shopBody.innerHTML = html; updateCartBar()
}

function renderProductList(products) {
  if (products.length === 0) return '<div style="text-align:center;padding:40px;color:#888;font-weight:700;">No products in this category</div>'
  return products.map(function(p) {
    var disc = p.mrp ? Math.round((1 - p.price / p.mrp) * 100) : 0
    var inCart = cart.find(function(c) { return c.id === p.id }); var qty = inCart ? inCart.qty : 0
    return '<div class="product-item" id="product-' + p.id + '"><div class="product-icon">' + getCategoryIcon(p.category) + '</div><div class="product-info"><div class="product-name">' + p.name + '</div><div class="product-brand">' + (p.brand || '') + ' · ' + (p.unit || '') + '</div><div class="product-prices"><span class="product-price">₹' + p.price + '</span>' + (p.mrp ? '<span class="product-mrp">₹' + p.mrp + '</span>' : '') + (disc > 0 ? '<span class="product-disc">' + disc + '% OFF</span>' : '') + '</div></div><div id="qty-ctrl-' + p.id + '">' + (qty === 0 ? '<button class="add-btn" onclick="addToCart(' + p.id + ', \'' + p.name.replace(/'/g,'') + '\', ' + p.price + ')">' + t('add_to_cart') + '</button>' : '<div class="qty-ctrl"><button onclick="decreaseQty(' + p.id + ')">−</button><span>' + qty + '</span><button onclick="increaseQty(' + p.id + ', \'' + p.name.replace(/'/g,'') + '\', ' + p.price + ')">+</button></div>') + '</div></div>'
  }).join('')
}

function getCategoryIcon(category) {
  var icons = { 'Insecticide': '🧴', 'Fungicide': '🧪', 'Fertilizer': '🪣', 'Bio-pesticide': '🌿', 'Seeds': '🌱', 'Equipment': '🔧' }
  return icons[category] || '📦'
}

function filterProducts(category) {
  document.querySelectorAll('.cat').forEach(function(c) { c.classList.remove('active') })
  var catEl = document.getElementById('cat-' + category.replace(/\s/g,'-')); if (catEl) catEl.classList.add('active')
  var filtered = category === 'All' ? allProducts : allProducts.filter(function(p) { return p.category === category })
  var container = document.getElementById('product-list-container'); if (container) container.innerHTML = renderProductList(filtered)
}

function addToCart(id, name, price) {
  var existing = cart.find(function(c) { return c.id === id })
  if (existing) existing.qty++; else cart.push({ id: id, name: name, price: price, qty: 1 })
  updateQtyCtrl(id); updateCartBar(); showToast(name + ' added to cart')
}

function increaseQty(id, name, price) {
  var existing = cart.find(function(c) { return c.id === id })
  if (existing) existing.qty++; else cart.push({ id: id, name: name, price: price, qty: 1 })
  updateQtyCtrl(id); updateCartBar()
}

function decreaseQty(id) {
  var existing = cart.find(function(c) { return c.id === id }); if (!existing) return
  existing.qty--; if (existing.qty <= 0) cart = cart.filter(function(c) { return c.id !== id })
  updateQtyCtrl(id); updateCartBar()
}

function updateQtyCtrl(id) {
  var ctrl = document.getElementById('qty-ctrl-' + id); if (!ctrl) return
  var item = cart.find(function(c) { return c.id === id }); var qty = item ? item.qty : 0
  var product = allProducts.find(function(p) { return p.id === id })
  var name = product ? product.name.replace(/'/g,'') : '', price = product ? product.price : 0
  if (qty === 0) ctrl.innerHTML = '<button class="add-btn" onclick="addToCart(' + id + ', \'' + name + '\', ' + price + ')">' + t('add_to_cart') + '</button>'
  else ctrl.innerHTML = '<div class="qty-ctrl"><button onclick="decreaseQty(' + id + ')">−</button><span>' + qty + '</span><button onclick="increaseQty(' + id + ', \'' + name + '\', ' + price + ')">+</button></div>'
}

function cartTotal() { return cart.reduce(function(sum, item) { return sum + (item.price * item.qty) }, 0) }
function cartCount() { return cart.reduce(function(sum, item) { return sum + item.qty }, 0) }

function updateCartBar() {
  var bar = document.getElementById('cart-bar'); if (!bar) return
  if (cart.length === 0) { bar.style.display = 'none'; return }
  bar.style.display = 'flex'
  var countEl = document.getElementById('cart-count'); if (countEl) countEl.textContent = cartCount() + ' item' + (cartCount() > 1 ? 's' : '')
  var totalEl = document.getElementById('cart-total'); if (totalEl) totalEl.textContent = '₹' + cartTotal()
}

function openCart() {
  var screen = document.getElementById('cart-screen'); if (!screen) return
  var storeNameEl = document.getElementById('cart-store-name'); if (storeNameEl) storeNameEl.textContent = currentStoreName
  renderCartScreen(); screen.style.display = 'block'; screen.scrollTop = 0; fillAddressFromProfile()
}

function closeCart() { var screen = document.getElementById('cart-screen'); if (screen) screen.style.display = 'none' }

function cartDecrease(id) {
  var item = cart.find(function(c) { return String(c.id) === String(id) }); if (!item) return
  item.qty--; if (item.qty <= 0) cart = cart.filter(function(c) { return String(c.id) !== String(id) })
  renderCartScreen(); updateCartBar()
}

function cartIncrease(id) {
  var item = cart.find(function(c) { return String(c.id) === String(id) }); if (!item) return
  item.qty++; renderCartScreen(); updateCartBar()
}

function renderCartScreen() {
  var container = document.getElementById('cart-items-container'); if (!container) return
  if (cart.length === 0) { container.innerHTML = '<div style="text-align:center;padding:48px 24px;"><div style="font-size:48px;margin-bottom:12px;">🛒</div><div style="font-size:16px;font-weight:800;">Cart is empty</div></div>'; return }
  var html = ''
  cart.forEach(function(item) {
    html += '<div style="display:flex;align-items:center;gap:12px;padding:14px;background:white;border-radius:12px;margin-bottom:10px;border:1.5px solid #e8e0d0;"><div style="flex:1;"><div style="font-size:14px;font-weight:800;">' + item.name + '</div><div style="font-size:12px;color:#888;margin-top:2px;">₹' + item.price + ' each</div></div><div class="qty-ctrl"><button onclick="cartDecrease(\'' + item.id + '\')">−</button><span>' + item.qty + '</span><button onclick="cartIncrease(\'' + item.id + '\')">+</button></div><div style="font-size:15px;font-weight:900;color:#1a6e35;min-width:60px;text-align:right;">₹' + (item.price * item.qty) + '</div></div>'
  })
  html += '<div style="background:#1a6e35;border-radius:12px;padding:16px;margin-top:8px;"><div style="display:flex;justify-content:space-between;color:white;"><div style="font-size:14px;font-weight:700;">Total Amount</div><div style="font-size:18px;font-weight:900;">₹' + cartTotal() + '</div></div></div>'
  container.innerHTML = html
}

/* ══════════════════════════════════════
   PAYMENT
══════════════════════════════════════ */
function loadRazorpayScript() {
  return new Promise(function(resolve) {
    if (window.Razorpay) { resolve(true); return }
    var script = document.createElement('script'); script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = function() { resolve(true) }; script.onerror = function() { resolve(false) }
    document.head.appendChild(script)
  })
}

async function placeOrder() {
  if (cart.length === 0) { showToast('Cart is empty', 'error'); return }
  var farmerData = localStorage.getItem('rytuai_farmer'); if (!farmerData) { showToast('Please login again', 'error'); return }
  var farmer = JSON.parse(farmerData)
  var address = document.getElementById('delivery-address') ? document.getElementById('delivery-address').value.trim() : ''
  var notes = document.getElementById('order-notes') ? document.getElementById('order-notes').value.trim() : ''
  if (!address) { showToast('Please enter delivery address', 'error'); return }
  var placeBtn = document.getElementById('place-order-btn')
  if (placeBtn) { placeBtn.textContent = 'Initializing Payment...'; placeBtn.disabled = true }
  try {
    var loaded = await loadRazorpayScript()
    if (!loaded) { showToast('Payment service unavailable', 'error'); if (placeBtn) { placeBtn.textContent = 'Place Order'; placeBtn.disabled = false } return }
    var response = await fetch(API + '/payment/create-order', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + localStorage.getItem('rytuai_token') }, body: JSON.stringify({ amount: cartTotal(), farmer_id: farmer.phone, store_id: currentStoreId, items: cart, delivery_address: address, notes: notes }) })
    var data = await response.json()
    if (!response.ok) { showToast(data.message || 'Order creation failed', 'error'); if (placeBtn) { placeBtn.textContent = 'Place Order'; placeBtn.disabled = false } return }
    var options = {
      key: data.key_id, amount: data.amount, currency: data.currency, name: 'RytuAI Shop', description: 'Order from ' + currentStoreName, order_id: data.razorpay_order_id,
      prefill: { name: farmer.name, contact: farmer.phone }, theme: { color: '#1a6e35' },
      handler: async function(paymentResponse) { await verifyPayment(paymentResponse.razorpay_order_id, paymentResponse.razorpay_payment_id, paymentResponse.razorpay_signature, data.order_id) },
      modal: { ondismiss: async function() { showToast('Payment cancelled', 'error'); await markPaymentFailed(data.order_id); if (placeBtn) { placeBtn.textContent = 'Place Order'; placeBtn.disabled = false } } }
    }
    var rzp = new window.Razorpay(options)
    rzp.on('payment.failed', async function() { showToast('Payment failed', 'error'); await markPaymentFailed(data.order_id); if (placeBtn) { placeBtn.textContent = 'Place Order'; placeBtn.disabled = false } })
    rzp.open()
  } catch(err) { showToast('Payment failed. Please try again.', 'error'); if (placeBtn) { placeBtn.textContent = 'Place Order'; placeBtn.disabled = false } }
}

async function verifyPayment(rzpOrderId, rzpPaymentId, rzpSignature, orderId) {
  try {
    var response = await fetch(API + '/payment/verify', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + localStorage.getItem('rytuai_token') }, body: JSON.stringify({ razorpay_order_id: rzpOrderId, razorpay_payment_id: rzpPaymentId, razorpay_signature: rzpSignature, order_id: orderId }) })
    var data = await response.json()
    if (response.ok && data.success) { cart = []; updateCartBar(); closeCart(); showOrderSuccess(data.order) }
    else showToast('Payment verification failed.', 'error')
  } catch(err) { showToast('Verification error.', 'error') }
}

async function markPaymentFailed(orderId) {
  try { await fetch(API + '/payment/failed', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + localStorage.getItem('rytuai_token') }, body: JSON.stringify({ order_id: orderId }) }) } catch(err) {}
}

function showOrderSuccess(order) {
  var screen = document.getElementById('order-success-screen'); if (!screen) return
  var idEl = document.getElementById('order-id'); if (idEl) idEl.textContent = '#' + (order ? order.id : '—')
  var payEl = document.getElementById('order-payment-id'); if (payEl && order && order.razorpay_payment_id) { payEl.textContent = 'Payment ID: ' + order.razorpay_payment_id; payEl.style.display = 'block' }
  screen.style.display = 'block'
}

function closeOrderSuccess() { var screen = document.getElementById('order-success-screen'); if (screen) screen.style.display = 'none'; switchScreen('home') }

function getLocationForDelivery() {
  var addressEl = document.getElementById('delivery-address'); if (!addressEl) return
  addressEl.disabled = true
  if (!navigator.geolocation) { addressEl.disabled = false; showToast('Location not supported', 'error'); return }
  navigator.geolocation.getCurrentPosition(
    async function(position) {
      try {
        var res = await fetch('https://nominatim.openstreetmap.org/reverse?lat=' + position.coords.latitude + '&lon=' + position.coords.longitude + '&format=json')
        var data = await res.json(); var addr = data.address; var parts = []
        if (addr.village || addr.town || addr.city) parts.push(addr.village || addr.town || addr.city)
        if (addr.county || addr.state_district) parts.push(addr.county || addr.state_district)
        if (addr.state) parts.push(addr.state)
        addressEl.value = parts.join(', '); addressEl.disabled = false; showToast('Location detected!')
      } catch(e) { addressEl.disabled = false; showToast('Could not detect location', 'error') }
    },
    function() { addressEl.disabled = false; showToast('Location access denied', 'error') }, { timeout: 8000 }
  )
}

function fillAddressFromProfile() {
  var farmerData = localStorage.getItem('rytuai_farmer'); if (!farmerData) return
  var farmer = JSON.parse(farmerData); var addressEl = document.getElementById('delivery-address')
  if (addressEl && !addressEl.value) {
    var parts = []; if (farmer.village) parts.push(farmer.village); if (farmer.district) parts.push(farmer.district); if (farmer.name) parts.push('(' + farmer.name + ')')
    addressEl.value = parts.join(', ')
  }
}

/* ══════════════════════════════════════
   FEED
══════════════════════════════════════ */
var FARMING_TIPS = [
  { icon: '💧', title: 'Irrigation Tip', desc: 'Water your chilli crop early morning or late evening. Avoid midday irrigation to reduce evaporation loss by 30%.' },
  { icon: '🐛', title: 'Thrips Alert', desc: 'Thrips population increases in dry weather. Spray Spinosad 45% SC at 0.3ml/litre water. Repeat after 7 days.' },
  { icon: '🌱', title: 'Fertilizer Schedule', desc: 'Apply DAP 50kg/acre at flowering stage. Foliar spray of 00:52:34 fertilizer improves fruit set significantly.' },
  { icon: '☀️', title: 'Sunlight Management', desc: 'Chilli needs 6-8 hours of direct sunlight. Ensure proper spacing (60cm x 45cm) for maximum sun exposure.' },
  { icon: '🔬', title: 'Disease Prevention', desc: 'Spray Mancozeb 75% WP at 2.5g/litre water to prevent Anthracnose disease. Spray after every rain.' },
  { icon: '📅', title: 'Harvest Timing', desc: 'Harvest chilli when 60-70% fruits turn red. Early morning harvest maintains color and quality better.' }
]

var GOVT_SCHEMES = [
  { title: 'PM-KISAN Samman Nidhi', desc: '₹6,000 per year direct benefit transfer to farmer families in 3 installments of ₹2,000 each.', link: 'https://pmkisan.gov.in' },
  { title: 'AP Rythu Bharosa', desc: 'Andhra Pradesh government provides ₹13,500 per year to each farmer family for farming inputs.', link: 'https://apagrisnet.gov.in' },
  { title: 'Fasal Bima Yojana', desc: 'Crop insurance scheme. Get compensation for crop loss due to natural calamities, pests or diseases.', link: 'https://pmfby.gov.in' },
  { title: 'Kisan Credit Card', desc: 'Get credit up to ₹3 lakhs at 4% interest rate for farming needs. Apply at any bank branch.', link: 'https://www.nabard.org' }
]

async function loadFeed() {
  await Promise.all([loadFeedWeather(), loadFeedPrices(), loadFeedNews()])
}

async function loadFeedWeather() {
  var weatherDiv = document.getElementById('feed-weather-today')
  var forecastDiv = document.getElementById('feed-weather-forecast')
  if (!weatherDiv) return
  try {
    var lat = 16.3008, lon = 80.4428, cityName = 'Guntur'
    if (navigator.geolocation) {
      await new Promise(function(resolve) {
        navigator.geolocation.getCurrentPosition(
          async function(pos) {
            try {
              lat = pos.coords.latitude; lon = pos.coords.longitude
              var geoRes = await fetch('https://nominatim.openstreetmap.org/reverse?lat=' + lat + '&lon=' + lon + '&format=json')
              var geoData = await geoRes.json()
              cityName = geoData.address.village || geoData.address.town || geoData.address.city || geoData.address.county || 'Your Location'
            } catch(e) {}
            resolve()
          },
          function() { resolve() }, { timeout: 8000 }
        )
      })
    }
    var url = 'https://api.open-meteo.com/v1/forecast?latitude=' + lat + '&longitude=' + lon + '&current=temperature_2m,relative_humidity_2m,weathercode,windspeed_10m,precipitation&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=Asia/Kolkata&forecast_days=7'
    var res = await fetch(url); var data = await res.json()
    if (data && data.current) {
      var c = data.current; var temp = Math.round(c.temperature_2m), humidity = c.relative_humidity_2m
      var wind = Math.round(c.windspeed_10m), rain = c.precipitation || 0; var wInfo = getWeatherInfo(c.weathercode)
      var alertHtml = humidity > 80 ? '<div class="wtc-alert">⚠️ Very high humidity — High risk of fungal diseases. Spray fungicide today.</div>' :
        humidity > 65 ? '<div class="wtc-alert">⚠️ Moderate humidity — Monitor crop for disease symptoms.</div>' :
        rain > 5 ? '<div class="wtc-alert">🌧️ Rain expected — Avoid pesticide spray today.</div>' : ''
      weatherDiv.innerHTML = '<div class="wtc-top"><div><div class="wtc-temp">' + temp + '°C</div><div class="wtc-desc">' + wInfo.desc + '</div><div class="wtc-location">📍 ' + cityName + '</div></div><div class="wtc-icon">' + wInfo.icon + '</div></div><div class="wtc-details"><div class="wtc-detail">💧 ' + humidity + '% humidity</div><div class="wtc-detail">💨 ' + wind + ' km/h wind</div><div class="wtc-detail">🌧️ ' + rain + 'mm rain</div></div>' + alertHtml
      if (data.daily && forecastDiv) {
        var days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']; var forecastHtml = ''
        for (var i = 0; i < 7; i++) {
          var d = new Date(data.daily.time[i] + 'T00:00:00'); var dInfo = getWeatherInfo(data.daily.weathercode[i])
          forecastHtml += '<div class="forecast-day"><div class="fc-day">' + (i === 0 ? 'Today' : days[d.getDay()]) + '</div><div class="fc-icon">' + dInfo.icon + '</div><div class="fc-temp">' + Math.round(data.daily.temperature_2m_max[i]) + '°/' + Math.round(data.daily.temperature_2m_min[i]) + '°</div>' + (data.daily.precipitation_sum[i] > 0 ? '<div class="fc-rain">🌧 ' + data.daily.precipitation_sum[i] + 'mm</div>' : '') + '</div>'
        }
        forecastDiv.innerHTML = forecastHtml
      }
    }
  } catch(e) { weatherDiv.innerHTML = '<div style="text-align:center;padding:20px;color:#888;">Weather unavailable</div>' }
}



async function loadFeedNews() {
  var newsDiv = document.getElementById('feed-news')
  if (!newsDiv) return

  newsDiv.innerHTML =
    '<div style="text-align:center;padding:20px;">' +
    '<div class="loader-sm"></div></div>'

  try {
    var res = await fetch(API + '/feed/news')
    var data = await res.json()

    console.log('News articles received:', data.articles?.length || 0)

    if (res.ok && data.articles && data.articles.length > 0) {
      newsDiv.innerHTML = data.articles.map(function(n) {
        var timeAgo = formatNewsDate(n.publishedAt)
        var isAP = n.category === 'AP/TS'

        return '<div ' +
          'onclick="window.open(\'' + n.url + '\', \'_blank\')" ' +
          'style="cursor:pointer;background:white;' +
          'border-radius:14px;padding:14px 16px;' +
          'margin-bottom:10px;border:1.5px solid #e8e0d0;' +
          'border-left:4px solid ' + (isAP ? '#e74c3c' : '#1a6e35') + ';' +
          'display:block;">' +

          // Source + badge + time
          '<div style="display:flex;justify-content:space-between;' +
          'align-items:center;margin-bottom:6px;">' +
          '<div style="display:flex;align-items:center;gap:6px;">' +
          '<div style="font-size:11px;font-weight:800;color:#1a6e35;">' +
          (n.source ? n.source.name : 'News') + '</div>' +
          (isAP ?
            '<div style="background:#ffeaea;color:#e74c3c;' +
            'font-size:9px;font-weight:800;padding:2px 6px;' +
            'border-radius:10px;">🌶️ AP/TS</div>' :
            '<div style="background:#e8f5ee;color:#1a6e35;' +
            'font-size:9px;font-weight:800;padding:2px 6px;' +
            'border-radius:10px;">🇮🇳 India</div>'
          ) +
          '</div>' +
          '<div style="font-size:10px;color:#aaa;">' + timeAgo + '</div>' +
          '</div>' +

          // Title
          '<div style="font-size:13px;font-weight:800;' +
          'color:#1a2e1e;line-height:1.4;margin-bottom:6px;">' +
          n.title + '</div>' +

          // Description
          (n.description ?
            '<div style="font-size:12px;color:#666;' +
            'line-height:1.5;margin-bottom:8px;">' +
            (n.description.length > 100 ?
              n.description.substring(0, 100) + '...' :
              n.description) +
            '</div>' : '') +

          // Read more
          '<div style="font-size:11px;color:#1a6e35;font-weight:700;">' +
          'Read more →</div>' +
          '</div>'
      }).join('')
      return
    }

    // No articles
    newsDiv.innerHTML =
      '<div style="text-align:center;padding:32px;color:#888;">' +
      '<div style="font-size:32px;margin-bottom:8px;">📰</div>' +
      '<div style="font-size:13px;font-weight:700;">No news available</div>' +
      '<div style="font-size:11px;margin-top:4px;">Pull down to refresh</div>' +
      '</div>'

  } catch(e) {
    console.log('News render error:', e.message)
    newsDiv.innerHTML =
      '<div style="text-align:center;padding:32px;color:#888;">' +
      '<div style="font-size:32px;">📰</div>' +
      '<div style="font-size:13px;font-weight:700;margin-top:8px;">' +
      'Cannot load news</div>' +
      '</div>'
  }
}

async function loadCropPrices(cropKey) {
  // Update active tab styles
  var allTabs = ['chilli', 'paddy', 'cotton', 'bengalgram', 'maize', 'groundnut']
  allTabs.forEach(function(key) {
    var tab = document.getElementById('ptab-' + key)
    if (tab) {
      tab.style.background = key === cropKey ? '#1a6e35' : '#f0f0f0'
      tab.style.color = key === cropKey ? 'white' : '#555'
    }
  })

  var listEl = document.getElementById('crop-prices-list')
  if (!listEl) return

  listEl.innerHTML =
    '<div style="text-align:center;padding:20px;">' +
    '<div class="loader-sm"></div></div>'

  try {
    var res = await fetch(API + '/feed/prices/' + cropKey)
    var data = await res.json()

    if (res.ok && data.prices && data.prices.length > 0) {

      // ── TABLE FORMAT ──
      var html =
        '<div style="width:100%;overflow-x:auto;">' +
        '<table style="width:100%;border-collapse:collapse;' +
        'font-family:Nunito,sans-serif;font-size:13px;">' +

        // Table header
        '<thead>' +
        '<tr style="background:#1a6e35;color:white;">' +
        '<th style="padding:10px 12px;text-align:left;' +
        'border-radius:10px 0 0 0;font-size:12px;">రకం / Variety</th>' +
        '<th style="padding:10px 12px;text-align:center;font-size:12px;">కనిష్ట / Min</th>' +
        '<th style="padding:10px 12px;text-align:center;font-size:12px;">గరిష్ట / Max</th>' +
        '<th style="padding:10px 12px;text-align:center;font-size:12px;">మోడల్ / Modal</th>' +
        '<th style="padding:10px 12px;text-align:left;' +
        'border-radius:0 10px 0 0;font-size:12px;">మార్కెట్</th>' +
        '</tr>' +
        '</thead>' +

        // Table body
        '<tbody>' +
        data.prices.map(function(p, index) {
          var isEven = index % 2 === 0
          return '<tr style="background:' + (isEven ? 'white' : '#f8f5f0') + ';' +
            'border-bottom:1px solid #f0ede8;">' +

            // Variety
            '<td style="padding:12px;font-weight:800;color:#1a2e1e;">' +
            p.variety + '</td>' +

            // Min price
            '<td style="padding:12px;text-align:center;color:#888;">' +
            '₹' + p.minPrice.toLocaleString('en-IN') + '</td>' +

            // Max price
            '<td style="padding:12px;text-align:center;color:#888;">' +
            '₹' + p.maxPrice.toLocaleString('en-IN') + '</td>' +

            // Modal price — highlighted
            '<td style="padding:12px;text-align:center;' +
            'font-weight:900;font-size:15px;color:#1a6e35;">' +
            '₹' + p.modalPrice.toLocaleString('en-IN') + '</td>' +

            // Market
            '<td style="padding:12px;font-size:11px;color:#888;">' +
            '📍 ' + p.market + '</td>' +

            '</tr>'
        }).join('') +
        '</tbody>' +
        '</table>' +

        // Footer — last updated
        '<div style="text-align:right;font-size:10px;color:#aaa;' +
        'margin-top:8px;padding:0 4px;">' +
        '🕐 Updated: ' + (data.prices[0].date || 'Today') +
        ' · Per Quintal (₹)' +
        '</div>' +
        '</div>'

      listEl.innerHTML = html

    } else {
      listEl.innerHTML =
        '<div style="text-align:center;padding:32px;color:#888;">' +
        '<div style="font-size:32px;margin-bottom:8px;">📊</div>' +
        '<div style="font-size:13px;font-weight:700;">No prices today</div>' +
        '</div>'
    }
  } catch(e) {
    listEl.innerHTML =
      '<div style="text-align:center;padding:24px;' +
      'color:#888;font-weight:700;">Cannot load prices</div>'
  }
}




function loadStaticPrices(pricesDiv) {
  var prices = [
    { crop: 'Chilli (Teja)', icon: '🌶️', price: 18500,
      change: +500, unit: 'per quintal', market: 'Guntur APMC' },
    { crop: 'Paddy (Sona)', icon: '🌾', price: 2200,
      change: -50, unit: 'per quintal', market: 'Nellore APMC' },
    { crop: 'Cotton', icon: '🌿', price: 6800,
      change: +200, unit: 'per quintal', market: 'Kurnool APMC' },
    { crop: 'Groundnut', icon: '🥜', price: 5200,
      change: 0, unit: 'per quintal', market: 'Anantapur APMC' },
    { crop: 'Maize', icon: '🌽', price: 1850,
      change: -30, unit: 'per quintal', market: 'Nizamabad APMC' },
    { crop: 'Tomato', icon: '🍅', price: 1200,
      change: +300, unit: 'per quintal', market: 'Madanapalle APMC' }
  ]

  pricesDiv.innerHTML = prices.map(function(p) {
    var changeClass = p.change > 0 ? 'price-up' :
                      p.change < 0 ? 'price-down' : 'price-same'
    var changeText = p.change > 0 ? '▲ ₹' + p.change :
                     p.change < 0 ? '▼ ₹' + Math.abs(p.change) :
                     '— No change'
    return '<div class="price-card">' +
      '<div class="price-crop">' + p.icon + ' ' + p.crop + '</div>' +
      '<div class="price-value">₹' + p.price.toLocaleString('en-IN') + '</div>' +
      '<div class="price-unit">' + p.unit + '</div>' +
      '<div class="price-change ' + changeClass + '">' + changeText + '</div>' +
      '<div class="price-market">📍 ' + p.market + '</div>' +
      '</div>'
  }).join('')
}

async function loadFeedPrices() {
  var pricesDiv = document.getElementById('feed-prices')
  if (!pricesDiv) return

  // Tabs row
  var tabsHtml =
    '<div style="display:flex;flex-wrap:nowrap;overflow-x:auto;' +
    'gap:8px;padding-bottom:10px;margin-bottom:16px;' +
    'scrollbar-width:none;-webkit-overflow-scrolling:touch;">' +

    '<button id="ptab-chilli" onclick="loadCropPrices(\'chilli\')" ' +
    'style="flex-shrink:0;padding:7px 16px;border-radius:20px;border:none;' +
    'cursor:pointer;font-size:12px;font-weight:800;' +
    'font-family:Nunito,sans-serif;background:#1a6e35;color:white;">' +
    '🌶️ మిర్చి</button>' +

    '<button id="ptab-paddy" onclick="loadCropPrices(\'paddy\')" ' +
    'style="flex-shrink:0;padding:7px 16px;border-radius:20px;border:none;' +
    'cursor:pointer;font-size:12px;font-weight:800;' +
    'font-family:Nunito,sans-serif;background:#f0f0f0;color:#555;">' +
    '🌾 వరి</button>' +

    '<button id="ptab-cotton" onclick="loadCropPrices(\'cotton\')" ' +
    'style="flex-shrink:0;padding:7px 16px;border-radius:20px;border:none;' +
    'cursor:pointer;font-size:12px;font-weight:800;' +
    'font-family:Nunito,sans-serif;background:#f0f0f0;color:#555;">' +
    '🌿 పత్తి</button>' +

    '<button id="ptab-bengalgram" onclick="loadCropPrices(\'bengalgram\')" ' +
    'style="flex-shrink:0;padding:7px 16px;border-radius:20px;border:none;' +
    'cursor:pointer;font-size:12px;font-weight:800;' +
    'font-family:Nunito,sans-serif;background:#f0f0f0;color:#555;">' +
    '🫘 సెనగలు</button>' +

    '<button id="ptab-maize" onclick="loadCropPrices(\'maize\')" ' +
    'style="flex-shrink:0;padding:7px 16px;border-radius:20px;border:none;' +
    'cursor:pointer;font-size:12px;font-weight:800;' +
    'font-family:Nunito,sans-serif;background:#f0f0f0;color:#555;">' +
    '🌽 మొక్కజొన్న</button>' +

    '<button id="ptab-groundnut" onclick="loadCropPrices(\'groundnut\')" ' +
    'style="flex-shrink:0;padding:7px 16px;border-radius:20px;border:none;' +
    'cursor:pointer;font-size:12px;font-weight:800;' +
    'font-family:Nunito,sans-serif;background:#f0f0f0;color:#555;">' +
    '🥜 వేరుశెనగ</button>' +
    '</div>'

  // Prices list below tabs
  var listHtml = '<div id="crop-prices-list"></div>'

  pricesDiv.style.display = 'flex'
  pricesDiv.style.flexDirection = 'column'
  pricesDiv.style.width = '100%'
  pricesDiv.innerHTML = tabsHtml + listHtml

  // Load chilli by default
  loadCropPrices('chilli')
}

function loadFeedTips() {
  var tipsDiv = document.getElementById('feed-tips'); if (!tipsDiv) return
  var shuffled = FARMING_TIPS.sort(function() { return Math.random() - 0.5 }).slice(0, 3)
  tipsDiv.innerHTML = shuffled.map(function(tip) { return '<div class="tip-card"><div class="tip-icon">' + tip.icon + '</div><div><div class="tip-title">' + tip.title + '</div><div class="tip-desc">' + tip.desc + '</div></div></div>' }).join('')
}



function formatNewsDate(dateStr) {
  if (!dateStr) return ''
  try {
    var date = new Date(dateStr)
    var now = new Date()
    var diff = Math.floor((now - date) / (1000 * 60 * 60))
    if (diff < 1) return 'Just now'
    if (diff < 24) return diff + ' hours ago'
    var days = Math.floor(diff / 24)
    if (days === 1) return 'Yesterday'
    return days + ' days ago'
  } catch(e) { return '' }
}

function loadStaticNews(newsDiv) {
  var news = [
    { source: 'ఈనాడు',
      title: 'గుంటూరు మిర్చి ధరలు పెరుగుతున్నాయి',
      desc: 'గుంటూరు APMC మార్కెట్‌లో మిర్చి ధరలు పెరిగాయి.',
      url: 'https://eenadu.net' },
    { source: 'సాక్షి',
      title: 'రైతులకు PM కిసాన్ డబ్బులు జమ',
      desc: 'పీఎం కిసాన్ పథకం కింద రైతులకు ₹2000 జమ అయ్యింది.',
      url: 'https://sakshi.com' },
    { source: 'ఆంధ్రజ్యోతి',
      title: 'మిర్చి పంటకు త్రిప్స్ తెగులు నివారణ',
      desc: 'గుంటూరు జిల్లాలో మిర్చి పంటకు త్రిప్స్ తెగులు కనిపిస్తోంది.',
      url: 'https://andhrajyothy.com' }
  ]

  newsDiv.innerHTML = news.map(function(n) {
    return '<div class="news-card" onclick="window.open(\'' +
      n.url + '\', \'_blank\')">' +
      '<div class="news-source">' + n.source + '</div>' +
      '<div class="news-title">' + n.title + '</div>' +
      '<div class="news-desc">' + n.desc + '</div>' +
      '</div>'
  }).join('')
}

function loadFeedSchemes() {
  var schemesDiv = document.getElementById('feed-schemes'); if (!schemesDiv) return
  schemesDiv.innerHTML = GOVT_SCHEMES.map(function(s) { return '<div class="scheme-card"><div class="scheme-title">' + s.title + '</div><div class="scheme-desc">' + s.desc + '</div><button class="scheme-btn" onclick="window.open(\'' + s.link + '\', \'_blank\')">Learn More →</button></div>' }).join('')
}

/* ══════════════════════════════════════
   MY ORDERS
══════════════════════════════════════ */
async function loadMyOrders() {
  var farmerData = localStorage.getItem('rytuai_farmer'); if (!farmerData) return
  var farmer = JSON.parse(farmerData)
  var container = document.getElementById('my-orders-list'); if (!container) return
  container.innerHTML = '<div style="text-align:center;padding:40px;"><div class="loader-sm"></div></div>'
  try {
    var res = await fetch(API + '/shop/orders/' + farmer.phone, { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('rytuai_token') } })
    var data = await res.json()
    if (res.ok && data.orders && data.orders.length > 0) renderMyOrders(data.orders)
    else container.innerHTML = '<div style="text-align:center;padding:48px;color:#888;"><div style="font-size:48px;margin-bottom:12px;">📦</div><div style="font-size:16px;font-weight:800;color:#1a2e1e;">No orders yet</div></div>'
  } catch(e) { container.innerHTML = '<div style="text-align:center;padding:40px;color:#e74c3c;font-weight:700;">Cannot load orders</div>' }
}

function renderMyOrders(orders) {
  var container = document.getElementById('my-orders-list'); if (!container) return
  var statusConfig = {
    pending: { label: 'Order Placed', icon: '🕐', color: '#fff3cd', textColor: '#856404' },
    confirmed: { label: 'Confirmed', icon: '✅', color: '#cce5ff', textColor: '#004085' },
    out_for_delivery: { label: 'Out for Delivery', icon: '🚚', color: '#d4edda', textColor: '#155724' },
    delivered: { label: 'Delivered', icon: '🎉', color: '#d4edda', textColor: '#155724' },
    cancelled: { label: 'Cancelled', icon: '❌', color: '#f8d7da', textColor: '#721c24' }
  }
  container.innerHTML = orders.map(function(order) {
    var sc = statusConfig[order.status] || statusConfig['pending']
    var items = []; try { items = typeof order.items === 'string' ? JSON.parse(order.items) : (order.items || []) } catch(e) {}
    var itemsText = items.map(function(i) { return i.name + ' x' + i.qty }).join(', ')
    var time = order.created_at ? new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'
    return '<div style="background:white;border-radius:14px;padding:16px;margin-bottom:10px;border:1.5px solid #e8e0d0;"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;"><div style="font-size:14px;font-weight:800;">Order #' + order.id + '</div><div style="background:' + sc.color + ';color:' + sc.textColor + ';font-size:11px;font-weight:800;padding:4px 10px;border-radius:20px;">' + sc.icon + ' ' + sc.label + '</div></div><div style="font-size:12px;color:#888;margin-bottom:8px;">🕐 ' + time + '</div><div style="font-size:13px;color:#444;background:#f8f5f0;border-radius:8px;padding:10px;margin-bottom:8px;">🛒 ' + itemsText + '</div><div style="display:flex;justify-content:space-between;align-items:center;"><div style="font-size:12px;color:#888;">📍 ' + (order.delivery_address || '—') + '</div><div style="font-size:16px;font-weight:900;color:#1a6e35;">₹' + order.total_amount + '</div></div>' + renderOrderProgress(order.status) + '</div>'
  }).join('')
}

function renderOrderProgress(status) {
  var steps = ['pending', 'confirmed', 'out_for_delivery', 'delivered']
  var labels = ['Placed', 'Confirmed', 'On Way', 'Delivered']
  var currentIndex = steps.indexOf(status)
  if (status === 'cancelled') return '<div style="margin-top:12px;background:#ffeaea;border-radius:8px;padding:8px 12px;font-size:12px;font-weight:700;color:#e74c3c;text-align:center;">❌ Order Cancelled</div>'
  var stepsHtml = steps.map(function(step, i) {
    var isDone = i <= currentIndex
    return '<div style="display:flex;flex-direction:column;align-items:center;flex:1;"><div style="width:20px;height:20px;border-radius:50%;background:' + (isDone ? '#1a6e35' : '#e0e0e0') + ';display:flex;align-items:center;justify-content:center;font-size:10px;color:white;font-weight:800;">' + (isDone ? '✓' : (i + 1)) + '</div><div style="font-size:9px;font-weight:700;color:' + (isDone ? '#1a6e35' : '#aaa') + ';margin-top:3px;text-align:center;">' + labels[i] + '</div></div>'
  }).join('')
  return '<div style="margin-top:12px;"><div style="display:flex;align-items:center;position:relative;"><div style="position:absolute;top:10px;left:10%;right:10%;height:2px;background:#e0e0e0;z-index:0;"></div><div style="position:absolute;top:10px;left:10%;height:2px;background:#1a6e35;z-index:1;width:' + (currentIndex / 3 * 80) + '%;"></div><div style="display:flex;justify-content:space-between;width:100%;position:relative;z-index:2;">' + stepsHtml + '</div></div></div>'
}

function closeMyOrders() { var screen = document.getElementById('my-orders-screen'); if (screen) screen.style.display = 'none' }

/* ══════════════════════════════════════
   SCAN HISTORY + PESTICIDE SELECTION
══════════════════════════════════════ */
var selectedScanPesticides = [], selectedShopId = null, selectedShopName = null
var cachedScans = null, lastScanLoadTime = 0

async function addScanActionButtons(r) {
  var resultBody = document.querySelector('#result-content .result-body'); if (!resultBody) return
  var existing = document.getElementById('scan-action-btns'); if (existing) existing.remove()
  var div = document.createElement('div'); div.id = 'scan-action-btns'
  if (!r.healthy && r.pesticides && r.pesticides.length > 0) {
    div.innerHTML = '<div style="background:#e8f5ee;border-radius:12px;padding:14px;margin-top:16px;border:1.5px solid #c8ddc8;"><div style="font-size:13px;font-weight:800;color:#1a6e35;margin-bottom:4px;">💊 Recommended Pesticides</div><div style="font-size:11px;color:#888;margin-bottom:10px;">Select pesticides from available shops</div><div id="scan-pesticide-list"><div style="text-align:center;padding:16px;"><div class="loader-sm"></div></div></div><div id="scan-cart-info" style="display:none;background:#1a6e35;border-radius:10px;padding:12px;margin-top:10px;color:white;font-size:12px;font-weight:700;"></div><button onclick="goToShopWithSelectedPesticides()" id="scan-order-btn" style="display:none;width:100%;padding:14px;background:#1a6e35;color:white;border:none;border-radius:12px;font-size:14px;font-weight:800;font-family:Nunito,sans-serif;cursor:pointer;margin-top:10px;">🛒 Add to Cart & Order</button></div>'
    resultBody.appendChild(div)
    await searchPesticidesFromShops(r.pesticides)
  } else if (r.healthy) {
    div.innerHTML = '<div style="background:#e8f5ee;border-radius:12px;padding:16px;margin-top:16px;text-align:center;border:1.5px solid #c8ddc8;"><div style="font-size:28px;margin-bottom:8px;">🎉</div><div style="font-size:14px;font-weight:800;color:#1a6e35;">' + t('healthy_msg') + '</div><div style="font-size:12px;color:#555;margin-top:4px;font-family:Tiro Telugu,serif;">' + t('healthy_telugu') + '</div></div>'
    resultBody.appendChild(div)
  }
}

async function searchPesticidesFromShops(aiPesticides) {
  var container = document.getElementById('scan-pesticide-list'); if (!container) return
  try {
    var pestNames = aiPesticides.map(function(p) { return p.name })
    var res = await fetch(API + '/detect/search-pesticides', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + localStorage.getItem('rytuai_token') }, body: JSON.stringify({ pesticide_names: pestNames }) })
    var data = await res.json()
    renderPesticideShopList(aiPesticides, data.matched || {})
  } catch(e) { renderPesticideShopList(aiPesticides, {}) }
}

function renderPesticideShopList(aiPesticides, matched) {
  var container = document.getElementById('scan-pesticide-list'); if (!container) return
  selectedScanPesticides = []; var html = ''
  aiPesticides.forEach(function(aiPest, pestIdx) {
    var shopOptions = matched[aiPest.name] || []
    html += '<div style="margin-bottom:14px;"><div style="font-size:13px;font-weight:800;color:#1a2e1e;margin-bottom:6px;">' + (aiPest.icon || '🧴') + ' ' + aiPest.name + '</div>' +
      (aiPest.usageTelugu ? '<div style="font-size:11px;color:#555;font-family:Tiro Telugu,serif;margin-bottom:6px;padding:6px 8px;background:#f8f8f8;border-radius:6px;">' + aiPest.usageTelugu + '</div>' : '') +
      (shopOptions.length > 0 ?
        '<div style="font-size:10px;font-weight:800;color:#888;text-transform:uppercase;margin-bottom:4px;">Available in shops:</div>' +
        shopOptions.map(function(product) {
          var disc = product.mrp ? Math.round((1 - product.price / product.mrp) * 100) : 0
          var itemKey = pestIdx + '_' + product.id + '_' + product.stores.id
          var pJson = JSON.stringify(product).replace(/"/g,'&quot;'); var aJson = JSON.stringify(aiPest).replace(/"/g,'&quot;')
          return '<div id="pest-option-' + itemKey + '" style="background:white;border-radius:8px;padding:10px;margin-bottom:6px;border:2px solid #e0e0e0;cursor:pointer;" onclick="selectPesticideOption(\'' + itemKey + '\',' + pestIdx + ',' + pJson + ',' + aJson + ')"><div style="display:flex;align-items:center;gap:8px;"><div id="pest-check-' + itemKey + '" style="width:20px;height:20px;border-radius:50%;border:2px solid #ccc;display:flex;align-items:center;justify-content:center;font-size:10px;flex-shrink:0;">○</div><div style="flex:1;"><div style="font-size:12px;font-weight:800;">' + product.name + '</div><div style="font-size:10px;color:#888;">🏪 ' + product.stores.name + ' · ' + (product.unit || '') + '</div></div><div style="text-align:right;"><div style="font-size:14px;font-weight:900;color:#1a6e35;">₹' + (parseFloat(product.price) || 0) + '</div>' + (product.mrp ? '<div style="font-size:10px;color:#aaa;text-decoration:line-through;">₹' + product.mrp + '</div>' : '') + (disc > 0 ? '<div style="font-size:9px;color:#e74c3c;font-weight:800;">' + disc + '% OFF</div>' : '') + '</div></div></div>'
        }).join('') :
        '<div style="background:#fff8e1;border-radius:8px;padding:10px;font-size:12px;color:#856404;border:1px solid #ffe082;">⚠️ Not available in shops currently.</div>'
      ) + '</div>'
  })
  container.innerHTML = html
}

function selectPesticideOption(itemKey, pestIdx, product, aiPest) {
  if (selectedShopId && selectedShopId !== product.stores.id) { showShopConflictWarning(product.stores.id, product.stores.name, itemKey, pestIdx, product, aiPest); return }
  togglePesticideOption(itemKey, pestIdx, product, aiPest)
}

function togglePesticideOption(itemKey, pestIdx, product, aiPest) {
  var card = document.getElementById('pest-option-' + itemKey); var check = document.getElementById('pest-check-' + itemKey)
  if (!card || !check) return
  var existingIdx = selectedScanPesticides.findIndex(function(p) { return p.pestIdx === pestIdx })
  var isSelected = existingIdx >= 0 && selectedScanPesticides[existingIdx].itemKey === itemKey
  if (isSelected) {
    selectedScanPesticides.splice(existingIdx, 1); card.style.border = '2px solid #e0e0e0'
    check.textContent = '○'; check.style.background = 'white'; check.style.borderColor = '#ccc'; check.style.color = '#ccc'
  } else {
    if (existingIdx >= 0) {
      var prevKey = selectedScanPesticides[existingIdx].itemKey
      var prevCard = document.getElementById('pest-option-' + prevKey); var prevCheck = document.getElementById('pest-check-' + prevKey)
      if (prevCard) prevCard.style.border = '2px solid #e0e0e0'
      if (prevCheck) { prevCheck.textContent = '○'; prevCheck.style.background = 'white'; prevCheck.style.borderColor = '#ccc' }
      selectedScanPesticides.splice(existingIdx, 1)
    }
    selectedScanPesticides.push({ itemKey, pestIdx, id: product.id, name: product.name, price: parseFloat(product.price) || 0, storeId: product.stores.id, storeName: product.stores.name, qty: 1 })
    selectedShopId = product.stores.id; selectedShopName = product.stores.name
    card.style.border = '2px solid #1a6e35'; check.textContent = '✓'; check.style.background = '#1a6e35'; check.style.borderColor = '#1a6e35'; check.style.color = 'white'
  }
  if (selectedScanPesticides.length === 0) { selectedShopId = null; selectedShopName = null }
  updateScanOrderButton()
}

function updateScanOrderButton() {
  var btn = document.getElementById('scan-order-btn'); var info = document.getElementById('scan-cart-info')
  if (selectedScanPesticides.length === 0) { if (btn) btn.style.display = 'none'; if (info) info.style.display = 'none'; return }
  var total = selectedScanPesticides.reduce(function(sum, p) { return sum + p.price }, 0)
  if (info) { info.style.display = 'block'; info.innerHTML = '🏪 ' + selectedShopName + ' · ' + selectedScanPesticides.length + ' item(s) · ₹' + total }
  if (btn) { btn.style.display = 'block'; btn.textContent = '🛒 Add ' + selectedScanPesticides.length + ' Item(s) to Cart' }
}

function showShopConflictWarning(newShopId, newShopName, itemKey, pestIdx, product, aiPest) {
  var old = document.getElementById('shop-conflict-box'); if (old) old.remove()
  var box = document.createElement('div'); box.id = 'shop-conflict-box'
  box.style.cssText = 'position:fixed;bottom:90px;left:16px;right:16px;background:white;border-radius:16px;padding:20px;z-index:99999;box-shadow:0 8px 32px rgba(0,0,0,0.2);border:1.5px solid #e8e0d0;'
  var pJson = JSON.stringify(product).replace(/"/g,'&quot;'); var aJson = JSON.stringify(aiPest).replace(/"/g,'&quot;')
  box.innerHTML = '<div style="font-size:14px;font-weight:800;margin-bottom:8px;">🏪 Different Shop</div><div style="font-size:12px;color:#555;margin-bottom:14px;">Your selections are from <strong>' + selectedShopName + '</strong>. Switch to <strong>' + newShopName + '</strong>?</div><div style="display:flex;gap:10px;"><button onclick="document.getElementById(\'shop-conflict-box\').remove()" style="flex:1;padding:12px;background:#f5f5f5;color:#555;border:none;border-radius:10px;font-size:13px;font-weight:700;font-family:Nunito,sans-serif;cursor:pointer;">Keep Current</button><button onclick="clearAndSelectNewShop(\'' + itemKey + '\',' + pestIdx + ',' + pJson + ',' + aJson + ')" style="flex:1;padding:12px;background:#1a6e35;color:white;border:none;border-radius:10px;font-size:13px;font-weight:700;font-family:Nunito,sans-serif;cursor:pointer;">Switch Shop</button></div>'
  document.body.appendChild(box)
}

function clearAndSelectNewShop(itemKey, pestIdx, product, aiPest) {
  var box = document.getElementById('shop-conflict-box'); if (box) box.remove()
  selectedScanPesticides.forEach(function(p) {
    var c = document.getElementById('pest-option-' + p.itemKey); var ch = document.getElementById('pest-check-' + p.itemKey)
    if (c) c.style.border = '2px solid #e0e0e0'
    if (ch) { ch.textContent = '○'; ch.style.background = 'white'; ch.style.borderColor = '#ccc' }
  })
  selectedScanPesticides = []; selectedShopId = null; selectedShopName = null; cart = []; updateCartBar()
  togglePesticideOption(itemKey, pestIdx, product, aiPest)
}

function goToShopWithSelectedPesticides() {
  if (selectedScanPesticides.length === 0) { showToast('Please select at least one pesticide', 'error'); return }
  currentStoreId = selectedShopId; currentStoreName = selectedShopName
  selectedScanPesticides.forEach(function(p) { if (!cart.find(function(c) { return String(c.id) === String(p.id) })) cart.push({ id: p.id, name: p.name, price: p.price, qty: 1 }) })
  updateCartBar(); showToast(selectedScanPesticides.length + ' item(s) added!')
  setTimeout(function() { switchScreen('shop'); setTimeout(function() { openStore(selectedShopId, selectedShopName) }, 300) }, 1000)
}

async function loadScanHistory() {
  var container = document.getElementById('scan-history-list')
  if (!container) return
  var farmerData = localStorage.getItem('rytuai_farmer')
  if (!farmerData) return
  var farmer = JSON.parse(farmerData)

  var now = Date.now()
  if (cachedScans && (now - lastScanLoadTime) < 60000) {
    renderScanHistory(cachedScans)
    return
  }

  container.innerHTML = '<div style="text-align:center;padding:20px;"><div class="loader-sm"></div></div>'

  try {
    // Only filter by field if field has scans
    var fieldParam = currentFieldId ? '?field_id=' + currentFieldId : ''
    var res = await fetch(API + '/detect/history/' + farmer.phone + fieldParam, {
      headers: { 'Authorization': 'Bearer ' + localStorage.getItem('rytuai_token') }
    })
    var data = await res.json()

    if (res.ok && data.scans && data.scans.length > 0) {
      cachedScans = data.scans
      lastScanLoadTime = Date.now()
      renderScanHistory(data.scans)
    } else {
      // If no scans for this field — try without field filter
      if (currentFieldId && fieldParam) {
        console.log('No scans for field', currentFieldId, '— loading all scans')
        var res2 = await fetch(API + '/detect/history/' + farmer.phone, {
          headers: { 'Authorization': 'Bearer ' + localStorage.getItem('rytuai_token') }
        })
        var data2 = await res2.json()
        if (res2.ok && data2.scans && data2.scans.length > 0) {
          cachedScans = data2.scans
          lastScanLoadTime = Date.now()
          renderScanHistory(data2.scans)
          return
        }
      }
      cachedScans = []
      container.innerHTML =
        '<div style="text-align:center;padding:32px;color:#888;">' +
        '<div style="font-size:32px;margin-bottom:8px;">🔬</div>' +
        '<div style="font-size:13px;font-weight:700;">' +
        (currentLang === 'te' ? 'ఇంకా స్కాన్‌లు లేవు' : 'No scans yet') +
        '</div></div>'
    }
  } catch(e) {
    if (cachedScans && cachedScans.length > 0) renderScanHistory(cachedScans)
    else container.innerHTML = '<div style="text-align:center;padding:20px;color:#888;font-weight:700;">Cannot load scan history</div>'
  }
}

function renderScanHistory(scans) {
  var container = document.getElementById('scan-history-list'); if (!container) return
  container.innerHTML = scans.map(function(scan) {
    var date = scan.created_at ? new Date(scan.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '—'
    var severityColor = scan.healthy ? '#1a6e35' : scan.severity === 'Low' ? '#f5a623' : '#e74c3c'
    var pesticides = []; try { pesticides = typeof scan.pesticides === 'string' ? JSON.parse(scan.pesticides) : (scan.pesticides || []) } catch(e) {}
    var pestNames = pesticides.slice(0, 2).map(function(p) { return p.name }).join(', ')
    if (pesticides.length > 2) pestNames += ' +' + (pesticides.length - 2) + ' more'
    var shortSummary = scan.telugu_summary ? scan.telugu_summary.substring(0, 80) + '...' : ''
    return '<div style="background:white;border-radius:12px;padding:12px 14px;margin-bottom:8px;border:1.5px solid #e8e0d0;border-left:4px solid ' + severityColor + ';"><div style="display:flex;justify-content:space-between;align-items:flex-start;"><div style="flex:1;"><div style="font-size:13px;font-weight:800;color:#1a2e1e;">' + (scan.healthy ? '✅ ' : '🦠 ') + scan.disease + '</div>' + (scan.telugu_name ? '<div style="font-size:12px;color:#1a6e35;font-family:Tiro Telugu,serif;">' + scan.telugu_name + '</div>' : '') + (shortSummary ? '<div style="font-size:11px;color:#666;font-family:Tiro Telugu,serif;margin-top:4px;line-height:1.5;">' + shortSummary + '</div>' : '') + (pestNames ? '<div style="font-size:11px;color:#888;margin-top:4px;">💊 ' + pestNames + '</div>' : '') + '</div><div style="text-align:right;flex-shrink:0;margin-left:8px;"><div style="font-size:10px;color:#888;">' + date + '</div>' + (scan.severity ? '<div style="font-size:10px;font-weight:700;color:' + severityColor + ';margin-top:2px;">' + scan.severity + '</div>' : '') + '</div></div></div>'
  }).join('')
}

/* ══════════════════════════════════════
   SCAN UPGRADE UI
══════════════════════════════════════ */
function showScanUpgradeUI() {
  switchScreen('result')
  var content = document.getElementById('result-content'); var loading = document.getElementById('result-loading'); var error = document.getElementById('result-error')
  if (loading) loading.style.display = 'none'; if (error) error.style.display = 'none'; if (!content) return
  content.style.display = 'block'
  content.innerHTML = '<div style="text-align:center;padding:32px 24px;"><div style="font-size:56px;margin-bottom:12px;">🔬</div><div style="font-size:20px;font-weight:900;color:#1a2e1e;margin-bottom:6px;">Free Scans Finished!</div><div style="font-size:13px;color:#888;margin-bottom:4px;">You have used all 2 free scans this month.</div><div style="font-size:12px;color:#1a6e35;font-family:Tiro Telugu,serif;margin-bottom:24px;">ఈ నెల మీ 2 ఉచిత స్కాన్‌లు పూర్తయ్యాయి</div>' +
    '<div style="background:white;border-radius:14px;padding:16px;border:2px solid #e8e0d0;text-align:left;margin-bottom:12px;"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;"><div><div style="font-size:15px;font-weight:800;">🔬 1 Extra Scan</div><div style="font-size:12px;color:#888;margin-top:2px;">Single scan credit</div></div><div style="font-size:22px;font-weight:900;color:#1a6e35;">₹29</div></div><button onclick="buyScanPlan(\'pay_per_scan\')" style="width:100%;padding:12px;background:#1a6e35;color:white;border:none;border-radius:10px;font-size:14px;font-weight:800;font-family:Nunito,sans-serif;cursor:pointer;">Buy 1 Scan — ₹29</button></div>' +
    '<div style="background:white;border-radius:14px;padding:16px;border:2px solid #1a6e35;text-align:left;margin-bottom:12px;"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;"><div><div style="font-size:15px;font-weight:800;">🔬 5 Scan Pack</div><div style="font-size:12px;color:#1a6e35;margin-top:2px;">Best value — ₹19.8 per scan</div></div><div style="font-size:22px;font-weight:900;color:#1a6e35;">₹99</div></div><button onclick="buyScanPlan(\'scan_pack_5\')" style="width:100%;padding:12px;background:#1a6e35;color:white;border:none;border-radius:10px;font-size:14px;font-weight:800;font-family:Nunito,sans-serif;cursor:pointer;">Buy 5 Scans — ₹99</button></div>' +
    '<div style="background:linear-gradient(135deg,#0d3d1e,#1a6e35);border-radius:14px;padding:16px;text-align:left;margin-bottom:20px;"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;"><div><div style="font-size:15px;font-weight:800;color:white;">⭐ Unlimited Monthly</div><div style="font-size:12px;color:#a8e6bc;margin-top:2px;">Unlimited scans for 30 days</div></div><div style="font-size:22px;font-weight:900;color:#f5a623;">₹99</div></div><button onclick="buyScanPlan(\'unlimited\')" style="width:100%;padding:12px;background:#f5a623;color:#0d3d1e;border:none;border-radius:10px;font-size:14px;font-weight:800;font-family:Nunito,sans-serif;cursor:pointer;">Go Unlimited — ₹99/month</button></div>' +
    '<button onclick="resetAndScan()" style="width:100%;padding:12px;background:#f0f0f0;color:#555;border:none;border-radius:10px;font-size:13px;font-weight:700;font-family:Nunito,sans-serif;cursor:pointer;">← Back to Detect</button></div>'
}

async function buyScanPlan(plan) {
  var farmerData = localStorage.getItem('rytuai_farmer'); if (!farmerData) { showToast('Please login again', 'error'); return }
  var farmer = JSON.parse(farmerData)
  try {
    var loaded = await loadRazorpayScript(); if (!loaded) { showToast('Payment service unavailable', 'error'); return }
    var response = await fetch(API + '/payment/subscribe', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + localStorage.getItem('rytuai_token') }, body: JSON.stringify({ farmer_id: farmer.phone, plan }) })
    var data = await response.json(); if (!response.ok) { showToast(data.message || 'Failed', 'error'); return }
    var options = {
      key: data.key_id, amount: data.amount, currency: data.currency, name: 'RytuAI', description: data.label, order_id: data.razorpay_order_id,
      prefill: { name: farmer.name, contact: farmer.phone }, theme: { color: '#1a6e35' },
      handler: async function(paymentResponse) {
        var verifyRes = await fetch(API + '/payment/subscribe/verify', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + localStorage.getItem('rytuai_token') }, body: JSON.stringify({ razorpay_order_id: paymentResponse.razorpay_order_id, razorpay_payment_id: paymentResponse.razorpay_payment_id, razorpay_signature: paymentResponse.razorpay_signature, farmer_id: farmer.phone, plan }) })
        var verifyData = await verifyRes.json()
        if (verifyData.success) { showToast('✅ Plan activated! You can scan now.'); setTimeout(function() { resetAndScan() }, 1500) }
        else showToast('Payment verification failed', 'error')
      }
    }
    var rzp = new window.Razorpay(options); rzp.open()
  } catch(err) { showToast('Payment failed. Try again.', 'error') }
}


async function loadFields() {
  var farmer = JSON.parse(localStorage.getItem('rytuai_farmer'))
  if (!farmer) return
  try {
    var res = await fetch(API + '/fields/' + farmer.phone, {
      headers: { 'Authorization': 'Bearer ' + localStorage.getItem('rytuai_token') }
    })
    var data = await res.json()
    allFields = data.fields || []

    // Restore saved field or default to first
    var savedFieldId = parseInt(localStorage.getItem('rytuai_current_field'))
    var savedExists = allFields.find(function(f) { return f.id === savedFieldId })

    if (savedExists) {
      currentFieldId = savedFieldId  // restore previously selected field
    } else if (allFields.length > 0) {
      currentFieldId = allFields[0].id  // default to first field
      localStorage.setItem('rytuai_current_field', String(currentFieldId))
    }

    updateFieldSelector()
    loadFarmerData()
  } catch(e) {
    console.log('Fields load error:', e)
  }
}

function updateFieldSelector() {
  if (allFields.length === 0) return

  var currentField = allFields.find(function(f) {
    return f.id === currentFieldId
  }) || allFields[0]

  var daysOld = currentField.sowing_date
    ? Math.floor((new Date() - new Date(currentField.sowing_date)) / (1000 * 60 * 60 * 24))
    : null

  // Full width card style
  var html =
    '<div onclick="openFieldPicker()" ' +
    'style="display:flex;align-items:center;justify-content:space-between;' +
    'background:#f0f9f3;border:1.5px solid #1a6e35;' +
    'border-radius:14px;padding:12px 16px;cursor:pointer;' +
    'width:100%;box-sizing:border-box;">' +

    // Left — field info
    '<div style="display:flex;align-items:center;gap:12px;">' +
    '<div style="background:#1a6e35;border-radius:10px;' +
    'width:40px;height:40px;display:flex;align-items:center;' +
    'justify-content:center;font-size:20px;flex-shrink:0;">🌾</div>' +
    '<div>' +
    '<div style="font-size:15px;font-weight:900;color:#1a2e1e;">' +
    currentField.field_name + '</div>' +
    '<div style="font-size:12px;color:#555;margin-top:2px;">' +
    currentField.crop_type +
    ' · ' + currentField.land_acres + ' ' + t('acres') +
    (currentField.village ? ' · ' + currentField.village : '') +
    '</div>' +
    (daysOld !== null ?
      '<div style="font-size:11px;color:#1a6e35;font-weight:700;margin-top:2px;">' +
      '📅 Day ' + daysOld + ' of season</div>' : '') +
    '</div>' +
    '</div>' +

    // Right — switch arrow
    '<div style="display:flex;flex-direction:column;align-items:center;' +
    'background:#1a6e35;border-radius:8px;padding:6px 10px;">' +
    '<span style="font-size:11px;color:white;font-weight:800;">Switch</span>' +
    '<span style="font-size:16px;color:white;">▾</span>' +
    '</div>' +

    '</div>' +

    // Show all fields count below
    (allFields.length > 1 ?
      '<div style="font-size:11px;color:#888;margin-top:6px;' +
      'text-align:center;font-weight:600;">' +
      '📋 ' + allFields.length + ' fields — tap to switch' +
      '</div>' : '')

  // Update mobile
  var mobile = document.getElementById('field-selector')
  if (mobile) mobile.innerHTML = html

  // Update desktop
  var desktop = document.getElementById('field-selector-desktop')
  if (desktop) desktop.innerHTML = html
}

function openFieldPicker() {
  var existing = document.getElementById('field-picker-overlay')
  if (existing) existing.remove()

  var overlay = document.createElement('div')
  overlay.id = 'field-picker-overlay'
  overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;' +
    'background:rgba(0,0,0,0.5);z-index:9000;display:flex;' +
    'align-items:flex-end;'

  var sheet = document.createElement('div')
  sheet.style.cssText = 'background:white;border-radius:24px 24px 0 0;' +
    'width:100%;padding:20px;max-height:70vh;overflow-y:auto;'

  var html = '<div style="text-align:center;margin-bottom:16px;">' +
    '<div style="width:40px;height:4px;background:#e0e0e0;' +
    'border-radius:2px;margin:0 auto 16px;"></div>' +
    '<div style="font-size:16px;font-weight:900;color:#1a2e1e;">Select Field</div>' +
    '</div>'

  allFields.forEach(function(field) {
  var isActive = field.id === currentFieldId
  var daysOld = field.sowing_date ?
    Math.floor((new Date() - new Date(field.sowing_date)) / (1000 * 60 * 60 * 24)) : null

  html += '<div style="' +
    'padding:16px;border-radius:14px;margin-bottom:10px;' +
    'border:2px solid ' + (isActive ? '#1a6e35' : '#e8e0d0') + ';' +
    'background:' + (isActive ? '#e8f5ee' : 'white') + ';">' +

    '<div style="display:flex;justify-content:space-between;align-items:center;">' +
    '<div onclick="selectField(' + field.id + ')" style="flex:1;cursor:pointer;">' +
    '<div style="font-size:15px;font-weight:800;color:#1a2e1e;">🌾 ' + field.field_name + '</div>' +
    '<div style="font-size:12px;color:#888;margin-top:2px;">' +
    field.crop_type + ' · ' + field.land_acres + ' acres' +
    (field.village ? ' · ' + field.village : '') + '</div>' +
    (daysOld !== null ?
      '<div style="font-size:11px;color:#1a6e35;margin-top:2px;">' +
      daysOld + ' days since sowing</div>' : '') +
    '</div>' +

    '<div style="display:flex;align-items:center;gap:8px;">' +
    (isActive ? '<span style="color:#1a6e35;font-size:20px;">✓</span>' : '') +

    // ── DELETE BUTTON ──
    (allFields.length > 1 ?
      '<button onclick="deleteField(' + field.id + ', \'' + field.field_name + '\')" style="' +
      'background:#ffeaea;border:none;border-radius:8px;' +
      'padding:6px 10px;font-size:12px;cursor:pointer;color:#e74c3c;' +
      'font-weight:700;font-family:Nunito,sans-serif;">🗑️</button>' : '') +
    '</div>' +

    '</div>' +
    '</div>'
})

  // Add new field button
  html += '<button onclick="openAddField()" style="' +
    'width:100%;padding:14px;margin-top:8px;' +
    'background:#1a6e35;color:white;border:none;' +
    'border-radius:12px;font-size:14px;font-weight:800;' +
    'font-family:Nunito,sans-serif;cursor:pointer;">' +
    '+ Add New Field' +
    '</button>'

  html += '<button onclick="closeFieldPicker()" style="' +
    'width:100%;padding:12px;margin-top:8px;' +
    'background:#f0f0f0;color:#555;border:none;' +
    'border-radius:12px;font-size:13px;font-weight:700;' +
    'font-family:Nunito,sans-serif;cursor:pointer;">' +
    'Cancel' +
    '</button>'

  sheet.innerHTML = html
  overlay.appendChild(sheet)
  document.body.appendChild(overlay)
  overlay.onclick = function(e) {
    if (e.target === overlay) closeFieldPicker()
  }
}
async function deleteField(fieldId, fieldName) {
  // Confirm before deleting
  var confirmed = await showConfirm(
    currentLang === 'te'
      ? fieldName + ' పొలం తొలగించాలా?'
      : 'Delete field "' + fieldName + '"?'
  )
  if (!confirmed) return

  try {
    var res = await fetch(API + '/fields/' + fieldId, {
      method: 'DELETE',
      headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('rytuai_token')
      }
    })

    var data = await res.json()

    if (res.ok) {
      // Remove from local array
      allFields = allFields.filter(function(f) { return f.id !== fieldId })

      // If deleted field was active — switch to first field
      if (currentFieldId === fieldId && allFields.length > 0) {
        currentFieldId = allFields[0].id
        localStorage.setItem('rytuai_current_field', String(currentFieldId))
      }

      closeFieldPicker()
      updateFieldSelector()
      loadFarmerData()
      showToast(
        currentLang === 'te'
          ? 'పొలం తొలగించబడింది!'
          : 'Field deleted!'
      )
    } else {
      showToast(data.message || 'Failed to delete', 'error')
    }
  } catch(e) {
    showToast('Cannot connect to server', 'error')
  }
}

function closeFieldPicker() {
  var overlay = document.getElementById('field-picker-overlay')
  if (overlay) overlay.remove()
}

function selectField(fieldId) {
  currentFieldId = fieldId
  localStorage.setItem('rytuai_current_field', String(fieldId))
  closeFieldPicker()
  updateFieldSelector()
  loadFarmerData()

  // Reset scan cache so it reloads for new field
  cachedScans = null
  lastScanLoadTime = 0

  // If currently on tracker — reload immediately
  if (currentScreen === 'tracker') {
    loadActivities()
    loadScanHistory()
  }

  showToast(currentLang === 'te' ? '🌾 పొలం మార్చబడింది!' : '🌾 Field changed!')
}

function openAddField() {
  closeFieldPicker()

  var existing = document.getElementById('add-field-overlay')
  if (existing) existing.remove()

  var overlay = document.createElement('div')
  overlay.id = 'add-field-overlay'
  overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;' +
    'background:rgba(0,0,0,0.5);z-index:9001;display:flex;' +
    'align-items:flex-end;'

  overlay.innerHTML =
    '<div style="background:white;border-radius:24px 24px 0 0;' +
    'width:100%;padding:24px;max-height:85vh;overflow-y:auto;">' +

    '<div style="font-size:18px;font-weight:900;color:#1a2e1e;margin-bottom:20px;">' +
    '🌾 Add New Field</div>' +

    '<label style="font-size:12px;font-weight:700;color:#555;">Field Name *</label>' +
    '<input id="new-field-name" class="login-input" ' +
    'placeholder="e.g. North Field, Field 2" style="margin-bottom:12px;">' +

    '<label style="font-size:12px;font-weight:700;color:#555;">Crop Type *</label>' +
    '<select id="new-field-crop" class="login-input" style="margin-bottom:12px;">' +
    '<option value="">Select Crop</option>' +
    '<option value="Chilli">🌶️ Chilli</option>' +
    '<option value="Paddy">🌾 Paddy</option>' +
    '<option value="Cotton">Cotton</option>' +
    '<option value="Maize">🌽 Maize</option>' +
    '<option value="Groundnut">Groundnut</option>' +
    '<option value="Sunflower">🌻 Sunflower</option>' +
    '<option value="Tobacco">Tobacco</option>' +
    '<option value="Other">Other</option>' +
    '</select>' +

    '<label style="font-size:12px;font-weight:700;color:#555;">Land Area (Acres) *</label>' +
    '<input id="new-field-acres" type="number" class="login-input" ' +
    'placeholder="e.g. 5.5" style="margin-bottom:12px;">' +

    '<label style="font-size:12px;font-weight:700;color:#555;">Village</label>' +
    '<input id="new-field-village" class="login-input" ' +
    'placeholder="Village name" style="margin-bottom:12px;">' +

    '<label style="font-size:12px;font-weight:700;color:#555;">Sowing Date</label>' +
    '<input id="new-field-sowing" type="text" class="login-input" ' +
    'placeholder="🌱 Sowing Date" ' +
    'onfocus="this.type=\'date\'" ' +
    'onblur="if(!this.value)this.type=\'text\'" ' +
    'style="margin-bottom:20px;">' +

    '<button onclick="saveNewField()" style="width:100%;padding:14px;' +
    'background:#1a6e35;color:white;border:none;border-radius:12px;' +
    'font-size:15px;font-weight:800;font-family:Nunito,sans-serif;' +
    'cursor:pointer;margin-bottom:10px;">Save Field</button>' +

    '<button onclick="closeAddField()" style="width:100%;padding:12px;' +
    'background:#f0f0f0;color:#555;border:none;border-radius:12px;' +
    'font-size:13px;font-weight:700;font-family:Nunito,sans-serif;' +
    'cursor:pointer;">Cancel</button>' +

    '</div>'

  document.body.appendChild(overlay)
}

function closeAddField() {
  var overlay = document.getElementById('add-field-overlay')
  if (overlay) overlay.remove()
}

async function saveNewField() {
  var fieldName = document.getElementById('new-field-name').value.trim()
  var cropType = document.getElementById('new-field-crop').value
  var landAcres = document.getElementById('new-field-acres').value
  var village = document.getElementById('new-field-village').value.trim()
  var sowingDate = document.getElementById('new-field-sowing').value


  if (!fieldName || !cropType || !landAcres) {
    showToast('Please fill field name, crop and acres', 'error')
    return
  }
  var duplicate = allFields.find(function(f) {
    return f.field_name.toLowerCase() === fieldName.toLowerCase()
  })
  if (duplicate) {
    showToast(currentLang === 'te'
      ? 'ఈ పేరుతో పొలం ఇప్పటికే ఉంది!'
      : 'Field with this name already exists!', 'error')
    return
  }

  var farmer = JSON.parse(localStorage.getItem('rytuai_farmer'))
  if (!farmer) return

  try {
    var res = await fetch(API + '/fields', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + localStorage.getItem('rytuai_token')
      },
      body: JSON.stringify({
        farmer_id: farmer.phone,
        field_name: fieldName,
        crop_type: cropType,
        land_acres: parseFloat(landAcres),
        village: village,
        district: farmer.district,
        sowing_date: sowingDate || null
      })
    })

    var data = await res.json()
    if (res.ok) {
      allFields.push(data.field)
      currentFieldId = data.field.id
      localStorage.setItem('rytuai_current_field', currentFieldId)
      closeAddField()
      updateFieldSelector()
      loadFarmerData()
      showToast('Field added successfully!')
    } else {
      showToast(data.message || 'Failed to add field', 'error')
    }
  } catch(e) {
    showToast('Cannot connect to server', 'error')
  }
}


// Keep server alive
setInterval(function() { fetch('/auth/ping').catch(function() {}) }, 10 * 60 * 1000)