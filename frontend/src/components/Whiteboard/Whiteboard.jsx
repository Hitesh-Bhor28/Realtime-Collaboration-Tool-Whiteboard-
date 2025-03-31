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

  // Function to get mouse position relative to the canvas
  const getRelativePosition = (event) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = rect.width / canvas.width; // FIX: Invert the scaling
    const scaleY = rect.height / canvas.height;

    const x = (event.clientX - rect.left) / scaleX; // FIX: Divide instead of multiply
    const y = (event.clientY - rect.top) / scaleY;

    return { x, y };
  };

  const handleStart = (e) => {
    e.preventDefault();
    const event = e.touches ? e.touches[0] : e; // Support both touch and mouse
    const { x, y } = getRelativePosition(event);
    setIsDrawing(true);

    if (tool === "pencil") {
      setElements((prev) => [
        ...prev,
        { type: "pencil", path: [[x, y]], stroke: color },
      ]);
    } else if (tool === "line") {
      setElements((prev) => [
        ...prev,
        { type: "line", x1: x, y1: y, x2: x, y2: y, stroke: color },
      ]);
    } else if (tool === "rectangle") {
      setElements((prev) => [
        ...prev,
        { type: "rectangle", x1: x, y1: y, x2: x, y2: y, stroke: color },
      ]);
    } else if (tool === "eraser") {
      setElements((prev) => [
        ...prev,
        { type: "eraser", path: [[x, y]], stroke: "white" },
      ]);
    }
  };

  const handleMove = (e) => {
    if (!isDrawing) return;
    e.preventDefault();
    const event = e.touches ? e.touches[0] : e;
    const { x, y } = getRelativePosition(event);

    setElements((prev) => {
      const index = prev.length - 1;
      const element = prev[index];

      if (element.type === "pencil" || element.type === "eraser") {
        const newPath = [...element.path, [x, y]];
        return [...prev.slice(0, index), { ...element, path: newPath }];
      } else if (element.type === "line" || element.type === "rectangle") {
        return [...prev.slice(0, index), { ...element, x2: x, y2: y }];
      }

      return prev;
    });
  };

  const handleEnd = () => {
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
      onMouseDown={handleStart}
      onMouseMove={handleMove}
      onMouseUp={handleEnd}
      onTouchStart={handleStart} // For touch support
      onTouchMove={handleMove} // For touch support
      onTouchEnd={handleEnd} // For touch support
      className="canvas"
    ></canvas>
  );
};

export default Whiteboard;
