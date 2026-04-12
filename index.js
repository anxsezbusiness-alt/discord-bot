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
    PermissionsBitField,
    AttachmentBuilder
} = require('discord.js');
const cron = require('node-cron');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.DirectMessages
    ]
});

// --- KONFIGURATION ---
const SELL_CHANNEL_ID = process.env.SELL_CHANNEL_ID || '1492261103315587354';
const TEAM_CHANNEL_ID = process.env.TEAM_CHANNEL_ID || null;
const SALES_CHANNEL_ID = process.env.SALES_CHANNEL_ID || '1492593772884660224';

const VIP_SOURCE_CHANNEL_ID = '1492261103315587354';
const VIP_ALERT_CHANNEL_ID = '1492261194487037952';
const VIP_ROLE_ID = process.env.VIP_ROLE_ID || null;
const VIP_ROLE_NAME = process.env.VIP_ROLE_NAME || 'VIP';
const VIP_MAX_PRICE_EUR = Number(process.env.VIP_MAX_PRICE_EUR || 35);

const activeUploads = new Map();
const alertedVipMessages = new Set();

const BRAND_KEYWORDS = [
    'nike',
    'adidas',
    'stussy',
    'supreme',
    'carhartt',
    'ralph lauren',
    'stone island',
    'cp company',
    'arc teryx',
    'arcteryx',
    'moncler',
    'the north face',
    'tnf',
    'palm angels',
    'trapstar',
    'chrome hearts',
    'burberry',
    'gucci',
    'prada',
    'louis vuitton',
    'dior',
    'off-white',
    'yeezy',
    'new balance'
];

function getImageAttachment(message) {
    if (!message.attachments || message.attachments.size === 0) {
        return null;
    }

    return (
        message.attachments.find(attachment =>
            attachment.contentType?.startsWith('image/') ||
            /\.(png|jpe?g|gif|webp|bmp)$/i.test(attachment.name || '')
        ) || message.attachments.first()
    );
}

function sanitizeFileName(fileName) {
    const base = fileName || 'piece-image.jpg';
    return base.replace(/[^a-zA-Z0-9._-]/g, '_');
}

async function buildImageFile(uploadData) {
    if (!uploadData?.imageUrl) {
        return null;
    }

    try {
        const response = await fetch(uploadData.imageUrl);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const safeName = sanitizeFileName(uploadData.imageName);

        return new AttachmentBuilder(buffer, { name: safeName });
    } catch (error) {
        console.error('Bild konnte nicht heruntergeladen werden:', error.message);
        return null;
    }
}

function extractPrices(text) {
    const matches = [...text.matchAll(/(\d+(?:[.,]\d{1,2})?)/g)];
    return matches.map(match => Number(match[1].replace(',', '.'))).filter(Number.isFinite);
}

function getVipPieceData(message) {
    const embed = message.embeds?.[0];
    if (!embed) return null;

    const footerText = embed.footer?.text || embed.data?.footer?.text || '';
    if (!footerText.includes('Item-ID:')) {
        return null;
    }

    const title = embed.title || '';
    const description = embed.description || '';
    const fieldText = (embed.fields || [])
        .map(field => `${field.name} ${field.value}`)
        .join(' ');

    const combinedText = `${title} ${description} ${fieldText}`.toLowerCase();
    const brand = BRAND_KEYWORDS.find(keyword => combinedText.includes(keyword));
    const prices = extractPrices(fieldText);
    const currentPrice = prices.length ? Math.min(...prices) : null;

    return {
        embed,
        brand,
        currentPrice
    };
}

async function resolveVipMention(guild) {
    if (VIP_ROLE_ID) {
        return `<@&${VIP_ROLE_ID}>`;
    }

    const roleByName = guild.roles.cache.find(role => role.name === VIP_ROLE_NAME);
    if (roleByName) {
        return `<@&${roleByName.id}>`;
    }

    return `@${VIP_ROLE_NAME}`;
}

async function handleVipDeal(message) {
    if (message.channelId !== VIP_SOURCE_CHANNEL_ID) return;
    if (!message.author || !client.user || message.author.id !== client.user.id) return;
    if (alertedVipMessages.has(message.id)) return;

    const pieceData = getVipPieceData(message);
    if (!pieceData?.brand || pieceData.currentPrice === null) return;
    if (pieceData.currentPrice > VIP_MAX_PRICE_EUR) return;

    const alertChannel = await client.channels.fetch(VIP_ALERT_CHANNEL_ID).catch(() => null);
    if (!alertChannel || !message.guild) return;

    const vipMention = await resolveVipMention(message.guild);

    const alertEmbed = EmbedBuilder.from(pieceData.embed)
        .setColor('#f1c40f')
        .setFooter({
            text: `VIP Deal | ${pieceData.brand.toUpperCase()} | ${pieceData.currentPrice}EUR`
        });

    const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setLabel('Zum Piece')
            .setStyle(ButtonStyle.Link)
            .setURL(message.url)
    );

    await alertChannel.send({
        content: `${vipMention} Marken-Piece erkannt: ${pieceData.brand} fuer ${pieceData.currentPrice}EUR`,
        embeds: [alertEmbed],
        components: [row]
    });

    alertedVipMessages.add(message.id);
}

async function deleteFavoriteCopies(guild, itemId) {
    const favoriteChannels = guild.channels.cache.filter(channel =>
        channel.type === ChannelType.GuildText && channel.name.startsWith('favs-')
    );

    for (const channel of favoriteChannels.values()) {
        try {
            const messages = await channel.messages.fetch({ limit: 100 });
            const copies = messages.filter(message =>
                message.author.id === client.user.id &&
                message.embeds[0]?.data?.footer?.text === `Item-ID: ${itemId}`
            );

            for (const copy of copies.values()) {
                await copy.delete().catch(() => {});
            }
        } catch (error) {
            console.error(`Fehler beim Loeschen der Favoriten in ${channel.name}:`, error.message);
        }
    }
}

async function countUserSales(salesChannel, userId) {
    let count = 0;
    let lastId;

    while (true) {
        const options = { limit: 100 };
        if (lastId) options.before = lastId;

        const messages = await salesChannel.messages.fetch(options);
        if (!messages.size) break;

        for (const message of messages.values()) {
            if (message.author.id !== client.user.id) continue;

            const footerText =
                message.embeds[0]?.footer?.text ||
                message.embeds[0]?.data?.footer?.text ||
                '';

            if (footerText === `Sale-User-ID: ${userId}`) {
                count += 1;
            }
        }

        lastId = messages.last().id;
        if (messages.size < 100) break;
    }

    return count;
}

async function announceSale(sellerId) {
    const salesChannel = await client.channels.fetch(SALES_CHANNEL_ID).catch(() => null);
    if (!salesChannel) return;

    const previousSales = await countUserSales(salesChannel, sellerId);
    const currentSaleNumber = previousSales + 1;

    const embed = new EmbedBuilder()
        .setTitle('💸 Neuer Verkauf')
        .setDescription(`<@${sellerId}> hat so eben sein ${currentSaleNumber}. Piece verkauft!`)
        .setColor('#2ecc71')
        .setFooter({ text: `Sale-User-ID: ${sellerId}` })
        .setTimestamp();

    await salesChannel.send({
        content: `<@${sellerId}> hat so eben sein ${currentSaleNumber}. Piece verkauft!`,
        embeds: [embed]
    });
}

// --- REFRESH FUNKTION ---
async function refreshPanels() {
    console.log(`[${new Date().toLocaleTimeString()}] Panels werden aktualisiert...`);

    try {
        const sellChan = await client.channels.fetch(SELL_CHANNEL_ID);
        if (sellChan) {
            const msgs = await sellChan.messages.fetch({ limit: 50 });
            const oldPanels = msgs.filter(
                m => m.author.id === client.user.id && m.embeds[0]?.title === '📦 SELL YOUR PIECE'
            );

            for (const m of oldPanels.values()) {
                await m.delete().catch(() => {});
            }

            const embed = new EmbedBuilder()
                .setTitle('📦 SELL YOUR PIECE')
                .setDescription('Klicke unten auf den Button, um dein Item zum Verkauf anzubieten.')
                .setColor('#000000');

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('start_upload')
                    .setLabel('SELL PIECE')
                    .setStyle(ButtonStyle.Primary)
            );

            await sellChan.send({ embeds: [embed], components: [row] });
        }
    } catch (err) {
        console.error('Fehler Sell-Channel:', err.message);
    }

    try {
        if (!TEAM_CHANNEL_ID) return;

        const teamChan = await client.channels.fetch(TEAM_CHANNEL_ID);
        if (teamChan) {
            const msgs = await teamChan.messages.fetch({ limit: 50 });
            const oldPanels = msgs.filter(
                m => m.author.id === client.user.id && m.embeds[0]?.title === '🤝 FIND A TEAM'
            );

            for (const m of oldPanels.values()) {
                await m.delete().catch(() => {});
            }

            const embed = new EmbedBuilder()
                .setTitle('🤝 FIND A TEAM')
                .setDescription('Suche hier nach Partnern fuer deine Projekte.')
                .setColor('#2ecc71');

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('start_teamup')
                    .setLabel('TEAM-UP')
                    .setStyle(ButtonStyle.Success)
            );

            await teamChan.send({ embeds: [embed], components: [row] });
        }
    } catch (err) {
        console.error('Fehler Team-Channel:', err.message);
    }
}

// --- READY ---
client.once('ready', async () => {
    console.log(`🚀 ${client.user.tag} ist online!`);
    await refreshPanels();
    cron.schedule('*/5 * * * *', async () => {
        await refreshPanels();
    });
});

// --- INTERACTIONS ---
client.on('interactionCreate', async interaction => {
    if (interaction.isButton()) {
        if (interaction.customId === 'start_upload') {
            const modal = new ModalBuilder()
                .setCustomId('upload_modal')
                .setTitle('Piece Details');

            const pieceInput = new TextInputBuilder()
                .setCustomId('title')
                .setLabel('Piece')
                .setPlaceholder('z.B. Nike Hoodie')
                .setStyle(TextInputStyle.Short)
                .setRequired(true);

            const brandInput = new TextInputBuilder()
                .setCustomId('brand')
                .setLabel('Marke')
                .setPlaceholder('z.B. Nike')
                .setStyle(TextInputStyle.Short)
                .setRequired(true);

            const priceInput = new TextInputBuilder()
                .setCustomId('price')
                .setLabel('Preis')
                .setPlaceholder('z.B. 12EUR')
                .setStyle(TextInputStyle.Short)
                .setRequired(true);

            const sizeInput = new TextInputBuilder()
                .setCustomId('size')
                .setLabel('Groesse')
                .setPlaceholder('z.B. M / 38 / One Size')
                .setStyle(TextInputStyle.Short)
                .setRequired(true);

            const conditionInput = new TextInputBuilder()
                .setCustomId('condition')
                .setLabel('Zustand')
                .setPlaceholder('z.B. Sehr gut / Neu / Gut')
                .setStyle(TextInputStyle.Short)
                .setRequired(true);

            modal.addComponents(
                new ActionRowBuilder().addComponents(pieceInput),
                new ActionRowBuilder().addComponents(brandInput),
                new ActionRowBuilder().addComponents(priceInput),
                new ActionRowBuilder().addComponents(sizeInput),
                new ActionRowBuilder().addComponents(conditionInput)
            );

            return interaction.showModal(modal);
        }

        if (interaction.customId === 'start_teamup') {
            const modal = new ModalBuilder()
                .setCustomId('team_modal')
                .setTitle('Team Suche');

            const descInput = new TextInputBuilder()
                .setCustomId('desc')
                .setLabel('Deine Suche')
                .setPlaceholder('z.B. Suche jemanden fuer ein 50/50 Resell Projekt in Berlin...')
                .setStyle(TextInputStyle.Paragraph)
                .setRequired(true);

            modal.addComponents(new ActionRowBuilder().addComponents(descInput));
            return interaction.showModal(modal);
        }
    }

    if (interaction.isModalSubmit()) {
        if (interaction.customId === 'upload_modal') {
            const detailsModal = new ModalBuilder()
                .setCustomId('upload_modal_page_2')
                .setTitle('Weitere Details');

            activeUploads.set(interaction.user.id, {
                title: interaction.fields.getTextInputValue('title'),
                brand: interaction.fields.getTextInputValue('brand'),
                price: interaction.fields.getTextInputValue('price'),
                size: interaction.fields.getTextInputValue('size'),
                condition: interaction.fields.getTextInputValue('condition'),
                color: null,
                category: null,
                details: null,
                url: null,
                imageUrl: null,
                imageName: null
            });

            const colorInput = new TextInputBuilder()
                .setCustomId('color')
                .setLabel('Farbe')
                .setPlaceholder('z.B. Schwarz')
                .setStyle(TextInputStyle.Short)
                .setRequired(false);

            const categoryInput = new TextInputBuilder()
                .setCustomId('category')
                .setLabel('Kategorie')
                .setPlaceholder('z.B. Hoodie / Schuhe / Jacke')
                .setStyle(TextInputStyle.Short)
                .setRequired(false);

            const detailsInput = new TextInputBuilder()
                .setCustomId('details')
                .setLabel('Weitere Eigenschaften')
                .setPlaceholder('z.B. Oversized, kaum getragen, kleines Logo')
                .setStyle(TextInputStyle.Paragraph)
                .setRequired(false);

            const urlInput = new TextInputBuilder()
                .setCustomId('url')
                .setLabel('Vinted Link')
                .setPlaceholder('https://www.vinted.de/items/...')
                .setStyle(TextInputStyle.Short)
                .setRequired(true);

            detailsModal.addComponents(
                new ActionRowBuilder().addComponents(colorInput),
                new ActionRowBuilder().addComponents(categoryInput),
                new ActionRowBuilder().addComponents(detailsInput),
                new ActionRowBuilder().addComponents(urlInput)
            );

            return interaction.showModal(detailsModal);
        }

        if (interaction.customId === 'upload_modal_page_2') {
            const existing = activeUploads.get(interaction.user.id);
            if (!existing) {
                return interaction.reply({
                    content: 'Dein Upload ist abgelaufen. Bitte starte den Verkauf neu.',
                    ephemeral: true
                });
            }

            existing.color = interaction.fields.getTextInputValue('color') || 'Keine Angabe';
            existing.category = interaction.fields.getTextInputValue('category') || 'Keine Angabe';
            existing.details = interaction.fields.getTextInputValue('details') || 'Keine weiteren Angaben';
            existing.url = interaction.fields.getTextInputValue('url');

            return interaction.reply({
                content: 'Bitte lade jetzt ein Foto hoch und schreibe danach `done` in den Kanal.',
                ephemeral: true
            });
        }

        if (interaction.customId === 'team_modal') {
            const embed = new EmbedBuilder()
                .setTitle('🤝 TEAM-UP GESUCH')
                .setDescription(interaction.fields.getTextInputValue('desc'))
                .setAuthor({
                    name: interaction.user.username,
                    iconURL: interaction.user.displayAvatarURL()
                })
                .setColor('#2ecc71')
                .setTimestamp();

            await interaction.channel.send({ embeds: [embed] });
            return interaction.reply({ content: 'Dein Gesuch wurde gepostet!', ephemeral: true });
        }

        if (interaction.customId.startsWith('moffer_')) {
            const [, itemId, sellerId] = interaction.customId.split('_');

            if (!itemId || !sellerId) {
                return interaction.reply({
                    content: 'Das Angebot konnte nicht verarbeitet werden.',
                    ephemeral: true
                });
            }

            if (interaction.user.id === sellerId) {
                return interaction.reply({
                    content: 'Du kannst dir selbst kein Angebot machen!',
                    ephemeral: true
                });
            }

            const offerPrice = interaction.fields.getTextInputValue('oprice');
            const seller = await client.users.fetch(sellerId).catch(() => null);

            if (!seller) {
                return interaction.reply({
                    content: 'Der Verkaeufer konnte nicht gefunden werden.',
                    ephemeral: true
                });
            }

            const offerEmbed = new EmbedBuilder()
                .setTitle('📩 Neues Angebot')
                .addFields(
                    { name: 'Item-ID', value: itemId, inline: true },
                    { name: 'Angebot', value: offerPrice, inline: true },
                    { name: 'Von', value: `<@${interaction.user.id}>`, inline: true }
                )
                .setColor('#27ae60')
                .setTimestamp();

            try {
                await seller.send({ embeds: [offerEmbed] });
                return interaction.reply({
                    content: 'Dein Angebot wurde dem Verkaeufer gesendet.',
                    ephemeral: true
                });
            } catch (error) {
                console.error('Fehler beim Senden des Angebots:', error.message);
                return interaction.reply({
                    content: 'Ich konnte dem Verkaeufer keine DM schicken.',
                    ephemeral: true
                });
            }
        }
    }

    if (interaction.isButton()) {
        const parts = interaction.customId.split('_');
        if (parts.length < 3) return;

        const [action, itemId, sellerId] = parts;

        if (action === 'sold') {
            if (interaction.user.id !== sellerId) {
                return interaction.reply({
                    content: 'Nur der Verkaeufer kann das!',
                    ephemeral: true
                });
            }

            await deleteFavoriteCopies(interaction.guild, itemId);
            await interaction.message.delete().catch(() => {});
            await announceSale(sellerId).catch(error => {
                console.error('Fehler beim Sales-Post:', error.message);
            });

            return interaction.reply({
                content: 'Item wurde geloescht, Favoriten bereinigt und der Verkauf wurde gezaehlt.',
                ephemeral: true
            });
        }

        if (action === 'fav') {
            if (interaction.user.id === sellerId) {
                return interaction.reply({
                    content: 'Du kannst dein eigenes Piece nicht favorisieren!',
                    ephemeral: true
                });
            }

            const favoritesChannelName = `favs-${interaction.user.id}`;
            let favChan = interaction.guild.channels.cache.find(
                channel => channel.type === ChannelType.GuildText && channel.name === favoritesChannelName
            );

            if (!favChan) {
                favChan = await interaction.guild.channels.create({
                    name: favoritesChannelName,
                    type: ChannelType.GuildText,
                    permissionOverwrites: [
                        { id: interaction.guild.id, deny: [PermissionsBitField.Flags.ViewChannel] },
                        { id: interaction.user.id, allow: [PermissionsBitField.Flags.ViewChannel] }
                    ]
                });
            }

            const existingMessages = await favChan.messages.fetch({ limit: 100 });
            const alreadySaved = existingMessages.find(
                message =>
                    message.author.id === client.user.id &&
                    message.embeds[0]?.data?.footer?.text === `Item-ID: ${itemId}`
            );

            if (alreadySaved) {
                return interaction.reply({
                    content: 'Dieses Piece ist schon in deinen Favoriten.',
                    ephemeral: true
                });
            }

            const originalEmbed = EmbedBuilder.from(interaction.message.embeds[0]);
            originalEmbed.setFooter({ text: `Item-ID: ${itemId}` });

            const favoriteRow = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setLabel('Zum Original')
                    .setStyle(ButtonStyle.Link)
                    .setURL(interaction.message.url)
            );

            await favChan.send({
                content: '⭐ Dieses Piece hast du gespeichert:',
                embeds: [originalEmbed],
                components: [favoriteRow]
            });

            return interaction.reply({
                content: 'In deinen Favoriten gespeichert!',
                ephemeral: true
            });
        }

        if (action === 'offer') {
            if (interaction.user.id === sellerId) {
                return interaction.reply({
                    content: 'Du kannst dir selbst kein Angebot machen!',
                    ephemeral: true
                });
            }

            const modal = new ModalBuilder()
                .setCustomId(`moffer_${itemId}_${sellerId}`)
                .setTitle('Angebot senden');

            modal.addComponents(
                new ActionRowBuilder().addComponents(
                    new TextInputBuilder()
                        .setCustomId('oprice')
                        .setLabel('Dein Preisangebot')
                        .setPlaceholder('z.B. 10EUR')
                        .setStyle(TextInputStyle.Short)
                        .setRequired(true)
                )
            );

            return interaction.showModal(modal);
        }
    }
});

// --- MESSAGE CREATE ---
client.on('messageCreate', async message => {
    await handleVipDeal(message).catch(error => {
        console.error('VIP-Erkennung fehlgeschlagen:', error.message);
    });

    if (message.author.bot || !activeUploads.has(message.author.id)) return;

    const data = activeUploads.get(message.author.id);
    const imageAttachment = getImageAttachment(message);

    if (imageAttachment) {
        data.imageUrl = imageAttachment.proxyURL || imageAttachment.url;
        data.imageName = imageAttachment.name || 'piece-image.jpg';
    }

    if (message.content.trim().toLowerCase() === 'done') {
        await message.delete().catch(() => {});

        if (!data.imageUrl) {
            const warn = await message.channel.send({
                content: `<@${message.author.id}> bitte lade zuerst ein Bild hoch und schreibe dann \`done\`.`
            }).catch(() => null);

            if (warn) {
                setTimeout(() => {
                    warn.delete().catch(() => {});
                }, 7000);
            }
            return;
        }

        const itemId = Date.now().toString();
        const imageFile = await buildImageFile(data);

        const embed = new EmbedBuilder()
            .setTitle(`📦 ${data.brand} ${data.title}`)
            .addFields(
                { name: '💰 Preis', value: data.price, inline: true },
                { name: '📏 Groesse', value: data.size, inline: true },
                { name: '✨ Zustand', value: data.condition, inline: true },
                { name: '🎨 Farbe', value: data.color || 'Keine Angabe', inline: true },
                { name: '🏷️ Kategorie', value: data.category || 'Keine Angabe', inline: true },
                { name: '👤 Verkaeufer', value: `<@${message.author.id}>`, inline: true },
                { name: '📝 Details', value: data.details || 'Keine weiteren Angaben' }
            )
            .setColor('#ffffff')
            .setFooter({ text: `Item-ID: ${itemId}` });

        const sendPayload = {
            embeds: [embed]
        };

        if (imageFile) {
            embed.setImage(`attachment://${imageFile.name}`);
            sendPayload.files = [imageFile];
        } else {
            embed.addFields({
                name: '⚠️ Bild',
                value: 'Bild konnte nicht uebernommen werden. Bitte lade das Piece neu hoch.'
            });
        }

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setLabel('VINTED')
                .setStyle(ButtonStyle.Link)
                .setURL(data.url),
            new ButtonBuilder()
                .setCustomId(`fav_${itemId}_${message.author.id}`)
                .setLabel('❤️ Fav')
                .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
                .setCustomId(`offer_${itemId}_${message.author.id}`)
                .setLabel('📩 Offer')
                .setStyle(ButtonStyle.Success),
            new ButtonBuilder()
                .setCustomId(`sold_${itemId}_${message.author.id}`)
                .setLabel('SOLD')
                .setStyle(ButtonStyle.Danger)
        );

        sendPayload.components = [row];

        const chan = await client.channels.fetch(SELL_CHANNEL_ID);
        await chan.send(sendPayload);

        activeUploads.delete(message.author.id);
    }
});

if (!process.env.TOKEN) {
    console.error('TOKEN fehlt in den Railway Variables.');
    process.exit(1);
}

client.login(process.env.TOKEN);


