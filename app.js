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

  // let query="@RC =exec [dbo].[ReadUniversities]"
  // if (req.query.gender!="") query+="@Gender='"+req.query.gender+"'";
  // if (req.query.isFirstApplicant!="") query+=",@IsFirstApplicant="+req.query.isFirstApplicant;
  // if (req.query.gradYear!="") query+=",@GradYear="+req.query.gradYear;
  // if (req.query.GPA!="") query+=",@GPA="+req.query.GPA;
  // if (req.query.highSchool!="") query+=",@HighSchool='"+req.query.highSchool+"'";
  // if (req.query.stdTestType!="") query+=",@StdTestType='"+req.query.stdTestType+"'";
  // if (req.query.stdTestScore!="") query+=",@StdTestScore="+req.query.stdTestScore;
  // if (req.query.testLocation!="") query+=",@TestLocation='"+req.query.testLocation+"'";
  // if (req.query.testCity!="") query+=",@TestCity='"+req.query.testCity+"'";
  // if (req.query.activityType!="") query+=",@ActivityType='"+req.query.activityType+"'";
  // if (req.query.compRank!="") query+=",@CompRank='"+req.query.compRank+"'";

  // console.log(query)

app.get('/schools', (req, res)=> {
    sql.connect(config, (err)=> {
    
        if (err) console.log(err);
        var request = new sql.Request();
           
        // request.query(query, function (err, recordset) {
        request.input('GPA',sql.Float,req.query.GPA)
        request.input('Gender',sql.NVarChar,req.query.gender)
        request.input('IsFirstApplicant',sql.Bit,req.query.isFirstApplicant)
        request.input('GradYear',sql.Int,req.query.gradYear)
        request.input('HighSchool',sql.NVarChar,req.query.highSchool)
        request.input('StdTestType',sql.NVarChar,req.query.stdTestType)
        request.input('StdTestScore',sql.Int,req.query.stdTestScore)
        request.input('TestLocation',sql.NVarChar,req.query.testLocation)
        request.input('TestCity',sql.NVarChar,req.query.testCity)
        request.input('ActivityType',sql.NVarChar,req.query.activityType)
        request.input('CompRank',sql.NVarChar,req.query.compRank)
        // request.input()
        request.execute("[dbo].[ReadUniversities]", function (err, recordset) {
            if (err) console.log(err)

            // send records as a responses
            res.send(recordset);
            
        });
       
    });
});

app.get('/students', (req, res)=> {
  sql.connect(config, (err)=> {
  
      if (err) console.log(err);
      var request = new sql.Request();
      request.input('University',sql.NVarChar,req.query.university)
      request.execute("[dbo].[ReadStudentByUniversitySec]", function (err, recordset) {
          if (err) console.log(err)

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
