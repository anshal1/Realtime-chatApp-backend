const mongoose = require("mongoose")
const {Schema} = mongoose


const Chat = new Schema({
    Chatrommname:{
        type: String,
        required: true
    },
    type:{
        type: String,
        required: true
    },
    password:{
        type: String,
    },
    time:{
        type: String,
        required: true
    },
    no_of_users:{
        type: Number
    },
    Mood:{
        type: String,
        required: true
    },
    custom_msg:{
        type: String,
    },
    user_id:{
        type: String,
    },
    user_profile:{
        type: String,
    },
    date:{
        type: Date,
        default: Date.now
    },
    username:{
        type: String
    },
    no_of_user_joined:{
        type: Array
    }
})

const ChatSchema = mongoose.model("Chats", Chat)
module.exports = ChatSchema