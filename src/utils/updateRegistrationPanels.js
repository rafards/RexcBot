const { EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require("discord.js")
const { raceState } = require("../data/raceState")

async function updateRegistrationPanels(interaction){

 const guild = interaction.guild

 // ======================
 // PLAYER PANEL
 // ======================

 const playerChannel = guild.channels.cache.find(c => c.name === "info-race")

 const playerPanel = await playerChannel.messages.fetch(raceState.playerPanelId)

 const playerEmbed = new EmbedBuilder()
  .setTitle(`🏁 ${raceState.raceName}`)
  .setDescription(`Players\n${raceState.players.length} / ${raceState.slot}`)

 const joinButton = new ButtonBuilder()
  .setCustomId("join_race")
  .setLabel("Join")
  .setStyle(ButtonStyle.Success)

 const leaveButton = new ButtonBuilder()
  .setCustomId("leave_race")
  .setLabel("Leave")
  .setStyle(ButtonStyle.Danger)

 const row = new ActionRowBuilder().addComponents(joinButton,leaveButton)

 await playerPanel.edit({
  embeds:[playerEmbed],
  components:[row]
 })

 // ======================
 // ADMIN PANEL
 // ======================

 const adminChannel = guild.channels.cache.find(c => c.name === "setup-bot")

 const adminPanel = await adminChannel.messages.fetch(raceState.adminListPanelId)

 let list = ""

 raceState.players.forEach((p,i)=>{
  list += `${i+1}. ${p.ign}\n`
 })

 for(let i=raceState.players.length+1;i<=raceState.slot;i++){
  list += `${i}.\n`
 }

 const adminEmbed = new EmbedBuilder()
  .setTitle("📋 Player List")
  .setDescription(list)

 await adminPanel.edit({
  embeds:[adminEmbed]
 })

}

module.exports = { updateRegistrationPanels }
