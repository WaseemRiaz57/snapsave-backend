const express = require('express');
const youtubedl = require('youtube-dl-exec');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());

// Cookies lazmi chahiye taake bot block na ho
const cookiesPath = path.join(__dirname, 'cookies.txt');

app.use((req, res, next) => {
    res.setHeader('ngrok-skip-browser-warning', 'true');
    next();
});

app.get('/', (req, res) => {
    res.send('<h1>SnapSave Backend is LIVE!</h1><p>Smart TV API Active.</p>');
});

// 3. Video info route
app.get('/api/info', async (req, res) => {
    const videoUrl = req.query.url;
    if (!videoUrl) return res.status(400).json({ error: "URL is required" });

    try {
        console.log("Tracker: Smart TV (tv, tvhtml5) client lagaya gaya hai.");

        const output = await youtubedl(videoUrl, {
            dumpJson: true,
            skipDownload: true,
            cookies: cookiesPath, 
            forceIpv4: true,
            // 👇 THE BOSS LEVEL FIX: Smart TV API 👇
            extractorArgs: 'youtube:player_client=tv,tvhtml5' 
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
        // 👇 JADOO KI LINE YAHAN BHI 👇
        extractorArgs: 'youtube:player_client=tv,tvhtml5'
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