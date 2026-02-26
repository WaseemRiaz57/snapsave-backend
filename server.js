const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());

app.use((req, res, next) => {
    res.setHeader('ngrok-skip-browser-warning', 'true');
    next();
});

app.get('/', (req, res) => {
    res.send('<h1>SnapSave Backend is LIVE!</h1><p>Auto-Fallback Cobalt API Active.</p>');
});

// 3. Video info route
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

// 4. Download route (Auto-Fallback System)
app.get('/api/download', async (req, res) => {
    const { url, format } = req.query;
    
    // 4 Behtareen aur fast community servers ki list
    const cobaltServers = [
        'https://api.cobalt.ac/',
        'https://cobalt.kwiatekmateusz.pl/',
        'https://co.eepy.moe/',
        'https://cobalt.foo.software/'
    ];

    let finalDownloadUrl = null;

    console.log(`Tracker: Direct link dhoondna shuru...`);

    // Loop chalayega aur har server ko baari baari try karega
    for (const server of cobaltServers) {
        try {
            console.log(`Tracker: Try kar raha hoon -> ${server}`);
            
            const cobaltRes = await fetch(server, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
                },
                body: JSON.stringify({
                    url: url,
                    isAudioOnly: format === 'mp3',
                    aFormat: format === 'mp3' ? 'mp3' : undefined,
                    vQuality: '720'
                })
            });

            if (cobaltRes.ok) {
                const data = await cobaltRes.json();
                if (data.url) {
                    finalDownloadUrl = data.url;
                    console.log(`Tracker: Kamyabi! Link mil gaya -> ${server} se`);
                    break; // Link mil gaya toh loop torh do
                }
            }
        } catch (error) {
            console.log(`Tracker: ❌ ${server} down hai. Agla try kar raha hoon...`);
        }
    }

    // Agar link mil gaya toh user ko bhej do
    if (finalDownloadUrl) {
        res.redirect(finalDownloadUrl);
    } else {
        // Agar charo servers down hon
        res.status(500).send(`<h3>Server Error:</h3><p>Maazrat, is waqt saare free API servers down hain. Thori der baad dobara try karein.</p>`);
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));