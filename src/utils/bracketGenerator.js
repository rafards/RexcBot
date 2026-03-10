function shuffle(array){

 for(let i=array.length-1;i>0;i--){

  const j=Math.floor(Math.random()*(i+1))
  ;[array[i],array[j]]=[array[j],array[i]]

 }

 return array

}

function generateBracket(players){

 const shuffled = shuffle([...players])

 const matches = []

 let oddPlayer = null

 if(shuffled.length % 2 !== 0){

  oddPlayer = shuffled.pop()

 }

 for(let i=0;i<shuffled.length;i+=2){

  matches.push({

   player1: shuffled[i],
   player2: shuffled[i+1],

   winner:null,
   loser:null,

   round:1

  })

 }

 return {
  matches,
  oddPlayer
 }

 raceState.roundHistory = []
 raceState.currentMatchIndex = 0

}

module.exports = { generateBracket }
