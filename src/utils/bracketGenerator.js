function shuffle(array){

 for(let i=array.length-1;i>0;i--){

  const j = Math.floor(Math.random()*(i+1))

  ;[array[i],array[j]]=[array[j],array[i]]

 }

 return array

}

function generateBracket(players){

 const shuffled = shuffle([...players])

 const matches = []

 for(let i=0;i<shuffled.length;i+=2){

  const player1 = shuffled[i]
  const player2 = shuffled[i+1] || null

  matches.push({
   player1,
   player2,
   winner:null,
   loser:null,
   round:1
  })

 }

 return matches

}

module.exports = { generateBracket }
