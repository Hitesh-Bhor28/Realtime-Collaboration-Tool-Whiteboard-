import React from "react";
import { useNavigate } from "react-router";

import { useState } from "react";

const JoinRoomForm = ({ uuid, socket, setUser }) => {
  const [roomId, setRoomId] = useState("");
  const [name, setName] = useState("");
  const navigate = useNavigate();

  const handleRoomJoin = (e) => {
    e.preventDefault();

    const roomData = {
      name,
      roomId,
      userId: uuid(),
      host: false,
      presenter: false,
    };
    setUser(roomData);
    navigate(`/${roomId}`);
    socket.emit("userJoined", roomData);
  };

  return (
    <>
      <div className="createContainer">
        <div className="animated-title">Join Room</div>
        <form action="#">
          <div className="data">
            <input
              type="text"
              placeholder="Enter Name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
              }}
            />
            <input
              type="text"
              placeholder="Enter room code"
              value={roomId}
              onChange={(e) => {
                setRoomId(e.target.value);
              }}
            />
          </div>

          <div className="btn" style={{ marginTop: "17%" }}>
            <div className="inner"></div>
            <button type="submit" onClick={handleRoomJoin}>
              Join Room
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default JoinRoomForm;
