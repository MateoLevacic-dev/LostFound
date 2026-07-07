import { initializeStorage } from './storage.js';
import { initTheme } from './theme.js';
import { renderHeaderAuthButtons, setActiveNav, initScrollTop, initContactForm, requireLogin } from './ui.js';
import { initAuthPage, initLogout } from './auth.js';
import { initListPage, initPostPage, initItemPage, renderLatestPosts, initDashboardCards } from './posts.js';
import { initProfilePage, initSettingsPage } from './profile.js';
import { initNotifications } from './notifications.js';

async function initApp() {
  await initializeStorage();
  initTheme();
  renderHeaderAuthButtons();
  initLogout();
  setActiveNav();
  initScrollTop();
  initNotifications();

  const page = document.body.dataset.page;
  switch (page) {
    case 'home':
      renderLatestPosts();
      break;
    case 'login':
      initAuthPage('login');
      break;
    case 'register':
      initAuthPage('register');
      break;
    case 'dashboard': {
      const user = requireLogin();
      if (!user) return;
      initDashboardCards();
      break;
    }
    case 'create-post':
      initPostPage();
      break;
    case 'lost-items':
    case 'found-items':
      initListPage();
      break;
    case 'item':
      initItemPage();
      break;
    case 'profile':
      initProfilePage();
      break;
    case 'settings':
      initSettingsPage();
      break;
    case 'contact':
      initContactForm();
      break;
    default:
      break;
  }
}

document.addEventListener('DOMContentLoaded', initApp);
