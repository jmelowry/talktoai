'use client';

import React, { useState, useEffect, useRef } from 'react';
import styles from './page.module.css';

declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}

export default function Home() {
  const [isListening, setIsListening] = useState(false);
  const [finalTranscript, setFinalTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [audioInputs, setAudioInputs] = useState([]);
  const [selectedInput, setSelectedInput] = useState('');
  const textAreaRef = useRef(null);

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(stream => {
        console.log('Microphone access granted');
        // Fetch available audio input devices after gaining mic access
        return navigator.mediaDevices.enumerateDevices();
      })
      .then(devices => {
        const inputs = devices.filter(device => device.kind === 'audioinput');
        setAudioInputs(inputs);
        const defaultInput = inputs.find(input => input.label.includes('Built-in'));
        if (defaultInput) {
          setSelectedInput(defaultInput.deviceId);
        }
      })
      .catch(err => {
        console.error('Microphone access denied:', err);
        // Handle the error case where the user denies microphone access
      });
  }, []);

  useEffect(() => {
    if (isListening && typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        let interim = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            setFinalTranscript(prev => prev + event.results[i][0].transcript + ' ');
          } else {
            interim += event.results[i][0].transcript;
          }
        }
        setInterimTranscript(interim);
      };

      recognition.start();
      return () => recognition.stop();
    }
  }, [isListening]);

  const toggleListening = () => {
    setIsListening(!isListening);
  };

  return (
    <div className={styles.container}>
      <button onClick={toggleListening}>
        {isListening ? 'Stop Listening' : 'Start Listening'}
      </button>
      {isListening && <p>Listening...</p>}
      <textarea
        ref={textAreaRef}
        value={finalTranscript + interimTranscript}
        readOnly
        className={styles.textarea}
      />
      <select
        value={selectedInput}
        onChange={e => setSelectedInput(e.target.value)}
        className={styles.dropdown}
      >
        {audioInputs.map(input => (
          <option key={input.deviceId} value={input.deviceId}>
            {input.label}
          </option>
        ))}
      </select>
    </div>
  );
}
