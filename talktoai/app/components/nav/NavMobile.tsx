import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Squash as Hamburger } from 'hamburger-react';
import { routes } from '../../routes'; // Adjust the import path as needed

export const NavMobile = ({ isOpen, toggle }) => {
  return (
    <div style={{ display: 'block' }}>
      <Hamburger toggled={isOpen} toggle={toggle} />
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring' }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '250px',
              height: '100%',
              backgroundColor: '#333',
              padding: '20px',
              boxSizing: 'border-box',
              zIndex: 100
            }}
          >
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {routes.map((route) => (
                <li key={route.title} style={{ marginBottom: '10px' }}>
                  <a href={route.href} style={{ textDecoration: 'none', color: 'white', display: 'flex', alignItems: 'center' }}>
                    {route.Icon && <route.Icon style={{ marginRight: '5px' }} />}
                    {route.title}
                  </a>
                </li>
              ))}
              {/* Placeholder for Dictation Toggle */}
              <li>
                <button style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>
                  Toggle Dictation
                </button>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NavMobile;
