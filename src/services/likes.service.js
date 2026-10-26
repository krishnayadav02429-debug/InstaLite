const prisma = require('../db');

async function createLike(userId, postId) {
  try {
    return await prisma.like.create({ data: { userId: parseInt(userId), postId: parseInt(postId) } });
  } catch (error) {
    if (error.code === 'P2002') throw { code: 'ALREADY_LIKED' };
    throw error;
  }
}

async function deleteLike(userId, postId) {
  try {
    return await prisma.like.delete({ where: { userId_postId: { userId: parseInt(userId), postId: parseInt(postId) } } });
  } catch (error) {
    if (error.code === 'P2025') throw { code: 'LIKE_NOT_FOUND' };
    throw error;
  }
}

module.exports = { createLike, deleteLike };
