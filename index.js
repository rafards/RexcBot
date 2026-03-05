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
  console.log(`🚀 Enterprise System Online: ${client.user.tag}`);
});

/* ================= LOAD SYSTEMS ================= */

require("./systems/nicknameSystem")(client);
require("./systems/bracketSystem")(client);

/* ================================================= */

client.login(process.env.TOKEN);
