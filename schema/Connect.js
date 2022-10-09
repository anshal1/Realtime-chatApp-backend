const mongoose = require("mongoose")
const URI = "mongodb://localhost:27017/moody-chat"
const connect = ()=>{
    try {
        mongoose.connect(URI, ()=>{
            console.log("Connected To MDB")
        })
    } catch (error) {
        if(err){
            console.log(error)
        }
    }
}
module.exports = connect