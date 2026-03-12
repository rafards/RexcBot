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
 currentRound:1,
 currentMatchIndex: 0,
 roundHistory:[],

 roundRobinMode:false,
 roundRobinPlayers:[],
 roundRobinResults:[],

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
