const sheetCSVUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRNw6wkBGxAA0fupBuFnTFQnxbmQblW2OQe-OYw1-VARqugDGcgm4zWenpRocDn3uV-rrOOqo-22asR/pub?gid=0&single=true&output=csv'; 

// --- LOGIK SIDEBAR (BEBAS BUG) ---
const body = document.body;
const backdrop = document.getElementById('sidebarBackdrop');
const toggleBtn = document.getElementById('toggleBtn');
const closeBtnMobile = document.getElementById('closeSidebarMobile');

function toggleSidebar() {
    if (window.innerWidth >= 768) {
        // Desktop: Tambah class 'sidebar-collapsed' ke tag body
        body.classList.toggle('sidebar-collapsed');
    } else {
        // Mobile: Tambah class 'sidebar-open' ke tag body
        body.classList.toggle('sidebar-open');
        backdrop.classList.toggle('hidden');
    }
}

toggleBtn.addEventListener('click', toggleSidebar);
closeBtnMobile.addEventListener('click', toggleSidebar);
backdrop.addEventListener('click', toggleSidebar);

// Tutup sidebar jika pengguna resize skrin dari mobile ke desktop
window.addEventListener('resize', () => {
    if (window.innerWidth >= 768) {
        body.classList.remove('sidebar-open');
        backdrop.classList.add('hidden');
    }
});

// --- LOGIK DROPDOWN MENU ---
function toggleDropdown(menuId, iconId) {
    const menu = document.getElementById(menuId);
    const icon = document.getElementById(iconId);
    menu.classList.toggle('open');
    icon.classList.toggle('rotate-180');
}

// --- PENGURUSAN DATA & MASA SEMASA ---
const refreshBtn = document.getElementById('refreshBtn');
const refreshIcon = document.getElementById('refreshIcon');

refreshBtn.addEventListener('click', () => {
    refreshIcon.classList.add('fa-spin');
    document.getElementById('lastUpdated').innerText = "Mengemaskini...";
    fetchData();
});

Chart.defaults.font.family = "'Poppins', sans-serif";
Chart.defaults.color = '#64748b';

function updateTimestamp() {
    const now = new Date();
    // Paparan Format: 5 Apr 2026, 02:00 PTG
    const options = { 
        day: 'numeric', month: 'short', year: 'numeric', 
        hour: '2-digit', minute: '2-digit', hour12: true 
    };
    const timeString = now.toLocaleString('ms-MY', options);
    document.getElementById('lastUpdated').innerText = timeString;
}

function fetchData() {
    Papa.parse(sheetCSVUrl, {
        download: true,
        header: true,
        complete: function(results) {
            const data = results.data.filter(row => row['NAMA SEKOLAH'] && row['NAMA SEKOLAH'].trim() !== ''); 
            processDashboard(data);
            updateTimestamp(); // Paparkan masa semasa bila data siap dimuat turun
            setTimeout(() => refreshIcon.classList.remove('fa-spin'), 500);
        }
    });
}

function processDashboard(data) {
    let totalSekolah = data.length;
    let totalKelas = 0, totalGuru = 0, totalMBPK = 0;
    const ppdData = {}; 
    const tableBody = document.getElementById('table-body');
    tableBody.innerHTML = ''; 

    data.forEach(row => {
        totalKelas += parseInt(row['BIL KELAS']) || 0;
        totalGuru += parseInt(row['BIL GURU']) || 0;
        totalMBPK += parseInt(row['BIL MBPK']) || 0;

        let ppd = row['PPD'] || 'TIADA PPD';
        if (!ppdData[ppd]) ppdData[ppd] = 0;
        ppdData[ppd] += parseInt(row['BIL MBPK']) || 0;

        const tr = document.createElement('tr');
        tr.className = "hover:bg-slate-50 transition-all group";
        tr.innerHTML = `
            <td class="px-6 py-4 text-slate-500 font-medium">${row['PPD']}</td>
            <td class="px-6 py-4 text-slate-800 font-semibold group-hover:text-brand-600">${row['NAMA SEKOLAH']}</td>
            <td class="px-6 py-4 text-center text-slate-600">${row['BIL KELAS']}</td>
            <td class="px-6 py-4 text-center text-brand-600 font-bold bg-brand-50/20">${row['BIL MBPK']}</td>
        `;
        tableBody.appendChild(tr);
    });

    document.getElementById('kpi-sekolah').innerText = totalSekolah;
    document.getElementById('kpi-kelas').innerText = totalKelas;
    document.getElementById('kpi-guru').innerText = totalGuru;
    document.getElementById('kpi-mbpk').innerText = totalMBPK;

    buildChart(ppdData);
}

let myChart = null;
function buildChart(ppdData) {
    const ctx = document.getElementById('mbpkChart').getContext('2d');
    if (myChart) myChart.destroy();

    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, '#6366f1');
    gradient.addColorStop(1, '#818cf8');

    myChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: Object.keys(ppdData),
            datasets: [{
                label: 'Jumlah MBPK',
                data: Object.values(ppdData),
                backgroundColor: gradient,
                borderRadius: 8,
                barThickness: window.innerWidth < 768 ? 20 : 45
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: { 
                y: { beginAtZero: true, grid: { color: '#f1f5f9', drawBorder: false } },
                x: { grid: { display: false } }
            }
        }
    });
}

window.onload = fetchData;
