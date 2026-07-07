import { getThemePreference, saveThemePreference } from './storage.js';
import { showToast } from './ui.js';

const themeSwitchSelector = '#theme-switch';

export function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  saveThemePreference(theme);
}

export function initTheme() {
  const currentTheme = getThemePreference();
  applyTheme(currentTheme);
  document.querySelectorAll('.theme-toggle').forEach((button) => {
    button.addEventListener('click', () => {
      const nextTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      applyTheme(nextTheme);
      updateThemeSwitch(nextTheme);
      showToast(`Tema postavljena na ${nextTheme === 'dark' ? 'tamnu' : 'svijetlu'} verziju.`, 'success');
    });
  });

  const switchInput = document.querySelector(themeSwitchSelector);
  if (switchInput) {
    switchInput.checked = currentTheme === 'dark';
    switchInput.addEventListener('change', () => {
      const newTheme = switchInput.checked ? 'dark' : 'light';
      applyTheme(newTheme);
      showToast(`Tema promijenjena u ${newTheme === 'dark' ? 'tamni' : 'svijetli'} način.`, 'success');
    });
  }
}

function updateThemeSwitch(theme) {
  const switchInput = document.querySelector(themeSwitchSelector);
  if (!switchInput) return;
  switchInput.checked = theme === 'dark';
}
