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

 }catch(err){
  console.log("Reset tournament error:", err)
 }

}

module.exports = { resetTournamentButton }
