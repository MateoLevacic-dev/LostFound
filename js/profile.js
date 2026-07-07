import { getCurrentUser, getPosts, getUsers, saveUsers, clearCurrentUser, removePost, setCurrentUser } from './storage.js';
import { requireLogin, showToast } from './ui.js';

function attachProfilePostListeners(container, refreshFn) {
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

export function initProfilePage() {
  const user = requireLogin();
  if (!user) return;
  const profileName = document.getElementById('profile-name');
  const profileEmail = document.getElementById('profile-email');
  const profilePhone = document.getElementById('profile-phone');
  const profileCity = document.getElementById('profile-city');
  const profileUsername = document.getElementById('profile-username');
  const profileAvatar = document.getElementById('profile-avatar');
  const profilePostsCount = document.getElementById('profile-posts-count');
  const profileLostCount = document.getElementById('profile-lost-count');
  const profileFoundCount = document.getElementById('profile-found-count');
  const profileNotificationsCount = document.getElementById('profile-notifications-count');
  const postList = document.getElementById('profile-post-list');

  const renderProfilePosts = () => {
    const posts = getPosts().filter((post) => post.ownerId === user.id);
    const lostCount = posts.filter((post) => post.type === 'lost').length;
    const foundCount = posts.filter((post) => post.type === 'found').length;

    profileName.textContent = `${user.firstName} ${user.lastName}`;
    profileEmail.textContent = user.email;
    profilePhone.textContent = user.phone;
    profileCity.textContent = user.city;
    profileUsername.textContent = user.username;
    profileAvatar.src = user.avatar;
    profilePostsCount.textContent = posts.length;
    profileLostCount.textContent = lostCount;
    profileFoundCount.textContent = foundCount;
    profileNotificationsCount.textContent = '5';

    if (postList) {
      if (posts.length === 0) {
        postList.innerHTML = '<div class="glass-card" style="padding:2rem;"><p>Nemate nijednu objavu.</p></div>';
        return;
      }
      postList.innerHTML = posts
        .map((post) => {
          return `
            <article class="post-card glass-card">
              <img src="${post.image}" alt="${post.title}" loading="lazy" />
              <div class="post-meta">
                <span class="tag">${post.type === 'lost' ? 'Izgubljeno' : 'Pronađeno'}</span>
                <span>${post.city}</span>
              </div>
              <h4>${post.title}</h4>
              <p>${post.description.slice(0, 90)}...</p>
              <div class="post-actions">
                <a href="item.html?id=${post.id}" class="button outline">Detalji</a>
                <button class="button outline post-edit" type="button" data-id="${post.id}">Uredi</button>
                <button class="button ghost danger post-delete" type="button" data-id="${post.id}">Obriši</button>
              </div>
            </article>`;
        })
        .join('');
      attachProfilePostListeners(postList, renderProfilePosts);
    }
  };

  renderProfilePosts();
}

export function initSettingsPage() {
  const user = requireLogin();
  if (!user) return;
  const passwordForm = document.getElementById('password-form');
  const exportButton = document.getElementById('export-data');
  const deleteButton = document.getElementById('delete-account');

  if (passwordForm) {
    passwordForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const currentPassword = document.getElementById('current-password').value.trim();
      const newPassword = document.getElementById('new-password').value.trim();
      const confirmPassword = document.getElementById('confirm-new-password').value.trim();
      if (!currentPassword || !newPassword || !confirmPassword) {
        showToast('Popunite sva polja.', 'danger');
        return;
      }
      if (currentPassword !== user.password) {
        showToast('Trenutna lozinka nije ispravna.', 'danger');
        return;
      }
      if (newPassword !== confirmPassword) {
        showToast('Lozinke se ne podudaraju.', 'danger');
        return;
      }
      const allUsers = getUsers().map((entry) => (entry.id === user.id ? { ...entry, password: newPassword } : entry));
      const updatedUser = allUsers.find((entry) => entry.id === user.id);
      saveUsers(allUsers);
      if (updatedUser) {
        setCurrentUser(updatedUser, Boolean(localStorage.getItem('lfCurrentUser')));
      }
      setTimeout(() => {
        showToast('Lozinka spremljena.', 'success');
      }, 100);
      passwordForm.reset();
    });
  }

  if (exportButton) {
    exportButton.addEventListener('click', () => {
      const payload = {
        users: getUsers(),
        posts: getPosts(),
        exportedAt: new Date().toISOString()
      };
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = 'lostfound-data.json';
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
      showToast('Podaci su spremni za preuzimanje.', 'success');
    });
  }

  if (deleteButton) {
    deleteButton.addEventListener('click', () => {
      const confirmation = window.confirm('Jeste li sigurni da želite izbrisati svoj račun?');
      if (!confirmation) return;
      const users = getUsers().filter((item) => item.id !== user.id);
      saveUsers(users);
      clearCurrentUser();
      showToast('Račun je obrisan.', 'success');
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 800);
    });
  }
}
