const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const { jackpotLeaderboard } = require('../utils/store');
const jackpotLeaderboard = require('../index').jackpotLeaderboard;

module.exports = {
    data: new SlashCommandBuilder()
        .setName('leaderboard')
        .setDescription('Shows jackpot leaderboard'),

    async execute(interaction) {

        if (!jackpotLeaderboard || jackpotLeaderboard.size === 0) {
            return interaction.reply({
                content: "No jackpots yet.",
                ephemeral: true
            });
        }

        const sorted = [...jackpotLeaderboard.entries()]
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10);

        const lines = await Promise.all(sorted.map(async ([id, count], i) => {
            const user = await interaction.client.users.fetch(id).catch(() => null);
            const name = user ? user.username : "Unknown";
            return `**${i + 1}. ${name}** — ${count} 🎉`;
        }));

        const embed = new EmbedBuilder()
            .setTitle('🏆 Jackpot Leaderboard')
            .setDescription(lines.join('\n'))
            .setColor(0xffd700);

        await interaction.reply({ embeds: [embed] });
    }
};
