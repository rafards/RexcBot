const { EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require("discord.js")
const { raceState } = require("../../data/raceState")

async function deployRegistrationButton(interaction){

 if(interaction.customId !== "deploy_registration") return

 await interaction.deferUpdate()

 const playerChannel = interaction.guild.channels.cache.find(
  c => c.name === "info-race"
 )

 if(!playerChannel){
  return
 }

 if(!raceState.raceName || !raceState.slot){
  return
 }

 // buka pendaftaran
 raceState.registrationOpen = true

 // ================= PLAYER PANEL =================

 const playerEmbed = new EmbedBuilder()
  .setTitle(`🏁 ${raceState.raceName}`)
  .setDescription(`Players\n0/${raceState.slot}`)

 const disabled = !raceState.registrationOpen

 const joinButton = new ButtonBuilder()
  .setCustomId("join_race")
  .setLabel("Join")
  .setStyle(ButtonStyle.Success)
  .setDisabled(disabled)

 const leaveButton = new ButtonBuilder()
  .setCustomId("leave_race")
  .setLabel("Leave")
  .setStyle(ButtonStyle.Danger)
  .setDisabled(disabled)

 const row = new ActionRowBuilder().addComponents(joinButton,leaveButton)

 const playerPanel = await playerChannel.send({
  embeds:[playerEmbed],
  components:[row]
 })

 raceState.playerPanelId = playerPanel.id
 raceState.playerPanelChannelId = playerChannel.id

 // ================= ADMIN PANEL =================

 let list=""

 for(let i=1;i<=raceState.slot;i++){
  list += `${i}.\n`
 }

 const adminEmbed = new EmbedBuilder()
  .setTitle("📋 Player List")
  .setDescription(list)

 const fillButton = new ButtonBuilder()
 .setCustomId("fill_test_players")
 .setLabel("Fill Test Players")
 .setStyle(ButtonStyle.Secondary)

 const fill = new ActionRowBuilder().addComponents(fillButton)

 const adminPanel = await interaction.channel.send({
  embeds:[adminEmbed],
  components:[fill]
 })

 raceState.adminListPanelId = adminPanel.id
 raceState.adminListChannelId = interaction.channel.id

}

module.exports = { deployRegistrationButton }
