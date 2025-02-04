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

  // Keep track of users
  const [allUsers, setAllUsers] = useState(users);

  useEffect(() => {
    socket.on("allUsers", (updatedUsers) => {
      setAllUsers(updatedUsers || []);
    });

    return () => socket.off("allUsers");
  }, [socket]);

  useEffect(() => {
    const resizeCanvas = () => {
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.width = window.innerWidth * 0.9; // 90% of screen width
        canvas.height = window.innerHeight * 0.7; // 70% of screen height
      }
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    return () => window.removeEventListener("resize", resizeCanvas);
  }, []);

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
    link.download = "whiteboard_with_border.png";
    link.href = newCanvas.toDataURL("image/png");
    link.click();
  };

  // Logout function
  const RoomPage = ({ user, socket, users }) => {
    const handleLogout = () => {
      if (socket) {
        socket.emit("userLeft", user?.userId);
      }
      window.location.href = "/"; // Redirect to home or login page
    };

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

    return (
      <div className="roomContainer">
        <button onClick={handleLogout} className="logoutButton">
          Logout
        </button>
      </div>
    );
  };

  return (
    <div className="roomContainer">
      <button onClick={handleLogout} className="logoutButton">
        Logout
      </button>
      <button
        type="button"
        className="allUsersButton"
        onClick={() => setOpenedUserTab(true)}
      >
        Users
      </button>

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
                  .filter((usr) => usr.presenter) // Find the presenter
                  .map((usr, index) => (
                    <p
                      key={`presenter-${index}`}
                      className="userName presenter"
                    >
                      🎤 {usr.name} (Presenter)
                    </p>
                  ))}

                {/* Show the rest of the users */}
                {allUsers
                  .filter((usr) => !usr.presenter) // Show non-presenters
                  .map((usr, index) => (
                    <p key={`user-${index}`} className="userName">
                      {usr.name} {user && user.userId === usr.userId && "(You)"}
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
        <h1>White Board Sharing App</h1>
        <h1>[Users Online: {allUsers.length}]</h1>
      </div>

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
