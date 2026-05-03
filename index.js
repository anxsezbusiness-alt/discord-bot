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
const fs = require('node:fs');
const path = require('node:path');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.DirectMessages
    ]
});

const TIMEZONE = process.env.BOT_TIMEZONE || 'Europe/Berlin';

// --- CONFIG ---
const SELL_CHANNEL_ID = process.env.SELL_CHANNEL_ID || '1492261103315587354';
const TEAM_CHANNEL_ID = process.env.TEAM_CHANNEL_ID || null;
const SALES_CHANNEL_ID = process.env.SALES_CHANNEL_ID || '1492593772884660224';

const VIP_SOURCE_CHANNEL_ID = process.env.VIP_SOURCE_CHANNEL_ID || '1492261103315587354';
const VIP_ALERT_CHANNEL_ID = process.env.VIP_ALERT_CHANNEL_ID || '1492261194487037952';
const VIP_ROLE_ID = process.env.VIP_ROLE_ID || null;
const VIP_ROLE_NAME = process.env.VIP_ROLE_NAME || 'VIP';
const VIP_MAX_PRICE_EUR = Number(process.env.VIP_MAX_PRICE_EUR || 35);

const MOCKUP_CHANNEL_ID = process.env.MOCKUP_CHANNEL_ID || '1500527497345761533';
const MOCKUP_REPORT_CHANNEL_ID = process.env.MOCKUP_REPORT_CHANNEL_ID || '1492261750110949509';
const MOCKUP_STORE_PATH = path.join(__dirname, 'mockup-submissions.json');
const MOCKUP_PANEL_TITLE = 'SHARE YOUR MOCKUP FOR VELOO ARCHIVE';
const MOCKUP_VOTE_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;
const MOCKUP_WEEKLY_CRON = process.env.MOCKUP_WEEKLY_CRON || '0 0 * * 1';

const activeUploads = new Map();
const alertedVipMessages = new Set();
let mockupStore = loadMockupStore();

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

function createEmptyMockupStore() {
    return {
        submissions: {},
        announcedVoteWeeks: []
    };
}

function loadMockupStore() {
    try {
        if (!fs.existsSync(MOCKUP_STORE_PATH)) {
            return createEmptyMockupStore();
        }

        const raw = fs.readFileSync(MOCKUP_STORE_PATH, 'utf8');
        const parsed = JSON.parse(raw);

        return {
            submissions: parsed.submissions && typeof parsed.submissions === 'object' ? parsed.submissions : {},
            announcedVoteWeeks: Array.isArray(parsed.announcedVoteWeeks) ? parsed.announcedVoteWeeks : []
        };
    } catch (error) {
        console.error('Mockup store could not be loaded:', error.message);
        return createEmptyMockupStore();
    }
}

function saveMockupStore() {
    try {
        fs.writeFileSync(MOCKUP_STORE_PATH, JSON.stringify(mockupStore, null, 2), 'utf8');
    } catch (error) {
        console.error('Mockup store could not be saved:', error.message);
    }
}

function getEmbedFooterText(embed) {
    return embed?.footer?.text || embed?.data?.footer?.text || '';
}

function getImageAttachments(message) {
    if (!message.attachments || message.attachments.size === 0) {
        return [];
    }

    return [...message.attachments.values()].filter(attachment =>
        attachment.contentType?.startsWith('image/') ||
        /\.(png|jpe?g|gif|webp|bmp)$/i.test(attachment.name || '')
    );
}

function sanitizeFileName(fileName) {
    const base = fileName || 'image.jpg';
    return base.replace(/[^a-zA-Z0-9._-]/g, '_');
}

async function buildImageFileFromAttachment(attachment, prefix = 'image', index = 0) {
    if (!attachment?.url) {
        return null;
    }

    try {
        const response = await fetch(attachment.url);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const safeName = `${prefix}-${index + 1}-${sanitizeFileName(attachment.name || 'image.jpg')}`;

        return new AttachmentBuilder(buffer, { name: safeName });
    } catch (error) {
        console.error('Image could not be downloaded:', error.message);
        return null;
    }
}

async function buildImageFilesFromAttachments(attachments, prefix) {
    const files = [];

    for (let index = 0; index < attachments.length; index += 1) {
        const file = await buildImageFileFromAttachment(attachments[index], prefix, index);
        if (!file) {
            return [];
        }

        files.push(file);
    }

    return files;
}

function extractPrices(text) {
    const matches = [...text.matchAll(/(\d+(?:[.,]\d{1,2})?)/g)];
    return matches.map(match => Number(match[1].replace(',', '.'))).filter(Number.isFinite);
}

function getVipPieceData(message) {
    const embed = message.embeds?.[0];
    if (!embed) {
        return null;
    }

    const footerText = getEmbedFooterText(embed);
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
    if (message.channelId !== VIP_SOURCE_CHANNEL_ID) {
        return;
    }

    if (!message.author || !client.user || message.author.id !== client.user.id) {
        return;
    }

    if (alertedVipMessages.has(message.id)) {
        return;
    }

    const pieceData = getVipPieceData(message);
    if (!pieceData?.brand || pieceData.currentPrice === null) {
        return;
    }

    if (pieceData.currentPrice > VIP_MAX_PRICE_EUR) {
        return;
    }

    const alertChannel = await client.channels.fetch(VIP_ALERT_CHANNEL_ID).catch(() => null);
    if (!alertChannel || !message.guild) {
        return;
    }

    const vipMention = await resolveVipMention(message.guild);
    const alertEmbed = EmbedBuilder.from(pieceData.embed)
        .setColor('#f1c40f')
        .setFooter({
            text: `VIP Deal | ${pieceData.brand.toUpperCase()} | ${pieceData.currentPrice} EUR`
        });

    const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setLabel('Open Piece')
            .setStyle(ButtonStyle.Link)
            .setURL(message.url)
    );

    await alertChannel.send({
        content: `${vipMention} Brand deal detected: ${pieceData.brand} for ${pieceData.currentPrice} EUR`,
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
                getEmbedFooterText(message.embeds[0]) === `Item-ID: ${itemId}`
            );

            for (const copy of copies.values()) {
                await copy.delete().catch(() => {});
            }
        } catch (error) {
            console.error(`Error deleting favorites in ${channel.name}:`, error.message);
        }
    }
}

async function countUserSales(salesChannel, userId) {
    let count = 0;
    let lastId;

    while (true) {
        const options = { limit: 100 };
        if (lastId) {
            options.before = lastId;
        }

        const messages = await salesChannel.messages.fetch(options);
        if (!messages.size) {
            break;
        }

        for (const message of messages.values()) {
            if (message.author.id !== client.user.id) {
                continue;
            }

            const footerText = getEmbedFooterText(message.embeds[0]);
            if (footerText === `Sale-User-ID: ${userId}`) {
                count += 1;
            }
        }

        lastId = messages.last().id;
        if (messages.size < 100) {
            break;
        }
    }

    return count;
}

async function announceSale(sellerId) {
    const salesChannel = await client.channels.fetch(SALES_CHANNEL_ID).catch(() => null);
    if (!salesChannel) {
        return;
    }

    const previousSales = await countUserSales(salesChannel, sellerId);
    const currentSaleNumber = previousSales + 1;

    const embed = new EmbedBuilder()
        .setTitle('New Sale')
        .setDescription(`<@${sellerId}> just sold their ${currentSaleNumber}${getOrdinalSuffix(currentSaleNumber)} piece!`)
        .setColor('#2ecc71')
        .setFooter({ text: `Sale-User-ID: ${sellerId}` })
        .setTimestamp();

    await salesChannel.send({
        content: `<@${sellerId}> just sold their ${currentSaleNumber}${getOrdinalSuffix(currentSaleNumber)} piece!`,
        embeds: [embed]
    });
}

function getOrdinalSuffix(number) {
    const mod10 = number % 10;
    const mod100 = number % 100;

    if (mod10 === 1 && mod100 !== 11) return 'st';
    if (mod10 === 2 && mod100 !== 12) return 'nd';
    if (mod10 === 3 && mod100 !== 13) return 'rd';
    return 'th';
}

async function sendTempMessage(channel, content, ms = 7000) {
    const tempMessage = await channel.send({ content }).catch(() => null);
    if (tempMessage) {
        setTimeout(() => {
            tempMessage.delete().catch(() => {});
        }, ms);
    }
}

async function replyToInteraction(interaction, payload) {
    if (interaction.deferred || interaction.replied) {
        return interaction.followUp(payload).catch(() => null);
    }

    return interaction.reply(payload).catch(() => null);
}

async function deletePanelMessages(channel, title) {
    const messages = await channel.messages.fetch({ limit: 50 });
    const oldPanels = messages.filter(message =>
        message.author.id === client.user.id &&
        message.embeds[0]?.title === title
    );

    for (const panel of oldPanels.values()) {
        await panel.delete().catch(() => {});
    }
}

async function sendSellPanel() {
    const sellChannel = await client.channels.fetch(SELL_CHANNEL_ID).catch(() => null);
    if (!sellChannel) {
        return;
    }

    await deletePanelMessages(sellChannel, 'SELL YOUR PIECE');

    const embed = new EmbedBuilder()
        .setTitle('SELL YOUR PIECE')
        .setDescription('Click the button below to list your item for sale.')
        .setColor('#000000');

    const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId('start_upload')
            .setLabel('SELL PIECE')
            .setStyle(ButtonStyle.Primary)
    );

    await sellChannel.send({ embeds: [embed], components: [row] });
}

async function sendTeamPanel() {
    if (!TEAM_CHANNEL_ID) {
        return;
    }

    const teamChannel = await client.channels.fetch(TEAM_CHANNEL_ID).catch(() => null);
    if (!teamChannel) {
        return;
    }

    await deletePanelMessages(teamChannel, 'FIND A TEAM');

    const embed = new EmbedBuilder()
        .setTitle('FIND A TEAM')
        .setDescription('Find partners for your projects here.')
        .setColor('#2ecc71');

    const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId('start_teamup')
            .setLabel('TEAM-UP')
            .setStyle(ButtonStyle.Success)
    );

    await teamChannel.send({ embeds: [embed], components: [row] });
}

async function sendMockupPanel() {
    const mockupChannel = await client.channels.fetch(MOCKUP_CHANNEL_ID).catch(() => null);
    if (!mockupChannel) {
        return;
    }

    await deletePanelMessages(mockupChannel, MOCKUP_PANEL_TITLE);

    const embed = new EmbedBuilder()
        .setTitle(MOCKUP_PANEL_TITLE)
        .setDescription('Teile dein Mockup fuer Veloo Archive und gewinne dein eigenes Piece.')
        .addFields(
            {
                name: 'Was du eintragen sollst',
                value: 'Welche Art von Kleidung oder Accessoire du teilst, zum Beispiel Hoodie, Jersey, Cap, Tote Bag oder Beanie.'
            },
            {
                name: 'So funktioniert es',
                value: 'Klicke auf den Button, trage deine Angaben ein und sende danach genau eine Nachricht mit 1 bis 3 Bildern und dem Text `done`.'
            }
        )
        .setColor('#e67e22');

    const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId('start_mockup_upload')
            .setLabel('MOCKUP TEILEN')
            .setStyle(ButtonStyle.Secondary)
    );

    await mockupChannel.send({ embeds: [embed], components: [row] });
}

async function refreshPanels() {
    console.log(`[${new Date().toLocaleTimeString('de-DE', { timeZone: TIMEZONE })}] Refreshing panels...`);

    try {
        await sendSellPanel();
    } catch (error) {
        console.error('Sell channel error:', error.message);
    }

    try {
        await sendTeamPanel();
    } catch (error) {
        console.error('Team channel error:', error.message);
    }

    try {
        await sendMockupPanel();
    } catch (error) {
        console.error('Mockup channel error:', error.message);
    }
}

function getBerlinDateParts(date = new Date()) {
    const formatter = new Intl.DateTimeFormat('en-CA', {
        timeZone: TIMEZONE,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });

    const parts = formatter.formatToParts(date);
    const values = Object.fromEntries(
        parts
            .filter(part => part.type !== 'literal')
            .map(part => [part.type, part.value])
    );

    return {
        year: Number(values.year),
        month: Number(values.month),
        day: Number(values.day)
    };
}

function getWeekKey(date = new Date()) {
    const { year, month, day } = getBerlinDateParts(date);
    const mondayDate = new Date(Date.UTC(year, month - 1, day));
    const weekday = mondayDate.getUTCDay() || 7;
    mondayDate.setUTCDate(mondayDate.getUTCDate() - (weekday - 1));
    return mondayDate.toISOString().slice(0, 10);
}

function getPreviousWeekKey(date = new Date()) {
    const currentWeekDate = new Date(`${getWeekKey(date)}T00:00:00.000Z`);
    currentWeekDate.setUTCDate(currentWeekDate.getUTCDate() - 7);
    return currentWeekDate.toISOString().slice(0, 10);
}

function formatDateTime(dateValue) {
    return new Intl.DateTimeFormat('de-DE', {
        timeZone: TIMEZONE,
        dateStyle: 'medium',
        timeStyle: 'short'
    }).format(new Date(dateValue));
}

function isMockupVotingOpen(submission) {
    return Date.now() < new Date(submission.voteEndsAt).getTime();
}

function getMockupSubmission(entryId) {
    return mockupStore.submissions[entryId] || null;
}

function buildMockupActionRow(entryId, likeCount, likeDisabled = false, reportDisabled = false) {
    return new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId(`mockup_like_${entryId}`)
            .setLabel(`LIKE ${likeCount}`)
            .setStyle(ButtonStyle.Success)
            .setDisabled(likeDisabled),
        new ButtonBuilder()
            .setCustomId(`mockup_report_${entryId}`)
            .setLabel('REPORT')
            .setStyle(ButtonStyle.Danger)
            .setDisabled(reportDisabled)
    );
}

function buildMockupEmbeds(uploadData, author, entryId, imageFiles, voteEndsAt) {
    const embeds = [];

    const mainEmbed = new EmbedBuilder()
        .setTitle('Veloo Archive Mockup')
        .setDescription('Community-Voting ist 7 Tage offen.')
        .addFields(
            { name: 'Art', value: uploadData.garmentType, inline: true },
            { name: 'Name', value: uploadData.submitterName, inline: true },
            { name: 'Von', value: `<@${author.id}>`, inline: true },
            { name: 'Voting endet', value: formatDateTime(voteEndsAt), inline: false }
        )
        .setColor('#e67e22')
        .setFooter({ text: `Mockup-ID: ${entryId}` })
        .setTimestamp();

    if (imageFiles[0]) {
        mainEmbed.setImage(`attachment://${imageFiles[0].name}`);
    }

    embeds.push(mainEmbed);

    for (let index = 1; index < imageFiles.length; index += 1) {
        embeds.push(
            new EmbedBuilder()
                .setColor('#f4b183')
                .setImage(`attachment://${imageFiles[index].name}`)
                .setFooter({ text: `Weitere Mockup-Ansicht ${index + 1}` })
        );
    }

    return embeds;
}

async function setMockupLikeState(submission, likeDisabled) {
    const channel = await client.channels.fetch(submission.channelId).catch(() => null);
    if (!channel) {
        return;
    }

    const message = await channel.messages.fetch(submission.messageId).catch(() => null);
    if (!message) {
        return;
    }

    await message.edit({
        components: [buildMockupActionRow(submission.entryId, submission.likes.length, likeDisabled, false)]
    }).catch(() => {});
}

async function closeExpiredMockupVotes() {
    let changed = false;

    for (const submission of Object.values(mockupStore.submissions)) {
        if (submission.voteClosed || isMockupVotingOpen(submission)) {
            continue;
        }

        await setMockupLikeState(submission, true);
        submission.voteClosed = true;
        changed = true;
    }

    if (changed) {
        saveMockupStore();
    }
}

function pickWeeklyWinner(submissions) {
    return [...submissions].sort((left, right) => {
        const likeDifference = right.likes.length - left.likes.length;
        if (likeDifference !== 0) {
            return likeDifference;
        }

        return new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime();
    })[0] || null;
}

function buildWinnerFallbackEmbed(submission) {
    return new EmbedBuilder()
        .setTitle('Wochensieger Mockup')
        .setDescription(`<@${submission.userId}> gewinnt diese Woche mit ${submission.likes.length} Likes.`)
        .addFields(
            { name: 'Art', value: submission.garmentType, inline: true },
            { name: 'Name', value: submission.submitterName, inline: true },
            { name: 'Voting beendet', value: formatDateTime(submission.voteEndsAt), inline: false }
        )
        .setColor('#f1c40f')
        .setFooter({ text: `Mockup-ID: ${submission.entryId}` })
        .setTimestamp();
}

async function buildWinnerEmbeds(submission) {
    const channel = await client.channels.fetch(submission.channelId).catch(() => null);
    if (!channel) {
        return [buildWinnerFallbackEmbed(submission)];
    }

    const message = await channel.messages.fetch(submission.messageId).catch(() => null);
    if (!message || !message.embeds.length) {
        return [buildWinnerFallbackEmbed(submission)];
    }

    return message.embeds.slice(0, 3).map((embed, index) => {
        const winnerEmbed = EmbedBuilder.from(embed).setColor('#f1c40f');

        if (index === 0) {
            winnerEmbed
                .setTitle('Wochensieger Mockup')
                .setDescription(
                    `<@${submission.userId}> gewinnt diese Woche mit ${submission.likes.length} Likes.\n\n` +
                    `Art: ${submission.garmentType}\nName: ${submission.submitterName}`
                )
                .setFooter({ text: `Winner | Mockup-ID: ${submission.entryId}` })
                .setTimestamp();
        }

        return winnerEmbed;
    });
}

async function announceWeeklyMockupWinnerIfNeeded(referenceDate = new Date()) {
    const targetVoteWeek = getPreviousWeekKey(referenceDate);
    if (mockupStore.announcedVoteWeeks.includes(targetVoteWeek)) {
        return;
    }

    const candidates = Object.values(mockupStore.submissions).filter(submission =>
        submission.voteWeekKey === targetVoteWeek
    );

    if (!candidates.length) {
        mockupStore.announcedVoteWeeks.push(targetVoteWeek);
        saveMockupStore();
        return;
    }

    await closeExpiredMockupVotes();

    const winner = pickWeeklyWinner(candidates);
    const mockupChannel = await client.channels.fetch(MOCKUP_CHANNEL_ID).catch(() => null);
    if (!winner || !mockupChannel) {
        return;
    }

    const winnerEmbeds = await buildWinnerEmbeds(winner);
    const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setLabel('Open Winning Post')
            .setStyle(ButtonStyle.Link)
            .setURL(winner.messageUrl)
    );

    try {
        await mockupChannel.send({
            content: `Wochensieger: <@${winner.userId}> mit ${winner.likes.length} Likes.`,
            embeds: winnerEmbeds,
            components: [row]
        });
    } catch (error) {
        console.error('Weekly winner announcement failed:', error.message);
        return;
    }

    const winnerUser = await client.users.fetch(winner.userId).catch(() => null);
    if (winnerUser) {
        await winnerUser.send(
            `Du hast das Veloo Archive Mockup-Voting diese Woche mit ${winner.likes.length} Likes gewonnen.\n` +
            `Dein Gewinner-Post: ${winner.messageUrl}`
        ).catch(error => {
            console.error('Winner DM could not be sent:', error.message);
        });
    }

    mockupStore.announcedVoteWeeks.push(targetVoteWeek);
    saveMockupStore();
}

async function handleMockupLike(interaction, entryId) {
    const submission = getMockupSubmission(entryId);
    if (!submission) {
        return replyToInteraction(interaction, {
            content: 'Dieses Mockup wurde nicht mehr gefunden.',
            ephemeral: true
        });
    }

    if (interaction.user.id === submission.userId) {
        return replyToInteraction(interaction, {
            content: 'Du kannst dein eigenes Mockup nicht liken.',
            ephemeral: true
        });
    }

    if (!isMockupVotingOpen(submission)) {
        submission.voteClosed = true;
        saveMockupStore();
        await interaction.message.edit({
            components: [buildMockupActionRow(entryId, submission.likes.length, true, false)]
        }).catch(() => {});

        return replyToInteraction(interaction, {
            content: 'Das 7-Tage-Voting ist bereits vorbei.',
            ephemeral: true
        });
    }

    if (submission.likes.includes(interaction.user.id)) {
        return replyToInteraction(interaction, {
            content: 'Du hast dieses Mockup bereits gelikt.',
            ephemeral: true
        });
    }

    submission.likes.push(interaction.user.id);
    saveMockupStore();

    await interaction.message.edit({
        components: [buildMockupActionRow(entryId, submission.likes.length, false, false)]
    }).catch(() => {});

    return replyToInteraction(interaction, {
        content: `Like gespeichert. Aktuelle Likes: ${submission.likes.length}.`,
        ephemeral: true
    });
}

async function handleMockupReportSubmit(interaction, entryId) {
    const submission = getMockupSubmission(entryId);
    if (!submission) {
        return replyToInteraction(interaction, {
            content: 'Dieses Mockup wurde nicht mehr gefunden.',
            ephemeral: true
        });
    }

    if (interaction.user.id === submission.userId) {
        return replyToInteraction(interaction, {
            content: 'Du kannst dein eigenes Mockup nicht reporten.',
            ephemeral: true
        });
    }

    if (submission.reports.some(report => report.userId === interaction.user.id)) {
        return replyToInteraction(interaction, {
            content: 'Du hast dieses Mockup bereits gemeldet.',
            ephemeral: true
        });
    }

    const reason = interaction.fields.getTextInputValue('reason');
    submission.reports.push({
        userId: interaction.user.id,
        reason,
        createdAt: new Date().toISOString()
    });
    saveMockupStore();

    const reportChannel = await client.channels.fetch(MOCKUP_REPORT_CHANNEL_ID).catch(() => null);
    if (!reportChannel) {
        return replyToInteraction(interaction, {
            content: 'Der Mod-Channel konnte nicht erreicht werden.',
            ephemeral: true
        });
    }

    const reportEmbed = new EmbedBuilder()
        .setTitle('Mockup Report')
        .setDescription('A community mockup was reported for review.')
        .addFields(
            { name: 'Reported by', value: `<@${interaction.user.id}>`, inline: true },
            { name: 'Created by', value: `<@${submission.userId}>`, inline: true },
            { name: 'Entry ID', value: submission.entryId, inline: true },
            { name: 'Art', value: submission.garmentType, inline: true },
            { name: 'Name', value: submission.submitterName, inline: true },
            { name: 'Reason', value: reason, inline: false },
            { name: 'Original Post', value: submission.messageUrl, inline: false }
        )
        .setColor('#e74c3c')
        .setTimestamp();

    if (submission.previewImageUrl) {
        reportEmbed.setImage(submission.previewImageUrl);
    }

    const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setLabel('Open Reported Post')
            .setStyle(ButtonStyle.Link)
            .setURL(submission.messageUrl)
    );

    await reportChannel.send({
        embeds: [reportEmbed],
        components: [row]
    });

    return replyToInteraction(interaction, {
        content: 'Dein Report wurde an das Mod-Team geschickt.',
        ephemeral: true
    });
}

async function handleSellUploadMessage(message, uploadData) {
    const content = message.content.trim().toLowerCase();
    const imageAttachments = getImageAttachments(message);

    if (content !== 'done' || imageAttachments.length !== 1 || message.attachments.size !== 1) {
        await sendTempMessage(
            message.channel,
            `<@${message.author.id}> please send exactly one message with one image attached and the text **done**.`,
            6000
        );
        return;
    }

    const imageFiles = await buildImageFilesFromAttachments(imageAttachments, `piece-${message.author.id}`);
    await message.delete().catch(() => {});

    if (imageFiles.length !== 1) {
        await sendTempMessage(
            message.channel,
            `<@${message.author.id}> your image could not be processed. Please try again with **image + done** in one message.`,
            7000
        );
        return;
    }

    const itemId = Date.now().toString();

    const embed = new EmbedBuilder()
        .setTitle(` ${uploadData.brand} ${uploadData.title}`.trim())
        .addFields(
            { name: 'Price', value: uploadData.price, inline: true },
            { name: 'Size', value: uploadData.size, inline: true },
            { name: 'Seller', value: `<@${message.author.id}>`, inline: true }
        )
        .setColor('#ffffff')
        .setFooter({ text: `Item-ID: ${itemId}` })
        .setImage(`attachment://${imageFiles[0].name}`);

    const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setLabel('VINTED')
            .setStyle(ButtonStyle.Link)
            .setURL(uploadData.url),
        new ButtonBuilder()
            .setCustomId(`fav_${itemId}_${message.author.id}`)
            .setLabel('FAV')
            .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
            .setCustomId(`offer_${itemId}_${message.author.id}`)
            .setLabel('OFFER')
            .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
            .setCustomId(`sold_${itemId}_${message.author.id}`)
            .setLabel('SOLD')
            .setStyle(ButtonStyle.Danger)
    );

    const channel = await client.channels.fetch(SELL_CHANNEL_ID).catch(() => null);
    if (!channel) {
        await sendTempMessage(message.channel, 'The sell channel could not be reached.', 7000);
        return;
    }

    await channel.send({
        embeds: [embed],
        components: [row],
        files: imageFiles
    });

    activeUploads.delete(message.author.id);
}

async function handleMockupUploadMessage(message, uploadData) {
    const content = message.content.trim().toLowerCase();
    const imageAttachments = getImageAttachments(message);

    if (
        content !== 'done' ||
        imageAttachments.length < 1 ||
        imageAttachments.length > 3 ||
        imageAttachments.length !== message.attachments.size
    ) {
        await sendTempMessage(
            message.channel,
            `<@${message.author.id}> please send exactly one message with 1 to 3 images and the text **done**.`,
            7000
        );
        return;
    }

    const imageFiles = await buildImageFilesFromAttachments(imageAttachments, `mockup-${message.author.id}`);
    await message.delete().catch(() => {});

    if (imageFiles.length !== imageAttachments.length) {
        await sendTempMessage(
            message.channel,
            `<@${message.author.id}> your mockup images could not be processed. Please try again with 1 to 3 images and **done**.`,
            7000
        );
        return;
    }

    const entryId = Date.now().toString();
    const createdAt = new Date().toISOString();
    const voteEndsAt = new Date(Date.now() + MOCKUP_VOTE_WINDOW_MS).toISOString();
    const embeds = buildMockupEmbeds(uploadData, message.author, entryId, imageFiles, voteEndsAt);

    const channel = await client.channels.fetch(MOCKUP_CHANNEL_ID).catch(() => null);
    if (!channel) {
        await sendTempMessage(message.channel, 'The mockup channel could not be reached.', 7000);
        return;
    }

    const sentMessage = await channel.send({
        embeds,
        components: [buildMockupActionRow(entryId, 0, false, false)],
        files: imageFiles
    });

    mockupStore.submissions[entryId] = {
        entryId,
        messageId: sentMessage.id,
        messageUrl: sentMessage.url,
        channelId: sentMessage.channelId,
        userId: message.author.id,
        garmentType: uploadData.garmentType,
        submitterName: uploadData.submitterName,
        createdAt,
        voteEndsAt,
        voteWeekKey: getWeekKey(new Date(voteEndsAt)),
        voteClosed: false,
        likes: [],
        reports: [],
        previewImageUrl: sentMessage.attachments.first()?.url || null
    };
    saveMockupStore();

    activeUploads.delete(message.author.id);

    await sendTempMessage(
        message.channel,
        `<@${message.author.id}> your mockup is live and can now be liked for 7 days.`,
        5000
    );
}

client.once('ready', async () => {
    console.log(` ${client.user.tag} is online!`);

    await refreshPanels();
    await closeExpiredMockupVotes().catch(error => {
        console.error('Mockup vote cleanup failed on startup:', error.message);
    });
    await announceWeeklyMockupWinnerIfNeeded().catch(error => {
        console.error('Weekly winner check failed on startup:', error.message);
    });

    cron.schedule('*/5 * * * *', async () => {
        await refreshPanels();
    }, { timezone: TIMEZONE });

    cron.schedule('0 * * * *', async () => {
        await closeExpiredMockupVotes();
    }, { timezone: TIMEZONE });

    cron.schedule(MOCKUP_WEEKLY_CRON, async () => {
        await announceWeeklyMockupWinnerIfNeeded();
    }, { timezone: TIMEZONE });
});

client.on('interactionCreate', async interaction => {
    try {
        if (interaction.isButton()) {
            if (interaction.customId === 'start_upload') {
                const modal = new ModalBuilder()
                    .setCustomId('upload_modal')
                    .setTitle('Piece Details');

                const pieceInput = new TextInputBuilder()
                    .setCustomId('title')
                    .setLabel('Piece')
                    .setPlaceholder('e.g. Nike Hoodie')
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true);

                const brandInput = new TextInputBuilder()
                    .setCustomId('brand')
                    .setLabel('Brand')
                    .setPlaceholder('e.g. Nike')
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true);

                const priceInput = new TextInputBuilder()
                    .setCustomId('price')
                    .setLabel('Price')
                    .setPlaceholder('e.g. 12 EUR')
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true);

                const sizeInput = new TextInputBuilder()
                    .setCustomId('size')
                    .setLabel('Size')
                    .setPlaceholder('e.g. M / 38 / One Size')
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true);

                const linkInput = new TextInputBuilder()
                    .setCustomId('url')
                    .setLabel('Vinted Link')
                    .setPlaceholder('https://www.vinted.de/items/...')
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true);

                modal.addComponents(
                    new ActionRowBuilder().addComponents(pieceInput),
                    new ActionRowBuilder().addComponents(brandInput),
                    new ActionRowBuilder().addComponents(priceInput),
                    new ActionRowBuilder().addComponents(sizeInput),
                    new ActionRowBuilder().addComponents(linkInput)
                );

                return interaction.showModal(modal);
            }

            if (interaction.customId === 'start_teamup') {
                const modal = new ModalBuilder()
                    .setCustomId('team_modal')
                    .setTitle('Find a Team');

                const descInput = new TextInputBuilder()
                    .setCustomId('desc')
                    .setLabel('What are you looking for?')
                    .setPlaceholder('e.g. Looking for someone for a 50/50 resell project in Berlin...')
                    .setStyle(TextInputStyle.Paragraph)
                    .setRequired(true);

                modal.addComponents(new ActionRowBuilder().addComponents(descInput));
                return interaction.showModal(modal);
            }

            if (interaction.customId === 'start_mockup_upload') {
                const modal = new ModalBuilder()
                    .setCustomId('mockup_modal')
                    .setTitle('Veloo Archive Mockup');

                const garmentTypeInput = new TextInputBuilder()
                    .setCustomId('garment_type')
                    .setLabel('Welche Art von Kleidung / Accessoire?')
                    .setPlaceholder('z.B. Hoodie, Jersey, Cap, Tote Bag, Beanie')
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true);

                const nameInput = new TextInputBuilder()
                    .setCustomId('submitter_name')
                    .setLabel('Dein Name')
                    .setPlaceholder('z.B. Hasan / veloo archive')
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true);

                modal.addComponents(
                    new ActionRowBuilder().addComponents(garmentTypeInput),
                    new ActionRowBuilder().addComponents(nameInput)
                );

                return interaction.showModal(modal);
            }

            if (interaction.customId.startsWith('mockup_like_')) {
                const entryId = interaction.customId.replace('mockup_like_', '');
                return handleMockupLike(interaction, entryId);
            }

            if (interaction.customId.startsWith('mockup_report_')) {
                const entryId = interaction.customId.replace('mockup_report_', '');
                const modal = new ModalBuilder()
                    .setCustomId(`mockup_report_modal_${entryId}`)
                    .setTitle('Mockup melden');

                const reasonInput = new TextInputBuilder()
                    .setCustomId('reason')
                    .setLabel('Warum meldest du dieses Mockup?')
                    .setPlaceholder('Beschreibe kurz, was vom Mod-Team geprueft werden soll.')
                    .setStyle(TextInputStyle.Paragraph)
                    .setRequired(true);

                modal.addComponents(new ActionRowBuilder().addComponents(reasonInput));
                return interaction.showModal(modal);
            }

            const parts = interaction.customId.split('_');
            if (parts.length < 3) {
                return;
            }

            const [action, itemId, sellerId] = parts;

            if (action === 'sold') {
                if (interaction.user.id !== sellerId) {
                    return replyToInteraction(interaction, {
                        content: 'Only the seller can do that.',
                        ephemeral: true
                    });
                }

                await deleteFavoriteCopies(interaction.guild, itemId);
                await interaction.message.delete().catch(() => {});
                await announceSale(sellerId).catch(error => {
                    console.error('Error posting sale message:', error.message);
                });

                return replyToInteraction(interaction, {
                    content: 'Item deleted, favorites cleaned up, and sale counted.',
                    ephemeral: true
                });
            }

            if (action === 'fav') {
                if (interaction.user.id === sellerId) {
                    return replyToInteraction(interaction, {
                        content: 'You cannot favorite your own piece.',
                        ephemeral: true
                    });
                }

                const favoritesChannelName = `favs-${interaction.user.id}`;
                let favoriteChannel = interaction.guild.channels.cache.find(channel =>
                    channel.type === ChannelType.GuildText && channel.name === favoritesChannelName
                );

                if (!favoriteChannel) {
                    favoriteChannel = await interaction.guild.channels.create({
                        name: favoritesChannelName,
                        type: ChannelType.GuildText,
                        permissionOverwrites: [
                            { id: interaction.guild.id, deny: [PermissionsBitField.Flags.ViewChannel] },
                            { id: interaction.user.id, allow: [PermissionsBitField.Flags.ViewChannel] }
                        ]
                    });
                }

                const existingMessages = await favoriteChannel.messages.fetch({ limit: 100 });
                const alreadySaved = existingMessages.find(message =>
                    message.author.id === client.user.id &&
                    getEmbedFooterText(message.embeds[0]) === `Item-ID: ${itemId}`
                );

                if (alreadySaved) {
                    return replyToInteraction(interaction, {
                        content: 'This piece is already in your favorites.',
                        ephemeral: true
                    });
                }

                const originalEmbed = EmbedBuilder.from(interaction.message.embeds[0]);
                originalEmbed.setFooter({ text: `Item-ID: ${itemId}` });

                const favoriteRow = new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setLabel('Open Original')
                        .setStyle(ButtonStyle.Link)
                        .setURL(interaction.message.url)
                );

                await favoriteChannel.send({
                    content: 'You saved this piece:',
                    embeds: [originalEmbed],
                    components: [favoriteRow]
                });

                return replyToInteraction(interaction, {
                    content: 'Saved to your favorites.',
                    ephemeral: true
                });
            }

            if (action === 'offer') {
                if (interaction.user.id === sellerId) {
                    return replyToInteraction(interaction, {
                        content: 'You cannot make an offer to yourself.',
                        ephemeral: true
                    });
                }

                const modal = new ModalBuilder()
                    .setCustomId(`moffer_${itemId}_${sellerId}`)
                    .setTitle('Send Offer');

                modal.addComponents(
                    new ActionRowBuilder().addComponents(
                        new TextInputBuilder()
                            .setCustomId('oprice')
                            .setLabel('Your price offer')
                            .setPlaceholder('e.g. 10 EUR')
                            .setStyle(TextInputStyle.Short)
                            .setRequired(true)
                    )
                );

                return interaction.showModal(modal);
            }
        }

        if (interaction.isModalSubmit()) {
            if (interaction.customId === 'upload_modal') {
                activeUploads.set(interaction.user.id, {
                    type: 'sell',
                    sourceChannelId: interaction.channelId,
                    title: interaction.fields.getTextInputValue('title'),
                    brand: interaction.fields.getTextInputValue('brand'),
                    price: interaction.fields.getTextInputValue('price'),
                    size: interaction.fields.getTextInputValue('size'),
                    url: interaction.fields.getTextInputValue('url')
                });

                return replyToInteraction(interaction, {
                    content: 'Now send exactly one message with your image attached and the text `done`. That message will be deleted automatically afterwards.',
                    ephemeral: true
                });
            }

            if (interaction.customId === 'team_modal') {
                const embed = new EmbedBuilder()
                    .setTitle('TEAM-UP REQUEST')
                    .setDescription(interaction.fields.getTextInputValue('desc'))
                    .setAuthor({
                        name: interaction.user.username,
                        iconURL: interaction.user.displayAvatarURL()
                    })
                    .setColor('#2ecc71')
                    .setTimestamp();

                await interaction.channel.send({ embeds: [embed] });
                return replyToInteraction(interaction, {
                    content: 'Your request has been posted.',
                    ephemeral: true
                });
            }

            if (interaction.customId === 'mockup_modal') {
                activeUploads.set(interaction.user.id, {
                    type: 'mockup',
                    sourceChannelId: interaction.channelId,
                    garmentType: interaction.fields.getTextInputValue('garment_type'),
                    submitterName: interaction.fields.getTextInputValue('submitter_name')
                });

                return replyToInteraction(interaction, {
                    content: 'Sende jetzt genau eine Nachricht mit 1 bis 3 Bildern und dem Text `done`. Diese Nachricht wird danach automatisch geloescht.',
                    ephemeral: true
                });
            }

            if (interaction.customId.startsWith('mockup_report_modal_')) {
                const entryId = interaction.customId.replace('mockup_report_modal_', '');
                return handleMockupReportSubmit(interaction, entryId);
            }

            if (interaction.customId.startsWith('moffer_')) {
                const [, itemId, sellerId] = interaction.customId.split('_');

                if (!itemId || !sellerId) {
                    return replyToInteraction(interaction, {
                        content: 'The offer could not be processed.',
                        ephemeral: true
                    });
                }

                if (interaction.user.id === sellerId) {
                    return replyToInteraction(interaction, {
                        content: 'You cannot make an offer to yourself.',
                        ephemeral: true
                    });
                }

                const offerPrice = interaction.fields.getTextInputValue('oprice');
                const seller = await client.users.fetch(sellerId).catch(() => null);

                if (!seller) {
                    return replyToInteraction(interaction, {
                        content: 'The seller could not be found.',
                        ephemeral: true
                    });
                }

                const offerEmbed = new EmbedBuilder()
                    .setTitle('New Offer')
                    .addFields(
                        { name: 'Item ID', value: itemId, inline: true },
                        { name: 'Offer', value: offerPrice, inline: true },
                        { name: 'From', value: `<@${interaction.user.id}>`, inline: true }
                    )
                    .setColor('#27ae60')
                    .setTimestamp();

                try {
                    await seller.send({ embeds: [offerEmbed] });
                    return replyToInteraction(interaction, {
                        content: 'Your offer has been sent to the seller.',
                        ephemeral: true
                    });
                } catch (error) {
                    console.error('Error sending offer:', error.message);
                    return replyToInteraction(interaction, {
                        content: 'I could not send a DM to the seller.',
                        ephemeral: true
                    });
                }
            }
        }
    } catch (error) {
        console.error('Interaction handler failed:', error.message);
        await replyToInteraction(interaction, {
            content: 'Something went wrong while handling that action.',
            ephemeral: true
        });
    }
});

client.on('messageCreate', async message => {
    await handleVipDeal(message).catch(error => {
        console.error('VIP detection failed:', error.message);
    });

    if (message.author.bot) {
        return;
    }

    const uploadData = activeUploads.get(message.author.id);
    if (!uploadData) {
        return;
    }

    if (uploadData.sourceChannelId && uploadData.sourceChannelId !== message.channelId) {
        return;
    }

    if (uploadData.type === 'sell') {
        await handleSellUploadMessage(message, uploadData).catch(error => {
            console.error('Sell upload failed:', error.message);
        });
        return;
    }

    if (uploadData.type === 'mockup') {
        await handleMockupUploadMessage(message, uploadData).catch(error => {
            console.error('Mockup upload failed:', error.message);
        });
    }
});

if (!process.env.TOKEN) {
    console.error('TOKEN is missing in Railway variables.');
    process.exit(1);
}

client.login(process.env.TOKEN);
