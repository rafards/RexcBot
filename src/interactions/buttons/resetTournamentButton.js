const { raceState } = require("../../data/raceState")

async function resetTournamentButton(interaction){

 if(interaction.customId !== "reset_tournament") return

 await interaction.deferUpdate()

 const client = interaction.client

 try{

  // ==========================
  // DELETE SETUP PANEL
  // ==========================

  if(raceState.panelMessageId && raceState.panelChannelId){

   const channel = await client.channels.fetch(raceState.panelChannelId)
   const message = await channel.messages.fetch(raceState.panelMessageId)

   await message.delete().catch(()=>{})

  }

  // ==========================
  // DELETE PLAYER PANEL
  // ==========================

  if(raceState.playerPanelId){

   const channel = interaction.guild.channels.cache.find(c=>c.name==="info-race")

   if(channel){

    const msg = await channel.messages.fetch(raceState.playerPanelId).catch(()=>null)

    if(msg) await msg.delete().catch(()=>{})

   }

  }

  // ==========================
  // DELETE ADMIN PLAYER LIST
  // ==========================

  if(raceState.adminListPanelId){

   const msg = await interaction.channel.messages.fetch(raceState.adminListPanelId).catch(()=>null)

   if(msg) await msg.delete().catch(()=>{})

  }

  // ==========================
  // DELETE BRACKET PANEL
  // ==========================

  if(raceState.bracketPanelId && raceState.bracketChannelId){

   const channel = await client.channels.fetch(raceState.bracketChannelId)
   const msg = await channel.messages.fetch(raceState.bracketPanelId).catch(()=>null)

   if(msg) await msg.delete().catch(()=>{})

  }

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

 raceState.panelMessageId=null
 raceState.panelChannelId=null

 await interaction.channel.send({
  content:"🔄 Tournament reset. All panels cleared."
 })

}

module.exports = { resetTournamentButton }
