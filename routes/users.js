var express = require('express');
var router = express.Router();
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var User = require('../models/user')
// var multer = require('multer');

// var upload = multer({ dest: './uploads/' })



// .single('profileimage');
var multer = require('multer');

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '.jpg') //Appending .jpg
  }
})
var upload = multer({ storage: storage });
/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});
router.get('/register', function(req, res, next) {
  res.render('register',{
  	title:'Register'
  });
});
router.get('/login', function(req, res, next) {
  res.render('login',{
  	title:'Login'
  });
});

router.post('/register', upload.single('profileimage'),function(req,res,next){
	// get form value
	var name = req.body.name;
	
	var email = req.body.email;
	var username = req.body.username;
	var password = req.body.password;
	var password2 = req.body.password2;



// check image field
console.log("body printing");
console.log(req.body);

console.log(req.files)

if(req.files){
	console.log('Uploading file......');
console.log(req.files)
// file info 
var profileImageOriginalName = req.files.originalname;
var profileImageName = req.files.name;
var profileImageMime = req.files.mimetype;
var profileImagePath = req.files.path;
var profileImageExt = req.files.extension;
var profileImageSize = req.files.size;
}else
{
	// set a default image
	var profileImageName = 'noimage.png';
}

// form validation
req.checkBody('name','Name field is required').notEmpty();
req.checkBody('email','Email field is required').notEmpty();
req.checkBody('email','Enter Valid Email').isEmail();
req.checkBody('username','Name field is required').notEmpty();
req.checkBody('password','Name field is required').notEmpty();
req.checkBody('password2','Name field is required').equals(req.body.password);

//check for errors
var errors = req.validationErrors();
if(errors){
	
	res.render('register',{
		errors:errors,
		name:name,
		email:email,
		username:username,
		password:password,
		password2:password2
	});
}else{
	var newUser = new User({
		name:name,
		email:email,
		username:username,
		password:password,
		profileimage:profileImageName
	});
	console.log(newUser);
	// create user
	User.createUser(newUser,function(err, user){
		if(err) throw err;
		console.log("kashikhan")
		console.log(user);


	});
	console.log("chalo")
	req.flash('success','You are registered and eligible for log in');
	// res.location('/');
	res.redirect('/');
	 //  res.render('register',{
  // 	title:'Register'
  // });
}

});

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.getUserById(id, function(err, user) {
    done(err, user);
  });
});


 
passport.use(new LocalStrategy(
	function(username,password,done){
		User.getUserByUsername(username,function(err,user){
			if(err) throw err;
			if(!user){
				console.log('Invalid User');
				return done(null,false,{message:'Unknown User'});
			}
		User.comparePassword(password,user.password,function(err,isMatch){
			if(err) throw err;
			if(isMatch){
				return done(null,user);
			}
			else{
				console.log('Invalid Password');
				return done(null,false,{message:'Invalid Password'});
			}


		});
		});
	}
	));



router.post('/login',passport.authenticate('local',{
	failureRedirect:'/users/login',
	failureFlash:'invalid username or password'
}),function(req,res){
	console.log("Authentication success");
	req.flash('success' ,'You are logged in');
	res.redirect('/');
});

router.get('/logout',function(req,res){
	req.logout();
	req.flash('success','You have logged out');
	res.redirect('/users/login');

});

module.exports = router;
