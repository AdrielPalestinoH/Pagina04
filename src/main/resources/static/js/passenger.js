// Configuración global de la API (Ajusta la URL a la de tu backend Spring Boot)
const API_BASE_URL = 'http://localhost:8080/api/v1';
const POLLING_INTERVAL = 3000; // Actualizar ubicación cada 3 segundos

// Variables del mapa y marcadores
let map;
let busMarkers = {}; // Guarda referencia a los marcadores de camiones en el mapa
let pollingTimer = null;

// Icono personalizado para el camión
const busIcon = L.icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/3448/3448339.png',
  iconSize: [38, 38],
  iconAnchor: [19, 19],
  popupAnchor: [0, -19]
});

// Inicialización del DOM
document.addEventListener('DOMContentLoaded', () => {
  initMap();
  loadRoutes();

  // Listener para el selector de ruta
  document.getElementById('route-select').addEventListener('change', (e) => {
    const routeId = e.target.value;
    if (routeId) {
      startTrackingRoute(routeId);
    } else {
      stopTracking();
    }
  });
});

// 1. Inicializar mapa con Leaflet (centrado por defecto en Jalisco/Guadalajara)
function initMap() {
  map = L.map('map').setView([20.6767, -103.3475], 13);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap'
  }).addTo(map);
}

// 2. AJAX: Cargar catálogo de rutas para el selector
async function loadRoutes() {
  const select = document.getElementById('route-select');
  try {
    const response = await fetch(`${API_BASE_URL}/routes`);
    if (!response.ok) throw new Error('Error al consultar rutas');

    const routes = await response.json();

    select.innerHTML = '<option value="">-- Selecciona una ruta --</option>';
    routes.forEach(route => {
      const option = document.createElement('option');
      option.value = route.id;
      option.textContent = `${route.code} - ${route.name}`;
      select.appendChild(option);
    });
  } catch (error) {
    console.error('Error AJAX:', error);
    select.innerHTML = '<option value="">Error al cargar rutas</option>';
  }
}

// 3. Iniciar Polling en tiempo real para la ruta seleccionada
function startTrackingRoute(routeId) {
  stopTracking(); // Limpiar intervalo anterior si existe
  fetchBusLocations(routeId); // Primera llamada inmediata

  // Iniciar ciclo de peticiones periódicas
  pollingTimer = setInterval(() => {
    fetchBusLocations(routeId);
  }, POLLING_INTERVAL);
}

// Detener el polling y limpiar mapa
function stopTracking() {
  if (pollingTimer) clearInterval(pollingTimer);
  clearMarkers();
  document.getElementById('bus-details').classList.add('hidden');
  document.querySelector('.placeholder-text').classList.remove('hidden');
}

// 4. AJAX: Obtener ubicaciones de unidades vivas (`GET /routes/{id}/buses`)
async function fetchBusLocations(routeId) {
  try {
    const response = await fetch(`${API_BASE_URL}/routes/${routeId}/buses`);
    if (!response.ok) throw new Error('Error al obtener posiciones');

    const buses = await response.json();
    updateMapMarkers(buses);
  } catch (error) {
    console.error('Error al actualizar posiciones GPS:', error);
  }
}

// 5. Renderizado y actualización dinámica de marcadores en el mapa
function updateMapMarkers(buses) {
  if (!buses || buses.length === 0) {
    clearMarkers();
    return;
  }

  const updatedIds = new Set();

  buses.forEach(bus => {
    const { id, unitNumber, latitude, longitude, nextStop, eta } = bus;
    updatedIds.add(id);

    // Si la unidad ya está en el mapa, actualizar su posición
    if (busMarkers[id]) {
      busMarkers[id].setLatLng([latitude, longitude]);
    } else {
      // Si no existe, crear el marcador
      const marker = L.marker([latitude, longitude], { icon: busIcon })
        .addTo(map)
        .bindPopup(`<b>Unidad ${unitNumber}</b><br>Próxima parada: ${nextStop || 'N/D'}`);

      // Al hacer clic en el camión, mostrar info en el panel lateral
      marker.on('click', () => displayBusInfo(bus));

      busMarkers[id] = marker;
    }
  });

  // Si un camión dejó de transmitir/desapareció, quitarlo del mapa
  Object.keys(busMarkers).forEach(id => {
    if (!updatedIds.has(Number(id)) && !updatedIds.has(id)) {
      map.removeLayer(busMarkers[id]);
      delete busMarkers[id];
    }
  });

  // Mostrar automáticamente los datos del primer camión encontrado
  if (buses.length > 0) {
    displayBusInfo(buses[0]);
  }
}

// 6. Actualizar panel lateral con la información de la unidad
function displayBusInfo(bus) {
  document.querySelector('.placeholder-text').classList.add('hidden');
  const details = document.getElementById('bus-details');
  details.classList.remove('hidden');

  document.getElementById('unit-name').textContent = `Unidad #${bus.unitNumber || bus.id}`;
  document.getElementById('next-stop').textContent = bus.nextStop || 'En trayecto';
  document.getElementById('eta-time').textContent = bus.eta ? `${bus.eta} min` : 'Calculando...';
}

// Limpiar todos los marcadores del mapa
function clearMarkers() {
  Object.values(busMarkers).forEach(marker => map.removeLayer(marker));
  busMarkers = {};
}