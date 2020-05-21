let express = require('express');
let app = express();
//let port=process.env.PORT || 8888
let hbs=require('express-handlebars')
const sql = require("mssql");
const bcrypt=require("bcrypt")
const passport=require('passport')
require('./passport')(passport); // pass passport for configuration
const dbconfig=require('./db')
const flash=require("express-flash")
const session=require("express-session")
bodyParser = require('body-parser').json();
var cors = require('cors');
var corsOptions = {
    // origin: 'http://localhost:8080',
    // origin: 'http://wu-uni-app.s3-website.us-east-2.amazonaws.com',
    origin: 'http://uni-app-client.csse.rose-hulman.edu',
    credentials: true };

app.use(cors(corsOptions));
// const config = {
//   user: 'jw19',
//   password: 'Password123',
//   server: 'golem.csse.rose-hulman.edu', 
//   database: '_S1G8UniAppSys_02' 
// };

// const config = {
//   user: 'wus4',
//   password: 'wushixinJames34',
//   server: 'golem.csse.rose-hulman.edu', 
//   database: '_S1G8UniAppSys' 
// };
let result= bcrypt.compare('wushixinJames34',dbconfig.password)
if (result){
  dbconfig.password='wushixinJames34'
}else console.log("password wrong")

const config=dbconfig

app.use(session({
	secret: 'vidyapathaisalwaysrunning',
	resave: true,
	saveUninitialized: true
 } )); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session





permittedLinker = ['localhost', '127.0.0.1'];  // who can link here?

app.use(function(req, res, next) {
  var i=0, notFound=1, referer=req.get('Referer');

  // if ((req.path==='/') || (req.path==='')) next(); // pass calls to '/' always

  if (referer){
      while ((i<permittedLinker.length) && notFound){
      notFound= (referer.indexOf(permittedLinker[i])===-1);
      i++;
      }
  }

  if (notFound) { 
     res.status(403).send('Protected area. Please enter website via www.mysite.com');
  } else {
    next(); // access is permitted, go to the next step in the ordinary routing
  }
});





app.engine('handlebars',hbs({defaultLayout:'main'}))
app.set('view engine','handlebars')





app.get('/',isLoggedIn,(req,res)=>{
    // res.sendStatus(200)
})


app.get('/schools',(req, res)=> {
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
        request.execute("[dbo].[ReadUniversities]",  (err, recordset) =>{
            if (err) console.log(err)

            // send records as a responses
            res.send(recordset);
            
        })
       
    })
})

app.get('/studentprofile', isLoggedIn, (req, res)=> {
  sql.connect(config, (err)=> {
  
      if (err) console.log(err);
      var request = new sql.Request();
      console.log(req.user.PID)
      request.input('PID',sql.Int,req.user.PID)
      request.execute("[dbo].[ReadApplicantRecord]",  (err, recordset)=>{
      // request.query("select * from person where PID="+req.user.PID, function (err, recordset) {
        console.log(recordset)
          if (err) console.log(err)

          // send records as a responses
          // console.log(recordset)
          res.send(recordset);
          
      })
     
  })
})

app.get('/students', (req, res)=> {
  sql.connect(config, (err)=> {
  
      if (err) console.log(err);
      var request = new sql.Request();
      request.input('University',sql.NVarChar,req.query.university)
      request.execute("[dbo].[ReadStudentByUniversityInit]", function (err, recordset) {
          if (err) console.log(err)

          res.send(recordset);
      });
     
  });
});

//app.listen(port, ()=>{
//  console.log('API listening on port='+port);
//});

app.post('/register', bodyParser, passport.authenticate('local-signup', {
  successMessage:'success',
  failureMessage:'fail',
  failureFlash : true // allow flash messages
}),
function(req, res) {
  console.log("hello");
  // req.session.save()
  if (req.body.remember) {
    req.session.cookie.maxAge = 999999999999 * 60 * 3;
  } else {
    req.session.cookie.expires = false;
  }
  if(req.user) res.sendStatus(200);
  else res.sendStatus(401);
  
});


app.post('/updateProfile',  bodyParser, async (req, res)=> {
  try {
    var hashedPassword=''
    if(req.body.password=='') hashedPassword=req.body.oldPassword
    else hashedPassword=await bcrypt.hash(req.body.password,10)
    let properGrade=req.body.stdGrade/100
    sql.connect(config, (err)=> {
    
      if (err) console.log(err);
      var request = new sql.Request();
      request.input('PID',sql.Int,req.user.PID)
      request.input('Username',sql.NVarChar,req.user.Username)
      request.input('FirstName',sql.NVarChar,req.body.firstName)
      request.input('LastName',sql.NVarChar,req.body.lastName)
      request.input('Email',sql.NVarChar,req.body.email)
      request.input('Password',sql.Text,hashedPassword)
      request.input('Gender',sql.NVarChar,req.body.gender)
      request.input('HighSchool',sql.NVarChar,req.body.highSchool)
      request.input('GradYear',sql.Int,req.body.gradYear)
      request.input('GPA',sql.Decimal,req.body.GPA)
      request.input('StdTestType',sql.NVarChar,req.body.stdTestType)
      request.input('StdTestGrade',sql.Float,properGrade)
      request.input('StdTestLocation',sql.NVarChar, "")
      request.input('StdTestDate',sql.Date,"2010-01-01")
      request.input('ActivityType',sql.NVarChar,req.body.activityType)
      request.input('ActivityName',sql.NVarChar,req.body.activityName)
      request.input('University',sql.NVarChar,req.body.universityName)
      request.input('ActivityStartDate',sql.NVarChar,null)
      request.input('ActivityEndDate',sql.NVarChar,null)
      request.input('SpecialAttributes',sql.NVarChar,'')

      request.execute("[dbo].[UpdateStudentUser]", (err, recordset)=> {
        if (err) console.log(err)

        // send records as a responses
        res.sendStatus(200)
        
    })


      // console.log(req.body)
     
    })
  } catch (error) {
    
  }
})

// app.post('/login',passport.authenticate('local-login',{
//   successMessage:'success!',
//   failureMessage: 'failed'
// }))
// app.post('/login',  ( req, res, next ) => {
//   console.log(req.body)
//   passport.authenticate('local-login', {
//       successMessage:'success',
//       failureMessage:'fail',
//       failureFlash: true
//   } )( req, res, next );
// } );

// app.post('/login', passport.authenticate('local-login', {
//   successMessage:'success',
//   failureMessage:'fail',
//   failureFlash : true // allow flash messages
// }),
// function(req, res) {
//   console.log("hello");
//   // res.redirect('/');
// });

app.post('/login', bodyParser, passport.authenticate('local-login', {
  successMessage:'success',
  failureMessage:'fail',
  failureFlash : true // allow flash messages
}),
function(req, res) {
  // console.log("hello");
  // req.session.save()
  if (req.body.remember) {
    req.session.cookie.maxAge = 999999999999 * 60 * 3 * 60 * 3;
  } else {
    req.session.cookie.expires = false;
  }
  if(req.user) res.sendStatus(200);
  else res.sendStatus(401);
  
})

app.get('/logout', isLoggedIn, function(req, res) {
  req.logout();
  req.session.destroy()
  // res.sendStatus(200)
})

app.get('/alluniversities', (req, res)=> {
  sql.connect(config, (err)=> {
    
    if (err) console.log(err);
    var request = new sql.Request();
    request.input('type',sql.NVarChar, req.query.type)
    request.input('isDesc',sql.NVarChar, req.query.isDesc)
    // request.query("select University.SID, name from University JOIN School on University.SID=School.SID",  (err, recordset) =>{
    request.execute("[dbo].[getSortedSchoolList]",  (err, recordset) =>{
        if (err) console.log(err)

        // send records as a responses
        res.send(recordset);
        
    })
   
  })
})

app.post('/percentage', bodyParser, (req, res)=> {
  var stdScore=req.body.stdTestScore/100
  var firstApplicant=req.body.isFirstApplicant? 1:0
  sql.connect(config, (err)=> {
    console.log("body="+JSON.stringify(req.body))
    if (err) console.log(err);
    var request = new sql.Request();
    request.input('Gender',sql.NVarChar, req.body.gender)
    request.input('IsFirstApplicant',sql.Bit,firstApplicant)
    request.input('GradYear',sql.Int,req.body.gradYear)
    request.input('GPA',sql.Float,req.body.GPA)
    request.input('StdTestType',sql.NVarChar,req.body.stdTestType)
    request.input('StdTestScore',sql.Float,stdScore)
    request.input('University',sql.NVarChar,req.body.university)
    // console.log(request)
    request.execute("ReadAcceptanceLikelihood",  (err, recordset) =>{
        if (err) console.log(err)
      console.log(recordset)
        // send records as a responses
        res.send(recordset);
        
    })
   
  })
})


function isLoggedIn(req, res, next) {

	// if user is authenticated in the session, carry on
	if (req.isAuthenticated()){
    console.log("Authorized")
    
    // res.sendStatus(200)
		return next();
  }

  // if they aren't redirect them to the home page
  console.log("not authorized")
  res.sendStatus(401)
  // return next();
}


const hostname = '127.0.0.1';
const port = 3000;

app.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
