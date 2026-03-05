require("dotenv").config();
const { Client, GatewayIntentBits } = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

client.once("clientReady", () => {
  console.log(`🚀 Bot Online: ${client.user.tag}`);
});

/* LOAD SYSTEMS */
require("./systems/nicknameSystem")(client);
// nanti tambah bracketSystem di sini

client.login(process.env.TOKEN);
