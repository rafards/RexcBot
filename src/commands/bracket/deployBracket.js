const { createBracketEmbed } = require("../../utils/embeds")
const { getSetupButton } = require("../../utils/bracketButtons")
const { raceState } = require("../../data/raceState")

async function deployBracket(message){

 if(raceState.panelMessageId){
  await message.delete().catch(()=>{})
  return
 }

 await message.delete().catch(()=>{})

 const embed = createBracketEmbed(raceState)
 const row = getSetupButton("setup_race")

 const msg = await message.channel.send({
  embeds:[embed],
  components:[row]
 })

 raceState.panelMessageId = msg.id
 raceState.panelChannelId = message.channel.id

}

module.exports = { deployBracket }
