// api/chat.js

import { Configuration, OpenAIApi } from 'openai';

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY, // Securely stored in Vercel
});

const openai = new OpenAIApi(configuration);

// Define the 10 exercises
const exercises = [
    "Role-Playing Scenarios: Engage in simulated real-life situations.",
    "Vocabulary Quizzes: Test and expand your vocabulary.",
    "Pronunciation Drills: Focus on the correct pronunciation of challenging words.",
    "Sentence Formation: Construct grammatically correct sentences.",
    "Storytelling: Narrate stories to practice fluency.",
    "Question and Answer Sessions: Improve comprehension and response skills.",
    "Grammar Corrections: Receive gentle corrections on grammatical errors.",
    "Conversational Topics: Discuss various topics to build conversational skills.",
    "Listening Comprehension: Respond to simulated audio clips and related questions.",
    "Feedback Sessions: Get constructive feedback on your progress.",
];

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { message, conversation } = req.body;

    if (!message) {
        return res.status(400).json({ error: 'No message provided' });
    }

    try {
        // Combine system prompt with conversation history if available
        const systemPrompt = `
You are Speaking Master, a professional chatbot designed for English speaking practice and learning.
Your primary function is to assist users in practicing and improving their spoken English through interactive and engaging conversations.
Incorporate the following 10 different exercises to provide a diverse learning experience:
${exercises.map((ex, index) => `${index + 1}. **${ex}**`).join('\n')}

Maintain a fluid and engaging conversation by rotating through these exercises.
After completing an exercise, prompt the user to continue with the next one or choose a preferred exercise.
Ensure your responses are clear, encouraging, and tailored to help users enhance their speaking skills.
Keep track of the exercises already covered to avoid repetition until all have been utilized.
Encourage users to provide feedback on exercises to further tailor the learning experience.
`;

        // Prepare messages array
        const messages = [
            {
                role: 'system',
                content: systemPrompt,
            },
        ];

        // Append conversation history if provided
        if (conversation && Array.isArray(conversation)) {
            messages.push(...conversation);
        }

        // Append the latest user message
        messages.push({ role: 'user', content: message });

        const response = await openai.createChatCompletion({
            model: 'gpt-4', // Specify the desired model
            messages: messages,
            temperature: 0.7, // Balances creativity and coherence
            max_tokens: 500,   // Allows for more detailed responses
            top_p: 1,
            frequency_penalty: 0,
            presence_penalty: 0.6,
            stop: ["\n", " User:", " Bot:"],
        });

        const reply = response.data.choices[0].message.content.trim();

        // Optionally, extract updated conversation history
        const updatedConversation = [...messages, { role: 'assistant', content: reply }];

        res.status(200).json({ reply, conversation: updatedConversation });
    } catch (error) {
        console.error('OpenAI API Error:', error.response ? error.response.data : error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}
