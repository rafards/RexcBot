const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require("discord.js")
const { raceState } = require("../../data/raceState")
const { updateRegistrationPanels } = require("../../utils/updateRegistrationPanels")

async function joinButton(interaction){

 if(interaction.customId !== "join_race") return

 if(!raceState.registrationOpen){
  return interaction.reply({content:"❌ Registration closed",ephemeral:true})
 }

 const already = raceState.players.find(p=>p.id===interaction.user.id)

 if(already){
  return interaction.reply({content:"⚠️ You already joined",ephemeral:true})
 }

 if(raceState.players.length >= raceState.slot){
  return interaction.reply({content:"❌ Slot full",ephemeral:true})
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

const index = raceState.players.findIndex(p => p.id === interaction.user.id)

if(index === -1){

 return interaction.reply({
  content:"❌ You are not registered",
  ephemeral:true
 })

}

raceState.players.splice(index,1)

await updateRegistrationPanels(interaction)

await interaction.reply({
 content:"👋 You left the race",
 ephemeral:true
})

module.exports = { joinButton, leaveButton }
