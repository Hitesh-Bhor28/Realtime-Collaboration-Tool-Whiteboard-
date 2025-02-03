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
}) => {
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
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (event.clientX - rect.left) * scaleX;
    const y = (event.clientY - rect.top) * scaleY;
    return { x, y };
  };

  const handleMouseDown = (e) => {
    const { x, y } = getRelativePosition(e);
    setIsDrawing(true);

    if (tool === "pencil") {
      setElements((prevElements) => [
        ...prevElements,
        { type: "pencil", path: [[x, y]], stroke: color },
      ]);
    } else if (tool === "line") {
      setElements((prevElements) => [
        ...prevElements,
        { type: "line", x1: x, y1: y, x2: x, y2: y, stroke: color },
      ]);
    } else if (tool === "rectangle") {
      setElements((prevElements) => [
        ...prevElements,
        { type: "rectangle", x1: x, y1: y, x2: x, y2: y, stroke: color },
      ]);
    }
  };

  const handleMouseMove = (e) => {
    if (!isDrawing) return;
    const { x, y } = getRelativePosition(e);

    setElements((prevElements) => {
      const index = prevElements.length - 1;
      const element = prevElements[index];

      if (element.type === "pencil") {
        const newPath = [...element.path, [x, y]];
        const updatedElement = { ...element, path: newPath };
        return [...prevElements.slice(0, index), updatedElement];
      } else if (element.type === "line") {
        const updatedElement = { ...element, x2: x, y2: y };
        return [...prevElements.slice(0, index), updatedElement];
      } else if (element.type === "rectangle") {
        const updatedElement = { ...element, x2: x, y2: y };
        return [...prevElements.slice(0, index), updatedElement];
      }
      return prevElements;
    });
  };

  const handleMouseUp = () => {
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
    const roughCanvas = rough.canvas(canvas);

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
    });
  }, [elements, canvasRef, ctxRef]);

  return (
    <canvas
      ref={canvasRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      className="canvas"
    ></canvas>
  );
};

export default Whiteboard;
