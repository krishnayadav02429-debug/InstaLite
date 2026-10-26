const express=require('express')
const Port=3000
const app=express()
app.get('/health',(req, res)=>{
    res.status(200).json({ "status": "OK" })
})
async function testConnection() {
  try {
    await prisma.$queryRaw`SELECT 1`;

    console.log("✅ Database connection successful");
  } catch (error) {
    console.error("❌ Database connection failed");
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
app.listen(Port,()=>{
    console.log(`server started on ${Port}`)
})