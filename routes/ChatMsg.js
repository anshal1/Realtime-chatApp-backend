const mongoose = require("mongoose")
const {Schema} = mongoose

const Chat = new Schema({
    text:{
        type: String,
        require: true
    },
    username:{
        type: String
    },
    profile:{
        type: String
    },
    room_id:{
        type: String
    },
    date:{
        type: Date,
        default: Date.now
    }
})

const Message = mongoose.model("messages", Chat)
module.exports = Message