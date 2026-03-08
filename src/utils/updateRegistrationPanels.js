const { EmbedBuilder } = require("discord.js")
const { raceState } = require("../data/raceState")

async function updateRegistrationPanels(interaction){

 const guild = interaction.guild

 const playerChannel = guild.channels.cache.find(c=>c.name==="info-race")
 const adminChannel = guild.channels.cache.find(c=>c.name==="setup-bot")

 const playerPanel = await playerChannel.messages.fetch(raceState.playerPanelId).catch(()=>null)
 const adminPanel = await adminChannel.messages.fetch(raceState.adminListPanelId).catch(()=>null)

 if(playerPanel){

  const playerEmbed = new EmbedBuilder()
   .setTitle(`🏁 ${raceState.raceName}`)
   .setDescription(`Players\n${raceState.players.length}/${raceState.slot}`)

  await playerPanel.edit({
   embeds:[playerEmbed]
  })

 }

 let text=""

raceState.players.forEach((p,i)=>{

 const win = p.winCount || 0
 const lose = p.loseCount || 0

 text += `${i+1}. ${p.ign}\n`

 if(win > 0){
  text += `   🏆 Win : ${win}\n`
 }

 if(lose > 0){
  text += `   ❌ Lose : ${lose}\n`
 }

 text += `\n`

})

 if(text===""){

  for(let i=1;i<=raceState.slot;i++){
   text += `${i}.\n`
  }

 }

 if(adminPanel){

  const adminEmbed = new EmbedBuilder()
   .setTitle("📋 Player List")
   .setDescription(text)

  await adminPanel.edit({
   embeds:[adminEmbed]
  })

 }

 if(raceState.players.length >= raceState.slot){

  if(playerPanel){
   await playerPanel.delete().catch(()=>{})
  }

 }

}

module.exports = { updateRegistrationPanels }
