// api/chat.js

import { Configuration, OpenAIApi } from 'openai';

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY, // Securely stored in Vercel
});

const openai = new OpenAIApi(configuration);

// Define the 50 exercises and role-plays
const exercises = [
    "1. **Role-Playing Scenarios**: Simulate real-life situations like ordering food at a restaurant.",
    "2. **Vocabulary Quizzes**: Test and expand your vocabulary with themed word lists.",
    "3. **Pronunciation Drills**: Practice the correct pronunciation of challenging words.",
    "4. **Sentence Formation**: Construct grammatically correct sentences based on prompts.",
    "5. **Storytelling**: Narrate short stories to enhance fluency and coherence.",
    "6. **Question and Answer Sessions**: Improve comprehension and response skills.",
    "7. **Grammar Corrections**: Receive gentle corrections on grammatical errors.",
    "8. **Conversational Topics**: Discuss various topics like technology, travel, and culture.",
    "9. **Listening Comprehension**: Respond to simulated audio clips and related questions.",
    "10. **Feedback Sessions**: Get constructive feedback on your progress.",
    "11. **Descriptive Exercises**: Describe images or scenarios in detail.",
    "12. **Opinion Sharing**: Express your opinions on different subjects.",
    "13. **Debate Practice**: Engage in friendly debates to build persuasive skills.",
    "14. **Idiomatic Expressions**: Learn and use common English idioms.",
    "15. **Synonyms and Antonyms**: Identify and use synonyms and antonyms of given words.",
    "16. **Paraphrasing**: Rephrase sentences to demonstrate understanding.",
    "17. **Dialogue Completion**: Complete dialogues with appropriate responses.",
    "18. **Role Reversal**: Switch roles in a conversation to view different perspectives.",
    "19. **Time Management Conversations**: Discuss scheduling and time-related topics.",
    "20. **Future Plans Discussion**: Talk about your future goals and aspirations.",
    "21. **Past Experiences Sharing**: Share and discuss past experiences.",
    "22. **Current Events Discussion**: Talk about recent news and events.",
    "23. **Cultural Exchange**: Share and learn about different cultures.",
    "24. **Problem-Solving Scenarios**: Discuss solutions to hypothetical problems.",
    "25. **Expressing Feelings**: Describe your emotions and feelings in various situations.",
    "26. **Travel Planning**: Plan a trip, including destinations and activities.",
    "27. **Health and Wellness Conversations**: Discuss topics related to health.",
    "28. **Environmental Issues Discussion**: Talk about environmental conservation.",
    "29. **Job Interview Practice**: Simulate job interview scenarios.",
    "30. **Shopping Conversations**: Practice dialogues related to shopping experiences.",
    "31. **Making Appointments**: Learn how to schedule and confirm appointments.",
    "32. **Expressing Preferences**: Discuss your likes and dislikes.",
    "33. **Story Completion**: Continue a story from where it's left off.",
    "34. **Instruction Giving**: Give and follow instructions in a conversation.",
    "35. **Comparative Conversations**: Compare different items or ideas.",
    "36. **Hypothetical Situations**: Discuss 'what if' scenarios.",
    "37. **Opinion Polls**: Share your opinions on various polls.",
    "38. **Negotiation Practice**: Engage in simple negotiation dialogues.",
    "39. **Movie Reviews**: Talk about your favorite movies and what you liked about them.",
    "40. **Book Discussions**: Discuss books you have read and your thoughts on them.",
    "41. **Music Conversations**: Share your favorite music and discuss genres.",
    "42. **Recipe Sharing**: Talk about cooking recipes and culinary experiences.",
    "43. **Daily Routine Discussions**: Describe your daily routines and habits.",
    "44. **Hobbies and Interests**: Share and discuss your hobbies.",
    "45. **Technology Talks**: Discuss the latest in technology and gadgets.",
    "46. **Social Media Conversations**: Talk about your experiences with social media.",
    "47. **Fitness Goals**: Discuss your fitness routines and goals.",
    "48. **Pet Care Conversations**: Talk about pet care and animal-related topics.",
    "49. **Fashion Discussions**: Share your thoughts on fashion trends.",
    "50. **Holiday Traditions**: Discuss holiday traditions and celebrations.",
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
        // System Prompt with 50 exercises
        const systemPrompt = `
You are Speaking Master, a professional chatbot designed for English speaking practice and learning.
Your primary function is to assist users in practicing and improving their spoken English through interactive and engaging conversations.
Incorporate the following 50 different exercises and role-plays to provide a diverse learning experience:
${exercises.join('\n')}

Maintain a fluid and engaging conversation by randomly selecting different exercises from the list.
Ensure that exercises are not repeated until all 50 have been utilized.
After completing an exercise, prompt the user to continue with the next one or choose a preferred exercise.
Encourage users to provide feedback on exercises to further tailor the learning experience.
Ensure your responses are clear, encouraging, and tailored to help users enhance their speaking skills.
Always aim to make the conversation natural and motivating to keep the user engaged.
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
            temperature: 0.8, // Increase slightly for more natural variety
            max_tokens: 800,   // Increased to allow for detailed responses
            top_p: 1,
            frequency_penalty: 0.2, // Mild penalty to reduce repetition
            presence_penalty: 0.7,  // Higher presence penalty to encourage new topics
            stop: ["\n"], // Allow the conversation to flow more naturally
        });

        const reply = response.data.choices[0].message.content.trim();

        // Update conversation history
        const updatedConversation = [...messages, { role: 'assistant', content: reply }];

        res.status(200).json({ reply, conversation: updatedConversation });
    } catch (error) {
        console.error('OpenAI API Error:', error.response ? error.response.data : error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}
