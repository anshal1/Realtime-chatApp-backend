const express = require("express");
const ChatSchema = require("../schema/Chatroom.js");
const router = express.Router()
const User = require("../schema/User.js");
const Message = require("./ChatMsg.js");
const FindUser = require("./Getuser.js")


router.post("/chat/create/v0", FindUser, async (req, res) => {
    try {
        const { chatname, chattype, password, time, no_of_users, Mood, custom_msg } = req.body
        if (!chatname || !chattype || !time || !no_of_users || !Mood) {
            return res.status(400).json({ error: "Please fill the details" })
        }
        // ? checking if the chat already exists or not
        const find_chat = await ChatSchema.find({ Chatrommname: chatname })
        if (find_chat.length !== 0) {
            return res.status(400).json({ error: "Chat room with this name already exists" })
        }
        const createChat = new ChatSchema({
            Chatrommname: chatname,
            type: chattype,
            time: time,
            password,
            no_of_users,
            Mood,
            custom_msg,
            user_id: user._id,
            user_profile: "",
            username: user.username,
            no_of_user_joined: 0
        })
        createChat.save().catch((err) => {
            if (err) {
                return res.status(500).json({ error: "Something went Wrong" })
            }
        })
        res.json({ res: createChat })

    } catch (error) {
        if (error) {
            console.log(error)
            return res.status(500).json({ error: "Internal server error" })
        }
    }
})

router.post("/get/chat/v0", FindUser, async (req, res) => {
    try {

        const allChats = await ChatSchema.find({})
        const reverse = await allChats.reverse()
        const limited = reverse.slice(0, req.query.number)
        if (allChats.length < 1 || !allChats) {
            return res.json({ error: "No chats available" })
        }
        res.json({ totalChats: allChats.length, received: limited.length, limited })

    } catch (error) {
        if (error) {
            return res.status(500).json({ error: "Internal server error" })
        }
    }
})
router.delete("/delete/chat/v0/:id", FindUser, async (req, res) => {
    try {
        const find_chat = await ChatSchema.findById(req.params.id)
        if (!find_chat) {
            return res.status(404).json({ error: "Chat not found" })
        }
        if (find_chat.user_id !== user._id.toString()) {
            return res.status(401).json({ error: "Unauthorized action" })
        }
        const find_messageof_this_chat = await Message.deleteMany({ room_id: find_chat.Chatrommname })
        const Delete = await ChatSchema.findByIdAndDelete(req.params.id)
        res.json({ msg: "Chat deleted" })

    } catch (error) {
        if (error) {
            return res.status(500).json({ error: "Internal server error" })
        }
    }
})
router.get("/user/chat/v0/", FindUser, async (req, res) => {
    try {

        const allChats = await ChatSchema.find({ username: user.username })
        const reverse = await allChats.reverse()
        const limited = reverse.slice(0, req.query.number)
        if (allChats.length < 1 || !allChats) {
            return res.json({ error: "No chats available" })
        }
        res.json({ totalChats: allChats.length, received: limited.length, limited })

    } catch (error) {
        if (error) {
            return res.status(500).json({ error: "Internal server error" })
        }
    }
})
// ? saving the message into the data base
router.post("/send/message/", FindUser, async (req, res) => {
    try {
        const { text } = req.body
        const room_id = req.query.room
        if (!room_id) {
            return res.status(404).json({ error: "It seems that this room does not exists" })
        }
        const createMessage = new Message({
            text: text,
            username: user.username,
            profile: user.profile,
            room_id: room_id
        })
        createMessage.save().catch((err) => {
            if (err) {
                return res.status(500).json({ error: "Internal server error" })
            }
        })
        res.json({ createMessage })

    } catch (error) {
        if (error) {
            return res.status(500).json({ error: "Internal server error" })
        }
    }
})
router.get("/fetch/all/chat", FindUser, async (req, res) => {
    try {
        const allchats = await Message.find({ room_id: req.query.room_id })
        if (!allchats || allchats.length < 1) {
            return res.status(404).json({ msg: "No chats available" })
        }
        res.json({ allchats })
    } catch (error) {
        if (error) {
            return res.status(500).json({ error: "Internal server error" })
        }
    }
})
router.post("/join/chat/:id", FindUser, async (req, res) => {
    try {

        const find_chat = await ChatSchema.findById(req.params.id)
        const { password } = req.body
        if (!find_chat) {
            return res.status(404).json({ error: "This chat no longer exists" })
        }
        const no_of_users = find_chat.no_of_users
        const no_of_users_joined = find_chat.no_of_user_joined.length
        const update_user_joined = no_of_users_joined + 1
        // ? finding if the currentuser already exists in side the room
        const exists_user = find_chat.no_of_user_joined.find((ele) => {
            return ele === user.username
        })
        if (no_of_users_joined === no_of_users && !exists_user) {
            return res.status(400).json({ error: "This room is full" })
        }

        // ? checking if the room is private or not
        if (!exists_user) {
            if (find_chat.type === "Private") {
                if (password !== find_chat.password) {
                    return res.status(400).json({ error: "Invalid password" })
                }
                const edit = await ChatSchema.findByIdAndUpdate(req.params.id, { $push: { no_of_user_joined: user.username } }, { new: true })
                res.json({ edit })
            } else {
                const edit = await ChatSchema.findByIdAndUpdate(req.params.id, { $push: { no_of_user_joined: user.username } }, { new: true })
                res.json({ edit })
                return
            }
        } else {
            res.json({ edit: find_chat })
            return
        }
    } catch (error) {
        if (error) {
            return res.status(500).json({ error: "Internal server error" })
        }
    }
})
router.post("/leave/chat/:id", FindUser, async (req, res) => {
    try {
        const find_chat = await ChatSchema.findById(req.params.id)
        if (!find_chat) {
            return res.status(404).json({ error: "This chat no longer exists" })
        }
        const no_of_users_joined = find_chat.no_of_user_joined.length
        const edit = await ChatSchema.findByIdAndUpdate(req.params.id, { $pull: { no_of_user_joined: user.username } }, { new: true })
        res.json({ edit })
    } catch (error) {
        if (error) {
            console.log(error)
            return res.status(500).json({ error: "Internal server error" })
        }
    }
})
router.post("/get/room/", FindUser, async (req, res) => {
    try {
        const room_id = req.query.room
        const find_room = await ChatSchema.findById(room_id)
        if (!find_room) return
        res.json({ find_room })

    } catch (error) {
        if (error) {
            return res.status(500).json({ error: "Internal server error" })
        }
    }
})
router.put("/kick/user/", FindUser, async(req,res)=>{
    const room = req.query.room
    const user_to_kick = req.query.user
    const owner_of_room = req.query.owner
    if(!owner_of_room){
        return res.status(401).json({error: "Unauthorized action"})
    }
    if(!user_to_kick){
        return res.status(404).json({error: "User not found"})
    }
    const find_room = await ChatSchema.findById(room)
    if(!find_room){
        return res.status(404).json({error: "Room not found"})
    }
    if(find_room.username !== owner_of_room){
        return res.status(401).json({error: "Unauthorized action"})
    }
    const check_if_user_exists_in_room = find_room.no_of_user_joined.find((user)=>{
       return user === user_to_kick
    })
    if(!check_if_user_exists_in_room){
        return res.status(404).json({error: "No user with this username exists in the room"})
    }
    const edit = await ChatSchema.findByIdAndUpdate(room, { $pull: { no_of_user_joined: user_to_kick } }, { new: true })
    res.json({msg: `${user_to_kick} has been kicked out of the room`, edit})

})
module.exports = router