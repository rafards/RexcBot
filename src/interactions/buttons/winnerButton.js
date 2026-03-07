const { raceState } = require("../../data/raceState")
const { generateNextRound } = require("../../utils/nextRoundGenerator")
const { buildBracketEmbed } = require("../../utils/bracketPanelBuilder")

async function winnerButton(interaction){

 if(!interaction.customId.startsWith("winner_")) return

 const parts = interaction.customId.split("_")

 const matchIndex = parseInt(parts[1])
 const playerIndex = parseInt(parts[2])

 const match = raceState.matches[matchIndex]

 if(match.winner){

  return interaction.reply({
   content:"Winner already set",
   ephemeral:true
  })

 }

 const winner = playerIndex===1 ? match.player1 : match.player2
 const loser  = playerIndex===1 ? match.player2 : match.player1

 match.winner = winner
 match.loser = loser

 raceState.losers.push(loser)

 await interaction.reply({
  content:`🏆 Winner: ${winner.ign}`
 })

 const panel = await channel.messages.fetch(raceState.bracketPanelId)
 
 await panel.edit({
  embeds:[buildBracketEmbed()]
 })

 const finished = raceState.matches.every(m=>m.winner)

 if(!finished) return
 
 // ==========================
 // DOUBLE MODE ENGINE
 // ==========================
 
 if(raceState.raceMode === "double"){
 
  const winners=[]
  const losers=[]
 
  raceState.matches.forEach(m=>{
 
   winners.push(m.winner)
   losers.push(m.loser)
 
  })
 
  raceState.matches=[]
 
  // winner vs winner
  for(let i=0;i<winners.length;i+=2){
 
   if(winners[i+1]){
 
    raceState.matches.push({
     player1:winners[i],
     player2:winners[i+1],
     winner:null,
     loser:null
    })
 
   }
 
  }
 
  // loser vs loser
  for(let i=0;i<losers.length;i+=2){
 
   if(losers[i+1]){
 
    raceState.matches.push({
     player1:losers[i],
     player2:losers[i+1],
     winner:null,
     loser:null
    })
 
   }
 
  }
 
 }

 const winners = raceState.matches.map(m=>m.winner)

 if(raceState.oddPlayer){
 
  const firstLoser = raceState.losers.shift()
 
  if(firstLoser){
 
   raceState.matches.push({
 
    player1:firstLoser,
    player2:raceState.oddPlayer,
 
    winner:null,
    loser:null
 
   })
 
  }
 
  raceState.oddPlayer=null
 
 }

 if(winners.length === 1){

  return interaction.followUp({
   content:`🏆 TOURNAMENT WINNER: ${winners[0].ign}`
  })

 }

 raceState.matches = generateNextRound(raceState.matches)
 raceState.currentRound++

 let text=""

 raceState.matches.forEach((m,i)=>{

  const p1 = m.player1?.ign || "BYE"
  const p2 = m.player2?.ign || "BYE"

  text += `Match ${i+1}\n${p1} vs ${p2}\n\n`

 })

}

module.exports = { winnerButton }
