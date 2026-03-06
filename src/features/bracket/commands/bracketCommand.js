const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

module.exports.execute = async (message) => {

  const embed = new EmbedBuilder()
    .setTitle("BRACKET CONTROL PANEL")
    .setDescription("Setup tournament");

  const row = new ActionRowBuilder().addComponents(

    new ButtonBuilder()
      .setCustomId("create_bracket")
      .setLabel("Create Tournament")
      .setStyle(ButtonStyle.Primary)

  );

  message.channel.send({
    embeds: [embed],
    components: [row]
  });

};
