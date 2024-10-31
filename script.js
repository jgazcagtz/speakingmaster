// script.js

const voiceBtn = document.getElementById('voice-btn');
const messages = document.getElementById('messages');
const loading = document.getElementById('loading');

let recognition;
let isListening = false;

// Initialize Speech Recognition
if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.addEventListener('result', (event) => {
        const transcript = event.results[0][0].transcript.trim();
        addMessage(transcript, 'user');
        fetchReply(transcript);
    });

    recognition.addEventListener('speechend', () => {
        recognition.stop();
        isListening = false;
        voiceBtn.textContent = '🎤 Start Talking';
    });

    recognition.addEventListener('error', (event) => {
        console.error('Speech recognition error:', event.error);
        addMessage('❌ Voice recognition failed. Please try again.', 'bot');
        isListening = false;
        voiceBtn.textContent = '🎤 Start Talking';
    });

    voiceBtn.addEventListener('click', () => {
        if (!isListening) {
            recognition.start();
            isListening = true;
            voiceBtn.textContent = '🎤 Listening...';
        }
    });
} else {
    voiceBtn.disabled = true;
    voiceBtn.title = 'Voice recognition not supported in this browser.';
    addMessage('❌ Voice recognition not supported in this browser.', 'bot');
}

function addMessage(text, sender) {
    const msg = document.createElement('div');
    msg.classList.add('message', sender);
    msg.textContent = text;
    messages.appendChild(msg);
    messages.scrollTop = messages.scrollHeight;
}

async function fetchReply(message) {
    loading.classList.remove('hidden');
    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message }),
        });

        const data = await response.json();
        if (data.reply) {
            addMessage(data.reply, 'bot');
            speak(data.reply);
        } else {
            const fallback = '🤔 I am not sure how to respond to that.';
            addMessage(fallback, 'bot');
            speak(fallback);
        }
    } catch (error) {
        console.error('Error:', error);
        const errorMsg = '❌ Something went wrong. Please try again.';
        addMessage(errorMsg, 'bot');
        speak(errorMsg);
    } finally {
        loading.classList.add('hidden');
    }
}

function speak(text) {
    if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-US';
        speechSynthesis.speak(utterance);
    } else {
        console.warn('Speech synthesis not supported.');
    }
}
