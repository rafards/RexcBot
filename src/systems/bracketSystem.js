const { raceState } = require("../data/raceState")

function shuffle(array){
 return array.sort(()=>Math.random()-0.5)
}

function generateMatches(players){

 const matches = []

 for(let i=0;i<players.length;i+=2){

  matches.push({
   player1: players[i],
   player2: players[i+1],
   winner:null
  })

 }

 return matches
}

async function generateBracket(interaction){

 const shuffled = shuffle([...raceState.players])

 raceState.matches = generateMatches(shuffled)

 raceState.currentRound = 1

 const { sendBracketPanel } = require("../utils/bracketPanelBuilder")

 await sendBracketPanel(interaction)

}

module.exports = { generateBracket }
