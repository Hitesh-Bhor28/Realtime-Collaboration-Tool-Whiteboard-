import React, { useState, useRef, useEffect } from "react";
import "./RoomPage.css";
import Whiteboard from "../../components/Whiteboard/Whiteboard";

const RoomPage = () => {
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const [tool, setTool] = useState("pencil");
  const [color, setColor] = useState("black");
  const [elements, setElements] = useState([]);
  const undoIntervalRef = useRef(null);

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

  return (
    <div className="roomContainer">
      <div className="roomTitle">
        <h1>White Board Sharing App</h1>
        <h1>[Users Online: 0]</h1>
      </div>

      <div className="roomTools">
        <div className="tools">
          <label htmlFor="pencil">Pencil</label>
          <input
            type="radio"
            id="pencil"
            name="currentTool"
            value="pencil"
            checked={tool === "pencil"}
            onChange={(e) => setTool(e.target.value)}
          />
          <span className="vertical-hr"></span>
          <label htmlFor="line">Line</label>
          <input
            type="radio"
            id="line"
            name="currentTool"
            value="line"
            checked={tool === "line"}
            onChange={(e) => setTool(e.target.value)}
          />
          <span className="vertical-hr"></span>
          <label htmlFor="rectangle">Rectangle</label>
          <input
            type="radio"
            id="rectangle"
            name="currentTool"
            value="rectangle"
            checked={tool === "rectangle"}
            onChange={(e) => setTool(e.target.value)}
          />
        </div>

        <div className="selectColor">
          <label htmlFor="color">Select Color</label>
          <input
            type="color"
            id="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
          />
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

      <div className="whiteboardContainer">
        <Whiteboard
          canvasRef={canvasRef}
          ctxRef={ctxRef}
          elements={elements}
          setElements={setElements}
          tool={tool}
          color={color}
        />
      </div>
    </div>
  );
};

export default RoomPage;
