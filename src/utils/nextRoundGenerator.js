function generateNextRound(matches){

 const winners = matches
  .map(m=>m.winner)
  .filter(Boolean)

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
