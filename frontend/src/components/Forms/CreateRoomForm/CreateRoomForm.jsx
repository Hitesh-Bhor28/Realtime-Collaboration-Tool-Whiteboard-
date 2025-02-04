import React from "react";
import { useState } from "react";
import { useNavigate } from "react-router";

const CreateRoomForm = ({ uuid, socket, setUser }) => {
  const [roomId, setRoomId] = useState(uuid());
  const [name, setName] = useState("");

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
  return (
    <>
      <div className="createContainer">
        <div className="animated-title">Create Room</div>
        <form action="#">
          <div className="data">
            <input
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
            <button className="copybtn" type="button">
              copy
            </button>
          </div>
          <div className="btn">
            <div className="inner"></div>
            <button type="submit" onClick={handleCreateRoom}>
              Generate Room
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default CreateRoomForm;
