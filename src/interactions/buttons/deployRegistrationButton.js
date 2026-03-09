const { EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require("discord.js")
const { raceState } = require("../../data/raceState")

function formatRupiah(value){

 if(!value || value === 0) return "Gratis"

 return "Rp" + Number(value).toLocaleString("id-ID")

}

async function deployRegistrationButton(interaction){

 if(interaction.customId !== "deploy_registration") return

 await interaction.deferUpdate()

 const playerChannel = interaction.guild.channels.cache.find(
  c => c.name === "info-race"
 )

 if(!playerChannel) return

 if(!raceState.raceName || !raceState.slot) return

 // ===============================
 // CLOSE SETUP PANEL (ADMIN)
 // ===============================

 await interaction.message.delete().catch(()=>{})

 // ===============================
 // OPEN REGISTRATION
 // ===============================

 raceState.registrationOpen = true

 // ===============================
 // PLAYER EMBED (NEW UI)
 // ===============================

 const playerEmbed = new EmbedBuilder()
  .setTitle("🏁 SSR BRACKET RACE")
  .setDescription("Registration is now open!\n\nJoin the race before the slot is full.")
  .addFields(
   {
    name:"🏎 Race",
    value: raceState.raceName,
    inline:false
   },
   {
    name:"💰 Registration",
    value: formatRupiah(raceState.racePrice),
    inline:true
   },
   {
    name:"🏁 Lap",
    value:`${raceState.lap} Laps`,
    inline:true
   },
   {
    name:"👥 Players",
    value:`0 / ${raceState.slot}`,
    inline:true
   },
   {
    name:"⏰ Race Start",
    value: raceState.time || "TBA",
    inline:false
   }
  )
  .setFooter({
   text:"Press JOIN to participate in the race"
  })

 // ===============================
 // JOIN / LEAVE BUTTON
 // ===============================

 const joinButton = new ButtonBuilder()
  .setCustomId("join_race")
  .setLabel("Join Race")
  .setStyle(ButtonStyle.Success)

 const leaveButton = new ButtonBuilder()
  .setCustomId("leave_race")
  .setLabel("Leave")
  .setStyle(ButtonStyle.Danger)

 const row = new ActionRowBuilder().addComponents(joinButton,leaveButton)

 const playerPanel = await playerChannel.send({
  embeds:[playerEmbed],
  components:[row]
 })

 raceState.playerPanelId = playerPanel.id
 raceState.playerPanelChannelId = playerChannel.id

 // ===============================
 // ADMIN PLAYER LIST
 // ===============================

 let list=""

 for(let i=1;i<=raceState.slot;i++){
  list += `${i}.\n`
 }

 const adminEmbed = new EmbedBuilder()
  .setTitle("📋 Player List")
  .setDescription(list)

 const fillButton = new ButtonBuilder()
  .setCustomId("fill_test_players")
  .setLabel("Fill Test Players")
  .setStyle(ButtonStyle.Secondary)

 const fill = new ActionRowBuilder().addComponents(fillButton)

 const adminPanel = await interaction.channel.send({
  embeds:[adminEmbed],
  components:[fill]
 })

 raceState.adminListPanelId = adminPanel.id
 raceState.adminListChannelId = interaction.channel.id

}

module.exports = { deployRegistrationButton }
