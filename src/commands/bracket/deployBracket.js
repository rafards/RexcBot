const { createBracketEmbed } = require("../../utils/embeds")
const { bracketData } = require("../../systems/bracketSystem")
const { getSetupButton } = require("../../utils/bracketButtons")
const { raceState } = require("../../data/raceState")

async function deployBracket(message){

 const embed = createBracketEmbed(bracketData)

 const row = getSetupButton("race_name")

 const msg = await message.channel.send({
  embeds:[embed],
  components:[row]
 })

 // simpan panel
 raceState.panelMessageId = msg.id
 raceState.panelChannelId = message.channel.id

}

module.exports = { deployBracket }
