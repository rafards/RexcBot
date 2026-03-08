const { EmbedBuilder } = require("discord.js")
const { raceState } = require("../data/raceState")

async function updateRegistrationPanels(interaction){

 const guild = interaction.guild

 const playerChannel = guild.channels.cache.find(c => c.name === "info-race")
 const adminChannel = guild.channels.cache.find(c => c.name === "setup-bot")

 const playerPanel = await playerChannel.messages.fetch(raceState.playerPanelId)
 const adminPanel = await adminChannel.messages.fetch(raceState.adminListPanelId)

 // =========================
 // SLOT FULL → HIDE PANEL
 // =========================

 if(raceState.players.length >= raceState.slot){

  await playerPanel.delete().catch(()=>{})

  return
 }

 const playerEmbed = new EmbedBuilder()
  .setTitle(`🏁 ${raceState.raceName}`)
  .setDescription(`Players\n${raceState.players.length}/${raceState.slot}`)

 await playerPanel.edit({
  embeds:[playerEmbed]
 })

 let text=""

 raceState.players.forEach((p,i)=>{
  text += `${i+1}. ${p.ign}\n`
 })

 if(text === "") text="No players yet"

 const adminEmbed = new EmbedBuilder()
  .setTitle("📋 Player List")
  .setDescription(text)

 await adminPanel.edit({
  embeds:[adminEmbed]
 })

}

module.exports = { updateRegistrationPanels }
