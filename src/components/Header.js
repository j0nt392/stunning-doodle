import React from 'react';
import './Header.css';

function Header() {
    return (
        <header className="header">
            <div className="hamburger-menu">
                <div className="hamburger-line"></div>
                <div className="hamburger-line"></div>
                <div className="hamburger-line"></div>
            </div>
            <h3 class='logo-container'> Intuitune</h3>
            {/* Add header content here */}
        </header>
    )
}

export default Header;