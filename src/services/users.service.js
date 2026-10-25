const prisma = require('../db');

async function createUser(data) {
  return prisma.user.create({ data });
}

async function listUsers(options = {}) {
  return prisma.user.findMany(options);
}

async function getUserById(id) {
  return prisma.user.findUnique({ where: { id: parseInt(id) } });
}

async function getUserByIdWithCounts(id) {
  return prisma.user.findUnique({
    where: { id: parseInt(id) },
    include: { _count: { select: { posts: true, likes: true } } }
  });
}

async function updateUser(id, data) {
  return prisma.user.update({ where: { id: parseInt(id) }, data });
}

async function deleteUser(id) {
  return prisma.user.delete({ where: { id: parseInt(id) } });
}

async function listUsersWithPagination(filters, sortBy, order, skip, take) {
  const where = {};
  if (filters.isPrivate !== undefined) where.isPrivate = filters.isPrivate;
  if (filters.search) {
    where.OR = [
      { username: { contains: filters.search, mode: 'insensitive' } },
      { fullname: { contains: filters.search, mode: 'insensitive' } }
    ];
  }
  if (filters.hasPosts !== undefined) {
    if (filters.hasPosts) where.posts = { some: {} };
    else where.posts = { none: {} };
  }
  const orderBy = {}; orderBy[sortBy] = order;
  const [users, total] = await prisma.$transaction([
    prisma.user.findMany({ where, skip, take, orderBy }),
    prisma.user.count({ where })
  ]);
  return { users, total };
}

async function getUserPosts(userId, skip, take) {
  const [posts, total] = await prisma.$transaction([
    prisma.post.findMany({
      where: { authorId: parseInt(userId) },
      skip, take,
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { likes: true } } }
    }),
    prisma.post.count({ where: { authorId: parseInt(userId) } })
  ]);
  return { posts, total };
}

async function getUserLikedPosts(userId, skip, take) {
  const [posts, total] = await prisma.$transaction([
    prisma.post.findMany({
      where: { likes: { some: { userId: parseInt(userId) } } },
      skip, take,
      orderBy: { createdAt: 'desc' },
      include: {
        author: { select: { id: true, username: true, fullname: true } },
        _count: { select: { likes: true } }
      }
    }),
    prisma.post.count({ where: { likes: { some: { userId: parseInt(userId) } } } })
  ]);
  return { posts, total };
}

module.exports = { createUser, listUsers, getUserById, getUserByIdWithCounts, updateUser, deleteUser, listUsersWithPagination, getUserPosts, getUserLikedPosts };
