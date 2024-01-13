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
  const textAreaRef = useRef(null);

  const toggleListening = () => {
    if (isListening) {
      // Code to stop speech recognition
      recognition.stop();
    } else {
      // Code to start speech recognition
      recognition.start();
    }
  };

  const HamburgerMenu = () => {
    const [menuOpen, setMenuOpen] = useState(false);

    return (
      <div className={styles.hamburgerMenu}>
        <input
          type="checkbox"
          id="menuToggle"
          checked={menuOpen}
          onChange={(e) => setMenuOpen(e.target.checked)}
        />
        <label htmlFor="menuToggle" className={styles.hamburgerIcon}>
          ☰
        </label>
        {menuOpen && (
          <div className={styles.menuContent}>
            {/* Place your menu items here */}
            <button onClick={toggleListening}>Toggle Listening</button>
            {/* Dropdown for input selection */}
          </div>
        )}
      </div>
    );
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();

      const handleMicChange = (event) => {
        // Update the selected microphone based on user choice
        // This might involve stopping and restarting the recognition with the new device
      };

      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);

      recognition.onresult = (event) => {
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

      // Start the speech recognition
      recognition.start();

      return () => {
        recognition.stop();
      };
    }
  }, [isListening]);

  return (
    <main className={styles.main}>
      <HamburgerMenu />
      <div className={styles.description}>
        <textarea
          ref={textAreaRef}
          value={finalTranscript + interimTranscript}
          readOnly
          className={styles.textarea}/>
        {isListening ? <p>listening...</p> : <p>not listening</p>}
      </div>
    </main>
  );
}