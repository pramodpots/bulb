var express = require("express");
var app = express();
var profile = require("./public/profile.json");
var passport = require("passport");
require("./config/passport")
var mongoose = require("mongoose");
var session = require("express-session");
var Bulb = require("./bulbschema");
var cool = require('cool-ascii-faces');
var uristring = process.env.MONGOLAB_URI;
var bodyParser = require("body-parser");
var multer = require("multer")
var cloudinary = require('cloudinary');
var multerCloudinary = require('multer-cloudinary');
mongoose.connect(uristring, function(err, res) {
    if (err) {
        console.log('ERROR connecting to: ' + uristring + '. ' + err);
    } else {
        console.log('Succeeded connected to: ' + uristring);
    }
});

cloudinary.config({
    cloud_name: 'ppmakeitcount',
    api_key: '195835998171227',
    api_secret: '2kbxGdgLjOxBnDoDOGY_Qyw-iqs'
});

app.use(session({
    secret: 'ppmakeitcountsapp',
    resave: false,
    saveUninitialized: true,

}));

var cloudinaryStorage = multerCloudinary({
    cloudinary: cloudinary
});
var cloudinaryUpload = multer({
    storage: cloudinaryStorage
});
//router.put('/me', cloudinaryUpload.fields([{name: 'cover', maxCount:1}]));
app.use(passport.initialize());
app.use(passport.session());

app.use(express.static(__dirname + '/public/uploads'));
// var storage = multer.diskStorage({
//     destination: function(req, file, cb) {
//         cb(null, __dirname + '/public/uploads')
//     },
//     filename: function(req, file, cb) {
//         cb(null, Date.now() + file.originalname)
//     }
// })

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
    res.locals.user = req.user;
    res.locals.fullUrl = req.get('host') + '/user/';
    next();
})

app.get('/', function(req, res) {

    res.render('main', {
        "user": req.user
    })
})

app.get('/uploadSingle', function(req, res) {
    cloudinary.uploader.upload('pp.jpeg', function(result) {
        console.log(result)
    });
    res.sendStatus(200);
})

app.get('/user/:id', function(req, res) {
    Bulb.findOne({
        'user_id': req.params.id
    }, function(err, doc) {
        if (err) {
            console.log(err);
            res.send("user not found");
        }
        if (doc) {
            res.render('index', {
                profile: doc.profile
            })
        }
    })
})

app.get('/profile', function(req, res) {
    // if (!res.locals.login) {
    //     console.log("checkin auth");
    //     res.redirect('/')
    // }

    res.render('form');
})

app.get('/login',
    passport.authenticate('google', {
        scope: ['https://www.googleapis.com/auth/plus.login']
    }));
app.route('/auth/google/callback')
    .get(passport.authenticate('google', {
        successRedirect: '/',
        failureRedirect: '/donowhere'
    }));
app.get('/logout', function(req, res) {
    req.logout();
    req.session.destroy()
    res.redirect('/')
})
var cpUpload = upload.fields([{
    name: 'propic',
    maxCount: 1
}, {
    name: 'pjImg1',
    maxCount: 1
}, {
    name: 'pjImg2',
    maxCount: 1
}])
app.post('/add/details', cloudinaryUpload.fields([{
    name: 'cover',
    maxCount: 1
}]), function(req, res) {
    var data = req.body;

    cloudinary.uploader.upload(req.files.propic[0], function(result) {
        console.log(result)
    });
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

    // if (!res.locals.login) {
    //     console.log("checkin auth");
    //     res.send('you are not loged in');
    // }

    Bulb.findOne({
        'user_id': req.user._id
    }, function(err, doc) {
        if (err) console.log(err);
        if (doc) {
            doc.profile = newObj;
            doc.save(function(err, doc) {
                if (doc) {
                    res.render('main', {
                        done: true
                    })
                }

            });

        } else {
            var bulb = new Bulb();
            bulb.user_id = req.user._id;
            bulb.profile = newObj;

            bulb.save(function() {
                res.render('main', {
                    done: true
                })
            })

        }
    })

});

app.listen(process.env.PORT || 3000, function() {
    console.log('listening on' + process.env.PORT);
});
