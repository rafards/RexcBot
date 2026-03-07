const { EmbedBuilder } = require("discord.js")
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

 raceState.matches = generateBracket(raceState.players)

 raceState.registrationOpen = false

 const embed = new EmbedBuilder()
  .setTitle(`🏁 ${raceState.raceName}`)
  .setDescription("Race successfully deployed!")
  .addFields(
   {name:"Laps", value:`${raceState.lap}`, inline:true},
   {name:"Slots", value:`${raceState.slot}`, inline:true},
   {name:"Race Time", value:`${raceState.time}`, inline:true},
   {name:"Players", value:`${raceState.players.length}`, inline:true}
  )

 await interaction.reply({embeds:[embed]})

}

module.exports = { deployRaceButton }
