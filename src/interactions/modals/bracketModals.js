const { createBracketEmbed } = require("../../utils/embeds")
const { bracketData } = require("../../systems/bracketSystem")
const { getSetupButton } = require("../../utils/bracketButtons")
const { raceState } = require("../../data/raceState")

async function handleBracketModals(interaction){

 if(interaction.customId === "race_name_modal"){

  const raceName = interaction.fields.getTextInputValue("race_name_input")

  bracketData.name = raceName
  bracketData.step = "registration"

  const embed = createBracketEmbed(bracketData)
  const row = getSetupButton("registration")

  await interaction.update({
   embeds:[embed],
   components:[row]
  })

 }

}

module.exports = { handleBracketModals }
