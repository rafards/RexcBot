const { Client, GatewayIntentBits } = require("discord.js")
const config = require("./config/config")

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

client.login(config.token)
