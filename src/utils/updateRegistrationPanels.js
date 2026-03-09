const { EmbedBuilder } = require("discord.js")
const { raceState } = require("../data/raceState")

function formatRupiah(value){

 if(!value || value === 0) return "Gratis"

 return "Rp" + Number(value).toLocaleString("id-ID")

}

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
   .setTitle("🏁 SSR BRACKET RACE")
   .setDescription("Registration is now open!\n\nJoin the race before the slot is full.")
   .addFields(
    {
     name:"🏎 Race",
     value: raceState.raceName,
     inline:false
    },
    {
     name:"💰 Registration",
     value: formatRupiah(raceState.racePrice),
     inline:true
    },
    {
     name:"🏁 Lap",
     value:`${raceState.lap} Laps`,
     inline:true
    },
    {
     name:"👥 Players",
     value:`${raceState.players.length} / ${raceState.slot}`,
     inline:true
    },
    {
     name:"⏰ Race Start",
     value: raceState.time || "TBA",
     inline:false
    }
   )
   .setFooter({
    text:"Press JOIN to participate in the race"
   })

  await playerPanel.edit({
   embeds:[playerEmbed]
  })

 }

 // =========================
 // BUILD PLAYER LIST
 // =========================

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

 // =========================
 // UPDATE ADMIN PANEL
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
 // SLOT FULL → DELETE PANEL
 // =========================

 if(raceState.players.length >= raceState.slot){

  if(playerPanel){
   await playerPanel.delete().catch(()=>{})
  }

 }

}

module.exports = { updateRegistrationPanels }