require('dotenv').config();

const fs = require('fs');
const {
    Client,
    Collection,
    GatewayIntentBits,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    ActionRowBuilder
} = require('discord.js');

const mongoose = require('mongoose');


mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB connected"))
    .catch(err => {
        console.error("MongoDB error:", err);
        process.exit(1);
    });


const client = new Client({
    intents: [GatewayIntentBits.Guilds]
});

client.commands = new Collection();


const commandFiles = fs.readdirSync('./commands').filter(f => f.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.data.name, command);
}


client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}`);
});


client.on('interactionCreate', async interaction => {


    if (interaction.isChatInputCommand()) {
        const command = client.commands.get(interaction.commandName);
        if (command) return command.execute(interaction);
    }


    if (interaction.isButton()) {

        // Open order modal
        if (interaction.customId === 'open_order_modal') {

            const modal = new ModalBuilder()
                .setCustomId('order_modal')
                .setTitle('Order Form');

            const ipInput = new TextInputBuilder()
                .setCustomId('website_ip')
                .setLabel('Website IP')
                .setStyle(TextInputStyle.Short);

            const nameInput = new TextInputBuilder()
                .setCustomId('website_name')
                .setLabel('Website Name')
                .setStyle(TextInputStyle.Short);

            const filterInput = new TextInputBuilder()
                .setCustomId('filters')
                .setLabel('List of Filter Links you want')
                .setStyle(TextInputStyle.Paragraph);

            modal.addComponents(
                new ActionRowBuilder().addComponents(ipInput),
                new ActionRowBuilder().addComponents(nameInput),
                new ActionRowBuilder().addComponents(filterInput)
            );

            return interaction.showModal(modal);
        }


        if (interaction.customId.startsWith('respond_')) {

            const userId = interaction.customId.split('_')[1];

            const modal = new ModalBuilder()
                .setCustomId(`response_modal_${userId}`)
                .setTitle('Send Links');

            const linksInput = new TextInputBuilder()
                .setCustomId('links')
                .setLabel('Insert Links here')
                .setStyle(TextInputStyle.Paragraph);

            modal.addComponents(
                new ActionRowBuilder().addComponents(linksInput)
            );

            return interaction.showModal(modal);
        }
    }


    if (interaction.isModalSubmit()) {

        
        if (interaction.customId === 'order_modal') {

            const ip = interaction.fields.getTextInputValue('website_ip');
            const name = interaction.fields.getTextInputValue('website_name');
            const filters = interaction.fields.getTextInputValue('filters');

            const userId = interaction.user.id;

            try {
                await interaction.user.send("Your order has been received. You will get your links soon.");
            } catch {
                
            }

            const embed = {
                title: "📦 New Order",
                color: 0x2b2d31,
                fields: [
                    { name: "User", value: `<@${userId}>` },
                    { name: "Website IP", value: ip || "None" },
                    { name: "Website Name", value: name || "None" },
                    { name: "Filters", value: filters || "None" }
                ]
            };

            const components = [
                {
                    type: 1,
                    components: [
                        {
                            type: 2,
                            label: "Send Links",
                            style: 1,
                            custom_id: `respond_${userId}`
                        }
                    ]
                }
            ];

            await fetch(process.env.WEBHOOK_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    embeds: [embed],
                    components
                })
            });

            return interaction.reply({
                content: "Order submitted! Check your DMs.",
                ephemeral: true
            });
        }

  
        if (interaction.customId.startsWith('response_modal_')) {

            const userId = interaction.customId.split('_')[2];
            const links = interaction.fields.getTextInputValue('links');

            try {
                const user = await client.users.fetch(userId);

                await user.send(`📦 Your Order is Ready!\n\n${links}`);

                return interaction.reply({
                    content: "Links sent to user.",
                    ephemeral: true
                });

            } catch (err) {
                return interaction.reply({
                    content: "Failed to DM user.",
                    ephemeral: true
                });
            }
        }
    }
});


client.login(process.env.TOKEN);
