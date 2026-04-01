const { raceState } = require("../data/raceState")
const { sendBracketPanel } = require("../utils/bracketPanelBuilder")
const { startRoundRobin } = require("./roundRobinSystem")

function shuffle(array){

 for(let i=array.length-1;i>0;i--){

  const j = Math.floor(Math.random()*(i+1))

  const temp = array[i]
  array[i] = array[j]
  array[j] = temp

 }

 return array
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

 raceState.matches = []
 raceState.losers = []
 raceState.currentRound = 1
 raceState.currentMatchIndex = 0

 if(shuffled.length % 2 !== 0){
  raceState.oddPlayer = shuffled.pop()
 }else{
  raceState.oddPlayer = null
 }

 
// ===============================
// FORCE ROUND ROBIN (3 PLAYER)
// ===============================

if(shuffled.length === 3){

 raceState.matches = startRoundRobin(shuffled)

 raceState.roundRobinMode = true
 raceState.roundRobinPlayers = [...shuffled]

 raceState.oddPlayer = null

 await sendBracketPanel(interaction.client)
 return
}

// ===============================
// NORMAL BRACKET
// ===============================

 raceState.matches = generateMatches(shuffled)

 // ===============================
// ROUND 1 WAITING LOSER MATCH
// ===============================

if(raceState.oddPlayer){

 raceState.matches.push({
  player1: raceState.oddPlayer,
  player2: null,
  waitingLoserMatch:1,
  winner:null,
  loser:null
 })

}

 await sendBracketPanel(interaction.client)
}

module.exports = { generateBracket }
