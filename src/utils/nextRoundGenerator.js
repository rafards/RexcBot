function generateNextRound(matches){

 const winners = matches.map(m => m.winner)

 const nextMatches = []

 for(let i=0;i<winners.length;i+=2){

  nextMatches.push({

   player1:winners[i],
   player2:winners[i+1],
   winner:null

  })

 }

 return nextMatches

}

module.exports = { generateNextRound }
