var express = require('express');
var router = express.Router();
const userModel = require("./users");
const postModel = require("./post");
const passport = require('passport');
const upload = require("./multer");

const localStrategy = require('passport-local');
passport.use(new localStrategy(userModel.authenticate()));

router.get('/', function (req, res, next) {
  res.render('index');
});
router.get('/login', function (req, res, next) {
  res.render('login', { error: req.flash('error') });
});
router.get('/feed', isLoggedIn, async function (req, res, next) {
  const user = await userModel.findOne({ username: req.session.passport.user });
  const posts = await postModel.find()
  .populate("user");
  res.render('feed',{user,posts});
});

router.post('/createpost', isLoggedIn, upload.single('postimage'), async function (req, res, next) {
  if (!req.file) {
    return res.status(400).send('No files were uploaded.');
  }
  const user = await userModel.findOne({ username: req.session.passport.user });
  const post = await postModel.create({
    user: user._id,
    imageTitle: req.body.filetitle,
    imageText: req.body.filecaption,
    image: req.file.filename,
  });

  user.posts.push(post._id);
  await user.save();
  res.redirect("/profile");
});

router.get('/profile', isLoggedIn, async function (req, res, next) {
  const user = await userModel.findOne({
    username: req.session.passport.user,
  })
    .populate("posts");
  res.render('profile', { user });
});

router.get('/add', isLoggedIn, async function (req, res, next) {
  const user = await userModel.findOne({
    username: req.session.passport.user,
  })
  res.render('add', { user });
});

router.get('/show/post', isLoggedIn, async function (req, res, next) {
  const user = await userModel.findOne({
    username: req.session.passport.user,
  })
    .populate("posts");
  res.render('show', { user });
});

router.post('/fileupload', isLoggedIn, upload.single('image'), async function (req, res, next) { 
  const user = await userModel.findOne({ username: req.session.passport.user });
  user.profileImage = req.file.filename;
  await user.save();
  res.redirect('/profile');
});

router.post('/register', function (req, res) {
  const { username, email, fullname, password } = req.body;
  const userData = ({ username, email, fullname });

  userModel.register(userData, password)
    .then(function () {
      passport.authenticate("local")(req, res, function () {
        res.redirect("/profile");
      })
    })
    .catch(function (err) {
      console.error(err);
      res.redirect("/register"); // Redirect to registration page on error
    });
});


router.post('/login', passport.authenticate("local", {
  successRedirect: "/profile",
  failureRedirect: "/login",
  failureFlash: true,
}), function (req, res) {
});

router.get("/logout", function (req, res) {
  req.logout(function (err) {
    if (err) { return next(err); }
    res.redirect('/');
  });
});

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect("/login");
};

module.exports = router;
