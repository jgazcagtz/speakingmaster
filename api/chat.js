// api/chat.js

import { Configuration, OpenAIApi } from 'openai';

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
            messages: [
                {
                    role: 'system',
                    content: `You are Speaking Master, a professional chatbot designed for English speaking practice and learning. 
                              Your function is to assist users in practicing and improving their spoken English through interactive conversations. 
                              Ensure your responses are clear, encouraging, and tailored to help users enhance their speaking skills.`,
                },
                { role: 'user', content: message },
            ],
            temperature: 0.7, // Adjust creativity level as needed
            max_tokens: 150,  // Adjust response length as needed
            top_p: 1,
            frequency_penalty: 0,
            presence_penalty: 0.6,
            stop: ["\n", " User:", " Bot:"],
        });

        const reply = response.data.choices[0].message.content.trim();
        res.status(200).json({ reply });
    } catch (error) {
        console.error('OpenAI API Error:', error.response ? error.response.data : error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}
