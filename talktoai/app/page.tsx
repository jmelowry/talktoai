'use client';

import React, { useState, useEffect, useRef } from 'react';
import styles from './page.module.css';
import '../styles/globals.css';

declare global {
  interface Window {
    SpeechRecognition: SpeechRecognition;
    webkitSpeechRecognition: SpeechRecognition;
  }
  interface Navigator {
    brave: {
      isBrave: () => Promise<boolean>;
    };
  }
}

interface SpeechRecognition extends EventTarget {
  new(): SpeechRecognition;
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onend: () => void;
  onstart: () => void;
  onsoundend: () => void;
}

interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionResultList {
  length: number;
  item: (index: number) => SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  item: (index: number) => SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
}

interface MediaDeviceInfo {
  deviceId: string;
  kind: string;
  label: string;
  groupId: string;
}

export default function Home() {
  const [isCompatible, setIsCompatible] = useState<boolean>(true);
  const [isListening, setIsListening] = useState(false);
  const [finalTranscript, setFinalTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [audioInputs, setAudioInputs] = useState<MediaDeviceInfo[]>([]);
  const [selectedInput, setSelectedInput] = useState('');
  const [selectedModel, setSelectedModel] = useState('gpt-3.5-turbo-1106');
  const [selectedApiKey, setSelectedApiKey] = useState('');
  const [rememberApiKey, setRememberApiKey] = useState(false); // New state for "Remember Me"
  const handleRememberApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRememberApiKey(e.target.checked);
  };
  const [apiKeySaved, setApiKeySaved] = useState(false); // New state for API key saved message
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
        let interimTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const result = event.results[i];
          const transcript = result.item(0).transcript;
          if (result.isFinal) {
            setDictatedText(prev => prev + transcript + ' ');
          } else {
            interimTranscript += transcript;
          }
        }
        setInterimTranscript(interimTranscript);
      };
    } else {
      setIsCompatible(false);
    }
  }, []);

  const [dictatedText, setDictatedText] = useState('');

  const [apiKeyValid, setApiKeyValid] = useState<boolean | null>(null);

  useEffect(() => {

    if (!('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      setIsCompatible(false);
    }

    const checkCompatibility = async () => {
      let isBrave: boolean = false;

      if (navigator.brave && await navigator.brave.isBrave()) {
        isBrave = true;
      }

      if (isBrave || !('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
        setIsCompatible(false);
      }
    };

    checkCompatibility();
  }, []);

  const handleApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newApiKey = e.target.value;
    setSelectedApiKey(newApiKey);

    // Check if the "Remember Me" checkbox is checked
    if (rememberApiKey) {
      // Save the API key to local storage
      localStorage.setItem('api_key', newApiKey);

      // Set the API key saved message
      setApiKeySaved(true);

      // Clear the message after a few seconds (e.g., 3 seconds)
      setTimeout(() => {
        setApiKeySaved(false);
      }, 3000);
    } else {
      // Remove the API key from local storage
      localStorage.removeItem('api_key');
    }
  };

  const validateApiKey = async () => {
    try {
      const response = await fetch('/api/validate-key', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ apiKey: selectedApiKey }),
      });

      const data = await response.json();
      if (data.valid) {
        // Key is valid
        setApiKeyValid(true);
        console.log('API Key is valid');
      } else {
        // Key is not valid
        setApiKeyValid(false);
        console.log('API Key is not valid');
      }
    } catch (error) {
      console.error('Error validating API key:', error);
    }
  };

  const handleSubmit = async () => {
    // Replace placeholders with actual variables
    const userMessage = finalTranscript; // Assuming finalTranscript is the state variable storing the dictated message
    const selectedModel: string = ""; // Assuming selectedModel is the state variable for the model
    // Remove the assignment statement since selectedModel is already a constant
    // selectedModel = selectedModel; // Assuming selectedModel is the state variable for the model
    const initialSystemPrompt = "You are chatting with an AI assistant."; // This can be a predefined prompt
    const apiKey = selectedApiKey; // Assuming selectedApiKey is the state variable for the API key

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          apiKey: apiKey,
          model: selectedModel,
          userMessage: userMessage,
          initialSystemPrompt: initialSystemPrompt
        }),
      });

      const data = await response.json();
      if (response.ok) {
        // Handle the successful response
        console.log('AI Response:', data.aiResponse);
      } else {
        // Handle errors
        console.error('Error from API:', data.error);
      }
    } catch (error) {
      console.error('Error sending request:', error);
    }
  };

  useEffect(() => {
    // Check for SpeechRecognition support
    if (!('SpeechRecognition' in window) && !('webkitSpeechRecognition' in window)) {
      setIsCompatible(false);
    }
  }, []);

  useEffect(() => {
    // Check if the API key is stored in local storage and retrieve it
    const storedApiKey = localStorage.getItem('api_key');
    if (storedApiKey) {
      setSelectedApiKey(storedApiKey);
      setRememberApiKey(true);
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) return;
  
    if (!isListening) {
      recognitionRef.current.start();
      setFinalTranscript(''); // Reset the final transcript when starting
      setInterimTranscript(''); // Also reset the interim transcript
    } else {
      recognitionRef.current.stop();
      setFinalTranscript((prev) => prev + interimTranscript); // Append any remaining interim transcript to the final transcript
      sendTextToOpenAI(finalTranscript + interimTranscript); // Send the complete text to OpenAI
      setInterimTranscript(''); // Reset the interim transcript after stopping
    }
  
    setIsListening(!isListening);
  };

  // UseEffect to fetch audio inputs
  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        return navigator.mediaDevices.enumerateDevices();
      })
      .then((devices) => {
        const inputs = devices.filter((device) => device.kind === 'audioinput');
        setAudioInputs(inputs);
        const defaultInput = inputs.find((input) => input.label.includes('Built-in'));
        if (defaultInput) {
          setSelectedInput(defaultInput.deviceId);
        }
      })
      .catch((err) => {
        console.error('Microphone access denied:', err);
      });
  }, []);

  const sendTextToOpenAI = async (text: string) => {
    // Use the state values directly
    const userApiKey = selectedApiKey;
    // Remove the redundant declaration and assignment of 'selectedModel'
    // const selectedModel: string = selectedModel;
    const initialSystemPrompt = "You are chatting with an AI assistant."; // This can be a constant or a state variable

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiKey: userApiKey,
          model: selectedModel,
          userMessage: text,
          initialSystemPrompt: initialSystemPrompt
        })
      });

      const data = await response.json();
      if (response.ok) {
        // Process the response from OpenAI
        console.log('AI Response:', data.aiResponse);
      } else {
        console.error('Error from API:', data.error);
      }
    } catch (error) {
      console.error('Error sending request:', error);
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      recognitionRef.current = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
      const recognitionInstance = recognitionRef.current;
      recognitionInstance.continuous = true;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = 'en-US';

      recognitionInstance.onresult = (event: SpeechRecognitionEvent) => {
        let interim = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const result = event.results.item(i);
          const transcript = result.item(0)?.transcript || '';
          if (result.isFinal) {
            setFinalTranscript((prev) => prev + transcript + ' ');
          } else {
            interim += transcript;
          }
        }
        setInterimTranscript(interim); // Update only the interim transcript
      };
      

      recognitionInstance.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Chat-O-Matic</h1>
  
      {!isCompatible && (
        <div className={`${styles.warning} ${styles.blink}`}>
          Your browser is not fully compatible. Please use Chrome, Edge, or Safari for the best experience.
        </div>
      )}
  
      <div className={styles.topControls}>
        <button
          onClick={toggleListening}
          className={`${styles.button} ${isListening ? styles.listening : ''}`}
        >
          {isListening ? 'Stop Listening' : 'Start Listening'}
        </button>
  
        <div className={styles.apiKeyInput}>
          <label htmlFor="apiKey" className={styles.selectorLabel}>
            OpenAI API Key
          </label>
          <input
            id="apiKey"
            type={apiKeyValid ? "password" : "text"}
            value={selectedApiKey}
            onChange={handleApiKeyChange}
            placeholder="Enter API Key"
            className={styles.input}
          />
          {apiKeyValid === false && (
            <span className={styles.validationEmoji}>⛔️</span>
          )}
          {apiKeyValid === true && (
            <span className={styles.validationEmoji}>✅</span>
          )}
          <button onClick={validateApiKey} className={styles.validateButton}>
            Validate Key
          </button>
          {apiKeySaved && (
            <div className={styles.apiKeySavedMessage}>API Key Saved!</div>
          )}
          <div className={styles.rememberMeCheckbox}>
            <input
              type="checkbox"
              id="rememberApiKey"
              checked={rememberApiKey}
              onChange={handleRememberApiKeyChange}
            />
            <label htmlFor="rememberApiKey">Remember Me</label>
          </div>
        </div>
      </div>
  
      <textarea
        ref={textAreaRef}
        value={finalTranscript + interimTranscript}
        readOnly
        className={styles.textarea}
        id="page_textarea"
        name="pageTextarea"
      />
  
      <div className={styles.selectors}>
        <div className={styles.selectorGroup}>
          <label htmlFor="audioInput" className={styles.selectorLabel}>Audio Input</label>
          <select
            id="audioInput"
            value={selectedInput}
            onChange={(e) => setSelectedInput(e.target.value)}
            className={styles.dropdown}
          >
            {audioInputs.map((input) => (
              <option key={input.deviceId} value={input.deviceId}>
                {input.label}
              </option>
            ))}
          </select>
        </div>
  
        <div className={styles.selectorGroup}>
          <label htmlFor="modelSelect" className={styles.selectorLabel}>Model</label>
          <select
            id="modelSelect"
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            className={styles.dropdown}
          >
            <option value="gpt-3.5-turbo-1106">gpt-3.5-turbo-1106</option>
            <option value="GPT-4">GPT-4</option>
            <option value="gpt-4-1106-preview">GPT-4 Turbo</option>
          </select>
        </div>
      </div>
    </div>
  );
}

