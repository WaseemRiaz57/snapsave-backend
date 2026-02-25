const express = require('express');
const youtubedl = require('youtube-dl-exec');
const cors = require('cors');

const app = express();
app.use(cors());

app.use((req, res, next) => {
    res.setHeader('ngrok-skip-browser-warning', 'true');
    next();
});

app.get('/', (req, res) => {
    res.send('<h1>SnapSave Backend is LIVE!</h1><p>Pure Mobile API Active (No Cookies).</p>');
});

// 3. Video info route
app.get('/api/info', async (req, res) => {
    const videoUrl = req.query.url;
    if (!videoUrl) return res.status(400).json({ error: "URL is required" });

    try {
        console.log("Tracker: Pure Mobile API chal rahi hai (Bina Cookies ke).");

        const output = await youtubedl(videoUrl, {
            dumpJson: true,
            skipDownload: true,
            forceIpv4: true,
            extractorArgs: 'youtube:player_client=android,ios' // Sirf Mobile API
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
        forceIpv4: true,
        extractorArgs: 'youtube:player_client=android,ios' // Sirf Mobile API
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