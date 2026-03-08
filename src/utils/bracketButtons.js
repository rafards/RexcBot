const { ButtonBuilder, ActionRowBuilder, ButtonStyle } = require("discord.js")

function getSetupButton(step){

 let button

 // ===============================
 // SETUP RACE
 // ===============================

 if(step === "setup_race"){

  button = new ButtonBuilder()
   .setCustomId("setup_race")
   .setLabel("Setup Race")
   .setStyle(ButtonStyle.Primary)

 }

 // ===============================
 // DEPLOY REGISTRATION
 // ===============================

 else if(step === "deploy"){

  button = new ButtonBuilder()
   .setCustomId("deploy_registration")
   .setLabel("Deploy Registration")
   .setStyle(ButtonStyle.Success)

 }

 return new ActionRowBuilder().addComponents(button)

}

module.exports = { getSetupButton }
