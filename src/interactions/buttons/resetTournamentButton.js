const { raceState } = require("../../data/raceState")

async function resetTournamentButton(interaction){

 if(interaction.customId !== "reset_tournament") return

 const channel = interaction.channel
 const client = interaction.client

 await interaction.deferUpdate()

 try{

  // ==========================
  // DELETE SETUP PANEL
  // ==========================

  if(raceState.panelMessageId && raceState.panelChannelId){

   const panelChannel = await client.channels.fetch(raceState.panelChannelId).catch(()=>null)

   if(panelChannel){
    const message = await panelChannel.messages.fetch(raceState.panelMessageId).catch(()=>null)
    if(message) await message.delete().catch(()=>{})
   }

  }

  // ==========================
  // DELETE PLAYER PANEL
  // ==========================

  if(raceState.playerPanelId){

   const playerChannel = interaction.guild.channels.cache.find(c=>c.name==="info-race")

   if(playerChannel){
    const msg = await playerChannel.messages.fetch(raceState.playerPanelId).catch(()=>null)
    if(msg) await msg.delete().catch(()=>{})
   }

  }

  // ==========================
  // DELETE ADMIN PLAYER LIST
  // ==========================

  if(raceState.adminListPanelId){

   const msg = await channel.messages.fetch(raceState.adminListPanelId).catch(()=>null)

   if(msg) await msg.delete().catch(()=>{})

  }

  // ==========================
  // DELETE BRACKET PANEL
  // ==========================

  if(raceState.bracketPanelId && raceState.bracketChannelId){

   const bracketChannel = await client.channels.fetch(raceState.bracketChannelId).catch(()=>null)

   if(bracketChannel){
    const msg = await bracketChannel.messages.fetch(raceState.bracketPanelId).catch(()=>null)
    if(msg) await msg.delete().catch(()=>{})
   }

  }

  // ==========================
  // CLEAN ALL CHANNEL MESSAGES
  // ==========================

  const messages = await channel.messages.fetch({ limit:100 })
  await channel.bulkDelete(messages, true).catch(()=>{})

 }catch(err){
  console.log("Reset cleanup error:", err)
 }

 // ==========================
 // RESET STATE
 // ==========================

 raceState.raceName=null
 raceState.racePrice=null

 raceState.lap=null
 raceState.slot=null
 raceState.time=null

 raceState.players=[]

 raceState.matches=[]
 raceState.losers=[]
 raceState.oddPlayer=null

 raceState.currentRound=1

 raceState.registrationOpen=false

 raceState.playerPanelId=null
 raceState.adminListPanelId=null

 raceState.bracketPanelId=null
 raceState.bracketChannelId=null

 raceState.panelMessageId=null
 raceState.panelChannelId=null

}

module.exports = { resetTournamentButton }
