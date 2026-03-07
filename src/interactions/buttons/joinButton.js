const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require("discord.js")
const { raceState } = require("../../data/raceState")

async function joinButton(interaction){

 if(interaction.customId !== "join_race") return

 if(!raceState.registrationOpen){
  return interaction.reply({
   content:"❌ Registration closed",
   ephemeral:true
  })
 }

 if(raceState.players.length >= raceState.slot){
  return interaction.reply({
   content:"❌ Slot penuh",
   ephemeral:true
  })
 }

 const modal = new ModalBuilder()
  .setCustomId("ign_modal")
  .setTitle("Enter IGN")

 const input = new TextInputBuilder()
  .setCustomId("ign_input")
  .setLabel("In Game Name")
  .setStyle(TextInputStyle.Short)
  .setRequired(true)

 const row = new ActionRowBuilder().addComponents(input)

 modal.addComponents(row)

 await interaction.showModal(modal)

}

module.exports = { joinButton }
