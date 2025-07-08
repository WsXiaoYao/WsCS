document.getElementById('submit').addEventListener('click', async () => {
  const question = document.getElementById('question').value;
  if (!question) return;

  try {
    const response = await fetch('http://localhost:3000/api/ask', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question })
    });
    const data = await response.json();
    document.getElementById('answer').innerText = data.answer;
  } catch (error) {
    console.error('Error:', error);
    document.getElementById('answer').innerText = '请求失败，请重试。';
  }
});