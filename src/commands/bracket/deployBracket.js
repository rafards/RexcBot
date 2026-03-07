const { createBracketEmbed } = require("../../utils/embeds")
const { getSetupButton } = require("../../utils/bracketButtons")
const { raceState } = require("../../data/raceState")

async function deployBracket(message){

 const embed = createBracketEmbed(raceState)

 const row = getSetupButton("race_name")

 const msg = await message.channel.send({
  embeds: [embed],
  components: [row]
 })

 // simpan panel message supaya bisa diedit
 raceState.panelMessageId = msg.id
 raceState.panelChannelId = message.channel.id

}

module.exports = { deployBracket }
