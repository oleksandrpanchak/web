document.addEventListener('DOMContentLoaded', function () {
  const container = document.getElementById('contactMap');
  const error = document.getElementById('contactMapError');
  if (!container) return;

  function showMapError() {
    if (!error) return;
    error.textContent = 'Не вдалося завантажити карту. Скористайтеся посиланням «Переглянути на OpenStreetMap».';
    error.hidden = false;
  }

  if (!window.L) {
    showMapError();
    return;
  }

  const city = [49.8397, 24.0297];
  const map = L.map(container, {
    zoomControl: false,
    scrollWheelZoom: false
  }).setView(city, 12);

  L.control.zoom({
    zoomInTitle: 'Наблизити карту',
    zoomOutTitle: 'Віддалити карту'
  }).addTo(map);

  const tiles = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">Учасники OpenStreetMap</a>'
  });
  tiles.on('tileerror', showMapError);
  tiles.addTo(map);

  L.circleMarker(city, {
    radius: 9,
    color: '#1f4b43',
    fillColor: '#e7c873',
    fillOpacity: 1,
    weight: 3,
    interactive: false
  }).addTo(map).bindTooltip('Львів', {
    permanent: true,
    direction: 'top',
    offset: [0, -8]
  });

  if ('ResizeObserver' in window) {
    const observer = new ResizeObserver(() => map.invalidateSize({ pan: false }));
    observer.observe(container);
  }
});
