const usersService = require('../services/users.service');
const { validatePagination } = require('../utils/pagination');

async function create(req, res) {
  try {
    const { username, email, fullname, bio } = req.body;
    if (!username || !email || !fullname) {
      return res.status(400).json({ error: 'username, email and fullname are required' });
    }
    const allowedData = { username, email, fullname };
    if (bio !== undefined) allowedData.bio = bio;
    const user = await usersService.createUser(allowedData);
    return res.status(201).json(user);
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'username or email already taken' });
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
    const { sortBy = 'createdAt', order = 'desc', isPrivate, search, hasPosts } = req.query;
    if (sortBy && !['createdAt', 'username', 'fullname'].includes(sortBy)) {
      return res.status(400).json({ error: 'sortBy must be one of: createdAt, username, fullname' });
    }
    if (order && !['asc', 'desc'].includes(order)) {
      return res.status(400).json({ error: 'order must be asc or desc' });
    }
    if (isPrivate !== undefined && isPrivate !== 'true' && isPrivate !== 'false') {
      return res.status(400).json({ error: 'isPrivate must be true or false' });
    }
    if (hasPosts !== undefined && hasPosts !== 'true' && hasPosts !== 'false') {
      return res.status(400).json({ error: 'hasPosts must be true or false' });
    }
    const filters = {
      isPrivate: isPrivate === 'true' ? true : isPrivate === 'false' ? false : undefined,
      search,
      hasPosts: hasPosts === 'true' ? true : hasPosts === 'false' ? false : undefined
    };
    const skip = (page - 1) * limit;
    const { users, total } = await usersService.listUsersWithPagination(filters, sortBy, order, skip, limit);
    const totalPages = Math.ceil(total / limit);
    return res.status(200).json({ data: users, meta: { page, limit, total, totalPages } });
  } catch (error) {
    throw error;
  }
}

async function getOne(req, res) {
  try {
    const user = await usersService.getUserByIdWithCounts(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    return res.status(200).json(user);
  } catch (error) {
    throw error;
  }
}

async function update(req, res) {
  try {
    const allowedData = {};
    if (req.body.fullname !== undefined) allowedData.fullname = req.body.fullname;
    if (req.body.bio !== undefined) allowedData.bio = req.body.bio;
    if (req.body.isPrivate !== undefined) allowedData.isPrivate = req.body.isPrivate;
    const user = await usersService.updateUser(req.params.id, allowedData);
    return res.status(200).json(user);
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'User not found' });
    }
    throw error;
  }
}

async function remove(req, res) {
  try {
    await usersService.deleteUser(req.params.id);
    return res.status(204).send();
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'User not found' });
    }
    throw error;
  }
}

async function getUserPosts(req, res) {
  try {
    const user = await usersService.getUserById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    const { page, limit, error } = validatePagination(req.query.page, req.query.limit);
    if (error) {
      return res.status(400).json({ error });
    }
    const skip = (page - 1) * limit;
    const { posts, total } = await usersService.getUserPosts(req.params.id, skip, limit);
    const totalPages = Math.ceil(total / limit);
    return res.status(200).json({ data: posts, meta: { page, limit, total, totalPages } });
  } catch (error) {
    throw error;
  }
}

async function getUserLikedPosts(req, res) {
  try {
    const user = await usersService.getUserById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    const { page, limit, error } = validatePagination(req.query.page, req.query.limit);
    if (error) {
      return res.status(400).json({ error });
    }
    const skip = (page - 1) * limit;
    const { posts, total } = await usersService.getUserLikedPosts(req.params.id, skip, limit);
    const totalPages = Math.ceil(total / limit);
    return res.status(200).json({ data: posts, meta: { page, limit, total, totalPages } });
  } catch (error) {
    throw error;
  }
}

module.exports = { create, list, getOne, update, remove, getUserPosts, getUserLikedPosts };
