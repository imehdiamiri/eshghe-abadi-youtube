const express = require('express');
const fs = require('fs');
const bodyParser = require('body-parser');
const { exec } = require('child_process');
const axios = require('axios');
const FormData = require('form-data');
const app = express();
const PORT = process.env.PORT || 3000;

const TELEGRAM_BOT_TOKEN = '7574745434:AAHC7KhZqBAS3NN0oDFj3Ijya-EvNpnkdpo';
const TELEGRAM_CHANNEL = '@eshgheabadi';

app.use(bodyParser.json());

const filePath = './latest_video.json';
if (!fs.existsSync(filePath)) {
  fs.writeFileSync(filePath, JSON.stringify({ videoId: "" }, null, 2));
}

app.get('/last', (req, res) => {
  try {
    const data = fs.readFileSync(filePath);
    const json = JSON.parse(data);
    res.json({ videoId: json.videoId || "" });
  } catch (err) {
    res.status(500).json({ error: 'Error reading video ID' });
  }
});

app.post('/update', (req, res) => {
  const { videoId } = req.body;
  if (!videoId) return res.status(400).json({ error: 'videoId required' });

  try {
    fs.writeFileSync(filePath, JSON.stringify({ videoId }, null, 2));
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Error saving video ID' });
  }
});

app.post('/upload', async (req, res) => {
  const { videoId, title } = req.body;
  if (!videoId || !title) return res.status(400).json({ error: 'Missing fields' });

  const url = `https://www.youtube.com/watch?v=${videoId}`;
  const filename = `${videoId}.mp4`;
  const caption = `${title}

@eshgheabadi 👈

📥 (اگر در پخش صدا یا تصویر مشکل داشتید از پخش‌کننده خارجی مانند VLC یا MX Player استفاده کنید)

#eshgheabadi #عشق_ابدی #جزیره_عشق_ابدی #eshghabadiofficial`;

  exec(`yt-dlp -f 'bestvideo[height<=480]+bestaudio/best[height<=480]' -o '${filename}' ${url}`, async (error) => {
    if (error) {
      console.error('Download error:', error);
      return res.status(500).json({ error: 'Download failed' });
    }

    try {
      const fileStream = fs.createReadStream(filename);
      const tgUrl = \`https://api.telegram.org/bot\${TELEGRAM_BOT_TOKEN}/sendVideo\`;

      const formData = new FormData();
      formData.append('chat_id', TELEGRAM_CHANNEL);
      formData.append('caption', caption);
      formData.append('video', fileStream, { filename });

      const headers = formData.getHeaders();
      await axios.post(tgUrl, formData, { headers });

      fs.unlinkSync(filename);
      res.json({ uploaded: true });
    } catch (err) {
      console.error('Telegram upload error:', err);
      res.status(500).json({ error: 'Telegram upload failed' });
    }
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
