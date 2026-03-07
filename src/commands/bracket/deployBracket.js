const { createBracketEmbed } = require("../../utils/embeds")
const { getSetupButton } = require("../../utils/bracketButtons")
const { raceState } = require("../../data/raceState")

async function deployBracket(message){

 // hapus command
 await message.delete().catch(()=>{})

 const embed = createBracketEmbed(raceState)

 const row = getSetupButton("race_name")

 const msg = await message.channel.send({
  embeds:[embed],
  components:[row]
 })

 raceState.panelMessageId = msg.id
 raceState.panelChannelId = message.channel.id

}

module.exports = { deployBracket }
