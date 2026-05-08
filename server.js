const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const iconv = require('iconv-lite');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static('public'));

app.get('/api/posts', async (req, res) => {
    try {
        // We fetch as arraybuffer to handle Korean encoding (EUC-KR)
        const response = await axios.get('https://housechurchministries.org/html/main/main.php', {
            responseType: 'arraybuffer'
        });
        
        // Decode the Korean text
        const html = iconv.decode(response.data, 'euc-kr');
        const $ = cheerio.load(html);
        const posts = [];

        // This looks for links that typically lead to board posts on this site
        $('a').each((i, el) => {
            const text = $(el).text().trim();
            const link = $(el).attr('href') || '';
            
            if (link.includes('board.php') && text.length > 5) {
                posts.push({
                    title: text,
                    url: `https://housechurchministries.org/html/main/${link}`
                });
            }
        });

        res.json(posts.slice(0, 12)); // Return the 12 latest
    } catch (error) {
        res.status(500).json({ error: "Failed to scrape data" });
    }
});

app.listen(PORT, '0.0.0.0', () => console.log(`Proxy running on port ${PORT}`));