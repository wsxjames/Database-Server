let express = require('express');
let app = express();
//let port=process.env.PORT || 8888
let hbs=require('express-handlebars')
const sql = require("mssql");


//const config = {
//    user: 'james',
//    password: 'wushixinDB!',
//    server: 'uni-app-server.database.windows.net', 
//    database: 'S1G8UniAppSys' 
//};

 const config = {
   user: 'wus4',
   password: 'wushixinJames34',
   server: 'golem.csse.rose-hulman.edu', 
   database: '_S1G8UniAppSys' 
 };

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });


app.engine('handlebars',hbs({defaultLayout:'main'}))
app.set('view engine','handlebars')

app.get('/',(req,res)=>{
    res.render('index')
})

// app.get('/profile',(req,res)=>{
//   res.render('profile')
// })

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

//app.listen(port, ()=>{
//  console.log('API listening on port='+port);
//});

const hostname = 'localhost';
const port = 3000;

app.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
