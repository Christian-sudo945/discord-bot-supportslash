const { EmbedBuilder, Colors } = require("discord.js");

module.exports = {
    name: "help",
    description: "View bot slash commands.",
    options: [],
    run: async (client, interaction) => {

        const commands = client.slashCommands.map(x => `\`${x.name}\` - ${x.description}`).join("\n");

        const embed = new EmbedBuilder()
            .setTitle("💡 **Classic Dome Bot Commands**")
            .addFields(
            { name: "Commands", value: commands || "No commands available yet.", inline: false }
            )
            .setColor(Colors.Blurple)
            .setFooter({ text: "Type /help for more info about a command." })
            .setTimestamp()
            .setThumbnail("https://media.discordapp.net/attachments/1272657175256502394/1327520275255787570/c9b3d4cf-eb98-4ec1-83c1-f2c736d38e24.png?ex=67835d19&is=67820b99&hm=7aec98b57659df9f917df11f3685fcda8e4f96f18d75e310f79c23b3c7b57d09&=&format=webp&quality=lossless&width=468&height=468")

        return interaction.reply({ embeds: [embed] }).catch(err => {
            console.error("Error sending reply:", err);
        });
    },
};
