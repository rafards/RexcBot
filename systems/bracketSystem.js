const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  StringSelectMenuBuilder,
  EmbedBuilder,
  Events,
  PermissionFlagsBits,
  MessageFlags
} = require("discord.js");

const { loadState, saveState, resetState } = require("../utils/storage");

let bracket = loadState();
if (!bracket || !bracket.status) bracket = resetState();

function isAuthorized(member) {
  return (
    member.permissions.has(PermissionFlagsBits.Administrator) ||
    member.roles.cache.has(process.env.ORGANIZER_ROLE_ID)
  );
}

function pad(str, length) {
  return str.padEnd(length, " ");
}

function renderTree() {
  if (!bracket.rounds || !bracket.rounds.length) return "Belum ada bracket.";

  let output = "```\n";

  bracket.rounds.forEach((round, rIndex) => {
    let title = "";

    if (rIndex === bracket.rounds.length - 1) title = "GRAND FINAL";
    else if (rIndex === bracket.rounds.length - 2) title = "SEMIFINAL";
    else title = `ROUND ${rIndex + 1}`;

    output += `==== ${title} ====\n\n`;

    round.forEach((match, mIndex) => {
      const p1 = match.p1 ? `<@${match.p1}>` : "BYE";
      const p2 = match.p2 ? `<@${match.p2}>` : "BYE";
      const winner = match.winner ? `<@${match.winner}>` : "?";

      const longest = Math.max(p1.length, p2.length, 10);

      output += `${pad(p1, longest)} ─┐\n`;
      output += `${" ".repeat(longest)}  ├── ${winner}\n`;
      output += `${pad(p2, longest)} ─┘`;

      if (
        bracket.status === "running" &&
        rIndex === bracket.currentRound &&
        mIndex === bracket.currentMatchIndex
      ) {
        output += "   ← LIVE";
      }

      output += "\n\n";
    });
  });

  output += "```";
  return output;
}

function generateBracket() {
  let players = [...bracket.participants];

  while (players.length < bracket.maxSlot) {
    players.push(null);
  }

  let rounds = [];

  let firstRound = [];
  for (let i = 0; i < players.length; i += 2) {
    firstRound.push({ p1: players[i], p2: players[i + 1], winner: null });
  }
  rounds.push(firstRound);

  let size = firstRound.length;
  while (size > 1) {
    size /= 2;
    let newRound = [];
    for (let i = 0; i < size; i++) {
      newRound.push({ p1: null, p2: null, winner: null });
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

  const currentRoundMatches = bracket.rounds?.[bracket.currentRound];
  if (!currentRoundMatches) return;

  if (bracket.currentMatchIndex >= currentRoundMatches.length) {
    const winners = currentRoundMatches.map(m => m.winner);

    if (bracket.currentRound === bracket.rounds.length - 1) {
      bracket.status = "finished";
      saveState(bracket);
      return;
    }

    const next = bracket.rounds[bracket.currentRound + 1];

    for (let i = 0; i < next.length; i++) {
      next[i].p1 = winners[i * 2];
      next[i].p2 = winners[i * 2 + 1];
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
      await message.delete().catch(() => {});

      if (bracket.status !== "idle")
        return message.channel.send("Tournament masih aktif.");

      const select = new StringSelectMenuBuilder()
        .setCustomId("select_slot")
        .setPlaceholder("Pilih slot")
        .addOptions([
          { label: "4 Players", value: "4" },
          { label: "8 Players", value: "8" },
          { label: "16 Players", value: "16" }
        ]);

      const row = new ActionRowBuilder().addComponents(select);

      await message.channel.send({
        content: "Pilih jumlah slot:",
        components: [row]
      });
    }
  });

  client.on(Events.InteractionCreate, async (interaction) => {

    if (interaction.isStringSelectMenu()) {
      if (interaction.customId === "select_slot") {

        bracket = resetState();
        bracket.maxSlot = parseInt(interaction.values[0]);
        bracket.status = "open";
        bracket.channelId = interaction.channel.id;

        saveState(bracket);

        const embed = new EmbedBuilder()
          .setTitle("🏁 Tournament Registration")
          .setDescription(`Slot: 0 / ${bracket.maxSlot}`);

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

        return interaction.reply({ content: "Slot ditetapkan.", flags: MessageFlags.Ephemeral });
      }
    }

    if (interaction.isButton()) {

      if (interaction.customId === "join") {
        if (bracket.status !== "open")
          return interaction.reply({ content: "Registration tutup.", flags: MessageFlags.Ephemeral });

        if (bracket.participants.includes(interaction.user.id))
          return interaction.reply({ content: "Sudah join.", flags: MessageFlags.Ephemeral });

        if (bracket.participants.length >= bracket.maxSlot)
          return interaction.reply({ content: "Slot penuh.", flags: MessageFlags.Ephemeral });

        bracket.participants.push(interaction.user.id);
        saveState(bracket);

        const channel = await client.channels.fetch(bracket.channelId);
        const msg = await channel.messages.fetch(bracket.messageId);

        const embed = new EmbedBuilder()
          .setTitle("🏁 Tournament Registration")
          .setDescription(
            `Slot: ${bracket.participants.length} / ${bracket.maxSlot}`
          );

        await msg.edit({ embeds: [embed] });

        return interaction.reply({ content: "Berhasil join.", flags: MessageFlags.Ephemeral });
      }

      if (interaction.customId === "start") {
        if (!isAuthorized(interaction.member))
          return interaction.reply({ content: "Tidak punya izin.", flags: MessageFlags.Ephemeral });

        generateBracket();

        const channel = await client.channels.fetch(bracket.channelId);
        const msg = await channel.messages.fetch(bracket.messageId);

        const winnerRow = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId("win_p1")
            .setLabel("P1 WIN")
            .setStyle(ButtonStyle.Success),
          new ButtonBuilder()
            .setCustomId("win_p2")
            .setLabel("P2 WIN")
            .setStyle(ButtonStyle.Danger),
          new ButtonBuilder()
            .setCustomId("reset")
            .setLabel("RESET")
            .setStyle(ButtonStyle.Secondary)
        );

        await msg.edit({
          content: renderTree(),
          embeds: [],
          components: [winnerRow]
        });

        return interaction.reply({ content: "Tournament dimulai.", flags: MessageFlags.Ephemeral });
      }

      if (interaction.customId === "win_p1" || interaction.customId === "win_p2") {

        if (!isAuthorized(interaction.member))
          return interaction.reply({ content: "Tidak punya izin.", flags: MessageFlags.Ephemeral });

        const currentRoundMatches = bracket.rounds?.[bracket.currentRound];
        if (!currentRoundMatches)
          return interaction.reply({ content: "❌ Tidak ada match aktif.", flags: MessageFlags.Ephemeral });

        const match = currentRoundMatches[bracket.currentMatchIndex];
        if (!match)
          return interaction.reply({ content: "❌ Match tidak valid.", flags: MessageFlags.Ephemeral });

        const winner = interaction.customId === "win_p1" ? match.p1 : match.p2;
        if (!winner)
          return interaction.reply({ content: "❌ Peserta tidak valid.", flags: MessageFlags.Ephemeral });

        match.winner = winner;
        saveState(bracket);

        advanceMatch();

        const channel = await client.channels.fetch(bracket.channelId);
        const msg = await channel.messages.fetch(bracket.messageId);

        await msg.edit({ content: renderTree() });

        return interaction.reply({ content: "✅ Winner ditetapkan.", flags: MessageFlags.Ephemeral });
      }

      if (interaction.customId === "reset") {
        if (!isAuthorized(interaction.member))
          return interaction.reply({ content: "Tidak punya izin.", flags: MessageFlags.Ephemeral });

        bracket = resetState();
        saveState(bracket);

        return interaction.reply({ content: "Tournament direset.", flags: MessageFlags.Ephemeral });
      }
    }
  });
};
