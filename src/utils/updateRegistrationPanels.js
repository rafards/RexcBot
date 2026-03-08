const { EmbedBuilder } = require("discord.js")
const { raceState } = require("../data/raceState")

async function updateRegistrationPanels(interaction){

 const guild = interaction.guild

 const playerChannel = guild.channels.cache.find(c=>c.name==="info-race")
 const adminChannel = guild.channels.cache.find(c=>c.name==="setup-bot")

 const playerPanel = await playerChannel.messages.fetch(raceState.playerPanelId).catch(()=>null)
 const adminPanel = await adminChannel.messages.fetch(raceState.adminListPanelId).catch(()=>null)

 // =========================
 // UPDATE PLAYER PANEL
 // =========================

 if(playerPanel){

  const playerEmbed = new EmbedBuilder()
   .setTitle(`🏁 ${raceState.raceName}`)
   .setDescription(`Players\n${raceState.players.length}/${raceState.slot}`)

  await playerPanel.edit({
   embeds:[playerEmbed]
  })

 }

 // =========================
 // BUILD PLAYER LIST
 // =========================

 let text=""

 raceState.players.forEach((p,i)=>{
  text += `${i+1}. ${p.ign}\n`
 })

 // jika belum ada player
 if(text===""){

  for(let i=1;i<=raceState.slot;i++){
   text += `${i}.\n`
  }

 }

 // =========================
 // UPDATE ADMIN PLAYER LIST
 // =========================

 if(adminPanel){

  const adminEmbed = new EmbedBuilder()
   .setTitle("📋 Player List")
   .setDescription(text)

  await adminPanel.edit({
   embeds:[adminEmbed]
  })

 }

 // =========================
 // SLOT FULL → DELETE JOIN PANEL
 // =========================

 if(raceState.players.length >= raceState.slot){

  if(playerPanel){
   await playerPanel.delete().catch(()=>{})
  }

 }

}

module.exports = { updateRegistrationPanels }
