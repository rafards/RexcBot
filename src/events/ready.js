const { client } = require("../index")

client.once("clientReady", () => {
 console.log(`✅ Bot online sebagai ${client.user.tag}`)
})
