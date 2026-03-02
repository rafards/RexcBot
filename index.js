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

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers
    ],
    partials: [Partials.Channel]
});

// ===== STORAGE =====
const pendingRequests = new Map();
const activeTimeouts = new Map();

client.once("ready", () => {
    console.log(`✅ Logged in as ${client.user.tag}`);
});

// =========================
// INTERACTION HANDLER
// =========================
client.on(Events.InteractionCreate, async (interaction) => {
    try {

        // =========================
        // SLASH COMMAND /panelnick
        // =========================
        if (interaction.isChatInputCommand()) {

            if (interaction.commandName === "panelnick") {

                await interaction.deferReply();

                const embed = new EmbedBuilder()
                    .setColor("Blue")
                    .setTitle("🎮 Ganti Nickname")
                    .setDescription("Klik tombol di bawah untuk request nickname.");

                const row = new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId("open_request_modal")
                        .setLabel("Request Nickname")
                        .setStyle(ButtonStyle.Primary)
                );

                await interaction.editReply({
                    embeds: [embed],
                    components: [row]
                });
            }

            return;
        }

        // =========================
        // BUTTON OPEN MODAL
        // =========================
        if (interaction.isButton() && interaction.customId === "open_request_modal") {

            if (pendingRequests.has(interaction.user.id)) {
                return interaction.reply({
                    content: "⚠️ Kamu masih punya request aktif.",
                    flags: 64
                });
            }

            const modal = new ModalBuilder()
                .setCustomId("nickname_modal")
                .setTitle("Request Nickname");

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

        // =========================
        // MODAL SUBMIT
        // =========================
        if (interaction.type === InteractionType.ModalSubmit &&
            interaction.customId === "nickname_modal") {

            const nickname = interaction.fields.getTextInputValue("nickname_input");

            pendingRequests.set(interaction.user.id, nickname);

            const approvalChannel = await client.channels.fetch(process.env.APPROVAL_CHANNEL_ID).catch(() => null);

            if (!approvalChannel) {
                pendingRequests.delete(interaction.user.id);
                return interaction.reply({
                    content: "❌ Channel approval tidak ditemukan.",
                    flags: 64
                });
            }

            const embed = new EmbedBuilder()
                .setColor("Yellow")
                .setTitle("📌 Request Nickname")
                .addFields(
                    { name: "User", value: `<@${interaction.user.id}>` },
                    { name: "Nickname Baru", value: nickname }
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

            // AUTO EXPIRE 5 MENIT
            const timeout = setTimeout(() => {
                pendingRequests.delete(interaction.user.id);
                activeTimeouts.delete(interaction.user.id);
            }, 5 * 60 * 1000);

            activeTimeouts.set(interaction.user.id, timeout);

            return interaction.reply({
                content: "✅ Request berhasil dikirim. Tunggu approval staff.",
                flags: 64
            });
        }

        // =========================
        // APPROVE / REJECT
        // =========================
        if (interaction.isButton() &&
            (interaction.customId.startsWith("approve_") ||
             interaction.customId.startsWith("reject_"))) {

            const [action, userId] = interaction.customId.split("_");
            const nickname = pendingRequests.get(userId);

            if (!nickname) {
                return interaction.update({
                    content: "⚠️ Request sudah expired.",
                    embeds: [],
                    components: []
                });
            }

            const member = await interaction.guild.members.fetch(userId).catch(() => null);

            if (!member) {
                pendingRequests.delete(userId);
                return interaction.update({
                    content: "❌ User tidak ditemukan.",
                    embeds: [],
                    components: []
                });
            }

            if (action === "approve") {
                await member.setNickname(nickname).catch(() => null);

                pendingRequests.delete(userId);
                if (activeTimeouts.has(userId)) {
                    clearTimeout(activeTimeouts.get(userId));
                    activeTimeouts.delete(userId);
                }

                return interaction.update({
                    content: `✅ Request <@${userId}> disetujui oleh <@${interaction.user.id}>`,
                    embeds: [],
                    components: []
                });
            }

            if (action === "reject") {

                pendingRequests.delete(userId);
                if (activeTimeouts.has(userId)) {
                    clearTimeout(activeTimeouts.get(userId));
                    activeTimeouts.delete(userId);
                }

                return interaction.update({
                    content: `❌ Request <@${userId}> ditolak oleh <@${interaction.user.id}>`,
                    embeds: [],
                    components: []
                });
            }
        }

    } catch (err) {
        console.error("❌ ERROR:", err);
    }
});

client.login(process.env.TOKEN);