// SocketContext.js
import React, { createContext, useContext } from 'react';
import io from 'socket.io-client';

// Create a WebSocket connection to your server
const socket = io('http://localhost:5000');

// Create a context
const SocketContext = createContext();

// Provide the socket to your app
export const SocketProvider = ({ children }) => (
  <SocketContext.Provider value={socket}>
    {children}
  </SocketContext.Provider>
);

// Custom hook to use the socket
export const useSocket = () => useContext(SocketContext);
