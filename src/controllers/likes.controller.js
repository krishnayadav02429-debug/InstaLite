const likesService = require('../services/likes.service');
const postsService = require('../services/posts.service');
const usersService = require('../services/users.service');

async function likePost(req, res) {
  try {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }
    const post = await postsService.getPostById(req.params.id);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    const user = await usersService.getUserById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    try {
      const like = await likesService.createLike(userId, req.params.id);
      return res.status(201).json(like);
    } catch (error) {
      if (error.code === 'ALREADY_LIKED') {
        return res.status(409).json({ error: 'Already liked' });
      }
      throw error;
    }
  } catch (error) {
    throw error;
  }
}

async function unlikePost(req, res) {
  try {
    try {
      await likesService.deleteLike(req.params.userId, req.params.id);
      return res.status(204).send();
    } catch (error) {
      if (error.code === 'LIKE_NOT_FOUND') {
        return res.status(404).json({ error: 'Like not found' });
      }
      throw error;
    }
  } catch (error) {
    throw error;
  }
}

module.exports = { likePost, unlikePost };
