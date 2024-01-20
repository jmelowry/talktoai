'use client';

import React, { useState, useEffect, useRef } from 'react';
import styles from './page.module.css';
import '../styles/globals.css';

declare global {
  interface Window {
    SpeechRecognition: SpeechRecognition;
    webkitSpeechRecognition: SpeechRecognition;
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
  const [isListening, setIsListening] = useState(false);
  const [finalTranscript, setFinalTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [audioInputs, setAudioInputs] = useState<MediaDeviceInfo[]>([]);
  const [selectedInput, setSelectedInput] = useState('');
  const [selectedModel, setSelectedModel] = useState('GPT-3.5');
  const [selectedApiKey, setSelectedApiKey] = useState('');
  const [rememberApiKey, setRememberApiKey] = useState(false); // New state for "Remember Me"
  const [apiKeySaved, setApiKeySaved] = useState(false); // New state for API key saved message
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const recognition = useRef<SpeechRecognition | null>(null);
  const [apiKeyValid, setApiKeyValid] = useState<boolean | null>(null);

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

  useEffect(() => {
    // Check if the API key is stored in local storage and retrieve it
    const storedApiKey = localStorage.getItem('api_key');
    if (storedApiKey) {
      setSelectedApiKey(storedApiKey);
      setRememberApiKey(true);
    }
  }, []);

  const toggleListening = () => {
    if (!recognition.current) return;

    setIsListening(!isListening);
    if (!isListening) {
      recognition.current.start();
    } else {
      recognition.current.stop();
    }
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

  useEffect(() => {
    if (typeof window !== 'undefined') {
      recognition.current = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
      const recognitionInstance = recognition.current;
      recognitionInstance.continuous = true;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = 'en-US';

      recognitionInstance.onresult = (event: SpeechRecognitionEvent) => {
        let interim = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const result = event.results.item(i);
          for (let j = 0; j < result.length; j++) {
            const alternative = result.item(j);
            if (result.isFinal) {
              setFinalTranscript((prev) => prev + alternative.transcript + ' ');
            } else {
              interim += alternative.transcript;
            }
          }
        }
        setInterimTranscript(interim);
      };

      recognitionInstance.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  return (
    
    <div className={styles.container}>
      <h1 className={styles.title}>Chat-O-Matic</h1>

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
        </div>
      </div>

      <textarea
        ref={textAreaRef}
        value={finalTranscript + interimTranscript}
        readOnly
        className={styles.textarea}
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
            <option value="GPT-3.5">GPT-3.5</option>
            <option value="GPT-4">GPT-4</option>
          </select>
        </div>
      </div>
    </div>
  );
}