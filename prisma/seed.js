const prisma = require('../src/db');
const { users, posts, likes } = require('./seed-data');

async function main() {
  try {
    await prisma.like.deleteMany();
    await prisma.post.deleteMany();
    await prisma.user.deleteMany();

    const createdUsers = await prisma.user.createManyAndReturn({ data: users });
    const userMap = {};
    for (const user of createdUsers) userMap[user.username] = user.id;

    const postsData = posts.map(post => ({
      imageUrl: post.imageUrl,
      caption: post.caption,
      location: post.location,
      authorId: userMap[post.author],
      createdAt: post.createdAt
    }));
    const createdPosts = await prisma.post.createManyAndReturn({ data: postsData });
    const postMap = {};
    for (const post of createdPosts) {
      const match = post.imageUrl.match(/seed\/(insta\d+)\//);
      if (match) postMap[match[1]] = post.id;
    }

    const likesData = likes.map(like => ({ userId: userMap[like.user], postId: postMap[like.post] }));
    const createdLikes = await prisma.like.createManyAndReturn({ data: likesData });

    console.log(`🌱 Seeded ${createdUsers.length} users, ${createdPosts.length} posts and ${createdLikes.length} likes`);
  } catch (error) {
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
