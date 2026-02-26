const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());

app.use((req, res, next) => {
    res.setHeader('ngrok-skip-browser-warning', 'true');
    next();
});

app.get('/', (req, res) => {
    res.send('<h1>SnapSave Backend is LIVE!</h1><p>Official OEmbed + Premium Proxy APIs Active.</p>');
});

// 3. Video info route (100% Working Official OEmbed API Wapis Aa Gaya!)
app.get('/api/info', async (req, res) => {
    const videoUrl = req.query.url;
    if (!videoUrl) return res.status(400).json({ error: "URL is required" });

    try {
        console.log("Tracker: Official YouTube API se data fetch ho raha hai (Thumbnail ke liye)...");
        
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

// 4. Download Route (Premium WhatsApp Bot APIs - No IP Ban)
app.get('/api/download', async (req, res) => {
    const { url, format } = req.query;
    let finalDownloadUrl = null;

    console.log(`Tracker: Proxy APIs se ${format} link dhoondna shuru...`);

    // API 1: BK9 API (Boht fast aur stable)
    if (!finalDownloadUrl) {
        try {
            console.log("Tracker: Trying BK9 API...");
            const resApi = await fetch(`https://bk9.fun/download/youtube?url=${encodeURIComponent(url)}`);
            const data = await resApi.json();
            
            if (data && data.status && data.BK9) {
                finalDownloadUrl = format === 'mp3' ? data.BK9.mp3 : data.BK9.mp4;
                console.log("Tracker: Kamyabi! BK9 se link mil gaya.");
            }
        } catch (e) {
            console.log("Tracker: ❌ BK9 failed.");
        }
    }

    // API 2: RyzenDesu API (Solid Backup)
    if (!finalDownloadUrl) {
        try {
            console.log("Tracker: Trying RyzenDesu API...");
            const endpoint = format === 'mp3' ? 'ytmp3' : 'ytmp4';
            const resApi = await fetch(`https://api.ryzendesu.vip/api/downloader/${endpoint}?url=${encodeURIComponent(url)}`);
            const data = await resApi.json();
            
            if (data && data.url) {
                finalDownloadUrl = data.url;
                console.log("Tracker: Kamyabi! RyzenDesu se link mil gaya.");
            }
        } catch (e) {
            console.log("Tracker: ❌ RyzenDesu failed.");
        }
    }

    // Agar link mil gaya toh user ko direct video de do
    if (finalDownloadUrl) {
        res.redirect(finalDownloadUrl);
    } else {
        res.status(500).send(`<h3>Server Error:</h3><p>Maazrat, is waqt saari proxy APIs overload hain. Thori der baad try karein.</p>`);
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));