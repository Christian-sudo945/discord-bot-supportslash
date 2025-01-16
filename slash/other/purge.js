const { EmbedBuilder, Colors } = require("discord.js");

module.exports = {
    name: "purge",
    description: "Delete a specified number of messages in the channel.",
    options: [
        {
            name: "amount",
            description: "The number of messages to delete.",
            type: 4, 
            required: true,
        }
    ],
    run: async (client, interaction) => {
        const amount = interaction.options.getInteger("amount");

        if (!interaction.member.permissions.has("MANAGE_MESSAGES")) {
            return interaction.reply({
                content: "You don't have permission to purge messages.",
                ephemeral: true,
            });
        }

        if (amount < 1 || amount > 100) {
            return interaction.reply({
                content: "Please specify a number between 1 and 100.",
                ephemeral: true,
            });
        }

        try {
            
            const deletedMessages = await interaction.channel.bulkDelete(amount, true);

          
            const embed = new EmbedBuilder()
                .setTitle("🧹 Purge Completed!")
                .setDescription(`Successfully deleted ${deletedMessages.size} messages.`)
                .setColor(Colors.Green)
                .setTimestamp();

                return interaction.reply({
                    embeds: [embed],
                    ephemeral: true, 
                });
            } catch (error) {
                return interaction.reply({
                    content: "There was an error trying to purge messages in this channel.",
                    ephemeral: true, 
                });
        }
    },
};
