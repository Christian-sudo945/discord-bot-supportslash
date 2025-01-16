const { EmbedBuilder } = require('discord.js');
const yts = require('yt-search');
const { createAudioPlayer, createAudioResource, AudioPlayerStatus, joinVoiceChannel } = require('@discordjs/voice');
const ytdl = require('@distube/ytdl-core');
const { spawn } = require('child_process');
const ffmpeg = require('ffmpeg-static');
const { Player, QueryType } = require('discord-player');

module.exports = {
    name: 'play',
    description: 'Play music from a provided YouTube link or search query',
    options: [
        {
            name: 'query',
            type: 3,
            description: 'The search query or YouTube link',
            required: true,
        },
    ],
    async run(client, interaction) {
        const query = interaction.options.getString('query');
        const voiceChannel = interaction.member.voice.channel;

        if (!voiceChannel) return interaction.reply({ content: 'You need to join a voice channel first!', ephemeral: true });
        const permissions = voiceChannel.permissionsFor(interaction.client.user);
        if (!permissions.has('CONNECT') || !permissions.has('SPEAK')) return interaction.reply({ content: 'I need permissions to join and speak in your voice channel!', ephemeral: true });

        if (!client.player) {
            client.player = new Player(client);
            client.player.on('trackStart', (queue, track) => {
                queue.metadata.send({
                    embeds: [
                        new EmbedBuilder()
                            .setColor('#00FF00')
                            .setTitle('Now Playing 🎶')
                            .setDescription(`[${track.title}](${track.url})`)
                            .setThumbnail(track.thumbnail)
                            .addFields({ name: 'Requested By', value: queue.metadata.user.username, inline: true }),
                    ],
                });
            });
            client.player.on('queueEnd', (queue) => queue.metadata.send('✅ | Queue finished!'));
        }

        try {
            const queue = client.player.createQueue(interaction.guild, {
                metadata: {
                    channel: interaction.channel,
                    user: interaction.user,
                },
            });

            if (!queue.connection) await queue.connect(voiceChannel);

            const result = await client.player.search(query, {
                requestedBy: interaction.user,
                searchEngine: QueryType.AUTO,
            });

            if (!result || !result.tracks.length) return interaction.reply({ content: 'No results found!', ephemeral: true });

            const track = result.tracks[0];
            queue.addTrack(track);
            if (!queue.playing) await queue.play();

            interaction.reply({ content: `🎶 | Queued **${track.title}**!` });
        } catch (err) {
            try {
                const res = await yts(query);
                const video = res.videos[0];

                if (!video) return interaction.reply({ content: 'No videos found for your search query!', ephemeral: true });

                const videoUrl = video.url;
                const videoTitle = video.title;
                const videoThumbnail = video.thumbnail;

                const stream = ytdl(videoUrl, {
                    filter: 'audioonly',
                    quality: 'highestaudio',
                    highWaterMark: 1 << 25,
                });

                const ffmpegArgs = [
                    '-f', 'mp3',
                    '-ar', '44100',
                    '-ac', '2',
                    '-b:a', '192k',
                    '-i', 'pipe:0',
                    'pipe:1',
                ];

                const ffmpegProcess = spawn(ffmpeg, ffmpegArgs);
                stream.pipe(ffmpegProcess.stdin);

                const connection = joinVoiceChannel({
                    channelId: voiceChannel.id,
                    guildId: interaction.guild.id,
                    adapterCreator: interaction.guild.voiceAdapterCreator,
                });

                const resource = createAudioResource(ffmpegProcess.stdout);
                const player = createAudioPlayer();
                player.play(resource);
                connection.subscribe(player);

                player.on(AudioPlayerStatus.Playing, () => {
                    const embed = new EmbedBuilder()
                        .setColor('#00FF00')
                        .setTitle('Now Playing 🎶')
                        .setDescription(`[${videoTitle}](${videoUrl})`)
                        .setThumbnail(videoThumbnail)
                        .addFields({ name: 'Requested By', value: interaction.user.username, inline: true });

                    interaction.reply({ embeds: [embed] });
                });

                player.on('error', (error) => {
                    connection.disconnect();
                    interaction.reply({ content: 'An error occurred while playing the music.' });
                });
            } catch (manualError) {
                interaction.reply({ content: 'An error occurred while processing your request.', ephemeral: true });
            }
        }
    },
};
