// hooks/use-socket.tsx
import { io } from 'socket.io-client';

export const useSocket = () => {
  const socket = io('http://localhost:3001'); // Update with actual URL
  return socket;
};
