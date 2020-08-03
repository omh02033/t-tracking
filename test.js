
const express = require('express')
const app = express()
const io = require('socket.io')

const server = require('http').createServer(app)


server.listen(3000, () => {

})

io.on('connection', socket => {
    socket.emit('send user', socket.id)
})



io.on('send user', data => {
    console.log(data)
})