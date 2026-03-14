function generateNextRound(winners){

 // =========================
 // TOURNAMENT FINISHED
 // =========================

 if(winners.length <= 1){
  return null
 }

 // =========================
 // ROUND ROBIN (3 PLAYERS)
 // =========================

 if(winners.length === 3){

  const [a,b,c] = winners

  return [
   createMatch(a,b),
   createMatch(b,c),
   createMatch(c,a)
  ]

 }

 // =========================
 // NORMAL BRACKET
 // =========================

 const next = []

 for(let i = 0; i < winners.length; i += 2){

  const p1 = winners[i]
  let p2 = winners[i+1] || null

  // =========================
  // ANTI SELF MATCH
  // =========================

  if(p1 && p2 && p1.id === p2.id){

   const swap = winners[i+2]

   if(swap){
    winners[i+1] = swap
    winners[i+2] = p2
    p2 = swap
   }else{
    p2 = null
   }

  }

  // double safety
  if(p1 && p2 && p1.id === p2.id){
   p2 = null
  }

  next.push(createMatch(p1,p2))

 }

 return next
}

// =========================
// MATCH FACTORY
// =========================

function createMatch(p1,p2){

 return {
  player1:p1,
  player2:p2,
  winner:null,
  loser:null
 }

}

module.exports = { generateNextRound }
