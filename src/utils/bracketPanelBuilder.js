const { EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require("discord.js")
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

 // ================= CURRENT ROUND =================

 const activeIndex = raceState.matches.findIndex(m=>!m.winner)

 raceState.matches.forEach((m,i)=>{

  if(m.winner) return
  
  const p1 = m.player1?.ign || "BYE"
  const p2 = m.player2?.ign || "BYE"

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

 const embed = new EmbedBuilder()
  .setTitle("⚔ MATCH CURRENT")
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

 return {
  embed,
  components:[row]
 }

}

module.exports={
 sendBracketPanel,
 updateBracketPanel
}
