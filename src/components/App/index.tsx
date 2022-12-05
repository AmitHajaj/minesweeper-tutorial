import React, { useState, useEffect } from "react";
import NumberDisplay from "../NumberDisplay";
import Button from "../Button";
import { generateCells } from "../../utils";

import "./App.scss";
import { Cell, CellState, Face } from "../../types";

const App: React.FC = () => {
  const [cells, setCells] = useState<Cell[][]>(generateCells());
  const [face, setFace] = useState<Face>(Face.smile);
  const [time, setTime] = useState<number>(0);
  const [live, setLive] = useState<boolean>(false);

  useEffect(() => {
    const handleMousedown = () => {
      setFace(Face.oh);
    };

    const handleMouseup = () => {
      setFace(Face.smile);
    };

    window.addEventListener("mousedown", handleMousedown);
    window.addEventListener("mouseup", handleMouseup);

    return () => {
      window.removeEventListener("mousedown", handleMousedown);
      window.removeEventListener("mouseup", handleMouseup);
    };
  }, []);

  useEffect(() => {
    if (live) {
      const timer = setInterval(() => {
        setTime(time + 1);
      }, 1000);

      return () => {
        clearInterval(timer);
      };
    }
  }, [live, time]);

  const handleCellClick = (rowParam: number, colParam: number) => (): void => {
    if (!live) {
      setLive(true);
    }
  };

  const handleFaceClick = (): void => {
    if (live) {
      setLive(false);
      setTime(0);
      setCells(generateCells());
    }
  };

  const handleCellContext =
    (rowParam: number, colParam: number) =>
    (e: React.MouseEvent<HTMLDivElement, MouseEvent>): void => {
      e.preventDefault();

      const currCells = cells.slice();
      const currCell = cells[rowParam][colParam];

      if (currCell.state === CellState.visible) {
        return;
      } else if (currCell.state === CellState.open) {
        currCells[rowParam][colParam].state = CellState.flagged;
        setCells(currCells);
      }
    };

  const renderCells = (): React.ReactNode => {
    return cells.map((row, rowIndex) =>
      row.map((cell, colIndex) => (
        <Button
          key={`${rowIndex}-${colIndex}`}
          state={cell.state}
          value={cell.value}
          row={rowIndex}
          col={colIndex}
          onClick={handleCellClick}
          onContext={handleCellContext}
        />
      ))
    );
  };

  return (
    <div className="App">
      <div className="Header">
        <NumberDisplay value={1} />
        <div className="Face" onClick={handleFaceClick}>
          <span role="img" aria-label="Smiley Face">
            {face}
          </span>
        </div>
        <NumberDisplay value={time} />
      </div>
      <div className="Body">{renderCells()}</div>
    </div>
  );
};
export default App;
