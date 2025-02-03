import React, { useState, useEffect, useLayoutEffect } from "react";
import rough from "roughjs";
import "./index.css";

const roughGenerator = rough.generator();

const Whiteboard = ({ canvasRef, ctxRef, elements, setElements }) => {
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctxRef.current = ctx; // Store the context in ctxRef
  }, []);

  const handleMouseDown = (e) => {
    const { offsetX, offsetY } = e.nativeEvent;
    setElements((prevElements) => [
      ...prevElements,
      {
        type: "pencil",
        path: [[offsetX, offsetY]],
        stroke: "black",
      },
    ]);
    setIsDrawing(true);
  };

  const handleMouseMove = (e) => {
    if (!isDrawing) return;

    const { offsetX, offsetY } = e.nativeEvent;
    setElements((prevElements) =>
      prevElements.map((ele, index) =>
        index === prevElements.length - 1
          ? { ...ele, path: [...ele.path, [offsetX, offsetY]] }
          : ele
      )
    );
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
  };

  useLayoutEffect(() => {
    if (!canvasRef.current || !ctxRef.current) return;
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    const roughCanvas = rough.canvas(canvas);

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    elements.forEach((element) => {
      if (element.type === "pencil") {
        const roughElement = roughGenerator.linearPath(element.path, {
          stroke: element.stroke,
        });
        roughCanvas.draw(roughElement);
      }
    });
  }, [elements]);

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
