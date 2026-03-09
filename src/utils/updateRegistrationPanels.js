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

 // ================= PLAYER PANEL =================

 if(playerPanel){

  const embed = new EmbedBuilder()
   .setTitle("🏁 SSR BRACKET RACE")
   .setDescription("Registration is now open!\nJoin the race before the slot is full.")
   .addFields(
    { name:"🏎 Race", value: raceState.raceName },
    { name:"💰 Registration", value: formatRupiah(raceState.racePrice), inline:true },
    { name:"🏁 Lap", value: `${raceState.lap} Laps`, inline:true },
    { name:"👥 Players", value: `${raceState.players.length} / ${raceState.slot}`, inline:true },
    { name:"⏰ Race Start", value: raceState.time || "TBA" }
   )
   .setFooter({ text:"Press JOIN to participate in the race" })

  await playerPanel.edit({ embeds:[embed] })

 }

 // ================= ADMIN PLAYER LIST =================

 let text=""

 raceState.players.forEach((p,i)=>{
  text += `${i+1}. ${p.ign}\n\n`
 })

 if(text===""){
  for(let i=1;i<=raceState.slot;i++){
   text+=`${i}.\n`
  }
 }

 if(adminPanel){

  const embed=new EmbedBuilder()
   .setTitle("📋 Player List")
   .setDescription(text)

  await adminPanel.edit({embeds:[embed]})

 }

}

module.exports={ updateRegistrationPanels }
