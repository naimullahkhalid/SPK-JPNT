// --- MASUKKAN PAUTAN CSV GOOGLE SHEET ANDA DI SINI ---
// Gantikan URL di bawah dengan URL yang anda dapat dari 'Publish to web'
const sheetCSVUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRNw6wkBGxAA0fupBuFnTFQnxbmQblW2OQe-OYw1-VARqugDGcgm4zWenpRocDn3uV-rrOOqo-22asR/pub?gid=0&single=true&output=csv'; 

// Fungsi utama untuk mengambil dan memproses data
function fetchData() {
    Papa.parse(sheetCSVUrl, {
        download: true,
        header: true,
        complete: function(results) {
            const data = results.data.filter(row => row['NAMA SEKOLAH']); // Buang baris kosong
            processDashboard(data);
        },
        error: function(err) {
            console.error("Gagal memuat turun data:", err);
            document.getElementById('table-body').innerHTML = '<tr><td colspan="7" class="px-6 py-4 text-center text-red-500">Gagal memuat turun data pangkalan. Sila pastikan pautan CSV tepat.</td></tr>';
        }
    });
}

// Fungsi untuk mengemaskini UI
function processDashboard(data) {
    let totalSekolah = data.length;
    let totalKelas = 0;
    let totalGuru = 0;
    let totalMBPK = 0;

    const ppdData = {}; // Untuk menyimpan data carta (Group by PPD)
    const tableBody = document.getElementById('table-body');
    tableBody.innerHTML = ''; // Kosongkan jadual loading

    data.forEach(row => {
        // --- 1. Pengiraan KPI ---
        totalKelas += parseInt(row['BIL KELAS']) || 0;
        totalGuru += parseInt(row['BIL GURU']) || 0;
        totalMBPK += parseInt(row['BIL MBPK']) || 0;

        // --- 2. Penyediaan Data Carta (Jumlah MBPK mengikut PPD) ---
        let ppd = row['PPD'] || 'TIADA PPD';
        if (!ppdData[ppd]) ppdData[ppd] = 0;
        ppdData[ppd] += parseInt(row['BIL MBPK']) || 0;

        // --- 3. Membina Baris Jadual ---
        const tr = document.createElement('tr');
        tr.className = "hover:bg-slate-50 transition-colors";
        tr.innerHTML = `
            <td class="px-6 py-3 font-medium text-slate-800">${row['PPD']}</td>
            <td class="px-6 py-3 text-slate-600">${row['KOD SEKOLAH']}</td>
            <td class="px-6 py-3 text-slate-600 font-semibold">${row['NAMA SEKOLAH']}</td>
            <td class="px-6 py-3 text-center text-slate-600">${row['BIL KELAS']}</td>
            <td class="px-6 py-3 text-center text-slate-600">${row['BIL GURU']}</td>
            <td class="px-6 py-3 text-center text-slate-600">${row['BIL PPM']}</td>
            <td class="px-6 py-3 text-center text-slate-800 font-bold bg-slate-50">${row['BIL MBPK']}</td>
        `;
        tableBody.appendChild(tr);
    });

    // Kemaskini Kad KPI di skrin
    document.getElementById('kpi-sekolah').innerText = totalSekolah;
    document.getElementById('kpi-kelas').innerText = totalKelas;
    document.getElementById('kpi-guru').innerText = totalGuru;
    document.getElementById('kpi-mbpk').innerText = totalMBPK;

    // Bina Carta
    buildChart(ppdData);
}

// Fungsi untuk melukis Chart.js
function buildChart(ppdData) {
    const ctx = document.getElementById('mbpkChart').getContext('2d');
    
    // Asingkan label (PPD) dan data (Jumlah)
    const labels = Object.keys(ppdData);
    const dataValues = Object.values(ppdData);

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Jumlah MBPK',
                data: dataValues,
                backgroundColor: 'rgba(59, 130, 246, 0.8)', // Warna Biru Tailwind
                borderRadius: 4,
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false } // Sembunyikan legend sebab dah jelas
            },
            scales: {
                y: { beginAtZero: true, grid: { borderDash: [2, 4], color: '#e2e8f0' } },
                x: { grid: { display: false } }
            }
        }
    });
}

// Jalankan fungsi apabila laman siap dimuat
window.onload = fetchData;
