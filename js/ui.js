import { getCurrentUser } from './storage.js';

const toastContainer = document.createElement('div');
toastContainer.className = 'toast-container';
document.body.appendChild(toastContainer);

export function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  toastContainer.appendChild(toast);
  setTimeout(() => toast.classList.add('visible'), 10);
  setTimeout(() => toast.remove(), 4200);
}

export function setActiveNav() {
  const path = window.location.pathname.split('/').pop();
  document.querySelectorAll('.main-nav a').forEach((link) => {
    link.classList.toggle('active', link.getAttribute('href') === path);
  });
}

export function renderHeaderAuthButtons() {
  const currentUser = getCurrentUser();
  document.querySelectorAll('.header-actions').forEach((container) => {
    const themeToggle = container.querySelector('.theme-toggle');
    const themeButton = themeToggle ? themeToggle.cloneNode(true) : null;
    container.innerHTML = '';
    if (themeButton) {
      container.appendChild(themeButton);
    }
    if (currentUser) {
      const dashboardLink = document.createElement('a');
      dashboardLink.href = 'dashboard.html';
      dashboardLink.className = 'button outline';
      dashboardLink.textContent = 'Upravljačka ploča';

      const logoutButton = document.createElement('button');
      logoutButton.id = 'logout-button';
      logoutButton.type = 'button';
      logoutButton.className = 'button';
      logoutButton.textContent = 'Odjavi se';

      container.appendChild(dashboardLink);
      container.appendChild(logoutButton);
    } else {
      const loginLink = document.createElement('a');
      loginLink.href = 'login.html';
      loginLink.className = 'button outline';
      loginLink.textContent = 'Prijavi se';

      const registerLink = document.createElement('a');
      registerLink.href = 'register.html';
      registerLink.className = 'button';
      registerLink.textContent = 'Registriraj se';

      container.appendChild(loginLink);
      container.appendChild(registerLink);
    }
  });
}

export function initScrollTop() {
  const button = document.querySelector('.scroll-top');
  if (!button) return;
  button.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  window.addEventListener('scroll', () => {
    button.style.display = window.scrollY > 320 ? 'grid' : 'none';
  });
}

export function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    showToast('Poruka je poslana. Odgovorit ćemo u najkraćem roku.', 'success');
    form.reset();
  });
}

export function requireLogin() {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    showToast('Morate se prijaviti da biste koristili ovu stranicu.', 'danger');
    setTimeout(() => {
      window.location.href = 'login.html';
    }, 900);
    return null;
  }
  return currentUser;
}
