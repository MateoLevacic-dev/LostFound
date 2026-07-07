import { addPost, getPosts, updatePost, removePost, getCurrentUser, generateId } from './storage.js';
import { showToast, requireLogin } from './ui.js';
import { validatePostData } from './validation.js';
import { initGpsButton } from './map.js';
import { searchPosts, filterByStatus } from './search.js';
import { filterByTime } from './filters.js';

let currentFilteredPosts = [];
let currentPage = 1;
const pageSize = 6;

function createPostHTML(post) {
  return `
    <article class="post-card glass-card fade-in">
      <img src="${post.image}" alt="${post.title}" loading="lazy" />
      <div class="post-meta">
        <span class="tag">${post.type === 'lost' ? 'Izgubljeno' : 'Pronađeno'}</span>
        <span>${post.city}</span>
      </div>
      <h4>${post.title}</h4>
      <p>${post.description.slice(0, 96)}...</p>
      <div class="post-actions">
        <a href="item.html?id=${post.id}" class="button outline">Detalji</a>
        <a href="mailto:${post.contactEmail}?subject=Lost%20%26%20Found%20Croatia%20-%20${encodeURIComponent(post.title)}" class="button ghost">Kontakt</a>
      </div>
    </article>`;
}

function renderUserPostCard(post) {
  return `
    <article class="post-card glass-card fade-in">
      <img src="${post.image}" alt="${post.title}" loading="lazy" />
      <div class="post-meta">
        <span class="tag">${post.type === 'lost' ? 'Izgubljeno' : 'Pronađeno'}</span>
        <span>${post.city}</span>
      </div>
      <h4>${post.title}</h4>
      <p>${post.description.slice(0, 96)}...</p>
      <div class="post-actions">
        <a href="item.html?id=${post.id}" class="button outline">Detalji</a>
        <button class="button outline post-edit" data-id="${post.id}" type="button">Uredi</button>
        <button class="button ghost danger post-delete" data-id="${post.id}" type="button">Obriši</button>
      </div>
    </article>`;
}

function attachPostCardListeners(container, refreshFn) {
  if (!container) return;
  container.querySelectorAll('.post-edit').forEach((button) => {
    button.addEventListener('click', () => {
      const postId = button.dataset.id;
      window.location.href = `create-post.html?id=${postId}`;
    });
  });

  container.querySelectorAll('.post-delete').forEach((button) => {
    button.addEventListener('click', () => {
      const postId = button.dataset.id;
      const confirmation = window.confirm('Jeste li sigurni da želite izbrisati ovu objavu?');
      if (!confirmation) return;
      removePost(postId);
      showToast('Objava je obrisana.', 'success');
      if (typeof refreshFn === 'function') {
        refreshFn();
      } else {
        window.location.reload();
      }
    });
  });
}

function renderUserPosts(posts, containerId, refreshFn) {
  const container = document.getElementById(containerId);
  if (!container) return;
  if (posts.length === 0) {
    container.innerHTML = '<div class="glass-card" style="padding:2rem;"><p>Nemate nijednu objavu.</p></div>';
    return;
  }
  container.innerHTML = posts.map(renderUserPostCard).join('');
  attachPostCardListeners(container, refreshFn);
}

export function renderLatestPosts() {
  const latest = document.getElementById('latest-posts');
  if (!latest) return;
  const posts = getPosts()
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 4);
  latest.innerHTML = posts.map(createPostHTML).join('');
}

function renderPagination(totalItems) {
  const pages = Math.ceil(totalItems / pageSize);
  const pagination = document.getElementById('pagination');
  if (!pagination) return;
  if (pages <= 1) {
    pagination.innerHTML = '';
    return;
  }
  pagination.innerHTML = Array.from({ length: pages }, (_, index) => {
    const number = index + 1;
    return `<button class="pagination-button${number === currentPage ? ' active' : ''}" data-page="${number}">${number}</button>`;
  }).join('');
  pagination.querySelectorAll('.pagination-button').forEach((button) => {
    button.addEventListener('click', () => {
      currentPage = Number(button.dataset.page);
      renderPostList(currentFilteredPosts);
    });
  });
}

function renderPostList(posts, containerId = 'post-list') {
  const container = document.getElementById(containerId);
  if (!container) return;
  currentFilteredPosts = posts;
  currentPage = Math.min(currentPage, Math.ceil(posts.length / pageSize) || 1);
  const start = (currentPage - 1) * pageSize;
  const pageItems = posts.slice(start, start + pageSize);
  if (pageItems.length === 0) {
    container.innerHTML = '<div class="glass-card" style="padding:2rem;"><p>Nema objava za odabrane kriterije.</p></div>';
    renderPagination(posts.length);
    return;
  }
  container.innerHTML = pageItems.map(createPostHTML).join('');
  renderPagination(posts.length);
}

export function initListPage() {
  const statusFilter = document.getElementById('status-filter');
  const timeFilter = document.getElementById('time-filter');
  const searchInput = document.getElementById('search-input');

  const query = new URLSearchParams(window.location.search);
  const presetCategory = query.get('category');
  let posts = getPosts();
  if (presetCategory) {
    posts = posts.filter((post) => post.category === presetCategory);
  }

  const refresh = () => {
    let results = getPosts();
    if (presetCategory) {
      results = results.filter((post) => post.category === presetCategory);
    }
    const status = statusFilter?.value || 'all';
    const time = timeFilter?.value || 'all';
    const search = searchInput?.value || '';
    results = filterByStatus(results, status);
    results = filterByTime(results, time);
    results = searchPosts(results, search);
    currentPage = 1;
    renderPostList(results);
  };

  [statusFilter, timeFilter, searchInput].forEach((element) => {
    if (!element) return;
    element.addEventListener('input', refresh);
  });

  refresh();
}

export function initPostPage() {
  const form = document.getElementById('post-form');
  if (!form) return;
  const user = requireLogin();
  if (!user) return;
  initGpsButton();

  const query = new URLSearchParams(window.location.search);
  const editId = query.get('id');
  let editingPost = null;

  if (editId) {
    editingPost = getPostById(editId);
    if (!editingPost) {
      showToast('Objava nije pronađena.', 'danger');
      setTimeout(() => {
        window.location.href = 'dashboard.html';
      }, 800);
      return;
    }
    if (editingPost.ownerId !== user.id) {
      showToast('Nemate dopuštenje za uređivanje ove objave.', 'danger');
      setTimeout(() => {
        window.location.href = 'dashboard.html';
      }, 800);
      return;
    }

    const typeRadio = form.querySelector(`[name="type"][value="${editingPost.type}"]`);
    if (typeRadio) {
      typeRadio.checked = true;
    }
    form.querySelector('#item-category').value = editingPost.category;
    form.querySelector('#item-title').value = editingPost.title;
    form.querySelector('#item-description').value = editingPost.description;
    form.querySelector('#item-date').value = editingPost.date;
    form.querySelector('#item-color').value = editingPost.color;
    form.querySelector('#item-brand').value = editingPost.brand;
    form.querySelector('#item-location').value = editingPost.location;
    form.querySelector('#item-city').value = editingPost.city;
    form.querySelector('#item-address').value = editingPost.address;
    form.querySelector('#item-image').value = editingPost.image;
    form.querySelector('#item-info').value = editingPost.additionalInfo;
    form.querySelector('#contact-phone').value = editingPost.contactPhone;
    form.querySelector('#contact-email').value = editingPost.contactEmail;
    document.getElementById('detect-location')?.setAttribute('data-gps', editingPost.gps || '');
    const submitButton = form.querySelector('button[type="submit"]');
    if (submitButton) {
      submitButton.textContent = 'Ažuriraj objavu';
    }
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const postPayload = {
      id: editingPost ? editingPost.id : generateId('post'),
      type: data.get('type'),
      title: data.get('title').trim(),
      description: data.get('description').trim(),
      category: data.get('category'),
      date: data.get('date'),
      location: data.get('location').trim(),
      address: data.get('address').trim(),
      city: data.get('city').trim(),
      image: data.get('image').trim(),
      color: data.get('color').trim(),
      brand: data.get('brand').trim(),
      additionalInfo: data.get('additionalInfo').trim(),
      contactPhone: data.get('contactPhone').trim(),
      contactEmail: data.get('contactEmail').trim(),
      gps: document.getElementById('detect-location')?.dataset.gps || editingPost?.gps || '',
      status: editingPost ? editingPost.status : 'active',
      ownerId: user.id
    };

    const error = validatePostData(postPayload);
    if (error) {
      showToast(error, 'danger');
      return;
    }

    if (editingPost) {
      updatePost(postPayload);
      showToast('Objava je ažurirana.', 'success');
    } else {
      addPost(postPayload);
      showToast('Objava je unesena i spremna za pregled.', 'success');
    }

    form.reset();
    setTimeout(() => {
      window.location.href = 'dashboard.html';
    }, 900);
  });
}

function getPostById(postId) {
  return getPosts().find((post) => post.id === postId);
}

export function initItemPage() {
  const query = new URLSearchParams(window.location.search);
  const id = query.get('id');
  const post = getPostById(id);
  if (!post) {
    const main = document.querySelector('main');
    if (main) main.innerHTML = '<div class="glass-card" style="padding:2rem;"><p>Predmet nije pronađen.</p></div>';
    return;
  }

  document.getElementById('item-image').src = post.image;
  document.getElementById('item-title').textContent = post.title;
  document.getElementById('item-description').textContent = post.description;
  document.getElementById('item-category').textContent = post.category;
  document.getElementById('item-date').textContent = post.date;
  document.getElementById('item-city').textContent = post.city;
  document.getElementById('item-location').textContent = post.location;
  document.getElementById('item-color').textContent = post.color || '-';
  document.getElementById('item-brand').textContent = post.brand || '-';
  document.getElementById('item-address').textContent = post.address;
  document.getElementById('item-info').textContent = post.additionalInfo || 'Nema dodatnih informacija.';
  document.getElementById('owner-phone').textContent = post.contactPhone;
  document.getElementById('owner-email').textContent = post.contactEmail;
  document.getElementById('item-gps').textContent = post.gps || 'Nema GPS podataka.';
  document.getElementById('item-type').textContent = post.type === 'lost' ? 'Izgubljeno' : 'Pronađeno';

  const contactButton = document.getElementById('contact-owner');
  if (contactButton) {
    contactButton.href = `mailto:${post.contactEmail}?subject=Lost%20%26%20Found%20Croatia%20-%20${encodeURIComponent(post.title)}`;
  }

  const markButton = document.getElementById('mark-found');
  if (markButton) {
    markButton.addEventListener('click', () => {
      post.status = 'returned';
      updatePost(post);
      showToast('Predmet je označen kao pronađen/vraćen.', 'success');
      markButton.disabled = true;
      markButton.textContent = 'Označeno';
    });
  }

  const gallery = document.getElementById('gallery-list');
  if (gallery) {
    ['image', 'image', 'image'].forEach((key, index) => {
      const button = document.createElement('button');
      button.textContent = `Slika ${index + 1}`;
      button.addEventListener('click', () => {
        document.getElementById('item-image').src = post.image;
      });
      gallery.appendChild(button);
    });
  }
}

export function initDashboardCards() {
  const user = getCurrentUser();
  if (!user) return;

  const refreshDashboard = () => {
    const posts = getPosts().filter((post) => post.ownerId === user.id);
    const lostCount = posts.filter((item) => item.type === 'lost').length;
    const foundCount = posts.filter((item) => item.type === 'found').length;

    document.getElementById('welcome-text').textContent = `Dobrodošao, ${user.firstName}`;
    document.getElementById('user-post-count').textContent = posts.length;
    document.getElementById('user-lost-count').textContent = lostCount;
    document.getElementById('user-found-count').textContent = foundCount;
    document.getElementById('user-notifications-count').textContent = '5';

    renderUserPosts(posts, 'dashboard-post-list', refreshDashboard);
  };

  refreshDashboard();

  if (user.role === 'admin') {
    document.getElementById('admin-panel').hidden = false;
    const usersList = document.getElementById('admin-user-list');
    const postsList = document.getElementById('admin-post-list');
    if (usersList) {
      usersList.innerHTML = getPosts().slice(0, 5).map((item) => `<li>${item.title} (${item.type})</li>`).join('');
    }
    if (postsList) {
      postsList.innerHTML = getPosts().slice(0, 5).map((item) => `<li>${item.title} - ${item.city}</li>`).join('');
    }
  }
}
