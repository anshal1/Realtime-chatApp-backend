const mongoose = require("mongoose")
const URI = "mongodb+srv://anshal:anshalisgreat@cluster0.0xywu.mongodb.net/instagram"
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
