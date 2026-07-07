export function filterByTime(posts, range) {
  if (!range || range === 'all') return posts;
  const now = new Date();
  return posts.filter((post) => {
    const postDate = new Date(post.date);
    const diff = (now - postDate) / (1000 * 60 * 60 * 24);
    if (range === 'today') return diff < 1;
    if (range === 'week') return diff < 7;
    if (range === 'month') return diff < 31;
    return true;
  });
}
