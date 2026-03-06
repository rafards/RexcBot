const bracketCommand = require("../features/bracket/commands/bracketCommand");

module.exports = (client) => {

  client.on("messageCreate", async (message) => {

    if (message.author.bot) return;

    if (message.content === "!bracket") {
      return bracketCommand.execute(message, client);
    }

  });

};
