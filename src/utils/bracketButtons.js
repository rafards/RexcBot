const { ButtonBuilder, ActionRowBuilder, ButtonStyle } = require("discord.js")

function getSetupButton(step){

 let button

 if(step === "race_name"){

  button = new ButtonBuilder()
   .setCustomId("set_race_name")
   .setLabel("Set Race Name")
   .setStyle(ButtonStyle.Primary)

 }

 else if(step === "registration"){

  button = new ButtonBuilder()
   .setCustomId("set_registration")
   .setLabel("Set Registration")
   .setStyle(ButtonStyle.Primary)

 }

 else if(step === "lap"){

  button = new ButtonBuilder()
   .setCustomId("set_lap")
   .setLabel("Set Lap")
   .setStyle(ButtonStyle.Primary)

 }

 else if(step === "slot"){

  button = new ButtonBuilder()
   .setCustomId("set_slot")
   .setLabel("Set Player Slot")
   .setStyle(ButtonStyle.Primary)

 }

 else if(step === "race_time"){

  button = new ButtonBuilder()
   .setCustomId("set_race_time")
   .setLabel("Set Race Time")
   .setStyle(ButtonStyle.Primary)

 }

 else if(step === "deploy"){

 button = new ButtonBuilder()
  .setCustomId("deploy_registration")
  .setLabel("Deploy Registration")
  .setStyle(ButtonStyle.Success)

}

 return new ActionRowBuilder().addComponents(button)

}

module.exports = { getSetupButton }
