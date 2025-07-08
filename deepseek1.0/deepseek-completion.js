import OpenAI from "openai";

const openai = new OpenAI({
  baseURL: 'https://api.deepseek.com',
  apiKey: 'sk-b40ef283929840f9b54d028b02fec6cf'
});

async function getCompletion(prompt) {
  try {
    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "deepseek-chat",
    });
    return completion.choices[0].message.content;
  } catch (error) {
    console.error("Error calling DeepSeek API:", error);
    return "Failed to get completion.";
  }
}

// 示例用法
async function exampleUsage() {
  const response = await getCompletion("你好，请介绍一下你自己。");
  console.log(response);
}

exampleUsage();