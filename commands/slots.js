const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { jackpotLeaderboard } = require('../utils/store');

const symbols = ['🍒', '🍋', '🍉', '⭐', '💎', '🍀'];
const cooldowns = new Map();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('slots')
        .setDescription('Spin the slot machine'),

    async execute(interaction) {
        const userId = interaction.user.id;
        const now = Date.now();
        const cooldownTime = 30 * 1000;


        if (cooldowns.has(userId)) {
            const expiration = cooldowns.get(userId) + cooldownTime;

            if (now < expiration) {
                const timeLeft = ((expiration - now) / 1000).toFixed(1);

                return interaction.reply({
                    content: `⏳ You need to wait ${timeLeft}s before using this again.`,
                    ephemeral: true
                });
            }
        }

        cooldowns.set(userId, now);
        setTimeout(() => cooldowns.delete(userId), cooldownTime);

 
        const spin = [
            symbols[Math.floor(Math.random() * symbols.length)],
            symbols[Math.floor(Math.random() * symbols.length)],
            symbols[Math.floor(Math.random() * symbols.length)]
        ];

        let resultText = "Better luck next time! YOU FAILED";
        let color = 0xff0000;


        if (spin[0] === spin[1] && spin[1] === spin[2]) {
            resultText = " JACKPOT, GAMBLING W!";
            color = 0x00ff00;

  
            jackpotLeaderboard.set(
                userId,
                (jackpotLeaderboard.get(userId) || 0) + 1
            );

        } 

        else if (spin[0] === spin[1] || spin[1] === spin[2] || spin[0] === spin[2]) {
            resultText = "Nice! You got a match";
            color = 0xffff00;
        }

        const embed = new EmbedBuilder()
            .setTitle('🎰 Slot Machine')
            .setDescription(`| ${spin.join(' | ')} |\n\n**${resultText}**`)
            .setColor(color);

        await interaction.reply({ embeds: [embed] });
    }
};
