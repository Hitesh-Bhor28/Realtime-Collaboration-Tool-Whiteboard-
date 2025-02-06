import React from "react";
import CreateRoomForm from "./CreateRoomForm/CreateRoomForm";
import JoinRoomForm from "./JoinRoomForm/JoinRoomForm";

const Forms = ({ uuid, socket, setUser }) => {
  return (
    <>
      <div className="center">
        <CreateRoomForm uuid={uuid} socket={socket} setUser={setUser} />
        <JoinRoomForm uuid={uuid} socket={socket} setUser={setUser} />
      </div>
    </>
  );
};

export default Forms;
