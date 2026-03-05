const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  StringSelectMenuBuilder,
  Events,
  MessageFlags,
  PermissionFlagsBits
} = require("discord.js");

module.exports = (client) => {

  /* ================= STATE ================= */

  let bracket = {
    status: "idle",
    maxSlot: 8,
    participants: [],
    round: 1,
    matches: [],
    channelId: null,
    messageId: null
  };

  /* ================ UTIL =================== */

  function shuffle(array) {
    return array.sort(() => Math.random() - 0.5);
  }

  function generateMatches() {
    bracket.matches = [];
    let players = [...bracket.participants];
    let matchId = 1;

    while (players.length > 1) {
      const p1 = players.shift();
      const p2 = players.shift();

      bracket.matches.push({
        id: matchId++,
        p1,
        p2,
        winner: null,
        completed: false,
        isBye: false
      });
    }

    // Bye case
    if (players.length === 1) {
      bracket.matches.push({
        id: matchId,
        p1: players[0],
        p2: null,
        winner: players[0],
        completed: true,
        isBye: true
      });
    }
  }

  function buildEmbed() {
    const embed = new EmbedBuilder()
      .setColor("#22c55e")
      .setTitle("🏁 STATIC SHIFT RACING TOURNAMENT");

    if (bracket.status === "open") {
      embed.setDescription(
        `Status: Registration Open\n\n` +
        `Slot: ${bracket.participants.length} / ${bracket.maxSlot}\n\n` +
        (bracket.participants.length
          ? bracket.participants.map((id, i) => `${i + 1}. <@${id}>`).join("\n")
          : "Belum ada peserta.")
      );
    }

    if (bracket.status === "running") {
      let desc = `Status: Running\nRound: ${bracket.round}\n\n━━━━━━━━━━━━━━━━━━\n\n`;

      bracket.matches.forEach(match => {
        if (match.isBye) {
          desc += `Match ${match.id}\n<@${match.p1}> mendapat bye 🎟\n\n`;
        } else {
          desc += `Match ${match.id}\n<@${match.p1}> 🆚 <@${match.p2}>\n`;
          desc += `Winner: ${match.winner ? `<@${match.winner}> ✅` : "-"}\n\n`;
        }
      });

      desc += "━━━━━━━━━━━━━━━━━━";

      embed.setDescription(desc);
    }

    if (bracket.status === "finished") {
      embed.setDescription(`🏆 CHAMPION\n\n<@${bracket.participants[0]}>`);
    }

    embed.setFooter({ text: "Static Shift Racing • Casual Mode" });

    return embed;
  }

  async function updateMessage() {
    const channel = await client.channels.fetch(bracket.channelId);
    const message = await channel.messages.fetch(bracket.messageId);

    let components = [];

    if (bracket.status === "open") {
      components.push(
        new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId("join_bracket")
            .setLabel("JOIN")
            .setStyle(ButtonStyle.Success),
          new ButtonBuilder()
            .setCustomId("leave_bracket")
            .setLabel("LEAVE")
            .setStyle(ButtonStyle.Danger)
        )
      );
    }

    if (bracket.status === "running") {
      components.push(
        new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId("set_winner")
            .setLabel("Set Winner")
            .setStyle(ButtonStyle.Primary)
        )
      );
    }

    await message.edit({
      embeds: [buildEmbed()],
      components
    });
  }

  /* ================ COMMAND ================= */

  client.on("messageCreate", async (message) => {
    if (message.author.bot) return;
    if (message.content !== "!bracket") return;

    if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
      return message.reply("❌ Hanya admin yang bisa menggunakan command ini.");
    }

    if (bracket.status !== "idle") {
      return message.reply("❌ Tournament masih berjalan.");
    }

    bracket.status = "open";
    bracket.participants = [];
    bracket.round = 1;
    bracket.channelId = message.channel.id;

    const msg = await message.channel.send({
      embeds: [buildEmbed()],
      components: [
        new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId("join_bracket")
            .setLabel("JOIN")
            .setStyle(ButtonStyle.Success),
          new ButtonBuilder()
            .setCustomId("leave_bracket")
            .setLabel("LEAVE")
            .setStyle(ButtonStyle.Danger)
        )
      ]
    });

    bracket.messageId = msg.id;

    await message.reply({
      content: "Panel tournament dibuka. Gunakan tombol untuk kontrol.",
      flags: MessageFlags.Ephemeral
    });
  });

  /* ================ INTERACTIONS ================= */

  client.on(Events.InteractionCreate, async (interaction) => {

    if (!interaction.isButton() && !interaction.isStringSelectMenu()) return;

    /* JOIN */
    if (interaction.customId === "join_bracket") {
      if (bracket.status !== "open") return;

      if (bracket.participants.includes(interaction.user.id)) {
        return interaction.reply({ content: "⚠ Kamu sudah terdaftar.", flags: MessageFlags.Ephemeral });
      }

      if (bracket.participants.length >= bracket.maxSlot) {
        return interaction.reply({ content: "❌ Slot penuh.", flags: MessageFlags.Ephemeral });
      }

      bracket.participants.push(interaction.user.id);
      await updateMessage();

      return interaction.reply({ content: "✅ Berhasil join!", flags: MessageFlags.Ephemeral });
    }

    /* LEAVE */
    if (interaction.customId === "leave_bracket") {
      if (bracket.status !== "open") return;

      bracket.participants = bracket.participants.filter(id => id !== interaction.user.id);
      await updateMessage();

      return interaction.reply({ content: "Keluar dari bracket.", flags: MessageFlags.Ephemeral });
    }

    /* SET WINNER BUTTON */
    if (interaction.customId === "set_winner") {
      if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator))
        return interaction.reply({ content: "❌ Admin only.", flags: MessageFlags.Ephemeral });

      if (bracket.status !== "running")
        return interaction.reply({ content: "❌ Tournament belum berjalan.", flags: MessageFlags.Ephemeral });

      const unfinished = bracket.matches.filter(m => !m.completed && !m.isBye);

      if (!unfinished.length)
        return interaction.reply({ content: "Semua match sudah selesai.", flags: MessageFlags.Ephemeral });

      const menu = new StringSelectMenuBuilder()
        .setCustomId("select_match")
        .setPlaceholder("Pilih Match")
        .addOptions(
          unfinished.map(m => ({
            label: `Match ${m.id}`,
            value: `${m.id}`
          }))
        );

      return interaction.reply({
        content: "Pilih match:",
        components: [new ActionRowBuilder().addComponents(menu)],
        flags: MessageFlags.Ephemeral
      });
    }

    /* SELECT MATCH */
    if (interaction.customId === "select_match") {
      const matchId = parseInt(interaction.values[0]);
      const match = bracket.matches.find(m => m.id === matchId);

      const menu = new StringSelectMenuBuilder()
        .setCustomId(`select_winner_${match.id}`)
        .setPlaceholder("Pilih Pemenang")
        .addOptions([
          { label: `Player 1`, value: match.p1 },
          { label: `Player 2`, value: match.p2 }
        ]);

      return interaction.update({
        content: "Pilih pemenang:",
        components: [new ActionRowBuilder().addComponents(menu)]
      });
    }

    /* SELECT WINNER */
    if (interaction.customId.startsWith("select_winner_")) {
      const matchId = parseInt(interaction.customId.split("_")[2]);
      const match = bracket.matches.find(m => m.id === matchId);

      match.winner = interaction.values[0];
      match.completed = true;

      await interaction.update({ content: "Winner diset!", components: [] });

      await updateMessage();

      const allDone = bracket.matches.every(m => m.completed);

      if (allDone) {
        const winners = bracket.matches.map(m => m.winner);
        bracket.participants = winners;

        if (winners.length === 1) {
          bracket.status = "finished";
          await updateMessage();
          return;
        }

        bracket.round++;
        generateMatches();
        await updateMessage();
      }
    }
  });

};
