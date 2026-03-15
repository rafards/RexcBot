const { raceState } = require("../data/raceState")

function startRoundRobin(players){

 if(players.length !== 3) return null

 const [a,b,c] = players

 raceState.roundRobinMode = true
 raceState.roundRobinPlayers = players

 return [
  { player1:a, player2:c, winner:null, loser:null },
  { player1:b, player2:a, winner:null, loser:null },
  { player1:c, player2:b, winner:null, loser:null }
 ]
}

module.exports = { startRoundRobin }
