var express = require('express');
var app = express();
let port=process.env.port || 8888

app.get('/', (req, res) => {
  res.send('Hello!')
});

app.listen(port, ()=>{
  console.log('API listening on port 8081');
});