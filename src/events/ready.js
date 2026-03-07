const { client } = require("../index")

client.once("ready", () => {

 console.log(`Bot aktif sebagai ${client.user.tag}`)

})
