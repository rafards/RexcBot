require("dotenv").config();
const {
  Client,
  GatewayIntentBits,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  Events,
  InteractionType
} = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

const activeRequests = new Map();
let totalProcessed = 0;

/* ================= READY ================= */

client.once("clientReady", () => {
  console.log(`🚀 Enterprise System Online: ${client.user.tag}`);
});

/* ================= PANEL COMMAND ================= */

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;
  if (message.content !== "!panel") return;

  if (!message.member.roles.cache.has(process.env.APPROVER_ROLE_ID)) {
    return message.reply("❌ Tidak memiliki izin.");
  }

  const embed = new EmbedBuilder()
    .setColor("#0f172a")
    .setTitle("🛡 Nickname Management System")
    .setDescription(
      "━━━━━━━━━━━━━━━━━━━━━━━\n" +
      "Secure • Verified • Professional\n" +
      "━━━━━━━━━━━━━━━━━━━━━━━"
    )
    .addFields(
      {
        name: "📜 Rules",
        value:
          "• Maksimal 32 karakter\n" +
          "• Tidak mengandung unsur terlarang\n" +
          "• Mengikuti peraturan server\n"
      },
      {
        name: "📊 Live Statistics",
        value:
          `Members: ${message.guild.memberCount}\n` +
          `Active Requests: ${activeRequests.size}\n` +
          `Total Processed: ${totalProcessed}`
      }
    )
    .setThumbnail(message.guild.iconURL({ dynamic: true }))
    .setImage("https://i.imgur.com/b1f3T4V.png")
    .setFooter({
      text: "KEJAWEN TEAM • Enterprise System",
      iconURL: message.guild.iconURL({ dynamic: true })
    });

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("open_request_modal")
      .setLabel("Submit Nickname Request")
      .setEmoji("🚀")
      .setStyle(ButtonStyle.Primary)
  );

  await message.channel.send({
    embeds: [embed],
    components: [row]
  });

  await message.delete().catch(() => null);
});

/* ================= INTERACTION ================= */

client.on(Events.InteractionCreate, async (interaction) => {
  try {

    /* ================= OPEN MODAL ================= */

    if (interaction.isButton() && interaction.customId === "open_request_modal") {

      if (activeRequests.has(interaction.user.id)) {
        return interaction.reply({
          content: "⚠ Kamu masih memiliki request aktif.",
          ephemeral: true
        });
      }

      const modal = new ModalBuilder()
        .setCustomId("nickname_modal")
        .setTitle("Nickname Request");

      const input = new TextInputBuilder()
        .setCustomId("nickname_input")
        .setLabel("Masukkan nickname baru")
        .setStyle(TextInputStyle.Short)
        .setMaxLength(32)
        .setRequired(true);

      modal.addComponents(
        new ActionRowBuilder().addComponents(input)
      );

      return interaction.showModal(modal);
    }

    /* ================= SUBMIT REQUEST ================= */

    if (
      interaction.type === InteractionType.ModalSubmit &&
      interaction.customId === "nickname_modal"
    ) {

      const nickname = interaction.fields.getTextInputValue("nickname_input");

      activeRequests.set(interaction.user.id, {
        nickname,
        requestedAt: Date.now()
      });

      const approvalChannel = await interaction.guild.channels.fetch(
        process.env.APPROVAL_CHANNEL_ID
      );

      const embed = new EmbedBuilder()
        .setColor("#facc15")
        .setTitle("📌 Nickname Approval Request")
        .addFields(
          { name: "👤 Requester", value: `<@${interaction.user.id}>`, inline: true },
          { name: "📝 Requested Nickname", value: `**${nickname}**`, inline: true },
          { name: "📅 Requested At", value: `<t:${Math.floor(Date.now()/1000)}:F>` }
        )
        .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
        .setTimestamp();

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId(`approve_${interaction.user.id}`)
          .setLabel("Approve")
          .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
          .setCustomId(`reject_${interaction.user.id}`)
          .setLabel("Reject")
          .setStyle(ButtonStyle.Danger)
      );

      await approvalChannel.send({ embeds: [embed], components: [row] });

      return interaction.reply({
        content: "✅ Request berhasil dikirim ke staff.",
        ephemeral: true
      });
    }

    /* ================= REJECT BUTTON (FIXED) ================= */

    if (interaction.isButton() && interaction.customId.startsWith("reject_")) {

      if (!interaction.member.roles.cache.has(process.env.APPROVER_ROLE_ID)) {
        return interaction.reply({
          content: "❌ Tidak memiliki izin.",
          ephemeral: true
        });
      }

      const userId = interaction.customId.split("_")[1];

      const modal = new ModalBuilder()
        .setCustomId(`reject_modal_${userId}`)
        .setTitle("Reject Reason");

      const input = new TextInputBuilder()
        .setCustomId("reject_reason")
        .setLabel("Alasan Penolakan")
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(true);

      modal.addComponents(
        new ActionRowBuilder().addComponents(input)
      );

      return interaction.showModal(modal);
    }

    /* ================= APPROVE ================= */

    if (interaction.isButton() && interaction.customId.startsWith("approve_")) {

      if (!interaction.member.roles.cache.has(process.env.APPROVER_ROLE_ID)) {
        return interaction.reply({
          content: "❌ Tidak memiliki izin.",
          ephemeral: true
        });
      }

      const userId = interaction.customId.split("_")[1];
      const requestData = activeRequests.get(userId);
      if (!requestData)
        return interaction.reply({
          content: "⚠ Request tidak ditemukan.",
          ephemeral: true
        });

      const member = await interaction.guild.members.fetch(userId);
      const { nickname, requestedAt } = requestData;

      await member.setNickname(nickname);

      activeRequests.delete(userId);
      totalProcessed++;

      const embed = new EmbedBuilder()
        .setColor("#22c55e")
        .setTitle("✅ NICKNAME APPROVED")
        .setDescription("━━━━━━━━━━━━━━━━━━━━━━━\n🎉 Successfully Updated\n━━━━━━━━━━━━━━━━━━━━━━━")
        .addFields(
          { name: "👤 Requester", value: `<@${userId}>`, inline: true },
          { name: "📝 New Nickname", value: `**${nickname}**`, inline: true },
          { name: "🛡 Approved By", value: `<@${interaction.user.id}>`, inline: true },
          { name: "⏱ Process Time", value: `${Math.floor((Date.now() - requestedAt)/1000)}s`, inline: true },
          { name: "📅 Updated At", value: `<t:${Math.floor(Date.now()/1000)}:F>` }
        )
        .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
        .setFooter({ text: "KEJAWEN TEAM • Enterprise System" })
        .setTimestamp();

      return interaction.update({
        embeds: [embed],
        components: []
      });
    }

    /* ================= REJECT MODAL SUBMIT ================= */

    if (
      interaction.type === InteractionType.ModalSubmit &&
      interaction.customId.startsWith("reject_modal_")
    ) {

      const userId = interaction.customId.split("_")[2];
      const reason = interaction.fields.getTextInputValue("reject_reason");

      activeRequests.delete(userId);
      totalProcessed++;

      const embed = new EmbedBuilder()
        .setColor("#ef4444")
        .setTitle("❌ NICKNAME REJECTED")
        .addFields(
          { name: "👤 Requester", value: `<@${userId}>`, inline: true },
          { name: "🛡 Rejected By", value: `<@${interaction.user.id}>`, inline: true },
          { name: "📄 Reason", value: reason },
          { name: "📅 Decision Time", value: `<t:${Math.floor(Date.now()/1000)}:F>` }
        )
        .setTimestamp();

      return interaction.update({
        embeds: [embed],
        components: []
      });
    }

  } catch (err) {
    console.error("SYSTEM ERROR:", err);
  }
});

client.login(process.env.TOKEN);
