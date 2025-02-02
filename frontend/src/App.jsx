import { Route, Routes } from "react-router-dom";
import "./App.css";
import Forms from "./components/Forms";
import RoomPage from "./pages/RoomPage/RoomPage";

const App = () => {
  return (
    <>
      <Routes>
        <Route path="/" element={<Forms />} />
        <Route path="/:roomId" element={<RoomPage />} />
      </Routes>
    </>
  );
};

export default App;
