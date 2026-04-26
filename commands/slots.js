const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const symbols = ['🍒', '🍋', '🍉', '⭐', '💎', '🍀'];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('slots')
        .setDescription('LETS GO GAMBLING'),

    async execute(interaction) {


        const spin = [
            symbols[Math.floor(Math.random() * symbols.length)],
            symbols[Math.floor(Math.random() * symbols.length)],
            symbols[Math.floor(Math.random() * symbols.length)]
        ];

        let resultText = "Better luck next time!";
        let color = 0xff0000;


        if (spin[0] === spin[1] && spin[1] === spin[2]) {
            resultText = "JACKPOT 🎉";
            color = 0x00ff00;
        } else if (spin[0] === spin[1] || spin[1] === spin[2] || spin[0] === spin[2]) {
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
