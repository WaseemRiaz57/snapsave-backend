const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());

app.use((req, res, next) => {
    res.setHeader('ngrok-skip-browser-warning', 'true');
    next();
});

app.get('/', (req, res) => {
    res.send('<h1>SnapSave Backend is LIVE!</h1><p>VIP RapidAPI (YT-API) Active.</p>');
});

// YouTube URL se 11 hindo ka Video ID nikalne ka formula
function extractVideoId(url) {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=|shorts\/)|youtu\.be\/)([^"&?\/\s]{11})/gi;
    const match = regex.exec(url);
    return match ? match[1] : null;
}

// 3. Video info route (Official OEmbed - 100% Working)
app.get('/api/info', async (req, res) => {
    const videoUrl = req.query.url;
    if (!videoUrl) return res.status(400).json({ error: "URL is required" });
    try {
        const response = await fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(videoUrl)}&format=json`);
        const data = await response.json();
        res.json({ title: data.title, thumbnail: data.thumbnail_url, uploader: data.author_name });
    } catch (e) { 
        res.status(400).json({ error: "Invalid URL." }); 
    }
});

// 4. Download Route (RapidAPI VIP Route)
app.get('/api/download', async (req, res) => {
    const { url, format } = req.query;
    const videoId = extractVideoId(url);

    if (!videoId) return res.status(400).send("<h3>Error:</h3><p>Invalid Video ID.</p>");

    console.log(`Tracker: RapidAPI (YT-API) se ${format} link dhoondna shuru... ID: ${videoId}`);

    // 👇 Tasweer se li gayi aapki API Key 👇
    const RAPID_API_KEY = "50d7021205msh38d3b9a1afbceaap1ee050jsnfaffbec75639"; 
    const RAPID_API_HOST = "yt-api.p.rapidapi.com";

    const options = {
        method: 'GET',
        headers: {
            'x-rapidapi-key': RAPID_API_KEY,
            'x-rapidapi-host': RAPID_API_HOST
        }
    };

    try {
        const response = await fetch(`https://${RAPID_API_HOST}/video/info?id=${videoId}`, options);
        const data = await response.json();

        let finalDownloadUrl = null;

        // Step 1: Normal tareeqay se link dhoondna
        const formats = data?.streamingData?.formats || [];
        const adaptiveFormats = data?.streamingData?.adaptiveFormats || [];

        if (format === 'mp3') {
            const audioStreams = adaptiveFormats.filter(f => f.mimeType && f.mimeType.includes('audio'));
            if (audioStreams.length > 0) finalDownloadUrl = audioStreams[0].url;
        } else {
            const videoStreams = formats.filter(f => f.mimeType && f.mimeType.includes('video/mp4'));
            if (videoStreams.length > 0) finalDownloadUrl = videoStreams[0].url;
        }

        // Step 2: The Hacker Fallback (Agar uper se link na mile)
        if (!finalDownloadUrl && data) {
            console.log("Tracker: Standard JSON array fail, now deep searching...");
            const rawString = JSON.stringify(data);
            // JSON ke andar se direct googlevideo ka link nikalne ka Jadoo
            const urlRegex = /(https:\/\/[^\s"']+(?:googlevideo\.com\/videoplayback)[^\s"']+)/g;
            const matches = rawString.match(urlRegex);
            if (matches && matches.length > 0) {
                finalDownloadUrl = matches[0];
            }
        }

        // Final Faisla
        if (finalDownloadUrl) {
            console.log("Tracker: Kamyabi! VIP link mil gaya.");
            res.redirect(finalDownloadUrl);
        } else {
            // Agar koi error aye toh safaid screen par error show karega taake humein pata chale
            res.send(`<h3>API Error: Link nahi mila.</h3><p>Data: ${JSON.stringify(data).substring(0, 1000)}...</p>`);
        }

    } catch (error) {
        console.error('Download Error:', error);
        res.status(500).send(`<h3>Server Error:</h3><p>API connect nahi ho rahi.</p>`);
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));