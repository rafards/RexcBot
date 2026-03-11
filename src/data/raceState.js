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
 luckyLoserCandidates:[],
 currentRound:1,
 currentMatchIndex: 0,
 roundHistory:[],

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
