const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());

app.use((req, res, next) => {
    res.setHeader('ngrok-skip-browser-warning', 'true');
    next();
});

app.get('/', (req, res) => {
    res.send('<h1>SnapSave Backend is LIVE!</h1><p>Unstoppable Piped Proxy Network Active.</p>');
});

// YouTube URL se 11 hindo ka Video ID nikalne ka formula
function extractVideoId(url) {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=|shorts\/)|youtu\.be\/)([^"&?\/\s]{11})/gi;
    const match = regex.exec(url);
    return match ? match[1] : null;
}

// 3. Video info route (Official YouTube OEmbed API)
app.get('/api/info', async (req, res) => {
    const videoUrl = req.query.url;
    if (!videoUrl) return res.status(400).json({ error: "URL is required" });

    try {
        console.log("Tracker: Official YouTube API se data fetch ho raha hai...");
        const infoUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(videoUrl)}&format=json`;
        const response = await fetch(infoUrl);
        const data = await response.json();

        res.json({
            title: data.title,
            thumbnail: data.thumbnail_url,
            uploader: data.author_name
        });
    } catch (e) {
        console.error("Info Fetch Error:", e);
        res.status(400).json({ error: "Invalid URL. Sirf valid YouTube link dalein." });
    }
});

// 4. Download route (Piped Proxy Network - Ultimate Fallback)
app.get('/api/download', async (req, res) => {
    const { url, format } = req.query;
    const videoId = extractVideoId(url);

    if (!videoId) {
        return res.status(400).send(`<h3>Error:</h3><p>Invalid YouTube URL. Please check your link.</p>`);
    }

    // Duniya ke top 4 Piped API servers (Boht stable aur fast)
    const pipedServers = [
        'https://pipedapi.kavin.rocks',
        'https://pipedapi.tokhmi.xyz',
        'https://pipedapi.smnz.de',
        'https://api.piped.projectsegfau.lt'
    ];

    let finalDownloadUrl = null;
    console.log(`Tracker: Piped API se ${format} link dhoondna shuru (Video ID: ${videoId})...`);

    // Loop chalayega aur har Piped server ko try karega
    for (const server of pipedServers) {
        try {
            console.log(`Tracker: Try kar raha hoon -> ${server}`);
            
            const response = await fetch(`${server}/streams/${videoId}`);
            if (response.ok) {
                const data = await response.json();

                if (format === 'mp3') {
                    // MP3 ke liye sab se behtar audio stream nikalna
                    if (data.audioStreams && data.audioStreams.length > 0) {
                        finalDownloadUrl = data.audioStreams[0].url;
                        console.log(`Tracker: Kamyabi! MP3 Link mil gaya -> ${server} se`);
                        break;
                    }
                } else {
                    // MP4 ke liye woh stream jis mein awaz aur video dono hon (videoOnly: false)
                    if (data.videoStreams && data.videoStreams.length > 0) {
                        const combinedStream = data.videoStreams.find(s => s.videoOnly === false && s.format === 'MPEG_4');
                        if (combinedStream) {
                            finalDownloadUrl = combinedStream.url;
                            console.log(`Tracker: Kamyabi! MP4 Link mil gaya -> ${server} se`);
                            break;
                        } else {
                            // Agar combined na mile toh pehla standard MP4 de do
                            const firstMp4 = data.videoStreams.find(s => s.format === 'MPEG_4');
                            if(firstMp4){
                                finalDownloadUrl = firstMp4.url;
                                break;
                            }
                        }
                    }
                }
            }
        } catch (error) {
            console.log(`Tracker: ❌ ${server} down ya slow hai. Agla try kar raha hoon...`);
        }
    }

    // Agar link mil gaya toh user ko direct video par bhej do
    if (finalDownloadUrl) {
        res.redirect(finalDownloadUrl);
    } else {
        res.status(500).send(`<h3>Server Error:</h3><p>Maazrat, kisi bhi Piped server ko video stream nahi mili. Shayad video private ya age-restricted hai.</p>`);
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));