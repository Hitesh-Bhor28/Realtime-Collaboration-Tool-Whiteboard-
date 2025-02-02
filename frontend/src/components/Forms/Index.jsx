import React from "react";
import CreateRoomForm from "./CreateRoomForm/CreateRoomForm";
import JoinRoomForm from "./JoinRoomForm/JoinRoomForm";
import "./form.css";

const Forms = () => {
  return (
    <>
      <div class="center">
        <CreateRoomForm />
        <JoinRoomForm />
      </div>
    </>
  );
};

export default Forms;
