import React from "react";

const JoinRoomForm = () => {
  return (
    <>
      <div className="createContainer">
        <div className="animated-title">Join Room</div>
        <form action="#">
          <div className="data">
            <input type="text" placeholder="Enter room code" />
          </div>

          <div className="btn" style={{ marginTop: "17%" }}>
            <div className="inner"></div>
            <button type="submit">Join Room</button>
          </div>
        </form>
      </div>
    </>
  );
};

export default JoinRoomForm;
