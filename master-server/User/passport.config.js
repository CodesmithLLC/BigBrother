var passport = require('passport'),
    User = require('./UserModel'),
    LocalStrategy = require('passport-local').Strategy;
/*
  configure passport local strategy
  note .use is passport's .use method here
  Creates a new passport local strategy (the relevant classname inside passportlocal is Strategy)
  When we call passport.authenticate('local') in the '/login' route, we create a new local strategy
  which takes in the given username and password
  we need to tell passport whether the username and pw are correct - we indicate with a callback done
*/
passport.use('local-login', new LocalStrategy(function(username, password, done){
  User.findOne({ username: username }, function(err, user) {
    //if err, pass the error as a 500 response
    if (err) return done(err);
    //if there is no user, we have a different problem
    if (!user) return done(null, false, { message: 'Unknown user ' + username });
    user.comparePassword(password, function(err, isMatch) {
      //if err, pass the error forward as a 500 response
      if (err) return done(err);
      //if bad password, we have a different problem
      if(!isMatch) return done(null, false, { message: 'Invalid password' });
      // if success then pass forward no error (null) and some sort of user object
      // the user object {id: username, name: username} gets passed to serializeUser
      console.log('match found');
      return done(null, user);
    });
  });
}));

passport.use('local-signup', new LocalStrategy(
  {passReqToCallback : true},
  function(req, username, password, done) {
    var email = req.body.email;
    User.create({
      username: username,
      password: password,
      email: email
    }, function(err, createdUser) {
      //if err, pass the error forward as a 500 response
      if(err) return done(err);
      console.log('===createdUser===',createdUser);
      done(null, createdUser);
    });
  }
));

/*
  we want to store an identifier in our session store under the particular sessionID given by express-session and stored in
  a cookie on the client's browser
  Configures how to serialize our users
*/
passport.serializeUser(function(user, done){
    console.log('Inside serializeUser', user);
    // To Do: query against database or cache these
    done(null, user.id);
});

// id here is returned from checking the sessionID in our session store (it has the id stored as its value)
passport.deserializeUser(function(id, done){
    // Query databsae/cache here
    console.log(id);
    User.findOne({_id:id},function(err,user){
      if(err) return done(err);
      if(!user) return done(new Error("this user does not exist"));
      done(void(0),user);
    });
});

module.exports = passport;
