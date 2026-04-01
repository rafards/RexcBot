const raceState = {

 raceName:null,
 racePrice:null,

 lap:null,
 slot:null,
 time:null,

 raceMode:"single",

 players:[],

 // ================= MATCH =================
 matches:[],
 oddPlayer:null,
 losers:[],

 // ================= LUCKY LOSER =================
 luckyLoserMode:false,
 waitingPlayer:null,
 luckyLoserCandidates:[],

 // ================= PHASE =================
 thirdPlacePhase:false,
 finalPhase:false,
 finalPlayers:[], // 🔥 WAJIB

 // ================= ROUND =================
 currentRound:1,
 currentMatchIndex:0,
 roundHistory:[],

 // ================= ROUND ROBIN =================
 roundRobinMode:false,
 roundRobinPlayers:[],

 // ================= RESULT =================
 p1:null,
 p2:null,
 p3:null,

 // ================= PANEL =================
 registrationOpen:false,

 playerPanelChannelId:null,
 adminListChannelId:null,

 bracketChannelId:null,
 bracketMessageId:null,

 resultMessageId:null,

 adminMatchPanelId:null

}

module.exports = { raceState }
