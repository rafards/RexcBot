const { EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle } = require("discord.js")
const { raceState } = require("../../data/raceState")
const { generateBracket } = require("../../utils/bracketGenerator")

async function deployRaceButton(interaction){

 if(interaction.customId !== "deploy_race") return

 // VALIDATION
 if(!raceState.raceName)
  return interaction.reply({content:"❌ Race name not set", ephemeral:true})

 if(!raceState.lap)
  return interaction.reply({content:"❌ Lap not set", ephemeral:true})

 if(!raceState.slot)
  return interaction.reply({content:"❌ Slot not set", ephemeral:true})

 if(!raceState.time)
  return interaction.reply({content:"❌ Race time not set", ephemeral:true})

 if(raceState.players.length < 2)
  return interaction.reply({content:"❌ Need at least 2 players", ephemeral:true})

 // LOCK REGISTER
 raceState.registrationOpen = false

 // GENERATE BRACKET
 raceState.matches = generateBracket(raceState.players)

 // =========================
 // BUILD BRACKET TEXT
 // =========================

 let bracketText = ""

raceState.matches.forEach((match,index)=>{

 bracketText += `Match ${index+1}\n`
 bracketText += `${match.player1.name} vs ${match.player2.name}\n\n`

})

 // =========================
 // CREATE EMBED
 // =========================

 const embed = new EmbedBuilder()
  .setTitle(`🏁 ${raceState.raceName}`)
  .setDescription("Race Bracket Generated")
  .addFields(
   {name:"Round", value:`${raceState.currentRound}`, inline:true},
   {name:"Laps", value:`${raceState.lap}`, inline:true},
   {name:"Players", value:`${raceState.players.length}`, inline:true},
   {name:"Matches", value:bracketText}
  )

 // =========================
 // SET WINNER
 // =========================
 
 const rows = []

 raceState.matches.forEach((match,index)=>{

 const button1 = new ButtonBuilder()
  .setCustomId(`winner_${index}_1`)
  .setLabel(match.player1.name)
  .setStyle(ButtonStyle.Primary)

 const button2 = new ButtonBuilder()
  .setCustomId(`winner_${index}_2`)
  .setLabel(match.player2.name)
  .setStyle(ButtonStyle.Danger)

 const row = new ActionRowBuilder().addComponents(button1,button2)

 rows.push(row)

})

 // =========================
 // SEND TO CHANNEL
 // =========================

 await interaction.reply({
 embeds:[embed],
 components: rows
})

}

module.exports = { deployRaceButton }
