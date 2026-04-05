// Pautan CSV Google Sheet SPK JPN Terengganu
const sheetCSVUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRNw6wkBGxAA0fupBuFnTFQnxbmQblW2OQe-OYw1-VARqugDGcgm4zWenpRocDn3uV-rrOOqo-22asR/pub?gid=0&single=true&output=csv'; 

// Tetapan global Chart.js untuk menggunakan font Poppins
Chart.defaults.font.family = "'Poppins', sans-serif";
Chart.defaults.color = '#64748b'; 

function fetchData() {
    Papa.parse(sheetCSVUrl, {
        download: true,
        header: true,
        complete: function(results) {
            const data = results.data.filter(row => row['NAMA SEKOLAH'] && row['NAMA SEKOLAH'].trim() !== ''); 
            processDashboard(data);
        },
        error: function(err) {
            console.error("Ralat:", err);
            document.getElementById('table-body').innerHTML = `
                <tr>
                    <td colspan="7" class="px-6 py-12 text-center text-red-500 bg-red-50">
                        <i class="fa-solid fa-triangle-exclamation text-2xl mb-2"></i><br>
                        Gagal memuat turun data. Sila semak semula pautan CSV anda.
                    </td>
                </tr>`;
        }
    });
}

function processDashboard(data) {
    let totalSekolah = data.length;
    let totalKelas = 0;
    let totalGuru = 0;
    let totalMBPK = 0;

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
        tr.className = "hover:bg-slate-50 transition-colors group";
        tr.innerHTML = `
            <td class="px-6 py-4 text-slate-600 font-medium">${row['PPD']}</td>
            <td class="px-6 py-4 text-slate-500 font-mono text-xs">${row['KOD SEKOLAH']}</td>
            <td class="px-6 py-4 text-slate-800 font-medium group-hover:text-brand-600 transition-colors">${row['NAMA SEKOLAH']}</td>
            <td class="px-6 py-4 text-center text-slate-600">${row['BIL KELAS']}</td>
            <td class="px-6 py-4 text-center text-slate-600">${row['BIL GURU']}</td>
            <td class="px-6 py-4 text-center text-slate-600">${row['BIL PPM']}</td>
            <td class="px-6 py-4 text-center text-brand-600 font-bold bg-brand-50/50">${row['BIL MBPK']}</td>
        `;
        tableBody.appendChild(tr);
    });

    animateValue("kpi-sekolah", 0, totalSekolah, 1000);
    animateValue("kpi-kelas", 0, totalKelas, 1000);
    animateValue("kpi-guru", 0, totalGuru, 1000);
    animateValue("kpi-mbpk", 0, totalMBPK, 1000);

    buildChart(ppdData);
}

function animateValue(id, start, end, duration) {
    if (start === end) return;
    let range = end - start;
    let current = start;
    let increment = end > start ? 1 : -1;
    let stepTime = Math.abs(Math.floor(duration / range));
    let obj = document.getElementById(id);
    let timer = setInterval(function() {
        current += increment;
        obj.innerHTML = current;
        if (current == end) {
            clearInterval(timer);
        }
    }, stepTime);
}

let myChart = null; 

function buildChart(ppdData) {
    const ctx = document.getElementById('mbpkChart').getContext('2d');
    
    const labels = Object.keys(ppdData);
    const dataValues = Object.values(ppdData);

    if (myChart != null) {
        myChart.destroy();
    }

    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, '#6366f1'); 
    gradient.addColorStop(1, '#818cf8'); 

    myChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Jumlah MBPK',
                data: dataValues,
                backgroundColor: gradient,
                borderRadius: 6,
                borderSkipped: false,
                barThickness: 32
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: '#1e293b',
                    padding: 12,
                    titleFont: { size: 13, family: "'Poppins', sans-serif", weight: '600' },
                    bodyFont: { size: 14, family: "'Poppins', sans-serif" },
                    displayColors: false,
                    cornerRadius: 8,
                }
            },
            scales: {
                y: { 
                    beginAtZero: true, 
                    grid: { color: '#f1f5f9', drawBorder: false },
                    border: { dash: [4, 4] }
                },
                x: { 
                    grid: { display: false, drawBorder: false },
                    ticks: { font: { weight: '500' } }
                }
            },
            animation: {
                y: { duration: 2000, easing: 'easeOutQuart' }
            }
        }
    });
}

window.onload = fetchData;
