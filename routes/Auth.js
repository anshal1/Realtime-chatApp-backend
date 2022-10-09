const express = require("express");
const router = express.Router()
const User = require("../schema/User.js")
const bc = require("bcryptjs")
const jwt = require("jsonwebtoken")
const FindUser = require("./Getuser.js")

// ? SignUP router
router.post("/auth/v0/signup", async (req, res) => {
    try {
        const { username, email, password, gender, profile } = req.body
        const find_user = await User.find({ username, email})
        if (!username || !email || !password || !gender) {
            return res.status(400).json({ error: "Please fill the details" })
        }
        if (find_user.length >=1) {
            return res.status(400).json({ error: "User already exisit" })
        }
        const salt = bc.genSaltSync(10)
        const hash_password = bc.hashSync(password, salt)
        const createUser = new User({
            username,
            email,
            password: hash_password,
            gender,
            profile
        })
        createUser.save().catch((err) => {
            if (err) {
                console.log(err)
                return res.status(500).json({ error: "Internal server error" })
            }
        })
        const secret = process.env.Secret_Key
        const sign = jwt.sign({ token: createUser._id }, secret)
        res.json({  sign })
    } catch (error) {
        if (error) {
            console.log(error)
            return res.status(500).json({ error: "Internal server error" })
        }
    }
})


// ? login router
router.post("/auth/v0/login", async (req, res) => {
    try {
        const { username, password } = req.body
        if (!username || !password) {
            return res.status(400).json({ error: "Please fill the details" })
        }
        const find_user = await User.findOne({ username })
        if (!find_user) {
            return res.status(404).json({ error: "User does not exisit" })
        }
        const comparePass = bc.compareSync(password, find_user.password)
        if (!comparePass) {
            return res.status(401).json({ error: "Invalid details" })
        }
        const secret = process.env.Secret_Key
        const sign = jwt.sign({ token: find_user._id }, secret)
        res.json({ sign })
    } catch (error) {
        if (error) {
            console.log(error)
            return res.status(500).json({ error: "Internal server error" })
        }
    }
})

// ? Guest account
router.post("/auth/v0/guest", async (req, res) => {
    const find_user = await User.find({})
    const secret = process.env.Secret_Key
    const salt = bc.genSaltSync(10)
    const hash_password = bc.hashSync("GuestUser" + (find_user.length + 1), salt)
    const GuestUser = new User({
        username: "GuestUser" + (find_user.length + 1),
        email: "GuestUser@gmail.com",
        password: hash_password,
        gender: "Unknown",
        profile: ""
    })
    GuestUser.save().catch((err) => {
        if (err) {
            return res.status(500).json({ error: "Internal server error" })
        }
    })
    const sign = jwt.sign({ token: GuestUser._id }, secret)
    res.json({ sign })
})
// ? getting current user
router.post("/auth/get/user/v0", FindUser, (req, res)=>{
    res.json({user})
})
module.exports = router