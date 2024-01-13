'use client';

import React, { useState, useEffect, useRef } from 'react';
import styles from './page.module.css';
import { NavDesktop, NavMobile } from './components/nav'; 

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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const textAreaRef = useRef(null);

  const toggleListening = () => {
    setIsListening(!isListening);
    // Speech recognition logic will be triggered by useEffect
  };

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
          if (event.results[i].isFinal) {
            setFinalTranscript((prev) => prev + event.results[i][0].transcript + ' ');
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

  return (
    <div id="outer-container">
      <NavMobile isOpen={sidebarOpen} toggle={setSidebarOpen} />
      <NavDesktop />
      <main id="page-wrap" className={styles.main}>
        <button onClick={toggleListening}>{isListening ? 'Stop Listening' : 'Start Listening'}</button>
        <div className={styles.description}>
          <textarea ref={textAreaRef} value={finalTranscript + interimTranscript} readOnly className={styles.textarea} />
          {isListening ? <p>Listening...</p> : <p>Not listening</p>}
        </div>
      </main>
    </div>
  );
}
