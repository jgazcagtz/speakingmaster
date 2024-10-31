// api/chat.js

const { Configuration, OpenAIApi } = require('openai');

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY, // Securely stored in Vercel
});

const openai = new OpenAIApi(configuration);

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { message } = req.body;

    if (!message) {
        return res.status(400).json({ error: 'No message provided' });
    }

    try {
        const response = await openai.createChatCompletion({
            model: 'gpt-4', // Specify the desired model
            messages: [{ role: 'user', content: message }],
            // You can add more parameters here, such as temperature, max_tokens, etc.
        });

        const reply = response.data.choices[0].message.content.trim();
        res.status(200).json({ reply });
    } catch (error) {
        console.error('OpenAI API Error:', error.response ? error.response.data : error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}
