const mongoose = require("mongoose")
const URI = process.env.MD
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
