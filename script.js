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
        <div class="flex items-center justify-between"><div><p class="text-sm text-gray-400 dark:text-gray-500 font-medium">Total Tokens</p><h3 class="text-2xl font-bold text-gray-800 dark:text-gray-100 mt-1">{48,295}</h3><span class="inline-flex items-center text-xs text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 px-2 py-0.5 rounded-full mt-1"><i class="fas fa-arrow-up mr-1"></i> 12.5%</span></div><div class="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400"><i class="fas fa-dollar-sign text-2xl"></i></div></div>
      </div>
      <div class="bg-white dark:bg-[#1f2937] rounded-2xl shadow-sm border border-gray-100/80 dark:border-gray-700 p-5 card-hover">
        <div class="flex items-center justify-between"><div><p class="text-sm text-gray-400 dark:text-gray-500 font-medium">New Users</p><h3 class="text-2xl font-bold text-gray-800 dark:text-gray-100 mt-1">1,283</h3><span class="inline-flex items-center text-xs text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 px-2 py-0.5 rounded-full mt-1"><i class="fas fa-arrow-up mr-1"></i> 8.1%</span></div><div class="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400"><i class="fas fa-user-plus text-2xl"></i></div></div>
      </div>
      <div>
            <p class="text-sm text-gray-400 dark:text-gray-500 font-medium">Total Scripts</p>
            <h3 id="statTotalScripts" class="text-2xl font-bold text-gray-800 dark:text-gray-100 mt-1">–</h3>
      </div>
      <div class="bg-white dark:bg-[#1f2937] rounded-2xl shadow-sm border border-gray-100/80 dark:border-gray-700 p-5 card-hover">
        <div class="flex items-center justify-between"><div><p class="text-sm text-gray-400 dark:text-gray-500 font-medium">Conversion</p><h3 class="text-2xl font-bold text-gray-800 dark:text-gray-100 mt-1">3.24%</h3><span class="inline-flex items-center text-xs text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 px-2 py-0.5 rounded-full mt-1"><i class="fas fa-arrow-up mr-1"></i> 1.2%</span></div><div class="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-900/30 flex items-center justify-center text-rose-600 dark:text-rose-400"><i class="fas fa-percent text-2xl"></i></div></div>
      </div>
    </section>
    <!-- charts -->
    <section class="grid grid-cols-1 xl:grid-cols-3 gap-6">
      <div class="bg-white dark:bg-[#1f2937] p-5 rounded-2xl shadow-sm border border-gray-100/80 dark:border-gray-700 col-span-1 xl:col-span-2 card-hover">
        <div class="flex items-center justify-between mb-3"><h4 class="font-semibold text-gray-700 dark:text-gray-200">Top 5 characters</h4></div>
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
  `;
}

// ===== CHART INIT PER PAGE =====
let scriptsData = null;
let totalScripts = 0;

async function loadScriptsData() {
  if (scriptsData) return scriptsData;

  try {
    const response = await fetch("botc_scripts/all_scripts.json");
    if (!response.ok) throw new Error(`Erreur HTTP ${response.status}`);
    const jsonData = await response.json();

    totalScripts = jsonData.length; // <- nombre total de scripts extraits

    const scripts = jsonData.map(item => item.characters);
    const counts = {};
    for (let index = 0; index < scripts.length; index++) {
      const list_of_char = scripts[index];
      for (let char_index = 0; char_index < list_of_char.length; char_index++) {
        const character = list_of_char[char_index];
        counts[character] = (counts[character] || 0) + 1;
      }
    }

    scriptsData = counts;
    return scriptsData;
  } catch (err) {
    console.error("Erreur lors du chargement de scriptsData:", err);
    scriptsData = {};
    return scriptsData;
  }
}

function updateDashboardStats() {
  const el = document.getElementById('statTotalScripts');
  if (el) {
    el.textContent = totalScripts.toLocaleString('fr-FR'); // formate avec séparateur de milliers
  }
  // idem pour les autres stats dynamiques
}



function getTop(array, nb_values){
  const newMap = Object.entries(array);
  const sortedMap = newMap.sort((item1, item2) => item2[1] - item1[1]);
  const topMap = sortedMap.slice(0,5)
  const top = Object.fromEntries(topMap);
  return top;
}

let rolesData = null;

async function loadRolesData() {
  if (rolesData) return rolesData;

  try {
    const response = await fetch("official_data/roles.json");
    if (!response.ok) {
      throw new Error(`Erreur HTTP ${response.status}`);
    }
    rolesData = await response.json();
    return rolesData;
  } catch (err) {
    console.error("Erreur lors du chargement de rolesData:", err);
    rolesData = [];
    return rolesData;
  }
}

function getTeam(character) {
  if (!rolesData) return "other"; // pas encore chargé
  const role = rolesData.find(r => r.id === character);
  return role ? role.team : "other";
}


// Au chargement de la page
window.addEventListener('DOMContentLoaded', async () => {
  // 1. injecter le HTML du dashboard dans le DOM (à adapter selon ton code existant)
  //document.getElementById('mainContent').innerHTML = getDashboardHTML();

  // 2. charger les données
  await Promise.all([loadScriptsData(), loadRolesData()]);

  // 3. mettre à jour les stats et les graphiques
  updateDashboardStats();
  initChartsForPage('dashboard');
});

function initChartsForPage(page) {
  if (!window.chartInstances) window.chartInstances = {};
  const barCtx = document.getElementById('barChartDash');
  if (barCtx) {
    const topValues = getTop(scriptsData, 5);
    const topWithTeams = Object.entries(topValues).map(([character, count]) => ({
      character,
      count,
      team: getTeam(character)
    }));
    console.log(topWithTeams)
    const teamColors = {
      townsfolk: '#93c5fd', // bleu clair
      outsider: '#1e3a8a',  // bleu foncé
      minion: '#fca5a5',    // rouge clair
      demon: '#991b1b',     // rouge foncé
      other: '#9ca3af'      // gris, au cas où
    };

    const labels = Object.keys(topValues);
    const backgroundColors = labels.map(character => {
      const team = getTeam(character);
      return teamColors[team] || teamColors.other;
    });

    const bar = new Chart(barCtx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Occurences',
          data: Object.values(topValues),
          backgroundColor: backgroundColors,
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

// ===== INIT =====
applyDarkMode();
renderPage('dashboard');

// close dropdown on escape
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    document.getElementById('profileDropdown')?.classList.add('hidden');
  }
});
