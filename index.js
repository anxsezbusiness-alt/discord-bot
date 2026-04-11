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
    PermissionsBitField
} = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ]
});

// 🔑 CONFIG
const SELL_CHANNEL_ID = "1492261103315587354";
const TEAM_CHANNEL_ID = "1492261676798709760";
const SALES_CHANNEL_ID = "1492593772884660224";
const VIP_ROLE_ID = "1492255499239030966";

// 💾 STORAGE
const activeUploads = new Map();
let salesCount = 0;

// ================= SELL PANEL =================

async function sendSellPanel() {
    const channel = await client.channels.fetch(SELL_CHANNEL_ID).catch(() => null);
    if (!channel) return;

    const messages = await channel.messages.fetch({ limit: 20 });

    const old = messages.filter(m =>
        m.author.id === client.user.id &&
        (m.embeds[0]?.title?.includes("SELL YOUR PIECES") ||
         m.embeds[0]?.title?.includes("LEVO MARKETPLACE"))
    );

    for (const msg of old.values()) {
        await msg.delete().catch(() => {});
    }

    const embed = new EmbedBuilder()
        .setTitle("─── 📦 SELL YOUR PIECES ───")
        .setDescription("📸 Poste deine Pieces hier ↓")
        .setColor("#000000");

    const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId("start_upload")
            .setLabel("📸 SELL PIECE")
            .setStyle(ButtonStyle.Primary)
    );

    await channel.send({ embeds: [embed], components: [row] });
}

// ================= TEAM PANEL =================

async function sendTeamPanel() {
    const channel = await client.channels.fetch(TEAM_CHANNEL_ID).catch(() => null);
    if (!channel) return;

    const messages = await channel.messages.fetch({ limit: 20 });

    const old = messages.filter(m =>
        m.author.id === client.user.id &&
        m.embeds[0]?.title?.includes("FIND A TEAM")
    );

    for (const msg of old.values()) {
        await msg.delete().catch(() => {});
    }

    const embed = new EmbedBuilder()
        .setTitle("─── 🤝 FIND A TEAM ───")
        .setDescription("Finde Leute zum Resellen ↓")
        .setColor("#2ecc71");

    const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId("start_teamup")
            .setLabel("🤝 TEAM-UP")
            .setStyle(ButtonStyle.Success)
    );

    await channel.send({ embeds: [embed], components: [row] });
}

// ================= READY =================

client.once('ready', async () => {
    console.log(`✅ ONLINE: ${client.user.tag}`);
    await sendSellPanel();
    await sendTeamPanel();
});

// ================= INTERACTIONS =================

client.on('interactionCreate', async interaction => {
    try {

        if (interaction.isButton() && interaction.customId === "start_upload") {

            const modal = new ModalBuilder()
                .setCustomId("upload_modal")
                .setTitle("Sell your Piece");

            modal.addComponents(
                new ActionRowBuilder().addComponents(
                    new TextInputBuilder()
                        .setCustomId("title")
                        .setLabel("Piece Name")
                        .setStyle(TextInputStyle.Short)
                ),
                new ActionRowBuilder().addComponents(
                    new TextInputBuilder()
                        .setCustomId("price")
                        .setLabel("Preis")
                        .setStyle(TextInputStyle.Short)
                ),
                new ActionRowBuilder().addComponents(
                    new TextInputBuilder()
                        .setCustomId("url")
                        .setLabel("Link")
                        .setStyle(TextInputStyle.Short)
                )
            );

            return interaction.showModal(modal);
        }

        if (interaction.isButton() && interaction.customId === "start_teamup") {

            const modal = new ModalBuilder()
                .setCustomId("teamup_modal")
                .setTitle("Find Team");

            modal.addComponents(
                new ActionRowBuilder().addComponents(
                    new TextInputBuilder()
                        .setCustomId("title")
                        .setLabel("Was suchst du?")
                        .setStyle(TextInputStyle.Short)
                ),
                new ActionRowBuilder().addComponents(
                    new TextInputBuilder()
                        .setCustomId("desc")
                        .setLabel("Details")
                        .setStyle(TextInputStyle.Paragraph)
                )
            );

            return interaction.showModal(modal);
        }

        if (interaction.isModalSubmit() && interaction.customId === "upload_modal") {
            activeUploads.set(interaction.user.id, {
                title: interaction.fields.getTextInputValue("title"),
                price: interaction.fields.getTextInputValue("price"),
                url: interaction.fields.getTextInputValue("url"),
                images: []
            });

            return interaction.reply({
                content: "📸 Schicke bis zu 3 Bilder und schreibe `fertig`",
                ephemeral: true
            });
        }

        if (interaction.isModalSubmit() && interaction.customId === "teamup_modal") {
            const channel = await client.channels.fetch(TEAM_CHANNEL_ID);

            const embed = new EmbedBuilder()
                .setTitle("🤝 TEAM-UP")
                .setDescription(interaction.fields.getTextInputValue("desc"))
                .setFooter({ text: interaction.user.username });

            await channel.send({ embeds: [embed] });

            return interaction.reply({ content: "✅ Gepostet!", ephemeral: true });
        }

        if (interaction.customId?.startsWith("sold_")) {
            const sellerId = interaction.customId.split("_")[1];

            if (interaction.user.id !== sellerId) {
                return interaction.reply({ content: "❌ Nicht dein Post", ephemeral: true });
            }

            const embed = EmbedBuilder.from(interaction.message.embeds[0])
                .setTitle("🛑 SOLD");

            await interaction.update({ embeds: [embed], components: [] });
        }

    } catch (err) {
        console.error("❌ ERROR:", err);
    }
});

// ================= MESSAGE =================

client.on('messageCreate', async message => {
    if (message.author.bot) return;

    if (activeUploads.has(message.author.id)) {
        const data = activeUploads.get(message.author.id);

        if (message.attachments.size > 0) {
            message.attachments.forEach(att => {
                if (data.images.length < 3) {
                    data.images.push(att.url);
                }
            });

            return message.reply(`📸 ${data.images.length}/3 gespeichert`);
        }

        if (message.content.toLowerCase() === "fertig") {

            const channel = await client.channels.fetch(SELL_CHANNEL_ID);

            const embed = new EmbedBuilder()
                .setTitle(`📦 ${data.title}`)
                .addFields(
                    { name: "💰 Preis", value: data.price },
                    { name: "👤 Verkäufer", value: `<@${message.author.id}>` }
                );

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setLabel("LINK").setStyle(ButtonStyle.Link).setURL(data.url),
                new ButtonBuilder().setCustomId(`sold_${message.author.id}`).setLabel("SOLD").setStyle(ButtonStyle.Danger)
            );

            await channel.send({ embeds: [embed], components: [row] });

            activeUploads.delete(message.author.id);

            return message.reply("🚀 Gepostet!");
        }
    }
});

// 🔥 WICHTIG (Railway)
client.login(process.env.TOKEN);