const config = require("../core/config");
const bracketManager = require("../features/bracket/bracketManager");

module.exports = (client) => {

  client.on("messageCreate", async (message) => {

    if (message.author.bot) return;

    if (message.content !== "!bracket") return;

    if (message.channel.id !== config.channels.bracket) return;

    if (!message.member.roles.cache.has(config.roles.organizer)) {
      return message.reply("Only organizer can use this.");
    }

    bracketManager.openSetup(message);

  });

};
