const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const PORT = 4002;

app.use(bodyParser.json());

app.post('/api/ask', (req, res) => {
  const { question } = req.body;
  // 这里将集成 DeepSeek 的逻辑
  res.json({ answer: `这是对问题 "${question}" 的模拟回答。` });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});