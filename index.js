const express = require("express")
const app = express()
const http = require("http")
const server = http.createServer(app)
const hostname = "0.0.0.0"
const { Server } = require("socket.io")
require("dotenv").config()
const io = new Server(server, {
    cors: {
        origin: "https://realtime-chatapp-frontend.vercel.app"
    }
})
const PORT = 5999 || process.env.PORT
const cors = require("cors")
const connect = require("./schema/Connect.js")
const ChatSchema = require("./schema/Chatroom.js")
connect()
app.use(cors({
    origin: "https://realtime-chatapp-frontend.vercel.app"
}))
app.use(express.json())
app.use("/", require("./routes/Auth.js"))
app.use("/", require("./routes/CreateChat.js"))


// ? All sockets will be here
let rooms = []
let users = []
io.on("connection", async socket => {
    // ? this code will fetch all the rooms from the database and push it into the room array
    const allrooms = await ChatSchema.find({})
    allrooms.forEach((ele) => {
        if (!rooms.includes(ele.Chatrommname)) {
            rooms.push(ele.Chatrommname)
        }
    })
    socket.on("roomcreated", data => {
        io.emit("receive_room", data)
        // ? adding room the rooms array
        rooms.push(data.Chatrommname)
    })
    // ? adding all online users to the users array
    socket.on("user_sended", data => {
        // ? checking if user already exists or not if user exists then we do not want to add the user
        if (data) {
            const find_user = users.find((user) => {
                return data.username === user.user_data
            })
            if (find_user) {
                return
            } else {
                users.push({ user_data: data.username, socketID: socket.id })
                io.emit("allusers", users)
                return
            }
        }
    })

    // ? checking if room exists or not in the server (not database)
    socket.on("find_room", async data => {
        try {
            const find_room = rooms.find((room) => {
                return room === data.roomname
            })
            if (find_room) {
                socket.join(find_room)
                const current_room = await ChatSchema.find({ Chatrommname: find_room })
                // ? getting the no of users in this specific room
                io.to(find_room).emit("user_connected_to_room", current_room)
                // ? sending message to all user except for the user who just joined
                io.sockets.to(find_room).emit("Welcome_msg", `${data.user.username} joined ${find_room} chatroom`)
                // ? sending message to the user who just connected 
                io.to(data.socket).emit("welcome_msg_private", `You successfully joined the ${find_room} `)
                return
            }
            if (!find_room) {
                io.to(data.socket).emit("no_room-exists", "This room no longer exists in the server memory")
                return
            }
        } catch (error) {
            if (error) {
                return res.status(500).json({ error: "Internal server error" })
            }
        }
    })
    // ? sending message to specific room
    socket.on("receive_msg_from_room", async msg => {
        const find_room = rooms.find((room) => {
            return room === msg.data.room_id
        })
        io.to(find_room).emit("send_msg_to_room", msg)
    })
    // ? this event is use for when the user is in the chatting and reloads the page, by default the user will be removed from the room (inside the server only) so this is event will re-add the user to their specific room
    socket.on("loaded", async data => {
        const find_room = rooms.find((room) => {
            return room === data.roomname
        })
        if (find_room) {
            socket.join(find_room)
            const current_room = await ChatSchema.find({ Chatrommname: find_room })
            // ? getting the no of users in this specific room
            io.to(find_room).emit("user_connected_to_room", current_room)
            // ? sending message to all user except for the user who just joined
            io.sockets.to(find_room).emit("Welcome_msg", `${data.user.username} joined ${find_room} chatroom`)
            // ? sending message to the user who just connected 
            io.to(data.socket).emit("welcome_msg_private", `You successfully joined the ${find_room} `)
            return
        }
    })
    // ? emiting event to a specific room if the room is deleted by the user and his friends and other people are still inside the room
    socket.on("room_deleted", data => {
        const find_room = rooms.find((room) => {
            return room === data.roomname
        })
        if (find_room) {
            io.to(find_room).emit("room_deleted_msg", "This room has been deleted by the user")
        }
        rooms = rooms.filter((room) => {
            return room !== find_room
        })
        console.log("rooms: ", rooms)
    })
    // ? removing the user from the room
    socket.on("leave_room", async data => {
        socket.leave(data.roomname)
        io.to(data.roomname).emit("user_left", data)
        const current_room = await ChatSchema.find({ Chatrommname: data.roomname })
        // ? getting the no of users in this specific room
        io.to(data.roomname).emit("user_connected_to_room", current_room)
    })
    // ? sending the msg to the user that he/she has been kicked out of the room
    socket.on("kick_out", data =>{
        io.to(data.res.edit.Chatrommname).emit("user_kicked", data.res.msg)
        const find_user = users.find((user)=>{
            return user.user_data === data.kick_user
        })
        io.to(find_user.socketID).emit("you_got_kicked", "The owner of the room has kicked you")
    })
    socket.on("disconnect", () => {
        users = users.filter((user) => {
            return user.socketID !== socket.id
        })
        io.emit("allusers", users)
        io.to(socket.id).emit("You_left", `You left the room`)
    })
})

server.listen(PORT, ()=>{
    console.log(`App listening on ${PORT}`)
})
