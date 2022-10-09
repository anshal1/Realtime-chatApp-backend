const mongoose = require("mongoose")
const {Schema} = mongoose


const User = new Schema({
    username:{
        type: String,
        required: true
    },
    email:{
        type: String,
        required: true
    },
    password:{
        type: String,
        required: true
    },
    gender:{
        type: String,
        required: true
    },
    profile:{
        type: String
    },
})

const UserSchema = mongoose.model("Users", User)
module.exports = UserSchema