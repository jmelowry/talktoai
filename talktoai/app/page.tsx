'use client';

import React, { useState, useEffect, useRef } from 'react';
import styles from './page.module.css';

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
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const recognition = useRef<SpeechRecognition | null>(null);
  const recognitionActive = useRef<boolean>(false);

  const toggleListening = () => {
    setIsListening(!isListening);
    if (!recognition.current) return;

    if (!isListening && !recognitionActive.current) {
      recognition.current.start();
      recognitionActive.current = true;
    } else {
      recognition.current.stop();
      recognitionActive.current = false;
    }
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
    if (typeof window !== 'undefined') {
      // Initialize recognition instance
      recognition.current = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
      const recognitionInstance = recognition.current;
  
      // Configure recognition instance
      recognitionInstance.continuous = true;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = 'en-US';
  
      // Event handlers
      recognitionInstance.onresult = (event: SpeechRecognitionEvent) => {
        let interim = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const result = event.results.item(i);
          for (let j = 0; j < result.length; j++) {
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
  
      recognitionInstance.onend = () => {
        recognitionActive.current = false;
      };
  
      recognitionInstance.onstart = () => {
        recognitionActive.current = true;
      };
  
      let restartTimeout;
      recognitionInstance.onsoundend = () => {
        if (isListening && !recognitionActive.current) {
          restartTimeout = setTimeout(() => {
            if (isListening && !recognitionActive.current) {
              recognitionInstance.start();
              recognitionActive.current = true;
            }
          }, 1000);
        }
      };
  
      if (isListening) {
        recognitionInstance.start();
      }
  
      return () => {
        clearTimeout(restartTimeout);
        recognitionInstance.stop();
        recognitionActive.current = false;
      };
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
