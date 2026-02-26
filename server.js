const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());

app.use((req, res, next) => {
    res.setHeader('ngrok-skip-browser-warning', 'true');
    next();
});

app.get('/', (req, res) => {
    res.send('<h1>SnapSave Backend is LIVE!</h1><p>Hacker Loop (Multi-Scraper APIs) Active.</p>');
});

// 3. Video info route (Official OEmbed - 100% Working for Thumbnails)
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

// 4. Download Route (The Hacker Loop - 4 APIs in a row)
app.get('/api/download', async (req, res) => {
    const { url, format } = req.query;
    let finalDownloadUrl = null;

    console.log(`Tracker: Hacker Loop Started for ${format}...`);

    // API 1: BK9 (Boht popular hai)
    if (!finalDownloadUrl) {
        try {
            console.log("Tracker: Trying API 1 (BK9)...");
            const resApi = await fetch(`https://bk9.fun/download/youtube?url=${encodeURIComponent(url)}`);
            const data = await resApi.json();
            if (data?.BK9) {
                finalDownloadUrl = format === 'mp3' ? data.BK9.mp3 : data.BK9.mp4;
                if (finalDownloadUrl) console.log("Tracker: Kamyabi! BK9 se link mil gaya.");
            }
        } catch (e) { console.log("Tracker: ❌ API 1 failed."); }
    }

    // API 2: RyzenDesu (Strong backup)
    if (!finalDownloadUrl) {
        try {
            console.log("Tracker: Trying API 2 (RyzenDesu)...");
            const endpoint = format === 'mp3' ? 'ytmp3' : 'ytmp4';
            const resApi = await fetch(`https://api.ryzendesu.vip/api/downloader/${endpoint}?url=${encodeURIComponent(url)}`);
            const data = await resApi.json();
            if (data?.url) {
                finalDownloadUrl = data.url;
                console.log("Tracker: Kamyabi! RyzenDesu se link mil gaya.");
            }
        } catch (e) { console.log("Tracker: ❌ API 2 failed."); }
    }

    // API 3: Siputzx (Latest bypasser)
    if (!finalDownloadUrl) {
        try {
            console.log("Tracker: Trying API 3 (Siputzx)...");
            const endpoint = format === 'mp3' ? 'ytmp3' : 'ytmp4';
            const resApi = await fetch(`https://api.siputzx.my.id/api/d/${endpoint}?url=${encodeURIComponent(url)}`);
            const data = await resApi.json();
            // Inka data structure thora alag hota hai
            const foundUrl = data?.data?.dl || data?.data?.url || data?.url;
            if (foundUrl) {
                finalDownloadUrl = foundUrl;
                console.log("Tracker: Kamyabi! Siputzx se link mil gaya.");
            }
        } catch (e) { console.log("Tracker: ❌ API 3 failed."); }
    }

    // API 4: Vreden (Final fallback)
    if (!finalDownloadUrl) {
        try {
            console.log("Tracker: Trying API 4 (Vreden)...");
            const endpoint = format === 'mp3' ? 'ytmp3' : 'ytmp4';
            const resApi = await fetch(`https://api.vreden.web.id/api/${endpoint}?url=${encodeURIComponent(url)}`);
            const data = await resApi.json();
            const foundUrl = data?.result?.download?.url || data?.result?.url || data?.url;
            if (foundUrl) {
                finalDownloadUrl = foundUrl;
                console.log("Tracker: Kamyabi! Vreden se link mil gaya.");
            }
        } catch (e) { console.log("Tracker: ❌ API 4 failed."); }
    }

    // Aakhri faisla: Agar charo mein se kisi ek ne bhi link diya toh user ko bhej do
    if (finalDownloadUrl) {
        res.redirect(finalDownloadUrl);
    } else {
        res.status(500).send(`<h3>Server Error:</h3><p>Maazrat, is waqt sari 4 Scraper APIs block ya down hain. Lagta hai YouTube ne un sab ko temporary block kiya hua hai.</p>`);
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));