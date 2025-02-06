import React from "react";
import { useNavigate } from "react-router";
import { toast } from "react-toastify";
import { useState } from "react";
import "./join.css";
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

  // Function to paste room ID from clipboard
  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setRoomId(text);
        toast.success("Room ID pasted!", { position: "bottom-right" });
      } else {
        toast.error("Clipboard is empty!", { position: "bottom-right" });
      }
    } catch (error) {
      toast.error("Failed to access clipboard!", { position: "bottom-right" });
    }
  };

  return (
    <>
      <div className="joinContainer">
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
              required
            />
            <input
              type="text"
              placeholder="Enter room code"
              value={roomId}
              onChange={(e) => {
                setRoomId(e.target.value);
              }}
            />
            <button className="pastebtn" type="button" onClick={handlePaste}>
              Paste
            </button>
          </div>

          <div className="btn" style={{ marginTop: "17%" }}>
            <button
              type="submit"
              onClick={handleRoomJoin}
              disabled={!name || !roomId}
            >
              Join Room
            </button>
          </div>
        </form>
      </div>
      <div className="ani">
        <div className="line">
          <div className="pen">
            <div className="pen_overlay"></div>
            <div className="pen_top"></div>
            <div className="pen_bottom"></div>
          </div>
        </div>
      </div>
    </>
  );
};

export default JoinRoomForm;
