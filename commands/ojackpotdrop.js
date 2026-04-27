const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const User = require('../models/User');

const OWNER_ID = "1453078748080504996";

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ojackpotdrop')
        .setDescription('Owner: drop money to random users')
        .addIntegerOption(o => o.setName('amount').setRequired(true)),

    async execute(interaction) {
        if (interaction.user.id !== OWNER_ID) return;

        const amount = interaction.options.getInteger('amount');

        const users = await User.find({ guildId: interaction.guild.id });

        if (!users.length) return;

        const winner = users[Math.floor(Math.random() * users.length)];

        winner.balance += amount;
        await winner.save();

        await interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setTitle('💰 Jackpot Drop')
                    .setDescription(`<@${winner.userId}> won $${amount}`)
            ]
        });
    }
};
