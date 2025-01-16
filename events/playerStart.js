module.exports = (client) => {
    const { Player } = require('discord-player');
    
    client.on('playerStart', (queue, track) => {
        
        const channel = queue.metadata.channel;

        const embed = new EmbedBuilder()
            .setColor('#00FF00')
            .setTitle('Now Playing 🎶')
            .setDescription(`[${track.title}](${track.url})`)
            .setThumbnail(track.thumbnail)
            .addFields(
                { name: 'Duration', value: track.duration, inline: true },
                { name: 'Requested By', value: track.requestedBy.username, inline: true }
            );

        channel.send({ embeds: [embed] }).catch(console.error);
    });
};
