'use strict';

var express = require("express");
var app = express();
var passport = require("passport");
require("./config/passport")
var mongoose = require("mongoose");
var session = require("express-session");
var Bulb = require("./bulbschema");
var uristring = process.env.MONGOLAB_URI;
var bodyParser = require("body-parser");
var multer = require("multer")
var cloudinary = require('cloudinary');
var fs = require("fs");
var path = require('path');
var Datauri = require('datauri')

mongoose.connect(uristring, function(err, res) {
    if (err) {
        console.log('ERROR connecting to: ' + uristring + '. ' + err);
    } else {
        console.log('Succeeded connected to: ' + uristring);
    }
});
mongoose.Promise = global.Promise;

app.use(session({
    secret: 'ppmakeitcountsapp',
    resave: false,
    saveUninitialized: true,

}));

//router.put('/me', cloudinaryUpload.fields([{name: 'cover', maxCount:1}]));
app.use(passport.initialize());
app.use(passport.session());

app.use(express.static(__dirname + '/public/uploads'));

var storage = multer.memoryStorage({
    filename: function(req, file, cb) {
        cb(null, Date.now() + file.originalname)
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
cloudinary.config({
    cloud_name: 'ppmakeitcount',
    api_key: '195835998171227',
    api_secret: '2kbxGdgLjOxBnDoDOGY_Qyw-iqs'
});
app.locals.api_key = cloudinary.config().api_key;
app.locals.cloud_name = cloudinary.config().cloud_name;

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
app.post('/add/details', cpUpload, function(req, res) {
    var data = req.body;
    var propicURL, img1URL, img2URL;
    var newObj = {};
    var dUri = new Datauri();

    dUri.format(path.extname(req.files.propic[0].originalname).toString(), req.files.propic[0].buffer);
    cloudinary.uploader.upload(dUri.content, function(result) {
        propicURL = result.url;

        dUri.format(path.extname(req.files.pjImg1[0].originalname).toString(), req.files.pjImg1[0].buffer);
        cloudinary.uploader.upload(dUri.content, function(result) {
            img1URL = result.url;
            dUri.format(path.extname(req.files.pjImg2[0].originalname).toString(), req.files.pjImg2[0].buffer);
            cloudinary.uploader.upload(dUri.content, function(result) {
                img2URL = result.url;


                newObj = {
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
                    "propic": propicURL,
                    "projects": [{
                        "pjName": data.pjName1,
                        "pjDetails": data.pjDetails1,
                        "pjImg": img1URL,
                        "pjLink": data.pjLink1
                    }, {
                        "pjName": data.pjName2,
                        "pjDetails": data.pjDetails2,
                        "pjImg": img2URL,
                        "pjLink": data.pjLink2
                    }]
                }


                // Bulb.findOne({
                //     'user_id': '953'
                // }, function(err, doc) {
                //     if (err) console.log(err);
                //     if (doc) {
                //         doc.profile = newObj;
                //         doc.save(function(err, doc) {
                //             if (doc) {
                //                 res.render('main', {
                //                     done: true
                //                 })
                //             }
                //
                //         });
                //
                //     } else {
                //         var bulb = new Bulb();
                //         bulb.user_id = '953';
                //         bulb.profile = newObj;
                //
                //         bulb.save(function() {
                //             res.render('main', {
                //                 done: true
                //             })
                //         })
                //
                //     }
                // })

                res.send(newObj)
            });
        });
    });

    // if (!res.locals.login) {
    //     console.log("checkin auth");
    //     res.send('you are not loged in');
    // }



});

app.listen(process.env.PORT || 3000, function() {
    console.log('listening on' + process.env.PORT);
});
