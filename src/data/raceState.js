const raceState = {

 raceName:null,
 racePrice:null,

 lap:null,
 slot:null,
 time:null,

 raceMode:"single",

 players:[],

 matches:[],
 oddPlayer:null,
 losers:[],
 luckyLoserMode:false,
 waitingPlayer:null,
 luckyLoserCandidates:[],
 luckyLoserMatchIndex:null,

 thirdPlaceMode:false,
 thirdPlaceMatch:null,
 thirdPlaceWinner:null,
 semiFinalLosers:[],
 thirdPlacePhase:false,
 finalPhase:false,
 currentRound:1,
 currentMatchIndex: 0,
 roundHistory:[],

 roundRobinMode:false,
 roundRobinPlayers:[],
 roundRobinResults:[],
 p1:null,
 p2:null,
 p3:null,

 registrationOpen:false,

 panelMessageId:null,
 panelChannelId:null,

 playerPanelId:null,
 adminListPanelId:null,

 bracketPanelId:null,
 bracketChannelId:null,
 bracketMessageId:null,

 adminMatchPanelId:null

}

module.exports = { raceState }
