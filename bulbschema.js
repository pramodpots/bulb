'use strict';

var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var bulbSchema = new Schema({
    user_id : {
        type: String,
        required: true
    },
    profile: {
        "name": String,
        "email": String,
        "about": String,
        "skills": String,
        "linkedin": String,
        "github": String,
        "facebook": String,
        "twitter": String,
        "experiance": [],
        "achievements": [],
        "academics": [],
        "extra": [],
        "propic": String,
        "projects": []
    }

})


module.exports = mongoose.model('bulbSchema', bulbSchema);
