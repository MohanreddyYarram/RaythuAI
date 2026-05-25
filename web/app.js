
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