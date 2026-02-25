const express = require('express');
const youtubedl = require('youtube-dl-exec');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());

// Cookies file ka pakka rasta
const cookiesPath = path.join(__dirname, 'cookies.txt');

app.use((req, res, next) => {
    res.setHeader('ngrok-skip-browser-warning', 'true');
    next();
});

app.get('/', (req, res) => {
    res.send('<h1>SnapSave Backend is LIVE!</h1><p>Bot block fixed, Mobile API active.</p>');
});

// 3. Video info route
app.get('/api/info', async (req, res) => {
    const videoUrl = req.query.url;
    if (!videoUrl) return res.status(400).json({ error: "URL is required" });

    try {
        console.log("Tracker: Mobile API Client aur Cookies lag gaye hain.");

        const output = await youtubedl(videoUrl, {
            dumpJson: true,
            skipDownload: true,
            // noWarnings hata diya taake errors na chupein
            cookies: cookiesPath, 
            forceIpv4: true,
            extractorArgs: 'youtube:player_client=android,ios' // NAYI TABDEELI: Mobile API Trick
        });
        res.json(output);
    } catch (e) {
        console.error("Info Fetch Error:", e);
        res.status(400).json({ error: "Invalid URL or backend error" });
    }
});

// 4. Download route
app.get('/api/download', (req, res) => {
    const { url, format, title } = req.query;
    
    const cleanTitle = title ? title.replace(/[^a-zA-Z0-9 ]/g, "") : "snapsave_video";
    res.setHeader('Content-Disposition', `attachment; filename="${cleanTitle}.${format}"`);
    
    const args = {
        output: '-', 
        cookies: cookiesPath, 
        forceIpv4: true,
        extractorArgs: 'youtube:player_client=android,ios' // NAYI TABDEELI: Mobile API Trick
    };

    if (format === 'mp3') {
        args.extractAudio = true;
        args.audioFormat = 'mp3';
    } else {
        args.format = 'bestvideo+bestaudio/best';
    }

    const subprocess = youtubedl.exec(url, args);
    subprocess.stdout.pipe(res);

    subprocess.on('error', (err) => {
        console.error('Download Error:', err);
    });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));