const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js")

function getSetupButton(step){

 let label = "Set Race Name"
 let id = "set_race_name"

 if(step === "registration"){
  label = "Set Registration Type"
  id = "set_registration"
 }

 if(step === "lap"){
  label = "Set Lap"
  id = "set_lap"
 }

 if(step === "slots"){
  label = "Set Player Slots"
  id = "set_slots"
 }

 if(step === "time"){
  label = "Set Race Time"
  id = "set_time"
 }

 if(step === "deploy"){
  label = "Deploy Race"
  id = "deploy_race"
 }

 const row = new ActionRowBuilder().addComponents(
  new ButtonBuilder()
   .setCustomId(id)
   .setLabel(label)
   .setStyle(ButtonStyle.Primary)
 )

 return row

}

module.exports = { getSetupButton }
