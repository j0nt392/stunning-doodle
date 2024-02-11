import React from 'react'
import Header from "../components/Header";
import { Outlet } from 'react-router-dom'
import "../output.css";

function Layout() {
  return (
    <>
      <Header></Header>
      <Outlet/>
    </>
    
  )
}

export default Layout