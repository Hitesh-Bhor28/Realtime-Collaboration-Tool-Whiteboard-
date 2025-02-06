import React, { useState, useRef, useEffect } from "react";
import "./RoomPage.css";
import Whiteboard from "../../components/Whiteboard/Whiteboard";

const RoomPage = ({ user, socket, users = [] }) => {
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const [tool, setTool] = useState("pencil");
  const [color, setColor] = useState("black");
  const [elements, setElements] = useState([]);
  const undoIntervalRef = useRef(null);
  const [openedUserTab, setOpenedUserTab] = useState(false);
  const [allUsers, setAllUsers] = useState(users);

  useEffect(() => {
    return () => {
      socket.emit("userLeftMSG", user);
    };
  }, []);

  useEffect(() => {
    socket.on("allUsers", (updatedUsers) => {
      setAllUsers(updatedUsers || []);
    });

    return () => socket.off("allUsers");
  }, [socket]);

  useEffect(() => {
    const handleUnload = () => {
      if (socket) {
        socket.emit("userLeft", user?.userId);
      }
    };

    window.addEventListener("beforeunload", handleUnload);
    return () => {
      window.removeEventListener("beforeunload", handleUnload);
    };
  }, [socket, user]);

  const handleLogout = () => {
    if (socket) {
      socket.emit("userLeft", user?.userId);
    }
    window.location.href = "/"; // Redirect user to home or login page
  };

  const handleCanvasClear = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setElements([]);
  };

  const handleUndo = () => {
    setElements((prevElements) => prevElements.slice(0, -1));
  };

  const handleStartUndo = () => {
    if (undoIntervalRef.current) return;
    undoIntervalRef.current = setInterval(handleUndo, 50);
  };

  const handleStopUndo = () => {
    if (undoIntervalRef.current) {
      clearInterval(undoIntervalRef.current);
      undoIntervalRef.current = null;
    }
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const borderSize = 10;
    const borderColor = "black";

    const newCanvas = document.createElement("canvas");
    newCanvas.width = canvas.width + 2 * borderSize;
    newCanvas.height = canvas.height + 2 * borderSize;

    const newCtx = newCanvas.getContext("2d");

    newCtx.fillStyle = "white";
    newCtx.fillRect(0, 0, newCanvas.width, newCanvas.height);

    newCtx.strokeStyle = borderColor;
    newCtx.lineWidth = borderSize;
    newCtx.strokeRect(
      borderSize / 2,
      borderSize / 2,
      newCanvas.width - borderSize,
      newCanvas.height - borderSize
    );

    newCtx.drawImage(canvas, borderSize, borderSize);

    const link = document.createElement("a");
    link.download = "whiteboard.png";
    link.href = newCanvas.toDataURL("image/png");
    link.click();
  };

  return (
    <div className="roomContainer">
      {/* Logout Button */}
      <button onClick={handleLogout} className="logoutButton">
        Logout
      </button>

      {/* User List Button */}
      <button
        type="button"
        className="allUsersButton"
        onClick={() => setOpenedUserTab(true)}
      >
        Users
      </button>

      {/* User List Popup */}
      {openedUserTab && (
        <div className="usersContainer">
          <button
            type="button"
            className="usersCloseButton"
            onClick={() => setOpenedUserTab(false)}
          >
            Close
          </button>
          <div className="currentUser">
            {allUsers.length > 0 ? (
              <>
                {/* Show the presenter at the top */}
                {allUsers
                  .filter((usr) => usr.presenter)
                  .map((usr, index) => (
                    <p
                      key={`presenter-${index}`}
                      className="userName presenter"
                    >
                      {usr.name} (Presenter)
                    </p>
                  ))}

                {/* Show other users */}
                {allUsers
                  .filter((usr) => !usr.presenter)
                  .map((usr, index) => (
                    <p key={`user-${index}`} className="userName">
                      {usr.name} {user?.userId === usr.userId && "(You)"}
                    </p>
                  ))}
              </>
            ) : (
              <p>No users online</p>
            )}
          </div>
        </div>
      )}

      <div className="roomTitle">
        <h1>White Board Sharing App [Users Online: {allUsers.length}]</h1>
      </div>

      {user && user.presenter && (
        <div className="roomTools">
          <div className="tools">
            <label htmlFor="pencil">
              <span className="toolsHeadingPen toolsHeading">Pencil</span>
            </label>
            <input
              hidden
              type="radio"
              id="pencil"
              name="currentTool"
              value="pencil"
              checked={tool === "pencil"}
              onChange={(e) => setTool(e.target.value)}
            />
            <span className="vertical-hr"></span>
            <label htmlFor="line">
              <span className="toolsHeadingLin toolsHeading">Line</span>
            </label>
            <input
              hidden
              type="radio"
              id="line"
              name="currentTool"
              value="line"
              checked={tool === "line"}
              onChange={(e) => setTool(e.target.value)}
            />
            <span className="vertical-hr"></span>
            <label htmlFor="rectangle">
              <span className="toolsHeadingRec toolsHeading">Rectangle</span>
            </label>
            <input
              hidden
              type="radio"
              id="rectangle"
              name="currentTool"
              value="rectangle"
              checked={tool === "rectangle"}
              onChange={(e) => setTool(e.target.value)}
            />
          </div>

          <div className="selectColor">
            <label
              style={{
                fontFamily: "'Comic Neue', cursive", // Use camelCase for properties
                fontWeight: "bolder", // String value required
                fontSize: "larger",
              }}
            >
              Select Color
            </label>

            {/* Custom Color Picker */}
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
            />
            {["violet", "red", "blue", "green"].map((colorOption) => (
              <div
                key={colorOption}
                className={`colorOption ${
                  color === colorOption ? "active" : ""
                }`}
                data-color={colorOption}
                onClick={() => setColor(colorOption)}
              ></div>
            ))}
          </div>

          <div className="buttons">
            <div className="btnleft">
              <input
                type="button"
                value="Undo"
                onMouseDown={handleStartUndo}
                onMouseUp={handleStopUndo}
                onMouseLeave={handleStopUndo}
              />
              <input
                type="button"
                value="Download Canvas"
                onClick={handleDownload}
              />
            </div>
            <div className="btnright">
              <input
                type="button"
                value="Clear Canvas"
                onClick={handleCanvasClear}
              />
            </div>
          </div>
        </div>
      )}

      {/* Whiteboard Component */}
      <div className="whiteboardContainer">
        <Whiteboard
          canvasRef={canvasRef}
          ctxRef={ctxRef}
          elements={elements}
          setElements={setElements}
          tool={tool}
          color={color}
          user={user}
          socket={socket}
        />
      </div>
    </div>
  );
};

export default RoomPage;
