const express = require('express');
const cors = require('cors');
const { spawn } = require('child_process');

const app = express();
app.use(cors());

// 1. ngrok warning bypass middleware
app.use((req, res, next) => {
    res.setHeader('ngrok-skip-browser-warning', 'true');
    next();
});

// 2. Welcome Route (Ab "Cannot GET /" nahi aayega)
app.get('/', (req, res) => {
    res.send('<h1>SnapSave Backend is LIVE!</h1><p>Tumhara server sahi kaam kar raha hai Waseem.</p>');
});

// 3. Video info route
app.get('/api/info', (req, res) => {
    const videoUrl = req.query.url;
    // W:\my-tools wala full path use kiya hai
    const ytDlpPath = 'W:\\my-tools\\yt-dlp.exe'; 
    const process = spawn(ytDlpPath, ['--dump-json', '--skip-download', videoUrl]);

    let output = '';
    process.stdout.on('data', (data) => output += data);
    process.on('close', () => {
        try { res.json(JSON.parse(output)); }
        catch (e) { res.status(400).json({ error: "Invalid URL or yt-dlp error" }); }
    });
});

// 4. Download route
// 4. Download route (Updated for Dynamic Title)
app.get('/api/download', (req, res) => {
    // Frontend se url, format, aur title receive kiya
    const { url, format, title } = req.query;
    
    // Title ko saaf karein (Sirf ABCD aur numbers allow karein taake Windows error na de)
    const cleanTitle = title ? title.replace(/[^a-zA-Z0-9 ]/g, "") : "snapsave_video";

    // Asli naam ko header mein set kiya
    res.setHeader('Content-Disposition', `attachment; filename="${cleanTitle}.${format}"`);
    
    const ytDlpPath = 'W:\\my-tools\\yt-dlp.exe';
    const args = format === 'mp3' 
        ? ['-x', '--audio-format', 'mp3', '-o', '-', url] 
        : ['-f', 'bestvideo+bestaudio/best', '-o', '-', url];
        
    spawn(ytDlpPath, args).stdout.pipe(res);
});// 4. Download route (Updated for Dynamic Title)
app.get('/api/download', (req, res) => {
    // Frontend se url, format, aur title receive kiya
    const { url, format, title } = req.query;
    
    // Title ko saaf karein (Sirf ABCD aur numbers allow karein taake Windows error na de)
    const cleanTitle = title ? title.replace(/[^a-zA-Z0-9 ]/g, "") : "snapsave_video";

    // Asli naam ko header mein set kiya
    res.setHeader('Content-Disposition', `attachment; filename="${cleanTitle}.${format}"`);
    
    const ytDlpPath = 'W:\\my-tools\\yt-dlp.exe';
    const args = format === 'mp3' 
        ? ['-x', '--audio-format', 'mp3', '-o', '-', url] 
        : ['-f', 'bestvideo+bestaudio/best', '-o', '-', url];
        
    spawn(ytDlpPath, args).stdout.pipe(res);
});

app.listen(5000, () => console.log('Server is running on port the 5000'));