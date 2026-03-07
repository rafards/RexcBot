function generateNextRound(matches){

 const winners = matches.map(m=>m.winner).filter(Boolean)

 const next=[]

 for(let i=0;i<winners.length;i+=2){

  next.push({

   player1:winners[i],
   player2:winners[i+1] || null,

   winner:null,
   loser:null

  })

 }

 return next

}

module.exports = { generateNextRound }
