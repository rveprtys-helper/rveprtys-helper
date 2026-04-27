const { SlashCommandBuilder } = require('discord.js');

const OWNER_ID = "1453078748080504996";
const frozen = new Set();

module.exports = {
    freezeSet: frozen,

    freeze: {
        data: new SlashCommandBuilder()
            .setName('ofreeze')
            .setDescription('Freeze a user')
            .addUserOption(o => o.setName('user').setRequired(true)),

        async execute(interaction) {
            if (interaction.user.id !== OWNER_ID) return;

            const user = interaction.options.getUser('user');
            frozen.add(user.id);

            interaction.reply(`${user.username} frozen`);
        }
    },

    unfreeze: {
        data: new SlashCommandBuilder()
            .setName('ounfreeze')
            .setDescription('Unfreeze user')
            .addUserOption(o => o.setName('user').setRequired(true)),

        async execute(interaction) {
            if (interaction.user.id !== OWNER_ID) return;

            const user = interaction.options.getUser('user');
            frozen.delete(user.id);

            interaction.reply(`${user.username} unfrozen`);
        }
    }
};
