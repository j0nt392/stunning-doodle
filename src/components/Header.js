import React from "react";
import { Link } from "react-router-dom";
// import './Header.css';

function Header() {
  return (
    <header className="w-[100%] flex justify-evenly items-center h-20 bg-slate-600 shadow-2xl text-white ">
        <Link to="/" className="mr-auto ml-5 text-lg">
          chordgeo
        </Link>
        {/* <Link to="/About" className="text-lg mr-5 ">About</Link>
        <Link to="/Tutorial" className="text-lg ">Tutorial</Link> */}
        {/* <a className="text-lg mr-5 ml-5">Profile</a> */}
    </header>
  );
}

export default Header;
