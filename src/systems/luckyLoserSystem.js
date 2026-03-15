const { raceState } = require("../data/raceState")

function startLuckyLoser(waitingPlayer, matchIndex){

 raceState.luckyLoserMode = true
 raceState.waitingPlayer = waitingPlayer
 raceState.luckyLoserMatchIndex = matchIndex

}

function applyLuckyLoser(player){

 const match = raceState.matches[raceState.luckyLoserMatchIndex]

 if(match){
  match.player2 = player
 }

 raceState.luckyLoserMode = false
 raceState.waitingPlayer = null
 raceState.luckyLoserMatchIndex = null
}

module.exports = {
 startLuckyLoser,
 applyLuckyLoser
}
