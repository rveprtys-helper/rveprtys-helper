const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getUser } = require('../utils/economy');

const COOLDOWN = 10 * 60 * 1000;
const cooldowns = new Map();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('rob')
        .setDescription('Try to rob another user')
        .addUserOption(option =>
            option.setName('target')
                .setDescription('User to rob')
                .setRequired(true)
        ),

    async execute(interaction) {
        const target = interaction.options.getUser('target');
        const user = await getUser(interaction.user.id, interaction.guild.id);
        const victim = await getUser(target.id, interaction.guild.id);

        const now = Date.now();

        if (cooldowns.has(interaction.user.id)) {
            const expiration = cooldowns.get(interaction.user.id) + COOLDOWN;
            if (now < expiration) {
                return interaction.reply({ content: `⏳ Cooldown active.`, ephemeral: true });
            }
        }

        cooldowns.set(interaction.user.id, now);

        if (target.id === interaction.user.id) {
            return interaction.reply({ content: "❌ You can't rob yourself.", ephemeral: true });
        }

        if (victim.balance < 50) {
            return interaction.reply({ content: "❌ Target is too poor to rob.", ephemeral: true });
        }

        const success = Math.random() < 0.5;

        if (success) {
            const amount = Math.floor(victim.balance * 0.3);

            victim.balance -= amount;
            user.balance += amount;

            await user.save();
            await victim.save();

            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle('💰 Rob Success')
                        .setDescription(`You stole **$${amount}** from ${target.username}`)
                        .setColor(0x00ff00)
                ]
            });
        } else {
            const penalty = Math.floor(user.balance * 0.2);

            user.balance -= penalty;
            await user.save();

            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle('🚨 Rob Failed')
                        .setDescription(`You got caught and lost **$${penalty}**`)
                        .setColor(0xff0000)
                ]
            });
        }
    }
};
