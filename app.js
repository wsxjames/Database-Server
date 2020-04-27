var express = require('express');
var app = express();
let port=process.env.PORT || 8888

app.get('/', (req, res) => {
  res.send('Hello!')
});

const config = {
    user: 'james',
    password: 'wushixinDB!',
    server: 'uni-app-server.database.windows.net', 
    database: 'S1G8UniAppSys' 
};

app.get('/schools', (req, res)=> {
    sql.connect(config, (err)=> {
    
        if (err) console.log(err);

        // create Request object
        var request = new sql.Request();
           
        // query to the database and get the records
        request.query('select SID, Name from School', function (err, recordset) {
            
            if (err) console.log(err)

            // send records as a responses
            res.send(recordset);
            
        });
    });
});

app.listen(port, ()=>{
  console.log('API listening on port='+port);
});