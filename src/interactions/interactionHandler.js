module.exports = (client) => {

  client.on("interactionCreate", async (interaction) => {

    if (!interaction.isButton()) return;

    const id = interaction.customId;

    if (id === "join_race") {
      require("./buttons/joinRace")(interaction);
    }

  });

};
