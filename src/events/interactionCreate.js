const { client } = require("../index")

const { registrationButton } = require("../interactions/buttons/registrationButton")
const { bracketButtons } = require("../interactions/buttons/bracketButtons")
const { handleBracketModals } = require("../interactions/modals/bracketModals")
const { raceState } = require("../data/raceState")
const { deployRaceButton } = require("../interactions/buttons/deployRaceButton")

client.on("interactionCreate", async interaction => {

 // ===============================
 // BUTTON
 // ===============================

 if(interaction.isButton()){

  if(interaction.customId === "register_player"){
   return registrationButton(interaction)
  }

  return bracketButtons(interaction)

 }

 // ===============================
 // SELECT MENU
 // ===============================

 if(interaction.isStringSelectMenu()){

  if(interaction.customId === "lap_select"){

   raceState.lap = Number(interaction.values[0])

   await interaction.reply({
    content:`🏎️ Race lap set to **${raceState.lap}**`,
    ephemeral:true
   })

  }

 }

 // ===============================
 // MODAL
 // ===============================

 if(interaction.isModalSubmit()){

  handleBracketModals(interaction)

 }

 // ===============================
 // DEPLOY RACE
 // ===============================

 if(interaction.isButton()){

 deployRaceButton(interaction)

}

})
