const { EmbedBuilder } = require("discord.js");

module.exports.openSetup = async (message) => {

  const embed = new EmbedBuilder()
    .setTitle("Bracket Setup")
    .setDescription("Create new race tournament")
    .addFields(
      { name: "Step 1", value: "Tournament Name" },
      { name: "Step 2", value: "Registration Type" },
      { name: "Step 3", value: "Lap Count" },
      { name: "Step 4", value: "Player Slots" }
    );

  message.channel.send({ embeds: [embed] });

};
