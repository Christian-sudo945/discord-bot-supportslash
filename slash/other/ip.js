const { EmbedBuilder, Colors } = require("discord.js");

module.exports = {
    name: "ip",
    description: "View the server IP address.",
    options: [
        {
            name: "server",
            description: "The server to view the IP address for.",
            type: 1,  
            required: false
        }
    ],
    run: async (client, interaction) => {

        const serverName = interaction.options.getString("server") || "classicroleplay"; 

        const serverIPs = {
            "classicroleplay": "samp.classicroleplay.xyz",
            "otherServer": "other.server.ip.address", 
        };

        const serverIP = serverIPs[serverName] || "Unknown Server"; 

        const embed = new EmbedBuilder()
            .setTitle("Server Information 🔒 ")
            .setDescription(`**Server IP Address for ${serverName}:** \`${serverIP}\`\n\nUse this IP to connect to our game server or related services. Be sure to check for any specific ports if needed.`)
            .setColor(Colors.Blue)
            .setTimestamp();

        return interaction.reply({ embeds: [embed] }).catch(err => {
            console.error("Error sending reply:", err);
        });
    },
};