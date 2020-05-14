const sql = require("mssql");
const LocalStrategy = require("passport-local").Strategy
const flash=require("express-flash")
const bcrypt=require("bcrypt")

const config = {
    user: 'wus4',
    password: 'wushixinJames34',
    server: 'golem.csse.rose-hulman.edu', 
    database: '_S1G8UniAppSys' 
  };

var connection=sql.connect(config,(err)=>{
    if (err) console.log(err)
})

module.exports = function(passport) {
    
    passport.serializeUser(function(user, done) {
        console.log(user)
		done(null, user.PID);
    });

    // used to deserialize the user
    passport.deserializeUser(function(PID, done) {
		connection.query("select * from person where PID = "+PID,function(err,rows){	
            console.log(rows.recordset[0])
			done(err, rows.recordset[0]);
		});
    });

    // =========================================================================
    // LOCAL SIGNUP ============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'

    passport.use(
        'local-signup',
        new LocalStrategy({
            // by default, local strategy uses username and password, we will override with email
            usernameField : 'username',
            passwordField : 'password',
            passReqToCallback : true // allows us to pass back the entire request to the callback
        },
        function(req, username, password, done) {
            // find a user whose email is the same as the forms email
            // we are checking to see if the user trying to login already exists
            
            connection.query("SELECT * FROM Person WHERE Username = + '"+username+"'", (err, rows) =>{
                if (err)
                    return done(err);
                if (rows.recordset[0]) {
                    return done(err);
                } else {
                    // if there is no user with that username
                    // create the user
                    
                    bcrypt.hash(password,10,(err,hashedPassword)=>{

                        if(err) console.log(err)

                        // console.log(username,hashedPassword)
                        var insertQuery = "INSERT INTO Person ( Username, Password, FirstName, LastName,Email ) values ('"+username+"',"+"'"+hashedPassword+"','J','W','j@w.c')"
                        // console.log(insertQuery)
                        var request = new sql.Request();
                        request.input('FirstName_2',sql.NVarChar,req.body.firstName)
                        request.input('LastName_3',sql.NVarChar,req.body.lastName)
                        request.input('Username_4',sql.NVarChar,username)
                        // request.input('Email',sql.NVarChar,'wsxjames8@gmail.com')
                        request.input('Password_5',sql.Text,hashedPassword)
                        // request.input('Type',sql.NVarChar,'student')
                        // connection.query(insertQuery,function(err, rows) {
                        request.execute("[dbo].[Create_Student]",(err,recordset)=>{
                            if(err) console.log(err)
                        })
                        // if (err) console.log(err)

                        
                        // });

                        connection.query("SELECT * FROM Person WHERE username = '" + username + "'",(err,rows)=>{
                            console.log("sent out"+JSON.stringify(rows))
                            return done(null, rows.recordset[0]);
                        })
                    })

                    
                    
                }
            
            
            });
        })
    );

    
	


    // =========================================================================
    // LOCAL LOGIN =============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'

    passport.use('local-login', new LocalStrategy({
        // by default, local strategy uses username and password, we will override with email
        usernameField : 'username',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass back the entire request to the callback
    },
    function(req, username, password, done) { // callback with email and password from our form
        console.log(username)
         connection.query("SELECT * FROM Person WHERE username = '" + username + "'",async(err,rows)=>{
            // console.log(rows.recordset[0].Password)
			if (err)
                return done(err);
			 if (!rows.recordset[0]) {
                console.log("crash?")
                return done(null, false); // req.flash is the way to set flashdata using connect-flash
            } 
			
			// if the user is found but the password is wrong
            if (!(await bcrypt.compare(password,rows.recordset[0].Password))){
                console.log("pswdwrong")
                return done(null, false); // create the loginMessage and save it to session as flashdata
            }
			
            // all is well, return successful user
            console.log("success")
            return done(null, rows.recordset[0]);			
		
		});
		// connection.end()


    }));

};