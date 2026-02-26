const express = require('express');
const cors = require('cors');
const ytdl = require('@distube/ytdl-core');

const app = express();
app.use(cors());

app.use((req, res, next) => {
    res.setHeader('ngrok-skip-browser-warning', 'true');
    next();
});

app.get('/', (req, res) => {
    res.send('<h1>SnapSave Backend is LIVE!</h1><p>Native ytdl-core Engine Active (No external APIs).</p>');
});

// 3. Video info route
app.get('/api/info', async (req, res) => {
    const videoUrl = req.query.url;
    if (!videoUrl) return res.status(400).json({ error: "URL is required" });

    try {
        console.log("Tracker: Native ytdl-core se info fetch ho rahi hai...");
        
        // Native package se basic info nikalna
        const info = await ytdl.getBasicInfo(videoUrl);
        
        res.json({
            title: info.videoDetails.title,
            thumbnail: info.videoDetails.thumbnails[0].url,
            uploader: info.videoDetails.author.name
        });
    } catch (e) {
        console.error("Info Fetch Error:", e);
        res.status(400).json({ error: "Invalid URL ya YouTube ne request block kar di." });
    }
});

// 4. Download route (Native Stream)
app.get('/api/download', async (req, res) => {
    const { url, format, title } = req.query;
    
    try {
        console.log(`Tracker: Native download start kar diya gaya hai (${format})...`);
        const cleanTitle = title ? title.replace(/[^a-zA-Z0-9 ]/g, "") : "snapsave_video";
        
        // Browser ko batana ke file download karni hai
        res.header('Content-Disposition', `attachment; filename="${cleanTitle}.${format}"`);
        
        if (format === 'mp3') {
            // Sirf Audio stream
            ytdl(url, { filter: 'audioonly', quality: 'highestaudio' }).pipe(res);
        } else {
            // Audio + Video (MPEG-4)
            ytdl(url, { filter: 'audioandvideo', quality: 'highest' }).pipe(res);
        }

    } catch (error) {
        console.error('Download Error:', error);
        res.status(500).send(`<h3>Server Error:</h3><p>Video stream link fail ho gaya. Error: ${error.message}</p>`);
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));