import OpenAI from "openai";

// for backward compatibility, you can still use `https://api.deepseek.com/v1` as `baseURL`.
const openai = new OpenAI({
  baseURL: 'https://api.deepseek.com',
  apiKey: 'sk-b40ef283929840f9b54d028b02fec6cf'
});

async function main() {
  const completion = await openai.chat.completions.create({
    messages: [{ role: "system", content: "You are a helpful assistant." }],
    model: "deepseek-chat",
  });

  console.log(completion.choices[0].message.content);
}

main();