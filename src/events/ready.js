const { client } = require("../index")

client.on("clientready", () => {

 console.log(`Bot aktif sebagai ${client.user.tag}`)

})
