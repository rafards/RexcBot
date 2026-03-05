const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  StringSelectMenuBuilder,
  EmbedBuilder,
  Events
} = require("discord.js");

const { loadState, saveState, resetState } = require("../utils/storage");

let bracket = loadState();
if (!bracket) bracket = resetState();

function isAuthorized(member) {
  return (
    member.permissions.has("Administrator") ||
    member.roles.cache.has(process.env.ORGANIZER_ROLE_ID)
  );
}

function renderTree() {
  if (!bracket.rounds.length) return "Belum ada bracket.";

  let output = "";

  bracket.rounds.forEach((round, rIndex) => {
    let title = "";

    if (rIndex === bracket.rounds.length - 1) title = "GRAND FINAL";
    else if (rIndex === bracket.rounds.length - 2) title = "SEMIFINAL";
    else title = `ROUND ${rIndex + 1}`;

    output += `━━━━━━━━━━━━━━━━\n${title}\n━━━━━━━━━━━━━━━━\n\n`;

    round.forEach((match, mIndex) => {
      const p1 = match.p1 ? `<@${match.p1}>` : "BYE";
      const p2 = match.p2 ? `<@${match.p2}>` : "BYE";
      const winner = match.winner ? `<@${match.winner}>` : "?";

      output += `${p1} ─┐\n`;
      output += `        ├── ${winner}\n`;
      output += `${p2} ─┘`;

      if (
        bracket.status === "running" &&
        rIndex === bracket.currentRound &&
        mIndex === bracket.currentMatchIndex
      ) {
        output += "   🏎 SSR HEAT — LIVE";
      }

      output += "\n\n";
    });
  });

  return output;
}

function generateBracket() {
  const roundCount = Math.log2(bracket.maxSlot);

  let players = [...bracket.participants];

  while (players.length < bracket.maxSlot) {
    players.push(null);
  }

  let rounds = [];

  // ROUND 1
  let firstRound = [];
  for (let i = 0; i < players.length; i += 2) {
    firstRound.push({
      p1: players[i],
      p2: players[i + 1],
      winner: null
    });
  }
  rounds.push(firstRound);

  // NEXT ROUNDS
  for (let r = 1; r < roundCount; r++) {
    const prev = rounds[r - 1];
    let newRound = [];

    for (let i = 0; i < prev.length / 2; i++) {
      newRound.push({
        p1: null,
        p2: null,
        winner: null
      });
    }

    rounds.push(newRound);
  }

  bracket.rounds = rounds;
  bracket.currentRound = 0;
  bracket.currentMatchIndex = 0;
  bracket.status = "running";

  saveState(bracket);
}

function advanceMatch() {
  bracket.currentMatchIndex++;

  const currentRoundMatches = bracket.rounds[bracket.currentRound];

  if (bracket.currentMatchIndex >= currentRoundMatches.length) {
    // move to next round
    const winners = currentRoundMatches.map(m => m.winner);

    if (bracket.currentRound === bracket.rounds.length - 1) {
      bracket.status = "finished";
      saveState(bracket);
      return;
    }

    const nextRound = bracket.rounds[bracket.currentRound + 1];

    for (let i = 0; i < nextRound.length; i++) {
      nextRound[i].p1 = winners[i * 2];
      nextRound[i].p2 = winners[i * 2 + 1];
    }

    bracket.currentRound++;
    bracket.currentMatchIndex = 0;
  }

  saveState(bracket);
}

module.exports = (client) => {

  client.on(Events.MessageCreate, async (message) => {
    if (message.author.bot) return;
    if (message.channel.id !== process.env.BRACKET_CHANNEL_ID) return;

    if (message.content === "!bracket") {
      if (bracket.status === "open" || bracket.status === "running") {
        return message.reply("⚠️ Tournament sedang aktif.");
      }

      const select = new StringSelectMenuBuilder()
        .setCustomId("select_slot")
        .setPlaceholder("Pilih jumlah slot")
        .addOptions([
          { label: "4 Players", value: "4" },
          { label: "8 Players", value: "8" },
          { label: "16 Players", value: "16" }
        ]);

      const row = new ActionRowBuilder().addComponents(select);

      await message.reply({
        content: "Pilih jumlah slot:",
        components: [row]
      });
    }
  });

  client.on(Events.InteractionCreate, async (interaction) => {

    // SLOT SELECT
    if (interaction.isStringSelectMenu()) {
      if (interaction.customId === "select_slot") {
        bracket.maxSlot = parseInt(interaction.values[0]);
        bracket.participants = [];
        bracket.rounds = [];
        bracket.status = "open";
        bracket.channelId = interaction.channel.id;

        saveState(bracket);

        const embed = new EmbedBuilder()
          .setTitle("🏁 SSR Championship")
          .setDescription(`Registration Open\nSlot: 0 / ${bracket.maxSlot}`);

        const row = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId("join")
            .setLabel("JOIN")
            .setStyle(ButtonStyle.Success),
          new ButtonBuilder()
            .setCustomId("start")
            .setLabel("START")
            .setStyle(ButtonStyle.Primary)
        );

        const msg = await interaction.channel.send({
          embeds: [embed],
          components: [row]
        });

        bracket.messageId = msg.id;
        saveState(bracket);

        return interaction.reply({ content: "Slot ditetapkan.", ephemeral: true });
      }
    }

    // BUTTONS
    if (interaction.isButton()) {

      if (interaction.customId === "join") {
        if (bracket.status !== "open")
          return interaction.reply({ content: "Registration ditutup.", ephemeral: true });

        if (bracket.participants.includes(interaction.user.id))
          return interaction.reply({ content: "Sudah terdaftar.", ephemeral: true });

        if (bracket.participants.length >= bracket.maxSlot)
          return interaction.reply({ content: "Slot penuh.", ephemeral: true });

        bracket.participants.push(interaction.user.id);
        saveState(bracket);

        const channel = await client.channels.fetch(bracket.channelId);
        const message = await channel.messages.fetch(bracket.messageId);

        const embed = new EmbedBuilder()
          .setTitle("🏁 SSR Championship")
          .setDescription(
            `Registration Open\nSlot: ${bracket.participants.length} / ${bracket.maxSlot}`
          );

        await message.edit({ embeds: [embed] });

        return interaction.reply({ content: "Berhasil join.", ephemeral: true });
      }

      if (interaction.customId === "start") {
        if (!isAuthorized(interaction.member))
          return interaction.reply({ content: "Tidak punya izin.", ephemeral: true });

        if (bracket.participants.length < 2)
          return interaction.reply({ content: "Minimal 2 peserta.", ephemeral: true });

        generateBracket();

        const channel = await client.channels.fetch(bracket.channelId);
        const message = await channel.messages.fetch(bracket.messageId);

        const embed = new EmbedBuilder()
          .setTitle("🏎 SSR Championship")
          .setDescription(renderTree());

        await message.edit({ embeds: [embed], components: [] });

        return interaction.reply({ content: "Tournament dimulai.", ephemeral: true });
      }
    }

  });

};
