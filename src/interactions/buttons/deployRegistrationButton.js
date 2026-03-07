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

 raceState.registrationOpen = true

 if(!raceState.raceName || !raceState.slot){
  return interaction.reply({
   content:"❌ Setup race belum lengkap",
   ephemeral:true
  })
 }

 // ================= PLAYER PANEL =================

 const playerEmbed = new EmbedBuilder()
  .setTitle(`🏁 ${raceState.raceName}`)
  .setDescription(`Players\n0 / ${raceState.slot}`)

 const joinButton = new ButtonBuilder()
  .setCustomId("join_race")
  .setLabel("Join")
  .setStyle(ButtonStyle.Success)

 const leaveButton = new ButtonBuilder()
  .setCustomId("leave_race")
  .setLabel("Leave")
  .setStyle(ButtonStyle.Danger)

 const row = new ActionRowBuilder().addComponents(joinButton,leaveButton)

 const playerPanel = await playerChannel.send({
  embeds:[playerEmbed],
  components:[row]
 })

 raceState.playerPanelId = playerPanel.id

 // ================= ADMIN PANEL =================

 let list=""

 for(let i=1;i<=raceState.slot;i++){
  list += `${i}.\n`
 }

 const adminEmbed = new EmbedBuilder()
  .setTitle("📋 Player List")
  .setDescription(list)

 const adminPanel = await interaction.channel.send({
  embeds:[adminEmbed]
 })

 raceState.adminListPanelId = adminPanel.id

}

module.exports = { deployRegistrationButton }
