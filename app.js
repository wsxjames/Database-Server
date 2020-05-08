let express = require('express');
let app = express();
//let port=process.env.PORT || 8888
let hbs=require('express-handlebars')
const sql = require("mssql");
const bcrypt=require("bcrypt")
const passport=require('passport')
require('./passport')(passport); // pass passport for configuration
const flash=require("express-flash")
const session=require("express-session")
bodyParser = require('body-parser').json();
var cors = require('cors');
var corsOptions = {
    // origin: 'http://localhost:8080',
    origin: 'http://wu-uni-app.s3-website.us-east-2.amazonaws.com',
    credentials: true };

app.use(cors(corsOptions));
const config = {
  user: 'wus4',
  password: 'wushixinJames34',
  server: 'golem.csse.rose-hulman.edu', 
  database: '_S1G8UniAppSys' 
};

app.use(session({
	secret: 'vidyapathaisalwaysrunning',
	resave: true,
	saveUninitialized: true
 } )); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session




// app.use(function(req, res, next) {
//     res.header("Access-Control-Allow-Origin", "http://localhost:8080"); // update to match the domain you will make the request from
//     res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
//     next();
//   });





app.engine('handlebars',hbs({defaultLayout:'main'}))
app.set('view engine','handlebars')





app.get('/',isLoggedIn,(req,res)=>{
    // res.sendStatus(200)
})


app.get('/schools', isLoggedIn, (req, res)=> {
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
            
        })
       
    })
})

app.get('/studentprofile',  (req, res)=> {
  sql.connect(config, (err)=> {
  
      if (err) console.log(err);
      var request = new sql.Request();
      request.query("select * from person where username='"+req.user.Username+"'", function (err, recordset) {
          if (err) console.log(err)

          // send records as a responses
          console.log(recordset)
          res.send(recordset);
          
      })
     
  })
})

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

app.post('/register',  bodyParser, async (req, res)=> {
  try {
    const hashedPassword=await bcrypt.hash(req.body.password,10)
    sql.connect(config, (err)=> {
    
      if (err) console.log(err);
      var request = new sql.Request();
      request.input('Email_6',sql.NVarChar,req.body.email)
      request.input('FirstName_2',sql.NVarChar,req.body.firstName)
      request.input('LastName_3',sql.NVarChar,req.body.lastName)
      request.input('UserName_4',sql.NVarChar,req.body.userName)
      request.input('Password_5',sql.Text,hashedPassword)
      request.input('PasswordSeed_7',sql.Text,'null')
      // request.input()
      request.execute("[dbo].[Create_Person]", function (err, recordset) {
          if (err) console.log(err)

          // send records as a responses
          res.sendStatus(200)
          
      })
     
    })
  } catch (error) {
    
  }
})

app.post('/updateProfile',  bodyParser, async (req, res)=> {
  try {
    const hashedPassword=await bcrypt.hash(req.body.password,10)
    sql.connect(config, (err)=> {
    
      if (err) console.log(err);
      var request = new sql.Request();
      // request.input('Email_6',sql.NVarChar,req.body.email)
      // request.input('FirstName_2',sql.NVarChar,req.body.firstName)
      // request.input('LastName_3',sql.NVarChar,req.body.lastName)
      // request.input('UserName_4',sql.NVarChar,req.body.userName)
      // request.input('Password_5',sql.Text,hashedPassword)
      // request.input('PasswordSeed_7',sql.Text,'null')
      // // request.input()
      // request.execute("[dbo].[Create_Person]", function (err, recordset) {
      //     if (err) console.log(err)

      //     // send records as a responses
      //     res.sendStatus(200)
          
      // })
      // request.execute("[dbo].[Create_Person]", function (err, recordset) {
      //     if (err) console.log(err)

      //     // send records as a responses
      //     res.sendStatus(200)
          
      // })
      request.query("update person set FirstName='"+req.body.firstName+"', LastName='"+req.body.lastName+"' where Username='"+req.body.username+"'")

      console.log(req.body)
     
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
  console.log("hello");
  // req.session.save()
  if (req.body.remember) {
    req.session.cookie.maxAge = 1000 * 60 * 3;
  } else {
    req.session.cookie.expires = false;
  }
  if(req.user) res.sendStatus(200);
  else res.sendStatus(401);
  
});

app.get('/logout', isLoggedIn, function(req, res) {
  req.logout();
  req.session.destroy()
  // res.sendStatus(200)
});


function isLoggedIn(req, res, next) {

	// if user is authenticated in the session, carry on
	if (req.isAuthenticated()){
    console.log("Authorized")
    
    res.sendStatus(200)
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
