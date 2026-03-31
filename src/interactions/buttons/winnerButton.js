aconst { raceState } = require("../../data/raceState")
const { generateNextRound } = require("../../utils/nextRoundGenerator")
const { updateBracketPanel } = require("../../utils/bracketPanelBuilder")
const { ButtonBuilder, ButtonStyle, ActionRowBuilder } = require("discord.js")
const { startRoundRobin } = require("../../systems/roundRobinSystem")
const { startThirdPlaceSystem } = require("../../systems/thirdPlaceSystem")

// ===============================
// RESET BUTTON
// ===============================

async function sendResetButton(interaction){

 if(raceState.resetMessageId) return

 const resetButton = new ButtonBuilder()
  .setCustomId("reset_tournament")
  .setLabel("Reset Tournament")
  .setStyle(ButtonStyle.Danger)

 const row = new ActionRowBuilder().addComponents(resetButton)

 const msg = await interaction.channel.send({
  components:[row]
 })

 raceState.resetMessageId = msg.id
}

// ===============================
// CALCULATE TOP 3
// ===============================

function calculateTop3(){

 const lastRound = raceState.roundHistory[raceState.roundHistory.length-1]
 if(!lastRound) return null

 const finalMatch = lastRound.matches[lastRound.matches.length-1]

 const champion = finalMatch.winner

 const runnerUp = finalMatch.p1 === champion
  ? finalMatch.p2
  : finalMatch.p1

 const previousRound = raceState.roundHistory[raceState.roundHistory.length-2]

 let thirdPlace = null

 if(previousRound){

  const losers = previousRound.matches
   .map(m=>{
    if(!m.winner) return null
    return m.p1 === m.winner ? m.p2 : m.p1
   })
   .filter(Boolean)

  thirdPlace = losers[0] || null
 }

 return { champion, runnerUp, thirdPlace }

}

// ===============================
// WINNER BUTTON
// ===============================

async function winnerButton(interaction){

 if(!interaction.customId.startsWith("winner_")) return

 const [,matchIndexStr,playerIndexStr] = interaction.customId.split("_")

 const matchIndex = parseInt(matchIndexStr)
 const playerIndex = parseInt(playerIndexStr)

 const match = raceState.matches[matchIndex]

 if(!match){
  return interaction.reply({ content:"Match tidak ditemukan", ephemeral:true })
 }

 if(match.winner){
  return interaction.reply({ content:"Winner already set", ephemeral:true })
 }

 const winner = playerIndex === 1 ? match.player1 : match.player2
 const loser  = playerIndex === 1 ? match.player2 : match.player1

 match.winner = winner
 match.loser = loser

 // ================= SAVE LOSER =================

 if(loser){

  raceState.losers.push(loser)

  if(raceState.currentRound > 1){

   const exists = raceState.luckyLoserCandidates.find(p=>p.id === loser.id)

   if(!exists){
    raceState.luckyLoserCandidates.push(loser)
   }

  }

 }

 // ================= HANDLE ODD PLAYER =================

 if(matchIndex === 0 && raceState.oddPlayer){

  const waitingMatch = raceState.matches.find(
   m => m.player1 === raceState.oddPlayer && m.player2 === null
  )

  if(waitingMatch){
   waitingMatch.player2 = loser
  }

  raceState.oddPlayer = null
 }

 await interaction.deferUpdate()

 // ================= SAVE HISTORY =================

 if(!raceState.roundHistory[raceState.currentRound-1]){

  raceState.roundHistory[raceState.currentRound-1] = {
   round: raceState.currentRound,
   matches:[]
  }

 }

 raceState.roundHistory[raceState.currentRound-1].matches.push({
  index: matchIndex+1,
  p1: match.player1?.ign,
  p2: match.player2 ? match.player2.ign : "Loser Match 1",
  winner: winner?.ign || null
 })

 const finished = raceState.matches.every(m=>m.winner)

 const remainingMatches = raceState.matches.filter(m => !m.winner)
 const waitingMatch = remainingMatches.find(m => m.player1 && !m.player2)

 // 🔥 LUCKY LOSER TRIGGER
 if(
  waitingMatch &&
  remainingMatches.length === 1 &&
  raceState.currentRound > 1 &&
  raceState.luckyLoserCandidates.length > 0
 ){

  if(!raceState.luckyLoserMode){

   raceState.luckyLoserMode = true
   raceState.waitingPlayer = waitingMatch.player1

   await updateBracketPanel(interaction.client)
   return

  }

 }

 if(!finished){
 
  await updateBracketPanel(interaction.client)
  return
 
 }

 // ================= ROUND ROBIN RESULT =================

 if(raceState.roundRobinMode){

  const winCount = {}

  raceState.matches.forEach(m=>{
   const id = m.winner.id
   if(!winCount[id]) winCount[id] = 0
   winCount[id]++
  })

  const scores = Object.entries(winCount).sort((a,b)=>b[1]-a[1])

  // AUTO CHAMPION

  if(scores[0][1] === 2){

   const champ = scores[0][0]
   const second = scores[1][0]

   const players = []

   raceState.matches.forEach(m => {
   
    if(!players.find(p => p.id === m.player1.id)){
     players.push(m.player1)
    }
   
    if(!players.find(p => p.id === m.player2.id)){
     players.push(m.player2)
    }
   
   })

   const p1 = players.find(p=>p.id === champ)
   const p2 = players.find(p=>p.id === second)
   const p3 = players.find(p=>p.id !== champ && p.id !== second)

   raceState.p1 = p1
   raceState.p2 = p2
   raceState.p3 = p3

   await updateBracketPanel(interaction.client)

   return
  }

  // ADMIN DECISION (1-1-1)

  await updateBracketPanel(interaction.client)

  return
 }

 // ================= GET WINNERS =================

 const winners = raceState.matches
  .map(m=>m.winner)
  .filter(Boolean)

 // ================= ROUND ROBIN GENERATOR =================

 if(winners.length === 3){

 raceState.matches = startRoundRobin(winners)

 raceState.currentRound++

 await updateBracketPanel(interaction.client)

 return
 }

 // ================= TOURNAMENT FINISHED =================

 if(winners.length === 1){

 // jika round robin mode jangan kirim reset
 if(!raceState.roundRobinMode){

  const result = calculateTop3()

  const playerChannel = await interaction.client.channels.fetch(
   raceState.playerPanelChannelId
  )

  await playerChannel.send({
   embeds:[{
    title:"🏆 TOURNAMENT RESULT",
    description:
`🥇 ${result?.champion || winners[0].ign}
🥈 ${result?.runnerUp || "TBD"}
🥉 ${result?.thirdPlace || "TBD"}`,
    color:0xFFD700
   }]
  })
 }

 return
}

 // THIRD PLACE

  if(winners.length === 2 && raceState.currentRound >= 2){

  const previousRound = raceState.roundHistory[raceState.roundHistory.length-1]

  const losers = previousRound.matches
   .map(m => m.p1 === m.winner ? m.p2 : m.p1)

  if(losers.length === 2){

   raceState.matches = startThirdPlaceSystem(winners, losers)

   raceState.currentRound++

   await updateBracketPanel(interaction.client)

   return
  }

 }

 // ================= NEXT ROUND =================

 const nextMatches = generateNextRound(winners)

 raceState.matches = nextMatches
 raceState.currentRound++

 raceState.luckyLoserCandidates = []
 raceState.luckyLoserMode = false
 raceState.waitingPlayer = null

 await updateBracketPanel(interaction.client)

}

module.exports = { winnerButton }
