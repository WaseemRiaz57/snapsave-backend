const express = require('express');
const youtubedl = require('youtube-dl-exec');
const cors = require('cors');

const app = express();
app.use(cors());

// 1. ngrok warning bypass middleware
app.use((req, res, next) => {
    res.setHeader('ngrok-skip-browser-warning', 'true');
    next();
});

// 2. Welcome Route
app.get('/', (req, res) => {
    res.send('<h1>SnapSave Backend is LIVE!</h1><p>Tumhara server sahi kaam kar raha hai Waseem.</p>');
});

// 3. Video info route (Cloud Ready - Removed W Drive)
app.get('/api/info', async (req, res) => {
    const videoUrl = req.query.url;
    if (!videoUrl) return res.status(400).json({ error: "URL is required" });

    try {
        // Naya tareeqa: Package use ho raha hai info nikalne ke liye
        const output = await youtubedl(videoUrl, {
            dumpJson: true,
            skipDownload: true,
            noWarnings: true
        });
        res.json(output);
    } catch (e) {
        console.error("Info Fetch Error:", e);
        res.status(400).json({ error: "Invalid URL or backend error" });
    }
});

// 4. Download route (Cloud Ready - Removed W Drive)
app.get('/api/download', (req, res) => {
    const { url, format, title } = req.query;
    
    // Title ko saaf karein (Sirf ABCD aur numbers allow karein)
    const cleanTitle = title ? title.replace(/[^a-zA-Z0-9 ]/g, "") : "snapsave_video";

    // Asli naam ko header mein set kiya
    res.setHeader('Content-Disposition', `attachment; filename="${cleanTitle}.${format}"`);
    
    // Naya tareeqa: Package use ho raha hai video download aur stream karne ke liye
    const args = {
        output: '-', // Data ko direct stream karne ke liye
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

// 5. Port Configuration (Cloud servers ke liye dynamic port)
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));