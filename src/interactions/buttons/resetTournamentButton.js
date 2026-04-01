const { raceState } = require("../../data/raceState")

async function resetTournamentButton(interaction){

 if(interaction.customId !== "reset_tournament") return

 const channel = interaction.channel
 const client = interaction.client

 if(!interaction.replied && !interaction.deferred){
 await interaction.deferUpdate().catch(()=>{})
 }

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

  if(raceState.bracketMessageId && raceState.playerPanelChannelId){

   const playerChannel = await client.channels.fetch(raceState.playerPanelChannelId).catch(()=>null)

   if(playerChannel){
    const msg = await playerChannel.messages.fetch(raceState.bracketMessageId).catch(()=>null)
    if(msg) await msg.delete().catch(()=>{})
   }

  }

  // ==========================
  // DELETE ADMIN MATCH PANEL
  // ==========================

  if(raceState.adminMatchPanelId){

   const msg = await channel.messages.fetch(raceState.adminMatchPanelId).catch(()=>null)

   if(msg) await msg.delete().catch(()=>{})

  }

  // ==========================
  // DELETE RESET BUTTON
  // ==========================

  if(raceState.resetMessageId){

   const msg = await interaction.channel.messages.fetch(raceState.resetMessageId).catch(()=>null)

   if(msg) await msg.delete().catch(()=>{})

  }

  // ==========================
// DELETE RESULT MESSAGE (PLAYER PANEL)
// ==========================

if(raceState.resultMessageId){

 try{

  const playerChannel = await client.channels.fetch(
   raceState.playerPanelChannelId
  ).catch(()=>null)

  if(playerChannel){
   const msg = await playerChannel.messages
    .fetch(raceState.resultMessageId)
    .catch(()=>null)

   if(msg) await msg.delete().catch(()=>{})
  }

 }catch(err){
  console.log("Failed delete result message:", err)
 }

 raceState.resultMessageId = null
}

  // ==========================
  // RESET STATE
  // ==========================

  raceState.raceName = null
  raceState.racePrice = null

  raceState.lap = null
  raceState.slot = null
  raceState.time = null

  raceState.players = []

  raceState.matches = []
  raceState.losers = []
  raceState.oddPlayer = null

  raceState.currentRound = 1
  raceState.currentMatchIndex = 0
  raceState.roundHistory = []

  raceState.registrationOpen = false

  raceState.playerPanelId = null
  raceState.adminListPanelId = null

  raceState.bracketPanelId = null
  raceState.bracketMessageId = null

  raceState.adminMatchPanelId = null

  raceState.panelMessageId = null
  raceState.panelChannelId = null

  // ==========================
  // RESET ROUND ROBIN STATE
  // ==========================

  raceState.roundRobinMode = false
  raceState.roundRobinPlayers = []
  raceState.roundRobinResults = []

  raceState.p1 = null
  raceState.p2 = null
  raceState.p3 = null

  // ==========================
  // RESET LUCKY LOSER
  // ==========================

  raceState.luckyLoserMode = false
  raceState.waitingPlayer = null
  raceState.luckyLoserCandidates = []

  // ==========================
  // RESET RESET BUTTON STATE
  // ==========================

  raceState.resetMessageId = null

 }catch(err){
  console.log("Reset tournament error:", err)
 }

 // hapus tombol reset
 try{
  await interaction.message.delete().catch(()=>{})
 }catch{}
 
}

module.exports = { resetTournamentButton }
