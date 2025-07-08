const express = require('express');
const axios = require('axios');

const app = express();
const port = 3000;

app.use(express.json());
app.use(express.static('public'));

app.post('/api/chat', async (req, res) => {
  try {
    const response = await axios.post('https://api.deepseek.com/v1/chat/completions', {
      messages: [{ role: "user", content: req.body.message }],
      model: "deepseek-chat"
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer sk-b40ef283929840f9b54d028b02fec6cf'
      }
    });
    res.json({ response: response.data.choices[0].message.content });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to get response from DeepSeek API' });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});