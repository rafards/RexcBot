const { Client, GatewayIntentBits } = require("discord.js");

function createBot() {

  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMembers,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent
    ]
  });

  return client;

}

module.exports = createBot;
