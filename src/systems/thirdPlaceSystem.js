const { raceState } = require("../data/raceState")

function startThirdPlaceSystem(winners, losers){

 if(winners.length !== 2 || losers.length !== 2) return null

 const matches = []

 // third place match dulu
 matches.push({
  player1: losers[0],
  player2: losers[1],
  type:"third_place",
  winner:null,
  loser:null
 })

 // final
 matches.push({
  player1: winners[0],
  player2: winners[1],
  type:"final",
  winner:null,
  loser:null
 })

 raceState.thirdPlaceMode = true

 return matches
}

module.exports = { startThirdPlaceSystem }
