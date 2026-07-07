import { showToast } from './ui.js';

export function requestGpsCoordinates() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolokacija nije podržana u pregledniku.'));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coordinates = `${position.coords.latitude.toFixed(6)}, ${position.coords.longitude.toFixed(6)}`;
        resolve(coordinates);
      },
      (error) => {
        showToast('Nismo mogli dohvatiti GPS lokaciju. Provjerite dozvole.', 'danger');
        reject(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 8000,
        maximumAge: 0
      }
    );
  });
}

export function initGpsButton() {
  const button = document.getElementById('detect-location');
  if (!button) return;
  button.addEventListener('click', async () => {
    try {
      button.textContent = 'Dohvaćanje...';
      const coords = await requestGpsCoordinates();
      button.textContent = 'GPS spremljen';
      button.dataset.gps = coords;
      button.blur();
      setTimeout(() => {
        button.textContent = 'Dohvati GPS';
      }, 1800);
    } catch (error) {
      button.textContent = 'Dohvati GPS';
    }
  });
}
