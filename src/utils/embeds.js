const { EmbedBuilder } = require("discord.js")

function createBracketEmbed(data){

 return new EmbedBuilder()
  .setTitle("🏁 SSR BRACKET RACE")
  .setColor("#ff2b2b")
  .setDescription(`
**Race Name**
${data.name || "Not Set"}

**Registration**
${data.type || "Not Set"}

**Lap**
${data.lap || "Not Set"}

**Slots**
${data.slots || "Not Set"}

**Race Start**
${data.time || "Not Set"}
`)

}

module.exports = { createBracketEmbed }
