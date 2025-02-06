import React from "react";
import { useState } from "react";
import { useNavigate } from "react-router";

import "./create.css";

const CreateRoomForm = ({ uuid, socket, setUser }) => {
  const [roomId, setRoomId] = useState(uuid());
  const [name, setName] = useState("");
  const [copied, setCopied] = useState(false);

  const navigate = useNavigate();

  const handleCreateRoom = (e) => {
    e.preventDefault();

    const roomData = {
      name,
      roomId,
      userId: uuid(),
      host: true,
      presenter: true,
    };
    setUser(roomData);
    navigate(`/${roomId}`);
    socket.emit("userJoined", roomData);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(roomId).then(() => {
      setCopied(true); // Show copied state

      setTimeout(() => setCopied(false), 2000); // Reset copied state after 2 sec
    });
  };
  return (
    <>
      <div className="createContainer">
        <div className="animated-title">Create Room</div>
        <form action="#">
          <div className="data">
            <input
              required
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
              }}
            />
          </div>
          <div className="code">
            <input
              type="text"
              value={roomId}
              className="generateCode"
              placeholder="Generate room code"
              disabled
            />
            <button
              className="generatebtn"
              type="button"
              onClick={() => setRoomId(uuid())}
            >
              Generate
            </button>
            <button className="copybtn" type="button" onClick={handleCopy}>
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
          <div className="btn">
            <button
              type="submit"
              onClick={handleCreateRoom}
              disabled={!name || !roomId}
            >
              Generate Room
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default CreateRoomForm;
