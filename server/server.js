const express = require('express');
const path = require('path');

const app = express();
const port = process.env.PORT||3000;
app.use(express.static(path.join(__dirname,'../public')));
app.get('/home',(req,res)=>{
  res.render('index')
})

//listning to the port
app.listen(port,()=>{
  console.log(`server started on port ${port}`);
})
