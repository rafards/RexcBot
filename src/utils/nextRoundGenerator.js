function generateNextRound(matches){

 const winners = matches
  .map(m=>m.winner)
  .filter(Boolean)

 // =========================
 // TOURNAMENT FINISHED
 // =========================

 if(winners.length <= 1){
  return null
 }

 // =========================
 // ROUND ROBIN (3 PLAYER)
 // =========================

 if(winners.length === 3){

  return [
   { player1:winners[0], player2:winners[1], winner:null, loser:null },
   { player1:winners[1], player2:winners[2], winner:null, loser:null },
   { player1:winners[2], player2:winners[0], winner:null, loser:null }
  ]

 }

 // =========================
 // NORMAL BRACKET
 // =========================

 const next=[]

 for(let i=0;i<winners.length;i+=2){

  const p1 = winners[i]
  const p2 = winners[i+1] || null

  next.push({
   player1:p1,
   player2:p2,
   winner:null,
   loser:null
  })

 }

 return next
}

module.exports = { generateNextRound }
