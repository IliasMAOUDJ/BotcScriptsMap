// ===== STATE =====
let currentPage = 'dashboard';
let darkMode = localStorage.getItem('darkMode') === 'true' || false;
let chartsInitialized = {};

// ===== DARK MODE =====
function applyDarkMode() {
  if (darkMode) {
    document.documentElement.classList.add('dark');
    document.getElementById('darkIcon').className = 'fas fa-sun text-lg';
  } else {
    document.documentElement.classList.remove('dark');
    document.getElementById('darkIcon').className = 'fas fa-moon text-lg';
  }
  localStorage.setItem('darkMode', darkMode);
}

function toggleDark() {
  darkMode = !darkMode;
  applyDarkMode();
}

// ===== SEARCH =====
function openSearch() {
  document.getElementById('searchOverlay').classList.remove('hidden');
  document.getElementById('searchInput').focus();
}

function closeSearch(e) {
  if (e && e.target !== e.currentTarget && !e.target.closest('#searchOverlay')) return;
  document.getElementById('searchOverlay').classList.add('hidden');
}

// close with escape
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeSearch(e);
});

// ===== PAGE SWITCHER =====
function switchPage(page) {
  currentPage = page;
  document.getElementById('pageTitle').innerText = page.charAt(0).toUpperCase() + page.slice(1);
  renderPage(page);
  // highlight sidebar (simple)
  document.querySelectorAll('nav a').forEach(el => {
    el.classList.remove('bg-indigo-50', 'dark:bg-indigo-900/30', 'text-indigo-700', 'dark:text-indigo-300');
    el.classList.add('text-gray-600', 'dark:text-gray-300');
  });
  // find matching link (by onclick)
  document.querySelectorAll('nav a').forEach(el => {
    if (el.textContent.trim().toLowerCase() === page) {
      el.classList.add('bg-indigo-50', 'dark:bg-indigo-900/30', 'text-indigo-700', 'dark:text-indigo-300');
      el.classList.remove('text-gray-600', 'dark:text-gray-300');
    }
  });
}

// ===== RENDER PAGES =====
function renderPage(page) {
  const container = document.getElementById('pageContent');
  // destroy old charts if any
  if (window.chartInstances) {
    Object.values(window.chartInstances).forEach(chart => chart.destroy());
    window.chartInstances = {};
  }
  let html = '';
  switch (page) {
    case 'dashboard': html = getDashboardHTML(); break;
    case 'analytics': html = getAnalyticsHTML(); break;
    default: html = getDashboardHTML();
  }
  container.innerHTML = html;
  // re-init charts after render (if any)
  setTimeout(() => {
    initChartsForPage(page);
  }, 50);
}

// ===== PAGE HTML GENERATORS =====
function getDashboardHTML() {
  return `
    <!-- stats -->
    <section class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
      <div class="bg-white dark:bg-[#1f2937] rounded-2xl shadow-sm border border-gray-100/80 dark:border-gray-700 p-5 card-hover">
        <div class="flex items-center justify-between"><div><p class="text-sm text-gray-400 dark:text-gray-500 font-medium">Total Revenue</p><h3 class="text-2xl font-bold text-gray-800 dark:text-gray-100 mt-1">$48,295</h3><span class="inline-flex items-center text-xs text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 px-2 py-0.5 rounded-full mt-1"><i class="fas fa-arrow-up mr-1"></i> 12.5%</span></div><div class="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400"><i class="fas fa-dollar-sign text-2xl"></i></div></div>
      </div>
      <div class="bg-white dark:bg-[#1f2937] rounded-2xl shadow-sm border border-gray-100/80 dark:border-gray-700 p-5 card-hover">
        <div class="flex items-center justify-between"><div><p class="text-sm text-gray-400 dark:text-gray-500 font-medium">New Users</p><h3 class="text-2xl font-bold text-gray-800 dark:text-gray-100 mt-1">1,283</h3><span class="inline-flex items-center text-xs text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 px-2 py-0.5 rounded-full mt-1"><i class="fas fa-arrow-up mr-1"></i> 8.1%</span></div><div class="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400"><i class="fas fa-user-plus text-2xl"></i></div></div>
      </div>
      <div class="bg-white dark:bg-[#1f2937] rounded-2xl shadow-sm border border-gray-100/80 dark:border-gray-700 p-5 card-hover">
        <div class="flex items-center justify-between"><div><p class="text-sm text-gray-400 dark:text-gray-500 font-medium">Orders</p><h3 class="text-2xl font-bold text-gray-800 dark:text-gray-100 mt-1">4,392</h3><span class="inline-flex items-center text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 px-2 py-0.5 rounded-full mt-1"><i class="fas fa-minus mr-1"></i> 0.3%</span></div><div class="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400"><i class="fas fa-shopping-bag text-2xl"></i></div></div>
      </div>
      <div class="bg-white dark:bg-[#1f2937] rounded-2xl shadow-sm border border-gray-100/80 dark:border-gray-700 p-5 card-hover">
        <div class="flex items-center justify-between"><div><p class="text-sm text-gray-400 dark:text-gray-500 font-medium">Conversion</p><h3 class="text-2xl font-bold text-gray-800 dark:text-gray-100 mt-1">3.24%</h3><span class="inline-flex items-center text-xs text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 px-2 py-0.5 rounded-full mt-1"><i class="fas fa-arrow-up mr-1"></i> 1.2%</span></div><div class="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-900/30 flex items-center justify-center text-rose-600 dark:text-rose-400"><i class="fas fa-percent text-2xl"></i></div></div>
      </div>
    </section>
    <!-- charts -->
    <section class="grid grid-cols-1 xl:grid-cols-3 gap-6">
      <div class="bg-white dark:bg-[#1f2937] p-5 rounded-2xl shadow-sm border border-gray-100/80 dark:border-gray-700 col-span-1 xl:col-span-2 card-hover">
        <div class="flex items-center justify-between mb-3"><h4 class="font-semibold text-gray-700 dark:text-gray-200">Weekly Revenue</h4><span class="text-xs text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-800 px-2 py-1 rounded-full">+18% vs last week</span></div>
        <div class="chart-container"><canvas id="barChartDash" style="width:100%;height:100%;"></canvas></div>
      </div>
      <div class="bg-white dark:bg-[#1f2937] p-5 rounded-2xl shadow-sm border border-gray-100/80 dark:border-gray-700 card-hover">
        <div class="flex items-center justify-between mb-2"><h4 class="font-semibold text-gray-700 dark:text-gray-200">Devices</h4><i class="fas fa-ellipsis-h text-gray-300 dark:text-gray-600"></i></div>
        <div class="chart-container"><canvas id="doughnutDash" style="width:100%;height:100%;"></canvas></div>
        <div class="flex justify-center gap-4 text-xs mt-2 text-gray-500 dark:text-gray-400"><span><span class="inline-block w-2 h-2 rounded-full bg-indigo-500 mr-1"></span> Mobile</span><span><span class="inline-block w-2 h-2 rounded-full bg-cyan-400 mr-1"></span> Desktop</span><span><span class="inline-block w-2 h-2 rounded-full bg-amber-400 mr-1"></span> Tablet</span></div>
      </div>
    </section>
    <section class="grid grid-cols-1 xl:grid-cols-3 gap-6">
      <div class="bg-white dark:bg-[#1f2937] p-5 rounded-2xl shadow-sm border border-gray-100/80 dark:border-gray-700 col-span-2 card-hover">
        <div class="flex items-center justify-between mb-3"><h4 class="font-semibold text-gray-700 dark:text-gray-200">Visitors trend</h4><div class="flex items-center space-x-2 text-xs"><span class="flex items-center"><span class="w-2 h-2 rounded-full bg-indigo-400 mr-1"></span> This week</span><span class="flex items-center"><span class="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-600 mr-1"></span> Last week</span></div></div>
        <div class="chart-container" style="height:200px;"><canvas id="lineDash" style="width:100%;height:100%;"></canvas></div>
      </div>
      <div class="bg-white dark:bg-[#1f2937] p-5 rounded-2xl shadow-sm border border-gray-100/80 dark:border-gray-700 card-hover flex flex-col justify-between">
        <div><h4 class="font-semibold text-gray-700 dark:text-gray-200">Active users</h4><div class="mt-2 flex items-baseline space-x-1"><span class="text-3xl font-bold text-gray-800 dark:text-gray-100">876</span><span class="text-xs text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 px-2 py-0.5 rounded-full">+23</span></div><div class="flex items-center mt-3 space-x-2 text-sm"><div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2"><div class="bg-indigo-500 h-2 rounded-full" style="width:68%;"></div></div><span class="text-xs text-gray-400 dark:text-gray-500">68%</span></div></div>
        <div class="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 text-xs"><div><span class="text-gray-400 dark:text-gray-500">New</span> <span class="font-medium text-gray-700 dark:text-gray-200">+42</span></div><div><span class="text-gray-400 dark:text-gray-500">Returning</span> <span class="font-medium text-gray-700 dark:text-gray-200">834</span></div><div><span class="text-gray-400 dark:text-gray-500">Bounce</span> <span class="font-medium text-gray-700 dark:text-gray-200">12%</span></div><div><span class="text-gray-400 dark:text-gray-200">Session</span> <span class="font-medium text-gray-700 dark:text-gray-200">4m</span></div></div>
      </div>
    </section>
    <!-- recent orders table -->
    <section class="bg-white dark:bg-[#1f2937] rounded-2xl shadow-sm border border-gray-100/80 dark:border-gray-700 p-5 card-hover">
      <div class="flex items-center justify-between mb-4"><h4 class="font-semibold text-gray-700 dark:text-gray-200">Recent orders</h4><a href="#" class="text-xs text-indigo-600 dark:text-indigo-400 hover:underline">View all</a></div>
      <div class="overflow-x-auto"><table class="min-w-full text-sm"><thead><tr class="text-left text-gray-400 dark:text-gray-500 border-b border-gray-100 dark:border-gray-700"><th class="pb-2 font-medium">Customer</th><th class="pb-2 font-medium">Product</th><th class="pb-2 font-medium">Amount</th><th class="pb-2 font-medium">Status</th></tr></thead><tbody class="divide-y divide-gray-50 dark:divide-gray-800"><tr><td class="py-2.5 text-gray-700 dark:text-gray-200">Olivia Chen</td><td class="text-gray-700 dark:text-gray-200">UI Kit Pro</td><td class="text-gray-700 dark:text-gray-200">$49.00</td><td><span class="bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 px-2 py-0.5 rounded-full text-xs">Paid</span></td></tr><tr><td class="py-2.5 text-gray-700 dark:text-gray-200">Marcus Rivera</td><td class="text-gray-700 dark:text-gray-200">Dashboard v4</td><td class="text-gray-700 dark:text-gray-200">$89.00</td><td><span class="bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300 px-2 py-0.5 rounded-full text-xs">Pending</span></td></tr><tr><td class="py-2.5 text-gray-700 dark:text-gray-200">Sophia Lee</td><td class="text-gray-700 dark:text-gray-200">Analytics add-on</td><td class="text-gray-700 dark:text-gray-200">$24.00</td><td><span class="bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full text-xs">Processing</span></td></tr><tr><td class="py-2.5 text-gray-700 dark:text-gray-200">James Park</td><td class="text-gray-700 dark:text-gray-200">Tailwind Pro</td><td class="text-gray-700 dark:text-gray-200">$59.00</td><td><span class="bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 px-2 py-0.5 rounded-full text-xs">Paid</span></td></tr></tbody></table></div>
    </section>
  `;
}

function getAnalyticsHTML() {
  return `<div class="bg-white dark:bg-[#1f2937] p-6 rounded-2xl shadow-sm border border-gray-100/80 dark:border-gray-700"><h2 class="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4">Analytics Overview</h2><div class="grid grid-cols-1 md:grid-cols-2 gap-6"><div class="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl"><h4 class="font-medium text-gray-600 dark:text-gray-300">Page Views</h4><p class="text-3xl font-bold text-indigo-600 dark:text-indigo-400">124.8K</p><span class="text-xs text-green-600 dark:text-green-400">+14.2%</span></div><div class="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl"><h4 class="font-medium text-gray-600 dark:text-gray-300">Bounce Rate</h4><p class="text-3xl font-bold text-rose-600 dark:text-rose-400">32.1%</p><span class="text-xs text-amber-600 dark:text-amber-400">-2.4%</span></div></div><div class="mt-6 h-48 chart-container"><canvas id="analyticsLine"></canvas></div></div>`;
}

function getUsersHTML() {
  return `<div class="bg-white dark:bg-[#1f2937] p-6 rounded-2xl shadow-sm border border-gray-100/80 dark:border-gray-700"><h2 class="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4">User Management</h2><div class="overflow-x-auto"><table class="min-w-full text-sm"><thead><tr class="text-left text-gray-400 dark:text-gray-500 border-b border-gray-100 dark:border-gray-700"><th class="pb-2 font-medium">Name</th><th class="pb-2 font-medium">Email</th><th class="pb-2 font-medium">Role</th><th class="pb-2 font-medium">Status</th></tr></thead><tbody class="divide-y divide-gray-50 dark:divide-gray-800"><tr><td class="py-2.5 text-gray-700 dark:text-gray-200">Alice Johnson</td><td class="text-gray-700 dark:text-gray-200">alice@example.com</td><td class="text-gray-700 dark:text-gray-200">Admin</td><td><span class="bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 px-2 py-0.5 rounded-full text-xs">Active</span></td></tr><tr><td class="py-2.5 text-gray-700 dark:text-gray-200">Bob Smith</td><td class="text-gray-700 dark:text-gray-200">bob@example.com</td><td class="text-gray-700 dark:text-gray-200">Editor</td><td><span class="bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300 px-2 py-0.5 rounded-full text-xs">Pending</span></td></tr><tr><td class="py-2.5 text-gray-700 dark:text-gray-200">Carol White</td><td class="text-gray-700 dark:text-gray-200">carol@example.com</td><td class="text-gray-700 dark:text-gray-200">Viewer</td><td><span class="bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 px-2 py-0.5 rounded-full text-xs">Active</span></td></tr></tbody></table></div></div>`;
}

function getOrdersHTML() {
  return `<div class="bg-white dark:bg-[#1f2937] p-6 rounded-2xl shadow-sm border border-gray-100/80 dark:border-gray-700"><h2 class="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4">Order History</h2><div class="space-y-3"><div class="flex justify-between items-center border-b border-gray-100 dark:border-gray-700 pb-2"><span class="font-medium text-gray-700 dark:text-gray-200">#ORD-001</span><span class="text-sm text-gray-500 dark:text-gray-400">$129.00 · Mar 12, 2026</span><span class="bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 text-xs px-2 py-0.5 rounded-full">Completed</span></div><div class="flex justify-between items-center border-b border-gray-100 dark:border-gray-700 pb-2"><span class="font-medium text-gray-700 dark:text-gray-200">#ORD-002</span><span class="text-sm text-gray-500 dark:text-gray-400">$89.00 · Mar 11, 2026</span><span class="bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300 text-xs px-2 py-0.5 rounded-full">Pending</span></div><div class="flex justify-between items-center"><span class="font-medium text-gray-700 dark:text-gray-200">#ORD-003</span><span class="text-sm text-gray-500 dark:text-gray-400">$45.00 · Mar 10, 2026</span><span class="bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-xs px-2 py-0.5 rounded-full">Processing</span></div></div></div>`;
}

function getMessagesHTML() {
  return `<div class="bg-white dark:bg-[#1f2937] p-6 rounded-2xl shadow-sm border border-gray-100/80 dark:border-gray-700"><h2 class="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4">Messages</h2><div class="space-y-3"><div class="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl"><div class="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-300 font-semibold">JD</div><div><p class="font-medium text-gray-700 dark:text-gray-200">John Doe</p><p class="text-sm text-gray-500 dark:text-gray-400">Hey, can you review the new design?</p><span class="text-xs text-gray-400 dark:text-gray-500">2h ago</span></div></div><div class="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl"><div class="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center text-emerald-600 dark:text-emerald-300 font-semibold">SM</div><div><p class="font-medium text-gray-700 dark:text-gray-200">Sarah Miles</p><p class="text-sm text-gray-500 dark:text-gray-400">The weekly report is ready.</p><span class="text-xs text-gray-400 dark:text-gray-500">5h ago</span></div></div></div></div>`;
}

function getSettingsHTML() {
  return `<div class="bg-white dark:bg-[#1f2937] p-6 rounded-2xl shadow-sm border border-gray-100/80 dark:border-gray-700"><h2 class="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4">Settings</h2><div class="space-y-4"><div class="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-3"><span class="text-gray-700 dark:text-gray-200">Dark mode</span><button onclick="toggleDark()" class="px-4 py-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 rounded-lg text-sm">${darkMode ? 'Disable' : 'Enable'}</button></div><div class="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-3"><span class="text-gray-700 dark:text-gray-200">Email notifications</span><label class="relative inline-flex items-center cursor-pointer"><input type="checkbox" checked class="sr-only peer"><div class="w-11 h-6 bg-gray-200 dark:bg-gray-600 peer-focus:ring-2 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div></label></div><div><button class="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm">Save preferences</button></div></div></div>`;
}

// ===== CHART INIT PER PAGE =====
function initChartsForPage(page) {
  if (!window.chartInstances) window.chartInstances = {};
  if (page === 'dashboard') {
    const barCtx = document.getElementById('barChartDash');
    if (barCtx) {
      const bar = new Chart(barCtx, {
        type: 'bar',
        data: {
          labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
          datasets: [{
            label: 'Revenue ($)',
            data: [2300, 3200, 2800, 4100, 3900, 4700, 5100],
            backgroundColor: ['#6366f1', '#818cf8', '#6366f1', '#4f46e5', '#6366f1', '#818cf8', '#4f46e5'],
            borderRadius: 8,
            barPercentage: 0.65
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            y: { beginAtZero: true, grid: { color: '#e5e7eb' } },
            x: { grid: { display: false } }
          }
        }
      });
      window.chartInstances.barDash = bar;
    }

    const doughCtx = document.getElementById('doughnutDash');
    if (doughCtx) {
      const dough = new Chart(doughCtx, {
        type: 'doughnut',
        data: {
          labels: ['Mobile', 'Desktop', 'Tablet'],
          datasets: [{
            data: [48, 35, 17],
            backgroundColor: ['#6366f1', '#22d3ee', '#fbbf24'],
            borderWidth: 0
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          cutout: '75%'
        }
      });
      window.chartInstances.doughDash = dough;
    }

    const lineCtx = document.getElementById('lineDash');
    if (lineCtx) {
      const line = new Chart(lineCtx, {
        type: 'line',
        data: {
          labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
          datasets: [{
            label: 'This week',
            data: [320, 450, 380, 520, 490, 680, 720],
            borderColor: '#6366f1',
            backgroundColor: 'rgba(99,102,241,0.05)',
            tension: 0.3,
            pointRadius: 2,
            borderWidth: 2
          }, {
            label: 'Last week',
            data: [280, 390, 340, 460, 430, 590, 640],
            borderColor: '#d1d5db',
            backgroundColor: 'transparent',
            borderDash: [5, 5],
            tension: 0.3,
            pointRadius: 2,
            borderWidth: 1.5
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            y: { beginAtZero: true, grid: { color: '#e5e7eb' } },
            x: { grid: { display: false } }
          }
        }
      });
      window.chartInstances.lineDash = line;
    }
  }

  if (page === 'analytics') {
    const ctx = document.getElementById('analyticsLine');
    if (ctx) {
      const line = new Chart(ctx, {
        type: 'line',
        data: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
          datasets: [{
            label: 'Visits',
            data: [1200, 1900, 1500, 2200, 2800, 3400],
            borderColor: '#6366f1',
            tension: 0.3
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } }
        }
      });
      window.chartInstances.analyticsLine = line;
    }
  }
}

// ===== INIT =====
applyDarkMode();
renderPage('dashboard');

// close dropdown on escape
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    document.getElementById('profileDropdown')?.classList.add('hidden');
  }
});
