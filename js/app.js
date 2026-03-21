const themeToggle = document.getElementById('themeToggle');
const html = document.documentElement;

const savedTheme = localStorage.getItem('theme') || 'light';
html.setAttribute('data-bs-theme', savedTheme);

if (themeToggle) {
  themeToggle.checked = savedTheme === 'dark';

  themeToggle.addEventListener('change', () => {
    const newTheme = themeToggle.checked ? 'dark' : 'light';
    html.setAttribute('data-bs-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  });
}
const artists = [
  { id: 1, name: 'Sabrina Carpenter', genre: 'Pop', popularity: 95 },
  { id: 2, name: 'Taylor Swift', genre: 'Pop', popularity: 99 },
  { id: 3, name: 'The Weeknd', genre: 'R&B', popularity: 92 },
  { id: 4, name: 'Bad Bunny', genre: 'Urbano', popularity: 97 }
];

const concerts = [
  {
    id: 1,
    artistId: 1,
    artist: 'Sabrina Carpenter',
    date: '2026-03-25',
    city: 'Ciudad de México',
    venue: 'Palacio de los Deportes',
    attendance: 18000,
    ticketSales: 19000,
    status: 'Confirmado',
    lat: 19.4042,
    lng: -99.0994
  },
  {
    id: 2,
    artistId: 2,
    artist: 'Taylor Swift',
    date: '2026-04-02',
    city: 'Guadalajara',
    venue: 'Estadio Akron',
    attendance: 42000,
    ticketSales: 44000,
    status: 'Agotado',
    lat: 20.6814,
    lng: -103.4623
  },
  {
    id: 3,
    artistId: 3,
    artist: 'The Weeknd',
    date: '2026-04-10',
    city: 'Monterrey',
    venue: 'Arena Monterrey',
    attendance: 16000,
    ticketSales: 17000,
    status: 'Confirmado',
    lat: 25.6866,
    lng: -100.3161
  },
  {
    id: 4,
    artistId: 4,
    artist: 'Bad Bunny',
    date: '2026-04-18',
    city: 'Puebla',
    venue: 'Auditorio Metropolitano',
    attendance: 12000,
    ticketSales: 12500,
    status: 'Últimos boletos',
    lat: 19.0414,
    lng: -98.2063
  }
];


// Métricas
function renderMetrics() {
  const metricConcerts = document.getElementById('metricConcerts');
  const metricAttendance = document.getElementById('metricAttendance');
  const metricSales = document.getElementById('metricSales');

  const totalAttendance = concerts.reduce((sum, concert) => sum + concert.attendance, 0);
  const totalSales = concerts.reduce((sum, concert) => sum + concert.ticketSales, 0);

  if (metricConcerts) metricConcerts.textContent = concerts.length;
  if (metricAttendance) metricAttendance.textContent = totalAttendance.toLocaleString('es-MX');
  if (metricSales) metricSales.textContent = totalSales.toLocaleString('es-MX');
}

// Tarjetas de artistas
function renderArtists() {
  const artistGrid = document.getElementById('artistGrid');
  if (!artistGrid) return;

  artistGrid.innerHTML = artists.map(artist => `
    <div class="col-md-6 col-xl-3">
      <div class="card shadow-sm h-100">
        <div class="card-body">
          <h3 class="h5">${artist.name}</h3>
          <p class="mb-2 text-body-secondary">Género: ${artist.genre}</p>
          <p class="mb-0"><strong>Popularidad:</strong> ${artist.popularity}</p>
        </div>
      </div>
    </div>
  `).join('');
}


// Tabla de conciertos
function renderConcertTable() {
  const tbody = document.querySelector('#concertTable tbody');
  if (!tbody) return;

  tbody.innerHTML = concerts.map(concert => `
    <tr>
      <td>${concert.date}</td>
      <td>${concert.artist}</td>
      <td>${concert.city}</td>
      <td>${concert.venue}</td>
      <td>${concert.attendance.toLocaleString('es-MX')}</td>
      <td>${concert.ticketSales.toLocaleString('es-MX')}</td>
      <td>${concert.status}</td>
    </tr>
  `).join('');
}

// Select del formulario
function renderArtistSelect() {
  const select = document.getElementById('artistId');
  if (!select) return;

  select.innerHTML = artists.map(artist => `
    <option value="${artist.id}">${artist.name}</option>
  `).join('');
}


// Gráfica Chart.js
let popularityChartInstance = null;

function renderPopularityChart() {
  const canvas = document.getElementById('popularityChart');
  if (!canvas) return;

  if (popularityChartInstance) {
    popularityChartInstance.destroy();
  }

  popularityChartInstance = new Chart(canvas, {
    type: 'bar',
    data: {
      labels: artists.map(artist => artist.name),
      datasets: [{
        label: 'Popularidad',
        data: artists.map(artist => artist.popularity),
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          max: 100
        }
      }
    }
  });
}


// Mapa Leaflet
let mapInstance = null;
let mapMarkersLayer = null;

function renderMap() {
  const mapContainer = document.getElementById('tourMap');
  if (!mapContainer) return;

  if (!mapInstance) {
    mapInstance = L.map('tourMap').setView([23.6345, -102.5528], 5);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(mapInstance);
  }

  if (mapMarkersLayer) {
    mapMarkersLayer.clearLayers();
  } else {
    mapMarkersLayer = L.layerGroup().addTo(mapInstance);
  }

  concerts.forEach(concert => {
    L.marker([concert.lat, concert.lng])
      .bindPopup(`
        <strong>${concert.artist}</strong><br>
        ${concert.city}<br>
        ${concert.venue}<br>
        ${concert.date}
      `)
      .addTo(mapMarkersLayer);
  });

  setTimeout(() => {
    mapInstance.invalidateSize();
  }, 200);
}

// Calendario FullCalendar
let calendarInstance = null;

function renderCalendar() {
  const calendarEl = document.getElementById('concertCalendar');
  if (!calendarEl) return;

  if (calendarInstance) {
    calendarInstance.destroy();
  }

  calendarInstance = new FullCalendar.Calendar(calendarEl, {
    initialView: 'dayGridMonth',
    locale: 'es',
    height: 'auto',
    events: concerts.map(concert => ({
      title: `${concert.artist} - ${concert.city}`,
      start: concert.date
    }))
  });

  calendarInstance.render();
}

// Formulario para agregar concierto
function setupPlanningForm() {
  const form = document.getElementById('planningForm');
  if (!form) return;

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const formData = new FormData(form);

    const artistId = Number(formData.get('artistId'));
    const artist = artists.find(a => a.id === artistId);

    const newConcert = {
      id: concerts.length + 1,
      artistId,
      artist: artist ? artist.name : 'Artista',
      date: formData.get('date'),
      city: formData.get('city'),
      venue: formData.get('venue'),
      attendance: Number(formData.get('attendance')),
      ticketSales: Number(formData.get('ticketSales')),
      status: 'Planeado',
      lat: Number(formData.get('lat')),
      lng: Number(formData.get('lng'))
    };

    concerts.push(newConcert);

    renderMetrics();
    renderConcertTable();
    renderMap();
    renderCalendar();
  });
}


// Botón actualizar

function setupRefreshButton() {
  const refreshBtn = document.getElementById('refreshBtn');
  if (!refreshBtn) return;

  refreshBtn.addEventListener('click', () => {
    renderMetrics();
    renderArtists();
    renderConcertTable();
    renderPopularityChart();
    renderMap();
    renderCalendar();
  });
}


// Inicio

document.addEventListener('DOMContentLoaded', () => {
  renderMetrics();
  renderArtists();
  renderConcertTable();
  renderArtistSelect();
  renderPopularityChart();
  renderMap();
  renderCalendar();
  setupPlanningForm();
  setupRefreshButton();
});