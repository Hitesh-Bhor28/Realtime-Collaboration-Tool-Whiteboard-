import React from "react";

const CreateRoomForm = () => {
  return (
    <>
      <div className="createContainer">
        <div className="animated-title">Create Room</div>
        <form action="#">
          <div className="data">
            <input type="text" placeholder="Enter your name" />
          </div>
          <div className="code">
            <input
              type="text"
              className="generateCode"
              placeholder="Generate room code"
              disabled
            />
            <button className="generatebtn" type="button">
              Generate
            </button>
            <button className="copybtn" type="button">
              copy
            </button>
          </div>
          <div className="btn">
            <div className="inner"></div>
            <button type="submit">Generate Room</button>
          </div>
        </form>
      </div>
    </>
  );
};

export default CreateRoomForm;
