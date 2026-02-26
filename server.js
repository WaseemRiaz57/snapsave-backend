const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());

app.use((req, res, next) => {
    res.setHeader('ngrok-skip-browser-warning', 'true');
    next();
});

app.get('/', (req, res) => {
    res.send('<h1>SnapSave Backend is LIVE!</h1><p>Free API Serverless Route Active (Zero Bans).</p>');
});

// 3. Video info route (Official YouTube OEmbed API)
app.get('/api/info', async (req, res) => {
    const videoUrl = req.query.url;
    if (!videoUrl) return res.status(400).json({ error: "URL is required" });

    try {
        console.log("Tracker: Official YouTube API se data fetch ho raha hai...");
        
        // Official YouTube API jo kabhi block nahi hoti
        const infoUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(videoUrl)}&format=json`;
        const response = await fetch(infoUrl);
        const data = await response.json();

        // Frontend ko info bhej di
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

// 4. Download route (Open-Source Cobalt API)
app.get('/api/download', async (req, res) => {
    const { url, format } = req.query;
    
    try {
        console.log(`Tracker: Cobalt API se ${format} ka direct link banaya ja raha hai...`);
        
        // Cobalt API se direct fast download link mangna
        const cobaltRes = await fetch('https://api.cobalt.tools/api/json', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36'
            },
            body: JSON.stringify({
                url: url,
                isAudioOnly: format === 'mp3',
                aFormat: format === 'mp3' ? 'mp3' : undefined,
                vQuality: '720'
            })
        });

        const data = await cobaltRes.json();
        
        if (data.url) {
            // JADOO: User ko seedha direct download link par bhej diya!
            res.redirect(data.url);
        } else {
            throw new Error("API Limit reached or invalid response");
        }
    } catch (error) {
        console.error('Download Error:', error);
        res.status(500).send("Video link abhi available nahi hai, thori der baad try karein.");
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));