import { Routes, Route } from "react-router-dom";


import LobbyScreen from "./screens/Lobby";
import RoomPage from "./screens/Room";

function App() {
  return (
    <>
        <Routes>
          <Route path="/" element={<LobbyScreen />} />
          <Route path="/room/:roomId" element={<RoomPage />} />
        </Routes>
    </>
  );
}

export default App;
