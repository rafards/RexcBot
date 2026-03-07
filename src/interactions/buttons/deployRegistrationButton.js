const { EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require("discord.js")
const { raceState } = require("../../data/raceState")

async function deployRegistrationButton(interaction){

 if(interaction.customId !== "deploy_registration") return

 const playerChannel = interaction.guild.channels.cache.find(
  c => c.name === "info-race"
 )

 if(!playerChannel){
  return interaction.reply({
   content:"❌ Channel info-race tidak ditemukan",
   ephemeral:true
  })
 }

 raceState.registrationOpen = true

 // ======================
 // UPDATE PLAYER PANEL
 // ======================

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
 // UPDATE ADMIN PANEL
 // ======================

 const adminPanel = await interaction.channel.messages.fetch(raceState.adminListPanelId)

 let list = ""

 raceState.players.forEach((p,i)=>{
  list += `${i+1}. ${p.ign}\n`
 })

 if(list === "") list = "No players yet"

 const adminEmbed = new EmbedBuilder()
  .setTitle("📋 Player List")
  .setDescription(list)

 await adminPanel.edit({
  embeds:[adminEmbed]
 })

}

module.exports = { deployRegistrationButton }
