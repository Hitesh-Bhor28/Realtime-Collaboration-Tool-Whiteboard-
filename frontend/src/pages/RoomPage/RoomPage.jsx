import React, { useState, useRef } from "react";
import "./RoomPage.css";
import Whiteboard from "../../components/Whiteboard/Whiteboard";

const RoomPage = () => {
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const [tool, setTool] = useState("pencil");
  const [color, setColor] = useState("black");
  const [elements, setElements] = useState([]);

  return (
    <div className="roomContainer">
      <div className="roomTitle">
        <h1>White Board Sharing App</h1>
        <h1>[Users Online : 0]</h1>
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
            <input type="button" value="Undo" />
            <input type="button" value="Redo" />
          </div>
          <div className="btnright">
            <input type="button" value="Clear Canvas" />
          </div>
        </div>
      </div>

      <div className="whiteboardContainer">
        <Whiteboard
          canvasRef={canvasRef}
          ctxRef={ctxRef}
          elements={elements}
          setElements={setElements}
        />
      </div>
    </div>
  );
};

export default RoomPage;
