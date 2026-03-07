const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require("discord.js")

async function handleBracketButtons(interaction){

 if(interaction.customId === "set_race_name"){

  const modal = new ModalBuilder()
   .setCustomId("race_name_modal")
   .setTitle("Set Race Name")

  const raceInput = new TextInputBuilder()
   .setCustomId("race_name_input")
   .setLabel("Race Name")
   .setStyle(TextInputStyle.Short)
   .setRequired(true)

  const row = new ActionRowBuilder().addComponents(raceInput)

  modal.addComponents(row)

  await interaction.showModal(modal)

 }

}

module.exports = { handleBracketButtons }
