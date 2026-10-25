const postsService = require('../services/posts.service');
const usersService = require('../services/users.service');
const { validatePagination } = require('../utils/pagination');

async function create(req, res) {
  try {
    const { imageUrl, caption, location, authorId } = req.body;
    if (!imageUrl || !authorId) {
      return res.status(400).json({ error: 'imageUrl and authorId are required' });
    }
    const user = await usersService.getUserById(authorId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    const allowedData = { imageUrl, authorId: parseInt(authorId) };
    if (caption !== undefined) allowedData.caption = caption;
    if (location !== undefined) allowedData.location = location;
    const post = await postsService.createPost(allowedData);
    return res.status(201).json(post);
  } catch (error) {
    if (error.code === 'P2003') {
      return res.status(404).json({ error: 'User not found' });
    }
    throw error;
  }
}

async function list(req, res) {
  try {
    const { page, limit, error } = validatePagination(req.query.page, req.query.limit);
    if (error) {
      return res.status(400).json({ error });
    }
    const { sortBy = 'createdAt', order = 'desc', location, search, from, to } = req.query;
    if (sortBy && !['createdAt', 'updatedAt', 'likes'].includes(sortBy)) {
      return res.status(400).json({ error: 'sortBy must be one of: createdAt, updatedAt, likes' });
    }
    if (order && !['asc', 'desc'].includes(order)) {
      return res.status(400).json({ error: 'order must be asc or desc' });
    }
    if ((from && isNaN(Date.parse(from))) || (to && isNaN(Date.parse(to)))) {
      return res.status(400).json({ error: 'from and to must be valid dates' });
    }
    const filters = { location, search, from, to };
    const skip = (page - 1) * limit;
    const { posts, total } = await postsService.listPostsWithPagination(filters, sortBy, order, skip, limit);
    const totalPages = Math.ceil(total / limit);
    return res.status(200).json({ data: posts, meta: { page, limit, total, totalPages } });
  } catch (error) {
    throw error;
  }
}

async function getOne(req, res) {
  try {
    const post = await postsService.getPostByIdWithDetails(req.params.id);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    return res.status(200).json(post);
  } catch (error) {
    throw error;
  }
}

async function update(req, res) {
  try {
    const allowedData = {};
    if (req.body.caption !== undefined) allowedData.caption = req.body.caption;
    if (req.body.location !== undefined) allowedData.location = req.body.location;
    const post = await postsService.updatePost(req.params.id, allowedData);
    return res.status(200).json(post);
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Post not found' });
    }
    throw error;
  }
}

async function remove(req, res) {
  try {
    await postsService.deletePost(req.params.id);
    return res.status(204).send();
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Post not found' });
    }
    throw error;
  }
}

async function getLikes(req, res) {
  try {
    const likes = await postsService.getPostLikes(req.params.id);
    if (likes === null) {
      return res.status(404).json({ error: 'Post not found' });
    }
    return res.status(200).json(likes);
  } catch (error) {
    throw error;
  }
}

module.exports = { create, list, getOne, update, remove, getLikes };
