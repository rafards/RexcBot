const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  Events,
  InteractionType,
  MessageFlags
} = require("discord.js");

module.exports = (client) => {

  const activeRequests = new Map();
  const processingRequests = new Set();
  const cooldowns = new Map();
  const userReplies = new Map();

  let totalProcessed = 0;

  const ONE_WEEK = 7 * 24 * 60 * 60 * 1000;

  /* ================= PANEL ================= */

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
        text: "KEJAWEN TEAM •",
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

        if (processingRequests.has(interaction.user.id)) {
          return interaction.reply({ content: "⏳ Request sedang diproses...", flags: MessageFlags.Ephemeral });
        }

        if (activeRequests.has(interaction.user.id)) {
          return interaction.reply({ content: "⚠ Kamu masih memiliki request aktif.", flags: MessageFlags.Ephemeral });
        }

        const cooldown = cooldowns.get(interaction.user.id);
        if (cooldown && Date.now() < cooldown) {
          const remaining = Math.ceil((cooldown - Date.now()) / (1000 * 60 * 60 * 24));
          return interaction.reply({
            content: `⛔ Kamu bisa mengajukan lagi dalam ${remaining} hari.`,
            flags: MessageFlags.Ephemeral
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

        modal.addComponents(new ActionRowBuilder().addComponents(input));
        return interaction.showModal(modal);
      }

      /* ================= SUBMIT ================= */

      if (
        interaction.type === InteractionType.ModalSubmit &&
        interaction.customId === "nickname_modal"
      ) {

        processingRequests.add(interaction.user.id);

        await interaction.reply({
          content: "⏳ Processing request...",
          flags: MessageFlags.Ephemeral
        });

        const nickname = interaction.fields.getTextInputValue("nickname_input");

        activeRequests.set(interaction.user.id, {
          nickname,
          requestedAt: Date.now(),
          approvalMessageId: null
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

        const sent = await approvalChannel.send({ embeds: [embed], components: [row] });

        activeRequests.get(interaction.user.id).approvalMessageId = sent.id;

        const cancelRow = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId("cancel_request")
            .setLabel("Cancel Request")
            .setStyle(ButtonStyle.Secondary)
        );

        await interaction.editReply({
          content: "✅ Request berhasil dikirim ke staff.\nMenunggu approval...",
          components: [cancelRow]
        });
        
        userReplies.set(interaction.user.id, interaction);
        processingRequests.delete(interaction.user.id);
      }

      /* ================= CANCEL ================= */

      if (interaction.isButton() && interaction.customId === "cancel_request") {

        const data = activeRequests.get(interaction.user.id);
        if (!data) return interaction.reply({ content: "⚠ Tidak ada request aktif.", flags: MessageFlags.Ephemeral });

        const approvalChannel = await interaction.guild.channels.fetch(process.env.APPROVAL_CHANNEL_ID);
        const msg = await approvalChannel.messages.fetch(data.approvalMessageId).catch(() => null);
        if (msg) await msg.delete().catch(() => null);

        activeRequests.delete(interaction.user.id);

        return interaction.update({
          content: "❌ Request berhasil dibatalkan.",
          components: []
        });
      }

      /* ================= APPROVE ================= */

      if (interaction.isButton() && interaction.customId.startsWith("approve_")) {

        await interaction.deferUpdate();
      
        const userId = interaction.customId.split("_")[1];
        const requestData = activeRequests.get(userId);
        if (!requestData) return;
      
        const member = await interaction.guild.members.fetch(userId);
        await member.setNickname(requestData.nickname);
      
        cooldowns.set(userId, Date.now() + ONE_WEEK);
      
        activeRequests.delete(userId);
        totalProcessed++;
      
        const embed = EmbedBuilder.from(interaction.message.embeds[0])
          .setColor("#22c55e")
          .setTitle("✅ NICKNAME APPROVED");
      
        await interaction.editReply({
          embeds: [embed],
          components: []
        });
      
        const userInteraction = userReplies.get(userId);
        if (userInteraction) {
          await userInteraction.editReply({
            content:
              `✅ **Nickname berhasil di-approve!**\n\n` +
              `📝 Nama Baru: **${requestData.nickname}**\n` +
              `🛡 Disetujui oleh: <@${interaction.user.id}>\n` +
              `📅 ${new Date().toLocaleString()}`,
            components: []
          }).catch(() => null);
      
          userReplies.delete(userId);
        }
      }

      /* ================= REJECT BUTTON ================= */

      if (interaction.isButton() && interaction.customId.startsWith("reject_")) {

        const userId = interaction.customId.split("_")[1];

        const modal = new ModalBuilder()
          .setCustomId(`reject_modal_${userId}`)
          .setTitle("Reject Reason");

        const input = new TextInputBuilder()
          .setCustomId("reject_reason")
          .setLabel("Alasan Penolakan")
          .setStyle(TextInputStyle.Paragraph)
          .setRequired(true);

        modal.addComponents(new ActionRowBuilder().addComponents(input));
        return interaction.showModal(modal);
      }

      /* ================= REJECT SUBMIT ================= */

      if (
        interaction.type === InteractionType.ModalSubmit &&
        interaction.customId.startsWith("reject_modal_")
      ) {
      
        const userId = interaction.customId.split("_")[2];
        const reason = interaction.fields.getTextInputValue("reject_reason");
      
        activeRequests.delete(userId);
        totalProcessed++;
      
        await interaction.update({
          embeds: [
            new EmbedBuilder()
              .setColor("#ef4444")
              .setTitle("❌ NICKNAME REJECTED")
              .addFields(
                { name: "👤 Requester", value: `<@${userId}>`, inline: true },
                { name: "📄 Reason", value: reason }
              )
          ],
          components: []
        });
      
        const userInteraction = userReplies.get(userId);
        if (userInteraction) {
          await userInteraction.editReply({
            content:
              `❌ **Nickname request ditolak**\n\n` +
              `📄 Alasan: ${reason}\n` +
              `🛡 Ditolak oleh: <@${interaction.user.id}>\n` +
              `📅 ${new Date().toLocaleString()}`,
            components: []
          }).catch(() => null);
      
          userReplies.delete(userId);
        }
      }

    } catch (err) {
      console.error("Terjadi error di InteractionCreate:", err);
    }
  });

};
