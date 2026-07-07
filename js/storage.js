const STORAGE_KEYS = {
  users: 'lfUsers',
  posts: 'lfPosts',
  currentUser: 'lfCurrentUser',
  theme: 'lfTheme',
  notifications: 'lfNotifications'
};

function parseJson(value, fallback) {
  try {
    return JSON.parse(value) || fallback;
  } catch (error) {
    return fallback;
  }
}

export function getUsers() {
  return parseJson(localStorage.getItem(STORAGE_KEYS.users), []);
}

export function saveUsers(users) {
  localStorage.setItem(STORAGE_KEYS.users, JSON.stringify(users));
}

export function getPosts() {
  return parseJson(localStorage.getItem(STORAGE_KEYS.posts), []);
}

export function savePosts(posts) {
  localStorage.setItem(STORAGE_KEYS.posts, JSON.stringify(posts));
}

export function getCurrentUser() {
  const localData = parseJson(localStorage.getItem(STORAGE_KEYS.currentUser), null);
  if (localData) {
    return localData;
  }
  return parseJson(sessionStorage.getItem(STORAGE_KEYS.currentUser), null);
}

export function setCurrentUser(user, remember = true) {
  clearCurrentUser();
  if (remember) {
    localStorage.setItem(STORAGE_KEYS.currentUser, JSON.stringify(user));
  } else {
    sessionStorage.setItem(STORAGE_KEYS.currentUser, JSON.stringify(user));
  }
}

export function clearCurrentUser() {
  localStorage.removeItem(STORAGE_KEYS.currentUser);
  sessionStorage.removeItem(STORAGE_KEYS.currentUser);
}

export function getNotifications() {
  return parseJson(localStorage.getItem(STORAGE_KEYS.notifications), []);
}

export function saveNotifications(notifications) {
  localStorage.setItem(STORAGE_KEYS.notifications, JSON.stringify(notifications));
}

function getValue(key, fallback) {
  return localStorage.getItem(key) || fallback;
}

export function getThemePreference() {
  return getValue(STORAGE_KEYS.theme, 'dark');
}

export function saveThemePreference(theme) {
  localStorage.setItem(STORAGE_KEYS.theme, theme);
}

export function addUser(newUser) {
  const users = getUsers();
  users.push(newUser);
  saveUsers(users);
}

export function updateUser(updatedUser) {
  const users = getUsers().map((user) => (user.id === updatedUser.id ? updatedUser : user));
  saveUsers(users);
}

export function addPost(post) {
  const posts = getPosts();
  posts.unshift(post);
  savePosts(posts);
}

export function updatePost(updatedPost) {
  const posts = getPosts().map((post) => (post.id === updatedPost.id ? updatedPost : post));
  savePosts(posts);
}

export function removePost(postId) {
  const posts = getPosts().filter((post) => post.id !== postId);
  savePosts(posts);
}

export function getUserByEmail(email) {
  return getUsers().find((user) => user.email.toLowerCase() === email.toLowerCase());
}

export function getUserByUsername(username) {
  return getUsers().find((user) => user.username.toLowerCase() === username.toLowerCase());
}

export function getUserByEmailOrUsername(identifier) {
  if (!identifier) return null;
  const normalized = identifier.trim().toLowerCase();
  return getUsers().find(
    (user) => user.email.toLowerCase() === normalized || user.username.toLowerCase() === normalized
  );
}

export function getUserById(userId) {
  return getUsers().find((user) => user.id === userId);
}

export async function initializeStorage() {
  const existingUsers = getUsers();
  const existingPosts = getPosts();
  if (existingUsers.length && existingPosts.length) {
    return;
  }

  const fallbackData = {
    users: [
      {
        id: 'u1',
        firstName: 'Ana',
        lastName: 'Kovač',
        username: 'ana1989',
        email: 'ana@example.com',
        password: 'Password123',
        phone: '091 123 4567',
        city: 'Zagreb',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
        role: 'user'
      },
      {
        id: 'u2',
        firstName: 'Ivan',
        lastName: 'Marić',
        username: 'ivan_admin',
        email: 'admin@lostfound.hr',
        password: 'Admin123',
        phone: '098 765 4321',
        city: 'Split',
        avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80',
        role: 'admin'
      }
    ],
    posts: [
      {
        id: 'p1',
        type: 'lost',
        title: 'Crni novčanik s putovnicom',
        category: 'Novčanici',
        description: 'Izgubljen u tramvaju na relaciji Kvaternikov trg - Glavni kolodvor.',
        date: '2026-07-01',
        location: 'Trg bana Jelačića 5',
        address: 'Kvaternikov trg, Zagreb',
        city: 'Zagreb',
        image: 'https://images.unsplash.com/photo-1555529669-26cce6a1c7b7?auto=format&fit=crop&w=900&q=80',
        color: 'Crna',
        brand: 'Tommy Hilfiger',
        additionalInfo: 'Sadrži putovnicu i osobna dokumenta.',
        contactPhone: '091 223 3344',
        contactEmail: 'ana@example.com',
        gps: '45.8150,15.9819',
        status: 'active',
        ownerId: 'u1'
      },
      {
        id: 'p2',
        type: 'found',
        title: 'Bijeli iPhone 13',
        category: 'Mobiteli',
        description: 'Pronađen kod šetnice uz Jarun, blizu kafića.',
        date: '2026-07-03',
        location: 'Jarunska ulica',
        address: 'Jarun, Zagreb',
        city: 'Zagreb',
        image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=900&q=80',
        color: 'Bijela',
        brand: 'Apple',
        additionalInfo: 'U maskici, bez punjača.',
        contactPhone: '097 432 1122',
        contactEmail: 'ivan@example.com',
        gps: '45.7850,15.9410',
        status: 'active',
        ownerId: 'u2'
      }
    ]
  };

  try {
    const response = await fetch('data/sampleData.json');
    const data = await response.json();
    saveUsers(data.users || fallbackData.users);
    savePosts(data.posts || fallbackData.posts);
    saveNotifications([]);
  } catch (error) {
    saveUsers(fallbackData.users);
    savePosts(fallbackData.posts);
    saveNotifications([]);
  }
}

export function generateId(prefix = 'id') {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}-${Date.now().toString().slice(-4)}`;
}
