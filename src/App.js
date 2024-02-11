import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainWindow from "./pages/Main";
import About from "./pages/About";
import Layout from "./pages/Layout";
import Tutorial from "./pages/Tutorial";

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout></Layout>}>
            <Route path="/" element={<MainWindow></MainWindow>} />
            <Route path="/About" element={<About />} />
            <Route path="/Tutorial" element={<Tutorial />} />

          </Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
