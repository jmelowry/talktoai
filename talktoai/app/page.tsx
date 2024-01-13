'use client';

import React, { useState, useEffect, useRef } from 'react';
import styles from './page.module.css';

// Add global declarations for window object
declare global {
  interface Window {
    SpeechRecognition: SpeechRecognition;
    webkitSpeechRecognition: SpeechRecognition;
  }
}

// SpeechRecognition interfaces
interface SpeechRecognition extends EventTarget {
  new(): SpeechRecognition;
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  onresult: (event: SpeechRecognitionEvent) => void;
}

interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionResultList {
  length: number;
  item: (index: number) => SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult; // Add index signature
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  item: (index: number) => SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
}

// MediaDeviceInfo interface
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
  const textAreaRef = useRef(null);
  const toggleListening = () => {
    setIsListening(!isListening);
  };

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(stream => {
        console.log('Microphone access granted');
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
      });
  }, []);

  useEffect(() => {
    if (isListening && typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
  
      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let interim = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const result = event.results.item(i);
          for (let j = 0; j < result.item.length; j++) {
            const alternative = result.item(j);
            if (result.isFinal) {
              setFinalTranscript(prev => prev + alternative.transcript + ' ');
            } else {
              interim += alternative.transcript;
            }
          }
        }
        setInterimTranscript(interim);
      };
      
  
      recognition.start();
      return () => recognition.stop();
    }
  }, [isListening]);
  
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