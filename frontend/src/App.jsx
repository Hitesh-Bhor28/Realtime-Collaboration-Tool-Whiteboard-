import { Route, Routes } from "react-router-dom";
import "./App.css";
import Forms from "./components/Forms";
import RoomPage from "./pages/RoomPage/RoomPage";
import { useEffect } from "react";
import { useState } from "react";

import io from "socket.io-client";

const server = "http://localhost:5000";
const connectionOptions = {
  "force new connection": true,
  reconnectionAttempts: "Infinity",
  timeout: 10000,
  transports: ["websocket"],
};
const socket = io(server, connectionOptions);

const App = () => {
  const [user, setUser] = useState("");
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const handleUserJoined = (data) => {
      if (data.success) {
        console.log("User Joined");
        setUsers(data.users);
      } else {
        console.log("User not Joined");
      }
    };

    socket.on("allUsers", (data) => {
      setUsers(data);
    });

    socket.on("userIsJoined", handleUserJoined);

    return () => {
      socket.off("userIsJoined", handleUserJoined); // ✅ Cleanup listener on unmount
    };
  }, []);

  const uuid = () => {
    let s4 = () => {
      return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    };
    return (
      s4() +
      s4() +
      "_" +
      s4() +
      "_" +
      s4() +
      "_" +
      s4() +
      "_" +
      s4() +
      s4() +
      s4()
    );
  };

  return (
    <>
      <Routes>
        <Route
          path="/"
          element={<Forms uuid={uuid} socket={socket} setUser={setUser} />}
        />
        <Route
          path="/:roomId"
          element={<RoomPage socket={socket} user={user} users={users} />}
        />
      </Routes>
    </>
  );
};

export default App;
