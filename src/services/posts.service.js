const prisma = require('../db');

async function createPost(data) {
  return prisma.post.create({ data });
}

async function listPosts(options = {}) {
  return prisma.post.findMany(options);
}

async function getPostById(id) {
  return prisma.post.findUnique({ where: { id: parseInt(id) } });
}

async function getPostByIdWithDetails(id) {
  return prisma.post.findUnique({
    where: { id: parseInt(id) },
    include: {
      author: { select: { id: true, username: true, fullname: true } },
      _count: { select: { likes: true } }
    }
  });
}

async function updatePost(id, data) {
  return prisma.post.update({ where: { id: parseInt(id) }, data });
}

async function deletePost(id) {
  return prisma.post.delete({ where: { id: parseInt(id) } });
}

async function listPostsWithPagination(filters, sortBy, order, skip, take) {
  const where = {};
  if (filters.location) where.location = { equals: filters.location, mode: 'insensitive' };
  if (filters.search) where.caption = { contains: filters.search, mode: 'insensitive' };
  if (filters.from || filters.to) {
    where.createdAt = {};
    if (filters.from) where.createdAt.gte = new Date(filters.from);
    if (filters.to) where.createdAt.lt = new Date(filters.to);
  }
  let orderBy;
  if (sortBy === 'likes') {
    orderBy = [{ likes: { _count: order } }, { createdAt: 'desc' }];
  } else {
    orderBy = {}; orderBy[sortBy] = order;
  }
  const [posts, total] = await prisma.$transaction([
    prisma.post.findMany({
      where, skip, take, orderBy,
      include: {
        author: { select: { id: true, username: true, fullname: true } },
        _count: { select: { likes: true } }
      }
    }),
    prisma.post.count({ where })
  ]);
  return { posts, total };
}

async function getPostLikes(postId) {
  const post = await prisma.post.findUnique({ where: { id: parseInt(postId) } });
  if (!post) return null;
  const likes = await prisma.like.findMany({
    where: { postId: parseInt(postId) },
    include: { user: { select: { id: true, username: true, fullname: true } } },
    orderBy: { user: { username: 'asc' } }
  });
  return likes.map(like => like.user);
}

module.exports = { createPost, listPosts, getPostById, getPostByIdWithDetails, updatePost, deletePost, listPostsWithPagination, getPostLikes };
