import { addUser, getUserByEmailOrUsername, setCurrentUser, getCurrentUser, clearCurrentUser, getUsers } from './storage.js';
import { showToast, initScrollTop } from './ui.js';
import { validateRegisterData, validateLoginData } from './validation.js';

function buildUserRecord(formData) {
  return {
    id: `user-${Date.now()}`,
    firstName: formData.get('firstName').trim(),
    lastName: formData.get('lastName').trim(),
    username: formData.get('username').trim(),
    email: formData.get('email').trim(),
    password: formData.get('password').trim(),
    phone: formData.get('phone').trim(),
    city: formData.get('city').trim(),
    avatar: formData.get('avatar').trim() || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
    role: 'user'
  };
}

export function initAuthPage(mode) {
  initScrollTop();
  if (mode === 'login') {
    const existingUser = getCurrentUser();
    if (existingUser) {
      window.location.href = 'dashboard.html';
      return;
    }
    const form = document.getElementById('login-form');
    if (!form) return;
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const data = new FormData(form);
      const payload = {
        identifier: data.get('email').trim(),
        password: data.get('password').trim(),
        remember: document.getElementById('remember-me')?.checked ?? false
      };
      const error = validateLoginData(payload);
      if (error) {
        showToast(error, 'danger');
        return;
      }
      const user = getUserByEmailOrUsername(payload.identifier);
      if (!user || user.password !== payload.password) {
        showToast('Neispravni podaci za prijavu.', 'danger');
        return;
      }
      setCurrentUser(user, payload.remember);
      showToast(`Dobrodošao, ${user.firstName}!`, 'success');
      setTimeout(() => {
        window.location.href = 'dashboard.html';
      }, 800);
    });
    return;
  }

  if (mode === 'register') {
    const form = document.getElementById('register-form');
    if (!form) return;
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const data = new FormData(form);
      const payload = {
        firstName: data.get('firstName').trim(),
        lastName: data.get('lastName').trim(),
        username: data.get('username').trim(),
        email: data.get('email').trim(),
        password: data.get('password').trim(),
        confirmPassword: data.get('confirmPassword').trim(),
        phone: data.get('phone').trim(),
        city: data.get('city').trim(),
        avatar: data.get('avatar').trim(),
        terms: data.get('terms') === 'on'
      };
      const error = validateRegisterData(payload);
      if (error) {
        showToast(error, 'danger');
        return;
      }
      if (getUserByEmail(payload.email)) {
        showToast('Email je već registriran.', 'danger');
        return;
      }
      if (getUserByUsername(payload.username)) {
        showToast('Korisničko ime je već zauzeto.', 'danger');
        return;
      }
      const user = buildUserRecord(new FormData(form));
      addUser(user);
      setCurrentUser(user, true);
      showToast('Registracija uspješna! Dobrodošli.', 'success');
      setTimeout(() => {
        window.location.href = 'dashboard.html';
      }, 900);
    });
    return;
  }
}

export function initLogout() {
  const button = document.getElementById('logout-button');
  if (!button) return;
  button.addEventListener('click', () => {
    clearCurrentUser();
    showToast('Odjavljeni ste.', 'success');
    setTimeout(() => {
      window.location.href = 'index.html';
    }, 600);
  });
}

export function requireLoginForRoute() {
  const user = getCurrentUser();
  if (!user) {
    showToast('Prijavite se da biste pristupili ovoj stranici.', 'danger');
    setTimeout(() => {
      window.location.href = 'login.html';
    }, 800);
    return null;
  }
  return user;
}
