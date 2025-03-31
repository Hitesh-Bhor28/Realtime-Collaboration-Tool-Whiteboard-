import React, { useState, useEffect, useRef } from "react";
import rough from "roughjs/bundled/rough.esm.js";

const roughGenerator = rough.generator();

const Whiteboard = ({
  canvasRef,
  ctxRef,
  elements,
  setElements,
  tool,
  color,
  user,
  socket,
}) => {
  const [img, setImg] = useState(null);
  useEffect(() => {
    socket.on("whiteBoardDataResponse", (data) => {
      setImg(data.imgURL);
    });
  }, []);

  if (!user?.presenter) {
    return (
      <div className="canvas">
        <img
          src={img}
          alt="images real time"
          style={{
            height: "49vh",
            width: "81vw",
          }}
        />
      </div>
    );
  }
  const [isDrawing, setIsDrawing] = useState(false);

  // Function to set up the canvas for high-DPI displays
  const setupCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const devicePixelRatio = window.devicePixelRatio || 1;

    // Set the desired canvas size in CSS pixels
    const desiredWidth = canvas.clientWidth;
    const desiredHeight = canvas.clientHeight;

    // Adjust the canvas size for high-DPI displays
    canvas.width = desiredWidth * devicePixelRatio;
    canvas.height = desiredHeight * devicePixelRatio;
    canvas.style.width = `${desiredWidth}px`;
    canvas.style.height = `${desiredHeight}px`;

    // Scale the context to ensure correct drawing operations
    ctx.scale(devicePixelRatio, devicePixelRatio);
    ctxRef.current = ctx;
  };

  const getRelativePosition = (event) => {
  const canvas = canvasRef.current;
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;

  // Check if event is from touch
  const clientX = event.touches ? event.touches[0].clientX : event.clientX;
  const clientY = event.touches ? event.touches[0].clientY : event.clientY;

  const x = (clientX - rect.left) * scaleX;
  const y = (clientY - rect.top) * scaleY;
  
  return { x, y };
};

// Handle both mouse and touch events
const handlePointerDown = (e) => {
  e.preventDefault(); // Prevent scrolling on touch devices
  const { x, y } = getRelativePosition(e);
  setIsDrawing(true);

  if (tool === "pencil") {
    setElements((prev) => [...prev, { type: "pencil", path: [[x, y]], stroke: color }]);
  } else if (tool === "line") {
    setElements((prev) => [...prev, { type: "line", x1: x, y1: y, x2: x, y2: y, stroke: color }]);
  } else if (tool === "rectangle") {
    setElements((prev) => [...prev, { type: "rectangle", x1: x, y1: y, x2: x, y2: y, stroke: color }]);
  } else if (tool === "eraser") {
    setElements((prev) => [...prev, { type: "eraser", path: [[x, y]], stroke: "white" }]);
  }
};

const handlePointerMove = (e) => {
  if (!isDrawing) return;
  e.preventDefault();
  const { x, y } = getRelativePosition(e);

  setElements((prev) => {
    const index = prev.length - 1;
    const element = prev[index];

    if (element.type === "pencil" || element.type === "eraser") {
      const updatedElement = { ...element, path: [...element.path, [x, y]] };
      return [...prev.slice(0, index), updatedElement];
    } else if (element.type === "line" || element.type === "rectangle") {
      const updatedElement = { ...element, x2: x, y2: y };
      return [...prev.slice(0, index), updatedElement];
    }

    return prev;
  });
};

const handlePointerUp = () => {
  setIsDrawing(false);
};
  useEffect(() => {
    setupCanvas();
  }, [canvasRef]);

  useEffect(() => {
    if (!canvasRef.current || !ctxRef.current) return;
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    ctx.lineCap = "round";

    if (canvasRef) {
      const roughCanvas = rough.canvas(canvas);

      // Clear canvas before redrawing elements
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      elements.forEach((element) => {
        if (element.type === "pencil") {
          const roughElement = roughGenerator.linearPath(element.path, {
            stroke: element.stroke,
            strokeWidth: 2,
            roughness: 0,
          });
          roughCanvas.draw(roughElement);
        } else if (element.type === "line") {
          const roughElement = roughGenerator.line(
            element.x1,
            element.y1,
            element.x2,
            element.y2,
            { stroke: element.stroke, roughness: 0, strokeWidth: 2 }
          );
          roughCanvas.draw(roughElement);
        } else if (element.type === "rectangle") {
          const rectX = Math.min(element.x1, element.x2);
          const rectY = Math.min(element.y1, element.y2);
          const width = Math.abs(element.x2 - element.x1);
          const height = Math.abs(element.y2 - element.y1);
          const roughElement = roughGenerator.rectangle(
            rectX,
            rectY,
            width,
            height,
            {
              stroke: element.stroke,
              roughness: 0,
              strokeWidth: 2,
            }
          );
          roughCanvas.draw(roughElement);
        }
        // Eraser logic (draws in white)
        else if (element.type === "eraser") {
          const roughElement = roughGenerator.linearPath(element.path, {
            stroke: "white", // Erases by drawing in white
            strokeWidth: 10, // Make eraser strokes wider
            roughness: 0,
          });
          roughCanvas.draw(roughElement);
        }
      });

      // Send updated canvas data to the server for real-time sync
      const canvasImage = canvasRef.current.toDataURL();
      socket.emit("WhiteboardData", canvasImage);
    }
  }, [elements, canvasRef, ctxRef]);

  return (
  <canvas
    ref={canvasRef}
    onMouseDown={handlePointerDown}
    onMouseMove={handlePointerMove}
    onMouseUp={handlePointerUp}
    onTouchStart={handlePointerDown}
    onTouchMove={handlePointerMove}
    onTouchEnd={handlePointerUp}
    className="canvas"
  />
  );
};

export default Whiteboard;
