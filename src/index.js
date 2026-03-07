const { Client, GatewayIntentBits } = require("discord.js")
const config = require("./config/config")

const { deployBracket } = require("./commands/bracket/deployBracket")

const client = new Client({
 intents: [
  GatewayIntentBits.Guilds,
  GatewayIntentBits.GuildMessages,
  GatewayIntentBits.MessageContent
 ]
})

module.exports = { client }

require("./events/ready")
require("./events/interactionCreate")

client.on("messageCreate", async (message) => {

 if (message.author.bot) return

 if (message.content === "!bracket") {
  deployBracket(message)
 }

})

client.login(config.token)
