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

function renderMatches() {
  if (!bracket.rounds.length) return "Belum ada bracket.";

  let text = "🏁 **TOURNAMENT BRACKET**\n\n";

  bracket.rounds.forEach((round, rIndex) => {

    let title = "";

    if (rIndex === bracket.rounds.length - 1) title = "GRAND FINAL";
    else if (rIndex === bracket.rounds.length - 2) title = "SEMIFINAL";
    else title = `ROUND ${rIndex + 1}`;

    text += `**${title}**\n\n`;

    round.forEach((match, mIndex) => {

      const p1 = match.p1 ? `<@${match.p1}>` : "BYE";
      const p2 = match.p2 ? `<@${match.p2}>` : "BYE";

      text += `Match ${mIndex + 1}\n`;
      text += `${p1} vs ${p2}\n`;

      if (match.winner) {
        text += `🏆 Winner: <@${match.winner}>\n`;
      }

      if (
        bracket.status === "running" &&
        rIndex === bracket.currentRound &&
        mIndex === bracket.currentMatchIndex
      ) {
        text += "🔥 **LIVE MATCH**\n";
      }

      text += "\n";
    });

    text += "━━━━━━━━━━━━━━━━━━━━\n\n";
  });

  return text;
}

function autoResolveBye() {

  let changed = false;

  const round = bracket.rounds[bracket.currentRound];

  if (!round) return;

  const match = round[bracket.currentMatchIndex];

  if (!match) return;

  if (match.p1 && !match.p2) {
    match.winner = match.p1;
    changed = true;
  }

  if (!match.p1 && match.p2) {
    match.winner = match.p2;
    changed = true;
  }

  if (changed) {
    advanceMatch();
  }
}

function generateBracket() {

  let players = [...bracket.participants];

  while (players.length < bracket.maxSlot) {
    players.push(null);
  }

  let rounds = [];

  let firstRound = [];

  for (let i = 0; i < players.length; i += 2) {
    firstRound.push({
      p1: players[i],
      p2: players[i + 1],
      winner: null
    });
  }

  rounds.push(firstRound);

  let size = firstRound.length;

  while (size > 1) {

    size = size / 2;

    let round = [];

    for (let i = 0; i < size; i++) {
      round.push({
        p1: null,
        p2: null,
        winner: null
      });
    }

    rounds.push(round);
  }

  bracket.rounds = rounds;
  bracket.currentRound = 0;
  bracket.currentMatchIndex = 0;
  bracket.status = "running";

  saveState(bracket);

  autoResolveBye();
}

function advanceMatch() {

  bracket.currentMatchIndex++;

  const currentRoundMatches = bracket.rounds[bracket.currentRound];

  if (bracket.currentMatchIndex >= currentRoundMatches.length) {

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

  autoResolveBye();
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

        return interaction.reply({
          content: "Slot ditetapkan.",
          flags: MessageFlags.Ephemeral
        });

      }

    }

    if (interaction.isButton()) {

      if (interaction.customId === "join") {

        if (bracket.status !== "open")
          return interaction.reply({
            content: "Registration tutup.",
            flags: MessageFlags.Ephemeral
          });

        if (bracket.participants.includes(interaction.user.id))
          return interaction.reply({
            content: "Sudah join.",
            flags: MessageFlags.Ephemeral
          });

        if (bracket.participants.length >= bracket.maxSlot)
          return interaction.reply({
            content: "Slot penuh.",
            flags: MessageFlags.Ephemeral
          });

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

        return interaction.reply({
          content: "Berhasil join.",
          flags: MessageFlags.Ephemeral
        });

      }

      if (interaction.customId === "start") {

        if (!isAuthorized(interaction.member))
          return interaction.reply({
            content: "Tidak punya izin.",
            flags: MessageFlags.Ephemeral
          });

        if (bracket.participants.length < 2)
          return interaction.reply({
            content: "Minimal 2 player.",
            flags: MessageFlags.Ephemeral
          });

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
          content: renderMatches(),
          embeds: [],
          components: [winnerRow]
        });

        return interaction.reply({
          content: "Tournament dimulai.",
          flags: MessageFlags.Ephemeral
        });

      }

      if (interaction.customId === "win_p1" || interaction.customId === "win_p2") {

        if (!isAuthorized(interaction.member))
          return interaction.reply({
            content: "Tidak punya izin.",
            flags: MessageFlags.Ephemeral
          });

        const currentRoundMatches = bracket.rounds[bracket.currentRound];

        const match = currentRoundMatches[bracket.currentMatchIndex];

        const winner =
          interaction.customId === "win_p1"
            ? match.p1
            : match.p2;

        match.winner = winner;

        saveState(bracket);

        advanceMatch();

        const channel = await client.channels.fetch(bracket.channelId);
        const msg = await channel.messages.fetch(bracket.messageId);

        await msg.edit({
          content: renderMatches()
        });

        if (bracket.status === "finished") {

          await channel.send(
            `🏆 **TOURNAMENT WINNER**\n<@${winner}>`
          );

        }

        return interaction.reply({
          content: "Winner ditetapkan.",
          flags: MessageFlags.Ephemeral
        });

      }

      if (interaction.customId === "reset") {

        if (!isAuthorized(interaction.member))
          return interaction.reply({
            content: "Tidak punya izin.",
            flags: MessageFlags.Ephemeral
          });

        bracket = resetState();

        saveState(bracket);

        return interaction.reply({
          content: "Tournament direset.",
          flags: MessageFlags.Ephemeral
        });

      }

    }

  });

};
