import React from "react";

function Tutorial() {
  return (
    <div className="h-[90vh] w-full bg-gray-800 flex justify-center items-center">
        <div className="grid grid-cols-3 ml-20 mr-20 gap-x-9 ">
          <div className="rounded shadow-2xl p-4 flex flex-col text-center text-[#CDD3D0] bg-slate-800">
            <img className="h-56 object-cover" src="circleoffifth.png"></img>
            <h2 className=" text-xl mt-4 ">The Circles</h2>
            
            <p>
              Learn about the circles and how you can utilize them to gain a
              greater inuition for your chord-progressions.
            </p>
          </div>

          <div className="rounded shadow-2xl p-4 flex flex-col text-center text-[#CDD3D0] bg-slate-800">
            <img
              className="h-56 object-cover object-top"
              src="settings.png"
            ></img>
            <h2 className=" text-xl mt-4 ">Customize your experience</h2>
            <p>
              Use the settings to customize your projects and retrieve only the
              relevant harmonic information you want.
            </p>
          </div>

          <div className="rounded shadow-2xl p-4 flex flex-col text-center text-[#CDD3D0] bg-slate-800">
            <img
              className="h-56 object-cover object-center"
              src="sacred.png"
            ></img>
            <h2 className="text-xl mt-4">Sacred Geometry</h2>
            <p>
              Learn how you can use the shapes to gain a intuition for exactly
              where your chordprogression should go next.
            </p>
          </div>
        </div>
    </div>
  );
}

export default Tutorial;
