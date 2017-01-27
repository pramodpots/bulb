var express = require("express");
var app = express();
var profile = require("./public/profile.json");
var passport = require("passport");
require("./config/passport")
var mongoose = require("mongoose");
var session = require("express-session");
var Bulb = require("./bulbschema");


mongoose.connect('localhost:27017/data')

app.use(session({
    secret: 'ppmakeitcountsapp',
    resave: false,
    saveUninitialized: true,

}));



app.use(passport.initialize());
app.use(passport.session());

app.use(express.static(__dirname + '/public/uploads'));
var bodyParser = require("body-parser");
var multer = require("multer")
var storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, __dirname + '/public/uploads')
    },
    filename: function(req, file, cb) {
        cb(null, req.user._id + Date.now() + file.originalname)
    }
})

var upload = multer({
        storage: storage
    })
    //var cpUpload = upload.fields([{ name: 'propic', maxCount: 1 }, { name: 'pjImg1', maxCount: 1 }])
app.set("views", "./views");
app.set("view engine", "jade");

app.use(bodyParser.urlencoded({
    extended: true
}))
app.use(bodyParser.json())
app.use(express.static("public"))


app.use(function(req, res, next) {
    res.locals.login = req.isAuthenticated();
    res.locals.session = req.session;
    next();
})

app.get('/main', function(req, res) {
    //console.log(req.user.account.id);
    res.render('main', {
        "user": req.user
    })
})

app.get('/', function(req, res) {
    console.log(__dirname)
    console.log(req.user._id);
    res.render('index', {
        "profile": profile
    });

})

app.get('/profile', function(req, res) {
    res.render('form');
})
app.get('/projects', function(req, res) {
    res.render('projects');
})

// authentication

//app.get('/login', passport.authenticate('google', { scope: 'https://www.google.com/m8/feeds' }));
app.get('/login',
    passport.authenticate('google', {
        scope: ['https://www.googleapis.com/auth/plus.login']
    }));
app.route('/auth/google/callback')
    .get(passport.authenticate('google', {
        successRedirect: '/main',
        failureRedirect: '/donowhere'
    }));
app.get('/logout', function(req, res) {
    req.logout();
    req.session.destroy()
    res.redirect('/')
})

app.post('/add/details', upload.fields([{
    name: 'propic',
    maxCount: 1
}, {
    name: 'pjImg1',
    maxCount: 1
}, {
    name: 'pjImg2',
    maxCount: 1
}]), function(req, res) {
    var data = req.body;

    var newObj = {
        "name": data.name,
        "email": data.email,
        "about": data.about,
        "skills": data.skills,
        "linkedin": data.linkedin,
        "github": data.github,
        "facebook": data.facebook,
        "twitter": data.twitter,
        "experiance": data.experiance,
        "achievements": data.achievements,
        "academics": data.academics,
        "extra": data.extra,
        "propic": req.files.propic[0].filename,
        "projects": [{
            "pjName": data.pjName1,
            "pjDetails": data.pjDetails1,
            "pjImg": req.files.pjImg1[0].filename,
            "pjLink": data.pjLink1
        }, {
            "pjName": data.pjName2,
            "pjDetails": data.pjDetails2,
            "pjImg": req.files.pjImg2[0].filename,
            "pjLink": data.pjLink2
        }]
    }

    if (!res.locals.login) {
        console.log("checkin auth");
        res.send('you are not loged in');
    }
    
    Bulb.findOne( { 'user_id' : req.user._id }, function(err,doc){
        if(err) console.log(err);
        if(doc){
            doc.profile = newObj;
            doc.save(function(){
                res.render('index',{
                profile: doc.profile
            })
            });
            
        }
        else{
            var bulb = new Bulb();
            bulb.user_id = req.user._id;
            bulb.profile = newObj;
            
            bulb.save(function(){
                res.render('index',{
                profile: newObj
            })
            })
            
        }
    })
    
});

app.post('/add/projects', function(req, res) {
    var d = req.body;
    var temp = [];
    for (var i = 0; i < req.body.email.length; i++) {
        var obj = {
            "pjName": d.pjName[i],
            "pjDetails": d.pjDetails[i],
            "pjImg": d.pjImg[i],
            "pjLink": d.pjLink[i]
        }
        temp.push(obj);
    }
    res.send(temp);
})

app.listen(8080, function() {
    console.log("running..........");
})
