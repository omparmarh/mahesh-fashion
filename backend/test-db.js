const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/mahesh_fashion').then(async () => {
  const db = mongoose.connection.db;
  const history = await db.collection('histories').find().limit(3).toArray();
  console.log(JSON.stringify(history, null, 2));
  process.exit();
});
