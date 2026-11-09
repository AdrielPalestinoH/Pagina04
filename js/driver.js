let watchId = null;
let currentTripId = null;
const logBox = document.getElementById('log-box');

function log(message) {
    const time = new Date().toLocaleTimeString();
    logBox.innerHTML += `<div>[${time}] ${message}</div>`;
    logBox.scrollTop = logBox.scrollHeight;
}

// 1. Cargar asignaciones al iniciar la página
window.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch('/api/v1/driver/assignments');
        const data = await response.json();

        const select = document.getElementById('route-select');
        select.innerHTML = '';

        if(data.length === 0) {
            select.innerHTML = '<option>No hay rutas asignadas</option>';
            return;
        }

        data.forEach(assignment => {
            const opt = document.createElement('option');
            opt.value = assignment.route_id;
            opt.textContent = `Ruta: ${assignment.name} (Unidad ${assignment.bus_number})`;
            select.appendChild(opt);
        });
        log("Asignaciones cargadas correctamente.");
    } catch (error) {
        log("Error al cargar asignaciones (usando modo simulación).");
        const select = document.getElementById('route-select');
        select.innerHTML = '<option value="1">Ruta 4 - Centro / Norte (Unidad 12)</option>';
    }
});

// 2. Iniciar el Viaje y el Monitoreo GPS
async function startTrip() {
    const routeId = document.getElementById('route-select').value;
    if (!routeId) {
        alert("Selecciona una ruta primero.");
        return;
    }

    try {
        await fetch('/api/v1/trips/start', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ route_id: routeId })
        });

        currentTripId = 101;
        log(`Viaje iniciado en ruta ID: ${routeId}`);

        document.getElementById('btn-start').disabled = true;
        document.getElementById('btn-start').classList.add('opacity-50', 'cursor-not-allowed');

        document.getElementById('btn-end').disabled = false;
        document.getElementById('btn-end').classList.remove('opacity-50', 'cursor-not-allowed');
        document.getElementById('route-select').disabled = true;

        if ("geolocation" in navigator) {
            document.getElementById('gps-status').textContent = "Transmitiendo...";
            document.getElementById('gps-status').className = "text-green-300";

            watchId = navigator.geolocation.watchPosition(
                sendTelemetryData,
                handleGeoError,
                {
                    enableHighAccuracy: true,
                    maximumAge: 0,
                    timeout: 5000
                }
            );
        } else {
            alert("Tu navegador no soporta geolocalización.");
        }

    } catch (error) {
        log("Error al iniciar el viaje con el servidor.");
    }
}

// 3. Enviar coordenadas de telemetría por AJAX
async function sendTelemetryData(position) {
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;
    const speed = position.coords.speed ? (position.coords.speed * 3.6).toFixed(1) : 0;
    const timestamp = new Date().toISOString();

    document.getElementById('speed-display').textContent = `${speed} km/h`;
    log(`GPS Pos: [${lat.toFixed(4)}, ${lon.toFixed(4)}] - Vel: ${speed} km/h`);

    const payload = {
        trip_id: currentTripId,
        latitude: lat,
        longitude: lon,
        speed: parseFloat(speed),
        timestamp: timestamp
    };

    try {
        await fetch('/api/v1/telemetry/location', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
    } catch (error) {
        console.warn("Fallo de red al enviar telemetría (reintentando...)");
    }
}

function handleGeoError(error) {
    document.getElementById('gps-status').textContent = "Error GPS";
    document.getElementById('gps-status').className = "text-red-400";
    log(`Error de GPS: ${error.message}`);
}

// 4. Terminar el Viaje
async function endTrip() {
    if (!confirm("¿Estás seguro de finalizar el turno y el viaje?")) return;

    if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
        watchId = null;
    }

    try {
        await fetch('/api/v1/trips/end', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ trip_id: currentTripId })
        });
        log("Viaje finalizado correctamente.");
    } catch (error) {
        log("Viaje finalizado localmente (error de red con servidor).");
    }

    document.getElementById('btn-start').disabled = false;
    document.getElementById('btn-start').classList.remove('opacity-50', 'cursor-not-allowed');

    document.getElementById('btn-end').disabled = true;
    document.getElementById('btn-end').classList.add('opacity-50', 'cursor-not-allowed');
    document.getElementById('route-select').disabled = false;

    document.getElementById('gps-status').textContent = "Detenido";
    document.getElementById('gps-status').className = "text-yellow-300";
    document.getElementById('speed-display').textContent = "0 km/h";
    currentTripId = null;
}