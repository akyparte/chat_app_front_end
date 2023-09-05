import './App.css';
import ChatHome from './components/chat-home';
import SocketIOClient from 'socket.io-client';
const socket = SocketIOClient('http://192.168.0.105:5000',{
  forceNew: true,
});

function App() {
  return (
     <ChatHome socket={socket}></ChatHome>
  );
}

export default App;
