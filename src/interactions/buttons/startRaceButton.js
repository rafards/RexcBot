const { EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require("discord.js")
const { raceState } = require("../../data/raceState")
const { generateBracket } = require("../../utils/bracketGenerator")

async function startRaceButton(interaction){

 if(interaction.customId !== "start_race") return

 if(raceState.players.length < 2){

  return interaction.reply({
   content:"❌ Need at least 2 players",
   ephemeral:true
  })

 }

 const result = generateBracket(raceState.players)

 raceState.matches = result.matches
 raceState.oddPlayer = result.oddPlayer

 if(raceState.oddPlayer){

 text += `Waiting Player\n${raceState.oddPlayer.ign}\n\n`

}

 let text=""

 raceState.matches.forEach((m,i)=>{

  const p1 = m.player1?.ign || "BYE"
  const p2 = m.player2?.ign || "BYE"

  text += `Match ${i+1}\n`
  text += `${p1} vs ${p2}\n\n`

 })

 const embed = new EmbedBuilder()
  .setTitle(`🏁 ${raceState.raceName}`)
  .setDescription(`ROUND ${raceState.currentRound}`)
  .addFields({name:"Matches",value:text})

 const rows=[]

 raceState.matches.forEach((m,i)=>{

  if(!m.player2) return

  const b1 = new ButtonBuilder()
   .setCustomId(`winner_${i}_1`)
   .setLabel(m.player1.ign)
   .setStyle(ButtonStyle.Primary)

  const b2 = new ButtonBuilder()
   .setCustomId(`winner_${i}_2`)
   .setLabel(m.player2.ign)
   .setStyle(ButtonStyle.Danger)

  rows.push(new ActionRowBuilder().addComponents(b1,b2))

 })

 await interaction.reply({
  embeds:[embed],
  components:rows
 })

}

module.exports = { startRaceButton }
