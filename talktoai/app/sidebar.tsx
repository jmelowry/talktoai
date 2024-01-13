'use client';

import React from 'react';
import { slide as Menu } from 'react-burger-menu';
import styles from './sidebar.module.css'; // Adjust the path as necessary

const Sidebar = ({ isOpen }: { isOpen: boolean }) => {
    return (
        <Menu isOpen={isOpen}>
            <a id="home" className="menu-item" href="/">Home</a>
            {/* Only one item for testing */}
        </Menu>
    );
};

export default Sidebar;
