module.exports = {

  token: process.env.TOKEN,

  clientId: process.env.CLIENT_ID,
  guildId: process.env.GUILD_ID,

  channels: {

    // nickname system
    nicknameApproval: process.env.APPROVAL_CHANNEL_ID,

    // bracket control panel
    bracket: process.env.BRACKET_CHANNEL_ID,

    // join race + race result
    raceAnnouncement: process.env.RACE_ANNOUNCEMENT_CHANNEL_ID

  },

  roles: {

    // nickname approver
    approver: process.env.APPROVER_ROLE_ID,

    // bracket organizer (BT)
    organizer: process.env.ORGANIZER_ROLE_ID

  }

};
