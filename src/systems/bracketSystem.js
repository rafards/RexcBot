const { raceState } = require("../data/raceState")

function shuffle(array){
 return array.sort(()=>Math.random()-0.5)
}

function generateMatches(players){

 const matches = []

 for(let i=0;i<players.length;i+=2){

  matches.push({
   player1: players[i],
   player2: players[i+1] || null,
   winner:null,
   loser:null
  })

 }

 return matches
}

async function generateBracket(interaction){

 const shuffled = shuffle([...raceState.players])

 // reset data bracket
 raceState.matches = []
 raceState.losers = []
 raceState.currentRound = 1

 // jika player ganjil
 if(shuffled.length % 2 !== 0){

  raceState.oddPlayer = shuffled.pop()

 }else{

  raceState.oddPlayer = null

 }

 raceState.matches = generateMatches(shuffled)

 const { sendBracketPanel } = require("../utils/bracketPanelBuilder")

 await sendBracketPanel(interaction)

}

module.exports = { generateBracket }
