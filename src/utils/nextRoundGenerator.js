function generateNextRound(matches){

 const winners = matches
  .map(m=>m.winner)
  .filter(Boolean)

 const next=[]

 for(let i=0;i<winners.length;i+=2){

  if(!winners[i+1]) break

  next.push({
   player1:winners[i],
   player2:winners[i+1],
   winner:null,
   loser:null
  })

 }

 return next

}

module.exports = { generateNextRound }
