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
            console.log(rows.recordset[0].Password)
			if (err)
                return done(err);
			 if (rows.length==0) {
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