const { client } = require("../index")

client.once("clientready", () => {

 console.log(`Bot aktif sebagai ${client.user.tag}`)

})
