export function searchPosts(posts, query) {
  if (!query) return posts;
  const normalized = query.toLowerCase().trim();
  return posts.filter((post) => {
    return [post.title, post.category, post.city, post.description, post.location]
      .filter(Boolean)
      .some((value) => value.toLowerCase().includes(normalized));
  });
}

export function filterByStatus(posts, status) {
  if (!status || status === 'all') return posts;
  return posts.filter((post) => post.type === status);
}

export function filterByCategory(posts, category) {
  if (!category) return posts;
  return posts.filter((post) => post.category === category);
}
