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

// Speicher-Strukturen
const activeUploads = new Map();
const items = new Map(); // Speichert alle aktiven Inserate
const favorites = new Map(); // user_id -> Array of item_ids

// ================= HELPER =================
async function getChannel(id) {
    return await client.channels.fetch(id).catch(() => null);
}

// ================= PANELS =================
async function refreshPanels() {
    const channel = await getChannel(SELL_CHANNEL_ID);
    if (!channel) return;

    const messages = await channel.messages.fetch({ limit: 50 }).catch(() => null);
    if (!messages) return;

    // Nur das Haupt-Panel löschen/neu senden
    const old = messages.filter(m => m.author.id === client.user.id && m.embeds[0]?.title === "📦 SELL YOUR PIECE");
    for (const msg of old.values()) await msg.delete().catch(() => {});

    const embed = new EmbedBuilder()
        .setTitle("📦 SELL YOUR PIECE")
        .setDescription("Klicke unten, um dein Item zu listen.")
        .setColor("#000000");

    const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId("start_upload").setLabel("SELL PIECE").setStyle(ButtonStyle.Primary)
    );

    await channel.send({ embeds: [embed], components: [row] });
}

client.once("ready", async () => {
    console.log(`✅ ONLINE: ${client.user.tag}`);
    await refreshPanels();
});

// ================= INTERACTION HANDLER =================
client.on("interactionCreate", async interaction => {
    
    // 1. MODAL ÖFFNEN
    if (interaction.isButton() && interaction.customId === "start_upload") {
        const modal = new ModalBuilder().setCustomId("upload_modal").setTitle("Sell your piece");
        modal.addComponents(
            new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId("title").setLabel("Name").setStyle(TextInputStyle.Short).setRequired(true)),
            new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId("price").setLabel("Preis").setStyle(TextInputStyle.Short).setRequired(true)),
            new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId("url").setLabel("Vinted Link").setStyle(TextInputStyle.Short).setRequired(true))
        );
        return interaction.showModal(modal);
    }

    // 2. MODAL SUBMIT
    if (interaction.isModalSubmit() && interaction.customId === "upload_modal") {
        activeUploads.set(interaction.user.id, {
            title: interaction.fields.getTextInputValue("title"),
            price: interaction.fields.getTextInputValue("price"),
            url: interaction.fields.getTextInputValue("url"),
            images: []
        });
        return interaction.reply({ content: "Schicke jetzt die Fotos hoch und schreibe danach `done`.", ephemeral: true });
    }

    // 3. FAVORITEN & OFFERS & SOLD
    if (interaction.isButton()) {
        const [action, itemId, sellerId] = interaction.customId.split("_");

        // FAVORISIEREN
        if (action === "fav") {
            let userFavs = favorites.get(interaction.user.id) || [];
            if (!userFavs.includes(itemId)) {
                userFavs.push(itemId);
                favorites.set(interaction.user.id, userFavs);
                return interaction.reply({ content: "Item zu deinen Favoriten hinzugefügt!", ephemeral: true });
            } else {
                return interaction.reply({ content: "Hattest du schon!", ephemeral: true });
            }
        }

        // SOLD (Nur Verkäufer)
        if (action === "sold") {
            if (interaction.user.id !== sellerId) return interaction.reply({ content: "Nur der Verkäufer kann das!", ephemeral: true });
            await interaction.message.delete();
            items.delete(itemId);
            return interaction.reply({ content: "Als verkauft markiert und gelöscht!", ephemeral: true });
        }

        // OFFER SENDEN (Käufer klickt "Offer")
        if (action === "offer") {
            if (interaction.user.id === sellerId) return interaction.reply({ content: "Eigener Artikel!", ephemeral: true });
            
            const modal = new ModalBuilder().setCustomId(`sendoffer_${itemId}_${sellerId}`).setTitle("Angebot senden");
            modal.addComponents(new ActionRowBuilder().addComponents(
                new TextInputBuilder().setCustomId("offer_price").setLabel("Dein Preisvorschlag").setStyle(TextInputStyle.Short)
            ));
            return interaction.showModal(modal);
        }
    }

    // 4. OFFER MODAL SUBMIT (Verkäufer bekommt Channel-Anfrage)
    if (interaction.isModalSubmit() && interaction.customId.startsWith("sendoffer")) {
        const [, itemId, sellerId] = interaction.customId.split("_");
        const price = interaction.fields.getTextInputValue("offer_price");
        const buyer = interaction.user;

        // Erstelle privaten Verhandlungs-Channel
        const guild = interaction.guild;
        const channel = await guild.channels.create({
            name: `offer-${buyer.username}`,
            type: ChannelType.GuildText,
            permissionOverwrites: [
                { id: guild.id, deny: [PermissionsBitField.Flags.ViewChannel] },
                { id: sellerId, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] },
                { id: buyer.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] }
            ]
        });

        const offerEmbed = new EmbedBuilder()
            .setTitle("Neues Angebot!")
            .setDescription(`<@${buyer.id}> bietet **${price}** für dein Item.`)
            .setColor("Yellow");

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId(`accept_${channel.id}`).setLabel("Annehmen (1 Std. Chat)").setStyle(ButtonStyle.Success),
            new ButtonBuilder().setCustomId(`decline_${channel.id}`).setLabel("Ablehnen").setStyle(ButtonStyle.Danger)
        );

        await channel.send({ content: `<@${sellerId}>`, embeds: [offerEmbed], components: [row] });
        return interaction.reply({ content: `Anfrage-Channel erstellt: <#${channel.id}>`, ephemeral: true });
    }

    // 5. ACCEPT / DECLINE LOGIK
    if (interaction.isButton() && (interaction.customId.startsWith("accept") || interaction.customId.startsWith("decline"))) {
        const [action, channelId] = interaction.customId.split("_");
        const channel = await guild.channels.cache.get(channelId);

        if (action === "accept") {
            await interaction.reply("Angebot angenommen! Ihr habt jetzt 1 Stunde Zeit.");
            setTimeout(async () => {
                await channel.delete().catch(() => {});
            }, 60 * 60 * 1000); // 1 Stunde
        } else {
            await interaction.reply("Angebot abgelehnt. Channel schließt...");
            setTimeout(() => channel.delete(), 3000);
        }
    }
});

// ================= MESSAGE HANDLER (BILDER & DONE) =================
client.on("messageCreate", async message => {
    if (message.author.bot) return;

    if (activeUploads.has(message.author.id)) {
        const data = activeUploads.get(message.author.id);

        // Bilder sammeln
        if (message.attachments.size > 0) {
            message.attachments.forEach(a => data.images.push(a.url));
            // Wir löschen die Foto-Nachricht sofort für Ordnung
            await message.delete().catch(() => {});
        }

        // Abschluss
        if (message.content.toLowerCase() === "done") {
            await message.delete().catch(() => {}); // Löscht "done"
            
            const channel = await getChannel(SELL_CHANNEL_ID);
            const itemId = Date.now().toString();

            const embed = new EmbedBuilder()
                .setTitle(`📦 ${data.title}`)
                .setColor("White")
                .addFields(
                    { name: "💰 Preis", value: data.price, inline: true },
                    { name: "👤 Verkäufer", value: `<@${message.author.id}>`, inline: true }
                );

            // Setze das ERSTE Bild als Hauptbild im Embed
            if (data.images.length > 0) {
                embed.setImage(data.images[0]);
            }

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setLabel("VINTED").setStyle(ButtonStyle.Link).setURL(data.url),
                new ButtonBuilder().setCustomId(`fav_${itemId}`).setLabel("❤️ Fav").setStyle(ButtonStyle.Secondary),
                new ButtonBuilder().setCustomId(`offer_${itemId}_${message.author.id}`).setLabel("📩 Offer").setStyle(ButtonStyle.Success)
            );

            // Verkäufer-Zeile (Nur er sieht diese Buttons sinnvoll)
            const sellerRow = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId(`sold_${itemId}_${message.author.id}`).setLabel("MARK SOLD").setStyle(ButtonStyle.Danger)
            );

            await channel.send({ embeds: [embed], components: [row, sellerRow] });
            activeUploads.delete(message.author.id);
        }
    }
});

client.login(process.env.TOKEN);