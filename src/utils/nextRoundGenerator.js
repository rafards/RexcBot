function generateNextRound(matches){

 const winners = matches
  .map(m=>m.winner)
  .filter(Boolean)

 // =========================
 // ROUND ROBIN (3 PLAYER)
 // =========================

 if(winners.length === 3){

 const [a,b,c] = winners

 return [
  { player1:a, player2:b, winner:null, loser:null },
  { player1:b, player2:c, winner:null, loser:null },
  { player1:c, player2:a, winner:null, loser:null }
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

 // =========================
 // TOURNAMENT FINISHED
 // =========================

 if(winners.length <= 1){
  return null
 }

 return next
}

module.exports = { generateNextRound }
