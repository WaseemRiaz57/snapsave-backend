const express = require('express');
const youtubedl = require('youtube-dl-exec');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());

// Cookies file ka pakka rasta (Absolute Path) taake server ko laazmi mil jaye
const cookiesPath = path.join(__dirname, 'cookies.txt');

// 1. ngrok warning bypass middleware
app.use((req, res, next) => {
    res.setHeader('ngrok-skip-browser-warning', 'true');
    next();
});

// 2. Welcome Route
app.get('/', (req, res) => {
    res.send('<h1>SnapSave Backend is LIVE!</h1><p>Bot block fix applied with cookies.</p>');
});

// 3. Video info route
app.get('/api/info', async (req, res) => {
    const videoUrl = req.query.url;
    if (!videoUrl) return res.status(400).json({ error: "URL is required" });

    try {
        // Yeh line humein logs mein batayegi ke naya code chal raha hai
        console.log("Tracker: Cookies ka rasta yeh hai ->", cookiesPath);

        const output = await youtubedl(videoUrl, {
            dumpJson: true,
            skipDownload: true,
            noWarnings: true,
            cookies: cookiesPath // YouTube bot block ko bypass karne ke liye
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
    
    // Title ko saaf karein
    const cleanTitle = title ? title.replace(/[^a-zA-Z0-9 ]/g, "") : "snapsave_video";
    res.setHeader('Content-Disposition', `attachment; filename="${cleanTitle}.${format}"`);
    
    const args = {
        output: '-', 
        cookies: cookiesPath // YouTube bot block ko bypass karne ke liye
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

// 5. Port Configuration
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));