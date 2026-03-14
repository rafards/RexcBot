const { 
 EmbedBuilder,
 ButtonBuilder,
 ButtonStyle,
 ActionRowBuilder,
 StringSelectMenuBuilder
} = require("discord.js")

const { raceState } = require("../data/raceState")

function buildBracketEmbed(){

 let text=""

 // ================= HISTORY =================

 raceState.roundHistory.forEach(r=>{

  text+=`━━━━━━━━━━━━━━\n`
  text+=`🏁 ROUND ${r.round}\n\n`

  r.matches.forEach(m=>{

   text+=`Match ${m.index}\n`
   text+=`${m.p1} vs ${m.p2}\n`

   if(m.winner){
    text+=`🏆 ${m.winner}\n`
   }

   text+="\n"

  })

 })

 // ================= ROUND ROBIN =================

 if(raceState.roundRobinMode){

 const matches = raceState.matches
 const activeIndex = matches.findIndex(m=>!m.winner)

 // ROUND ROBIN FINISHED

 if(activeIndex === -1){

  const result = calculateRoundRobinWins()
  const first = result[0][1]

  if(first === 2){

   const champ = raceState.roundRobinPlayers.find(p=>p.id===result[0][0])
   const p2 = raceState.roundRobinPlayers.find(p=>p.id===result[1][0])
   const p3 = raceState.roundRobinPlayers.find(p=>p.id===result[2][0])

   text+="━━━━━━━━━━━━━━\n"
   text+="🏆 FINAL RESULT\n\n"
   text+=`🥇 ${champ?.ign}\n`
   text+=`🥈 ${p2?.ign}\n`
   text+=`🥉 ${p3?.ign}\n`

  }else{

   text+="━━━━━━━━━━━━━━\n"
   text+="⏳ WAITING ADMIN DECISION\n\n"
   text+="Semua pemain menang 1 kali.\n"

  }

  return new EmbedBuilder()
   .setTitle("🏁 TOURNAMENT BRACKET")
   .setDescription(text)

 }

 text+="━━━━━━━━━━━━━━\n"
 text+="🏁 ROUND ROBIN\n\n"

 matches.forEach((m,i)=>{

  const p1 = m.player1?.ign || "TBD"
  const p2 = m.player2?.ign || "TBD"

  const live = i === activeIndex

  const title = live
   ? `➡ Match ${i+1} 🔴 LIVE`
   : `Match ${i+1}`

  text+=`${title}\n`
  text+=`${p1} vs ${p2}\n`

  if(m.winner){
   text+=`🏆 ${m.winner.ign}\n`
  }

  text+="\n"

 })

 return new EmbedBuilder()
  .setTitle("🏁 TOURNAMENT BRACKET")
  .setDescription(text)

 }

 // ================= CURRENT ROUND =================

 const activeIndex = raceState.matches.findIndex(m => !m.winner)
 const activeMatch = raceState.matches[activeIndex]

 if(activeMatch){

  const p1 = activeMatch.player1?.ign || "TBD"
  const p2 = activeMatch.player2?.ign || "TBD"

  text+=`━━━━━━━━━━━━━━━━\n`
  text+=`⚔ CURRENT MATCH\n`
  text+=`${p1} vs ${p2} 🔴 LIVE\n\n`

 }

 const upcoming = activeIndex === -1
 ? []
 : raceState.matches.slice(activeIndex + 1).filter(m=>!m.winner)

 if(upcoming.length){

  text+=`━━━━━━━━━━━━━━━━\n`
  text+=`📋 UPCOMING MATCHES\n`

  upcoming.forEach((m,i)=>{

   const p1 = m.player1?.ign || "TBD"
   let p2 = "TBD"

   if(m.player2){
    p2 = m.player2.ign
   }else if(m.waitingLoserMatch){
    p2 = `Loser Match ${m.waitingLoserMatch}`
   }else if(raceState.luckyLoserMode){
    p2 = "Waiting Lucky Loser"
   }

   const matchNumber = activeIndex + i + 2

   text+=`Match ${matchNumber}\n`
   text+=`${p1} vs ${p2}\n\n`

  })

 }

 if(!text.trim()){
  text="Bracket belum dimulai"
 }

 return new EmbedBuilder()
  .setTitle("🏁 TOURNAMENT BRACKET")
  .setDescription(text)

}

// ================= SEND PANEL =================

async function sendBracketPanel(client){

 const playerChannel = await client.channels.fetch(raceState.playerPanelChannelId)
 const adminChannel = await client.channels.fetch(raceState.adminListChannelId)

 const embed = buildBracketEmbed()

 const msg = await playerChannel.send({
  embeds:[embed]
 })

 raceState.bracketMessageId = msg.id

 const adminData = buildAdminPanel()

 let adminMsg

 if(raceState.adminMatchPanelId){

  adminMsg = await adminChannel.messages.fetch(raceState.adminMatchPanelId).catch(()=>null)

 }

 if(adminMsg){

  await adminMsg.edit({
   embeds:[adminData.embed],
   components:adminData.components
  })

 }else{

  adminMsg = await adminChannel.send({
   embeds:[adminData.embed],
   components:adminData.components
  })

  raceState.adminMatchPanelId = adminMsg.id

 }

}

// ================= UPDATE PANEL =================

async function updateBracketPanel(client){

 const playerChannel = await client.channels.fetch(raceState.playerPanelChannelId)
 const adminChannel = await client.channels.fetch(raceState.adminListChannelId)

 const msg = await playerChannel.messages.fetch(raceState.bracketMessageId)

 const embed = buildBracketEmbed()

 await msg.edit({ embeds:[embed] })

 const adminPanel = await adminChannel.messages.fetch(raceState.adminMatchPanelId)

 const adminData = buildAdminPanel() || {
 embed:new EmbedBuilder().setTitle("Panel"),
 components:[]
  }

 await adminPanel.edit({
  embeds:[adminData.embed],
  components:adminData.components
 })

}

// ================= CALCULATE WINS =================

function calculateRoundRobinWins(){

 const wins={}

 raceState.roundRobinPlayers.forEach(p=>{
  wins[p.id]=0
 })

 raceState.matches.forEach(m=>{
  if(m.winner){
   wins[m.winner.id]++
  }
 })

 return Object.entries(wins).sort((a,b)=>b[1]-a[1])

}

// ================= ADMIN PANEL =================

function buildAdminPanel(){

 // ================= LUCKY LOSER =================

 if(raceState.luckyLoserMode){

  const embed = new EmbedBuilder()
   .setTitle("⚠ Lucky Loser Selection")
   .setDescription(`Waiting Player:\n${raceState.waitingPlayer?.ign}\n\nSelect Lucky Loser`)

  const options = raceState.luckyLoserCandidates.length
 ? raceState.luckyLoserCandidates.map((p,i)=>({
    label:p.ign,
    value:String(i)
   }))
 : [{
    label:"No Lucky Loser Available",
    value:"none"
   }]

  const select = new StringSelectMenuBuilder()
   .setCustomId("select_lucky_loser")
   .setPlaceholder("Select Lucky Loser")
   .setDisabled(options[0].value === "none")
   .addOptions(options)

  const row = new ActionRowBuilder().addComponents(select)

  return { embed, components:[row] }

 }

 // ================= ROUND ROBIN =================

 if(raceState.roundRobinMode){

  const activeMatch = raceState.matches.find(m=>!m.winner)

  if(!activeMatch){

   const result = calculateRoundRobinWins()
   const first = result[0][1]

   if(first===2){

    const champ = raceState.roundRobinPlayers.find(p=>p.id===result[0][0])
    const p2 = raceState.roundRobinPlayers.find(p=>p.id===result[1][0])
    const p3 = raceState.roundRobinPlayers.find(p=>p.id===result[2][0])

    return {
     embed:new EmbedBuilder()
      .setTitle("🏆 TOURNAMENT RESULT")
      .setDescription(
`🥇 ${champ?.ign}
🥈 ${p2?.ign}
🥉 ${p3?.ign}`
      ),
     components:[]
    }

   }

   const buttons = raceState.roundRobinPlayers.map((p,i)=>
    new ButtonBuilder()
     .setCustomId(`select_p1_${i}`)
     .setLabel(p.ign)
     .setStyle(ButtonStyle.Primary)
   )

   const row = new ActionRowBuilder().addComponents(buttons)

   return {
    embed:new EmbedBuilder()
     .setTitle("🏁 Round Robin Finished")
     .setDescription("Semua pemain menang 1 kali.\nAdmin memilih champion."),
    components:[row]
   }

  }

  const p1 = activeMatch.player1?.ign
  const p2 = activeMatch.player2?.ign

  const matchIndex = raceState.matches.indexOf(activeMatch)

  const btn1 = new ButtonBuilder()
   .setCustomId(`winner_${matchIndex}_1`)
   .setLabel(p1)
   .setStyle(ButtonStyle.Primary)

  const btn2 = new ButtonBuilder()
   .setCustomId(`winner_${matchIndex}_2`)
   .setLabel(p2)
   .setStyle(ButtonStyle.Danger)

  const row = new ActionRowBuilder().addComponents(btn1,btn2)

  return {
   embed:new EmbedBuilder()
    .setTitle(`⚔ ROUND ROBIN`)
    .setDescription(`${p1} vs ${p2}`),
   components:[row]
  }

 }

 // ================= NORMAL BRACKET =================

 const activeMatch = raceState.matches?.find(m=>!m.winner)

 // ================= FINAL RESULT =================

if(raceState.p1 && raceState.p2 && raceState.p3){

 const resetButton = new ButtonBuilder()
  .setCustomId("reset_tournament")
  .setLabel("Reset Tournament")
  .setStyle(ButtonStyle.Danger)

 const row = new ActionRowBuilder().addComponents(resetButton)

 return {
  embed:new EmbedBuilder()
   .setTitle("🏆 TOURNAMENT RESULT")
   .setDescription(
`🥇 ${raceState.p1.ign}
🥈 ${raceState.p2.ign}
🥉 ${raceState.p3.ign}`
   ),
  components:[row]
 }

}

 if(activeMatch){

  const p1 = activeMatch.player1?.ign || "BYE"
  const p2 = activeMatch.player2?.ign || "BYE"

  const matchIndex = raceState.matches.indexOf(activeMatch)

  const btn1 = new ButtonBuilder()
   .setCustomId(`winner_${matchIndex}_1`)
   .setLabel(p1)
   .setStyle(ButtonStyle.Primary)

  const btn2 = new ButtonBuilder()
   .setCustomId(`winner_${matchIndex}_2`)
   .setLabel(p2)
   .setStyle(ButtonStyle.Danger)

  const row = new ActionRowBuilder().addComponents(btn1,btn2)

  return {
   embed:new EmbedBuilder()
    .setTitle(`⚔ ROUND ${raceState.currentRound}`)
    .setDescription(`${p1} vs ${p2}`),
   components:[row]
  }

 }

 // ================= FALLBACK =================

 return {
  embed:new EmbedBuilder()
   .setTitle("⚔ Waiting Match")
   .setDescription("Bracket sedang dibuat..."),
  components:[]
 }

}

module.exports={
 sendBracketPanel,
 updateBracketPanel
}
