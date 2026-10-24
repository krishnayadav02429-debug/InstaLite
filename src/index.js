const express = require('express');
const app = express();
const prisma = require('./db');
const usersRouter = require('./routes/users.routes');
const postsRouter = require('./routes/posts.routes');

app.use(express.json());

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

app.use('/users', usersRouter);
app.use('/posts', postsRouter);

async function testConnection() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    console.log('✅ Database connection successful');
  } catch (error) {
    console.error('❌ Database connection failed');
    console.error(error);
  }
}

testConnection();

app.listen(3000, () => {
  console.log('Server started on port 3000');
});
