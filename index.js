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
    ChannelType,
    PermissionsBitField
} = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

// CONFIG
const SELL_CHANNEL_ID = "1492261103315587354";
const TEAM_CHANNEL_ID = "1492261676798709760";

const activeUploads = new Map();

// ================= SAFE FETCH =================
async function getChannel(id) {
    const channel = await client.channels.fetch(id).catch(() => null);
    if (!channel) {
        console.log(`❌ No access to channel: ${id}`);
        return null;
    }
    return channel;
}

// ================= SELL PANEL =================
async function sendSellPanel() {
    const channel = await getChannel(SELL_CHANNEL_ID);
    if (!channel) return;

    const messages = await channel.messages.fetch({ limit: 20 }).catch(() => null);
    if (!messages) return;

    const old = messages.filter(m =>
        m.author.id === client.user.id &&
        m.embeds[0]?.title === "📦 SELL YOUR PIECE"
    );

    for (const msg of old.values()) {
        await msg.delete().catch(() => {});
    }

    const embed = new EmbedBuilder()
        .setTitle("📦 SELL YOUR PIECE")
        .setDescription("Click below to list your item")
        .setColor("#000000");

    const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId("start_upload")
            .setLabel("SELL PIECE")
            .setStyle(ButtonStyle.Primary)
    );

    await channel.send({ embeds: [embed], components: [row] }).catch(() => {});
}

// ================= TEAM PANEL =================
async function sendTeamPanel() {
    const channel = await getChannel(TEAM_CHANNEL_ID);
    if (!channel) return;

    const messages = await channel.messages.fetch({ limit: 20 }).catch(() => null);
    if (!messages) return;

    const old = messages.filter(m =>
        m.author.id === client.user.id &&
        m.embeds[0]?.title === "🤝 FIND A TEAM"
    );

    for (const msg of old.values()) {
        await msg.delete().catch(() => {});
    }

    const embed = new EmbedBuilder()
        .setTitle("🤝 FIND A TEAM")
        .setDescription("Find resell partners")
        .setColor("#2ecc71");

    const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId("start_teamup")
            .setLabel("TEAM-UP")
            .setStyle(ButtonStyle.Success)
    );

    await channel.send({ embeds: [embed], components: [row] }).catch(() => {});
}

// ================= REFRESH =================
async function refreshPanels() {
    console.log("🔄 Refreshing panels...");
    await sendSellPanel();
    await sendTeamPanel();
}

// ================= READY =================
client.once("clientReady", async () => {
    console.log(`✅ ONLINE: ${client.user.tag}`);

    // 🔥 SOFORT SENDEN
    await refreshPanels();

    // 🔁 alle 5 Minuten
    setInterval(refreshPanels, 5 * 60 * 1000);
});

// ================= INTERACTIONS =================
client.on("interactionCreate", async interaction => {

    // SELL BUTTON
    if (interaction.isButton() && interaction.customId === "start_upload") {

        const modal = new ModalBuilder()
            .setCustomId("upload_modal")
            .setTitle("Sell your piece");

        modal.addComponents(
            new ActionRowBuilder().addComponents(
                new TextInputBuilder()
                    .setCustomId("title")
                    .setLabel("Piece Name")
                    .setPlaceholder("e.g. Nike Tech Fleece")
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true)
            ),
            new ActionRowBuilder().addComponents(
                new TextInputBuilder()
                    .setCustomId("price")
                    .setLabel("Price")
                    .setPlaceholder("e.g. 120€")
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true)
            ),
            new ActionRowBuilder().addComponents(
                new TextInputBuilder()
                    .setCustomId("url")
                    .setLabel("Vintage Link (required)")
                    .setPlaceholder("https://www.vinted.de/...")
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true)
            )
        );

        return interaction.showModal(modal);
    }

    // TEAM BUTTON
    if (interaction.isButton() && interaction.customId === "start_teamup") {

        const modal = new ModalBuilder()
            .setCustomId("team_modal")
            .setTitle("Find a Team");

        modal.addComponents(
            new ActionRowBuilder().addComponents(
                new TextInputBuilder()
                    .setCustomId("desc")
                    .setLabel("What are you looking for?")
                    .setPlaceholder("Looking for resell partners in EU...")
                    .setStyle(TextInputStyle.Paragraph)
                    .setRequired(true)
            )
        );

        return interaction.showModal(modal);
    }

    // SELL SUBMIT
    if (interaction.isModalSubmit() && interaction.customId === "upload_modal") {

        activeUploads.set(interaction.user.id, {
            title: interaction.fields.getTextInputValue("title"),
            price: interaction.fields.getTextInputValue("price"),
            url: interaction.fields.getTextInputValue("url")
        });

        return interaction.reply({
            content: "Send images now, then type `done`",
            ephemeral: true
        });
    }

    // TEAM SUBMIT
    if (interaction.isModalSubmit() && interaction.customId === "team_modal") {

        const channel = await getChannel(TEAM_CHANNEL_ID);
        if (!channel) return;

        const embed = new EmbedBuilder()
            .setTitle("🤝 TEAM-UP")
            .setDescription(interaction.fields.getTextInputValue("desc"))
            .setFooter({ text: interaction.user.username });

        await channel.send({ embeds: [embed] });

        return interaction.reply({ content: "Posted!", ephemeral: true });
    }

});

// ================= MESSAGE =================
client.on("messageCreate", async message => {
    if (message.author.bot) return;

    if (activeUploads.has(message.author.id)) {

        if (message.content.toLowerCase() === "done") {

            const data = activeUploads.get(message.author.id);
            const channel = await getChannel(SELL_CHANNEL_ID);
            if (!channel) return;

            const embed = new EmbedBuilder()
                .setTitle(`📦 ${data.title}`)
                .addFields(
                    { name: "💰 Price", value: data.price },
                    { name: "Seller", value: `<@${message.author.id}>` }
                );

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setLabel("VIEW ITEM")
                    .setStyle(ButtonStyle.Link)
                    .setURL(data.url)
            );

            await channel.send({ embeds: [embed], components: [row] });

            activeUploads.delete(message.author.id);

            return message.reply("Posted!");
        }
    }
});

// LOGIN
client.login(process.env.TOKEN);