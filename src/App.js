import React, { useState, useRef, useEffect } from 'react';
import { fetchAIResponse } from './services/openaiService';
import './index.css';
import AvatarViewer from './components/AvatarViewer';

function App() {
  const [isListening, setIsListening] = useState(false);
  const [conversation, setConversation] = useState([]);
  const messagesEndRef = useRef(null);
  const avatarRef = useRef();

  const speakText = (text) => {
    const synth = window.speechSynthesis;
    const utterance = new SpeechSynthesisUtterance(text);

    utterance.lang = 'en-IN';
    utterance.pitch = 1.1;
    utterance.rate = 0.95;

    let mouthInterval;

    utterance.onstart = () => {
      mouthInterval = setInterval(() => {
        if (avatarRef.current) {
          const randomOpen = Math.random() * 0.7 + 0.3;
          avatarRef.current.setMouthOpen(randomOpen);
        }
      }, 100);
    };

    utterance.onend = () => {
      clearInterval(mouthInterval);
      if (avatarRef.current) {
        avatarRef.current.setMouthOpen(0);
      }
    };

    synth.speak(utterance);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversation]);

  const addMessage = (text, sender) => {
    setConversation((prev) => [...prev, { text, sender }]);
  };

  const startListening = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert('Speech recognition not supported. Use Chrome or Edge.');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-IN';

    recognition.onstart = () => setIsListening(true);

    recognition.onresult = async (event) => {
      const userInput = event.results[0][0].transcript;
      addMessage(userInput, 'user');

      try {
        const aiReply = await fetchAIResponse(userInput);
        if (!aiReply || aiReply.trim() === '') throw new Error('Empty response');
        addMessage(aiReply, 'bot');
        speakText(aiReply);
      } catch (error) {
        console.error('AI Error:', error);
        const fallback = "Ugh, I messed up again. Check the console for clues!";
        addMessage(fallback, 'bot');
        speakText(fallback);
      }
    };

    recognition.onerror = (event) => {
      alert('Speech error: ' + event.error);
      setIsListening(false);
    };

    recognition.onend = () => setIsListening(false);

    recognition.start();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0f2f] via-[#121222] to-[#0a0a1a] text-white font-sans px-4 py-6">
      <header className="text-center mb-6">
        <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-sky-400 to-indigo-600 bg-clip-text text-transparent drop-shadow-md">
          Companio
        </h1>
        <p className="mt-1 text-gray-400">Your 3D voice-powered assistant</p>
      </header>

      <div className="mb-8 max-w-2xl mx-auto">
        <AvatarViewer ref={avatarRef} modelUrl="https://models.readyplayer.me/687a0a844a0f53bfa4aa0436.glb" />
      </div>

      <div className="text-center mb-8">
        <button
          onClick={startListening}
          disabled={isListening}
          className={`px-6 py-3 text-xl font-semibold rounded-full shadow-lg transition-all duration-300 
            ${isListening ? 'bg-gray-500 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}
        >
          {isListening ? '🎙️ Listening...' : '🎤 Talk to Companio'}
        </button>
      </div>

      <div className="bg-[#1a1a2f] p-5 rounded-3xl shadow-2xl max-h-[50vh] overflow-y-auto custom-scrollbar">
        {conversation.map((msg, index) => (
          <div key={index} className={`my-4 flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex items-end space-x-3 max-w-[80%] ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`px-5 py-3 rounded-2xl text-white shadow-lg backdrop-blur-sm 
                ${msg.sender === 'user' ? 'bg-green-600' : 'bg-indigo-500'}`}>
                {msg.text}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <footer className="text-center text-sm text-gray-500 mt-6">
        &copy; {new Date().getFullYear()} Companio. 
      </footer>
    </div>
  );
}

export default App;
