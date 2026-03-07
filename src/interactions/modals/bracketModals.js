const { createBracketEmbed } = require("../../utils/embeds")
const { bracketData } = require("../../systems/bracketSystem")

async function handleBracketModals(interaction){

 if(interaction.customId === "race_name_modal"){

  const raceName = interaction.fields.getTextInputValue("race_name_input")

  bracketData.name = raceName

  const embed = createBracketEmbed(bracketData)

  await interaction.update({
   embeds:[embed]
  })

 }

}

module.exports = { handleBracketModals }
