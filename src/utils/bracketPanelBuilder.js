const { EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require("discord.js")
const { raceState } = require("../data/raceState")

function buildBracketEmbed(){

 if(raceState.roundRobinMode){
  return buildRoundRobinEmbed()
 }
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

 function buildRoundRobinEmbed(){

  const players = raceState.roundRobinPlayers

  let text = ""

  text += `🏁 ROUND ROBIN FINAL\n\n`

  text += `Match 1\n`
  text += `${players[0].ign} vs ${players[1].ign}\n\n`
 
  text += `Match 2\n`
  text += `${players[1].ign} vs ${players[2].ign}\n\n`

  text += `Match 3\n`
  text += `${players[2].ign} vs ${players[0].ign}\n\n`

  return new EmbedBuilder()
   .setTitle("🏁 ROUND ROBIN")
   .setDescription(text)
 }

 // ================= CURRENT ROUND =================

 const activeIndex = raceState.matches.findIndex(m=>!m.winner)

 text+=`━━━━━━━━━━━━━━\n`
 text+=`⚔ CURRENT ROUND\n\n`

 raceState.matches.forEach((m,i)=>{

  const p1 = m.player1?.ign || "TBD"
  const p2 = m.player2?.ign || "TBD"

  const live = i===activeIndex && !m.winner

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

async function updateBracketPanel(client){

 const playerChannel = await client.channels.fetch(raceState.playerPanelChannelId)
 const adminChannel = await client.channels.fetch(raceState.adminListChannelId)

 const msg = await playerChannel.messages.fetch(raceState.bracketMessageId)

 const embed = buildBracketEmbed()

 await msg.edit({
  embeds:[embed]
 })

 const adminPanel = await adminChannel.messages.fetch(raceState.adminMatchPanelId)

 const adminData = buildAdminPanel()

 await adminPanel.edit({
  embeds:[adminData.embed],
  components:adminData.components
 })

}

function buildAdminPanel(){
 if(raceState.luckyLoserMode){

  const embed = new EmbedBuilder()
   .setTitle("⚠ Lucky Loser Selection")
   .setDescription(
    `Waiting Player:\n${raceState.waitingPlayer?.ign}\n\nSelect Lucky Loser`
   )

  const buttons = raceState.luckyLoserCandidates.map((p,i)=>
   new ButtonBuilder()
    .setCustomId(`lucky_${i}`)
    .setLabel(p.ign)
    .setStyle(ButtonStyle.Secondary)
  )

  const row = new ActionRowBuilder().addComponents(buttons)

  return {
   embed,
   components:[row]
  }
 }

 if(raceState.roundRobinMode){

  const activeMatch = raceState.matches.find(m=>!m.winner)

  if(!activeMatch){
   return {
    embed:new EmbedBuilder()
    .setTitle("Round Robin Finished")
    .setDescription("Waiting admin decision"),
    components:[]
   }
  }

  const p1 = activeMatch.player1?.ign
  const p2 = activeMatch.player2?.ign

  const embed = new EmbedBuilder()
   .setTitle("🏁 ROUND ROBIN MATCH")
   .setDescription(`${p1} vs ${p2}`)

  const btn1 = new ButtonBuilder()
   .setCustomId(`winner_${raceState.matches.indexOf(activeMatch)}_1`)
   .setLabel(p1)
   .setStyle(ButtonStyle.Primary)

  const btn2 = new ButtonBuilder()
   .setCustomId(`winner_${raceState.matches.indexOf(activeMatch)}_2`)
   .setLabel(p2)
   .setStyle(ButtonStyle.Danger)
 
  const row = new ActionRowBuilder().addComponents(btn1,btn2)

  return { embed, components:[row] }

 }

 const activeMatch = raceState.matches.find(m=>!m.winner)

 if(!activeMatch){

 const champion = raceState.matches[0]?.winner

 if(champion){

  return {
   embed:new EmbedBuilder()
    .setTitle("🏆 TOURNAMENT FINISHED")
    .setDescription(`Winner: ${champion.ign}`),
   components:[]
  }

 }

 return {
  embed:new EmbedBuilder()
   .setTitle("Match Finished")
   .setDescription("Waiting next round"),
  components:[]
 }

}

 const p1 = activeMatch.player1?.ign || "BYE"
 const p2 = activeMatch.player2?.ign || "BYE"

 const matchIndex = raceState.matches.indexOf(activeMatch)

 const embed = new EmbedBuilder()
  .setTitle(`⚔ ROUND ${raceState.currentRound}`)
  .setDescription(
   `Match ${matchIndex+1}\n\n${p1} vs ${p2}`
  )

 const btn1 = new ButtonBuilder()
  .setCustomId(`winner_${raceState.matches.indexOf(activeMatch)}_1`)
  .setLabel(p1)
  .setStyle(ButtonStyle.Primary)

 const btn2 = new ButtonBuilder()
  .setCustomId(`winner_${raceState.matches.indexOf(activeMatch)}_2`)
  .setLabel(p2)
  .setStyle(ButtonStyle.Danger)

 const row = new ActionRowBuilder().addComponents(btn1,btn2)

 return {
  embed,
  components:[row]
 }

}

module.exports={
 sendBracketPanel,
 updateBracketPanel
}
