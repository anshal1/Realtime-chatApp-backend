const jwt = require("jsonwebtoken")
const User = require("../schema/User.js")
const express = require("express")
const FindUser =async (req, res, next)=>{
    try {
        const token = req.header("unknown")
        if(!token){
            return res.status(401).json({error: "Unauthorized action"})
        }
        const secret = process.env.Secret_Key
        const decode = jwt.verify(token, secret)
        id = decode.token
        const find_user = await User.findById(id)
        if(!find_user){
            return res.status(404).json({error: "User not found"})
        }
        user = find_user
    } catch (error) {
        if(error){
            return res.status(500).json({error: "Internal Server Error"})
        }
    }
    next()
}
module.exports = FindUser