import { Route, Routes } from "react-router-dom";
import "./App.css";
import Forms from "./components/Forms/formPage";
import RoomPage from "./pages/RoomPage/RoomPage";
import { useEffect } from "react";
import { useState } from "react";

import { toast, ToastContainer } from "react-toastify";

import io from "socket.io-client";

const server = process.env.REACT_APP_BACKEND_URL;
 
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

    socket.on("userJoinedMSG", (data) => {
      toast.success(`${data} - Joined the room`);
    });

    socket.on("userLeftMSG", (data) => {
      toast.error(`${data} - Left the room`);
    });

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

  const PreventReload = () => {
    useEffect(() => {
      document.addEventListener("contextmenu", (event) => {
        event.preventDefault();
        console.log("");
        toast.error("Right Click Disabled");
      });
    }, []);
  };

  return (
    <>
      <PreventReload />
      <ToastContainer
        position="bottom-right"
        autoClose={1500}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
      {/* Show Title Only on Home Page */}
      {window.location.pathname === "/" && (
        <h1 className="homepage-title">White Board Sharing App</h1>
      )}
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
      <h1 className="homepage-end">❤️ hitesh..</h1>
    </>
  );
};

export default App;
