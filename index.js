const createBot = require("./src/core/bot");
const config = require("./src/core/config");

const messageEvent = require("./src/events/messageCreate");
const interactionEvent = require("./src/events/interactionCreate");

const nicknameFeature = require("./src/features/nickname");

const client = createBot();

messageEvent(client);
interactionEvent(client);

nicknameFeature(client);

client.once("ready", () => {

  console.log(`Bot Online: ${client.user.tag}`);

});

client.login(config.TOKEN);
