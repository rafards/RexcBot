// =====================================================
// 📦 IMPORT & CONFIG
// =====================================================
require("dotenv").config();

const {
    Client,
    GatewayIntentBits,
    Partials,
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

// =====================================================
// 🤖 CLIENT SETUP
// =====================================================
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.DirectMessages
    ],
    partials: [Partials.Channel]
});

// =====================================================
// 🗂 MEMORY STORAGE
// =====================================================
const pendingRequests = new Map(); // userId => nickname

// =====================================================
// 🚀 READY EVENT
// =====================================================
client.once("ready", async () => {
    console.log(`✅ Logged in as ${client.user.tag}`);
});

// =====================================================
// 🎯 INTERACTION HANDLER
// =====================================================
client.on(Events.InteractionCreate, async (interaction) => {
    try {

        // =====================================================
        // 📌 SLASH COMMAND /panelnick
        // =====================================================
        if (interaction.isChatInputCommand()) {
            if (interaction.commandName === "panelnick") {

                const embed = new EmbedBuilder()
                    .setColor("Blue")
                    .setTitle("🎮 Request Ganti Nickname")
                    .setDescription("Klik tombol di bawah untuk mengajukan perubahan nickname.");

                const row = new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId("open_request_modal")
                        .setLabel("Request Nickname")
                        .setStyle(ButtonStyle.Primary)
                );

                return interaction.reply({
                    embeds: [embed],
                    components: [row]
                });
            }
        }

        // =====================================================
        // 🟢 USER CLICK REQUEST
        // =====================================================
        if (interaction.isButton() && interaction.customId === "open_request_modal") {

            // Jika masih ada request aktif
            if (pendingRequests.has(interaction.user.id)) {

                const cancelRow = new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId("cancel_request")
                        .setLabel("Batalkan Request")
                        .setStyle(ButtonStyle.Secondary)
                );

                return interaction.reply({
                    content: "⚠️ Kamu masih memiliki request aktif.",
                    components: [cancelRow],
                    ephemeral: true
                });
            }

            // Jika belum ada request
            const modal = new ModalBuilder()
                .setCustomId("nickname_modal")
                .setTitle("Request Nickname Baru");

            const nicknameInput = new TextInputBuilder()
                .setCustomId("nickname_input")
                .setLabel("Masukkan nickname baru")
                .setStyle(TextInputStyle.Short)
                .setRequired(true)
                .setMaxLength(32);

            modal.addComponents(
                new ActionRowBuilder().addComponents(nicknameInput)
            );

            return interaction.showModal(modal);
        }

        // =====================================================
        // ❌ CANCEL REQUEST BUTTON
        // =====================================================
        if (interaction.isButton() && interaction.customId === "cancel_request") {

            if (!pendingRequests.has(interaction.user.id)) {
                return interaction.reply({
                    content: "⚠️ Tidak ada request aktif untuk dibatalkan.",
                    ephemeral: true
                });
            }

            pendingRequests.delete(interaction.user.id);

            return interaction.update({
                content: "❌ Request berhasil dibatalkan.",
                components: []
            });
        }

        // =====================================================
        // 📝 USER SUBMIT REQUEST MODAL
        // =====================================================
        if (
            interaction.type === InteractionType.ModalSubmit &&
            interaction.customId === "nickname_modal"
        ) {

            const nickname = interaction.fields.getTextInputValue("nickname_input");

            pendingRequests.set(interaction.user.id, nickname);

            const approvalChannel = await client.channels.fetch(process.env.APPROVAL_CHANNEL_ID);

            const embed = new EmbedBuilder()
                .setColor("Yellow")
                .setTitle("📌 Request Nickname Baru")
                .addFields(
                    { name: "User", value: `<@${interaction.user.id}>`, inline: true },
                    { name: "Nickname Diminta", value: `\`${nickname}\``, inline: true }
                )
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

            await approvalChannel.send({
                embeds: [embed],
                components: [row]
            });

            return interaction.reply({
                content: "✅ Request berhasil dikirim. Mohon tunggu persetujuan staff.",
                ephemeral: true
            });
        }

        // =====================================================
        // 🛡 STAFF BUTTON HANDLER
        // =====================================================
        if (interaction.isButton()) {

            const approverRole = process.env.APPROVER_ROLE_ID;

            if (!interaction.member.roles.cache.has(approverRole)) {
                return interaction.reply({
                    content: "❌ Hanya staff yang dapat melakukan aksi ini.",
                    ephemeral: true
                });
            }

            // ================= APPROVE =================
            if (interaction.customId.startsWith("approve_")) {

                const userId = interaction.customId.split("_")[1];
                const nickname = pendingRequests.get(userId);

                if (!nickname) {
                    return interaction.reply({
                        content: "⚠️ Request sudah expired atau dibatalkan.",
                        ephemeral: true
                    });
                }

                const member = await interaction.guild.members.fetch(userId);

                await member.setNickname(nickname).catch(() => null);

                await member.send({
                    embeds: [
                        new EmbedBuilder()
                            .setColor("Green")
                            .setTitle("✅ Nickname Disetujui")
                            .setDescription(`Nickname kamu sekarang menjadi **${nickname}**.`)
                            .setTimestamp()
                    ]
                }).catch(() => null);

                pendingRequests.delete(userId);

                return interaction.update({
                    content: `✅ Request <@${userId}> disetujui oleh <@${interaction.user.id}>`,
                    embeds: [],
                    components: []
                });
            }

            // ================= REJECT =================
            if (interaction.customId.startsWith("reject_")) {

                const userId = interaction.customId.split("_")[1];

                const modal = new ModalBuilder()
                    .setCustomId(`reject_modal_${userId}`)
                    .setTitle("Alasan Penolakan");

                const reasonInput = new TextInputBuilder()
                    .setCustomId("reject_reason")
                    .setLabel("Berikan alasan penolakan")
                    .setStyle(TextInputStyle.Paragraph)
                    .setRequired(true)
                    .setMinLength(5)
                    .setMaxLength(300);

                modal.addComponents(
                    new ActionRowBuilder().addComponents(reasonInput)
                );

                return interaction.showModal(modal);
            }
        }

        // =====================================================
        // 📝 STAFF SUBMIT REJECT MODAL
        // =====================================================
        if (
            interaction.type === InteractionType.ModalSubmit &&
            interaction.customId.startsWith("reject_modal_")
        ) {

            const userId = interaction.customId.split("_")[2];
            const reason = interaction.fields.getTextInputValue("reject_reason");

            const member = await interaction.guild.members.fetch(userId).catch(() => null);

            if (member) {
                await member.send({
                    embeds: [
                        new EmbedBuilder()
                            .setColor("Red")
                            .setTitle("❌ Request Nickname Ditolak")
                            .setDescription(`Alasan penolakan:\n\n${reason}`)
                            .setTimestamp()
                    ]
                }).catch(() => null);
            }

            pendingRequests.delete(userId);

            return interaction.update({
                content: `❌ Request <@${userId}> ditolak oleh <@${interaction.user.id}>`,
                embeds: [],
                components: []
            });
        }

    } catch (err) {
        console.error("❌ ERROR:", err);
    }
});

// =====================================================
// 🔐 GLOBAL ERROR HANDLER
// =====================================================
process.on("unhandledRejection", console.error);
process.on("uncaughtException", console.error);

// =====================================================
// 🔑 LOGIN
// =====================================================
client.login(process.env.TOKEN);
