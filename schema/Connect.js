const mongoose = require("mongoose")
require("dotenv").config();
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
