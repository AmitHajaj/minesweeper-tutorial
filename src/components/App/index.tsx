import React, { useState, useEffect } from "react";
import NumberDisplay from "../NumberDisplay";
import Button from "../Button";
import { generateCells, openMultipleCells } from "../../utils";

import "./App.scss";
import { Cell, CellState, CellValue, Face } from "../../types";
import { MAX_COLS, MAX_FLAGS, MAX_ROWS } from "../../constants";

const App: React.FC = () => {
  const [cells, setCells] = useState<Cell[][]>(generateCells());
  const [face, setFace] = useState<Face>(Face.smile);
  const [time, setTime] = useState<number>(0);
  const [live, setLive] = useState<boolean>(false);
  const [bombCounter, setbombCounter] = useState<number>(MAX_FLAGS);
  const [hasLost, setHasLost] = useState<boolean>(false);
  const [hasWon, setHasWon] = useState<boolean>(false);

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
    if (live && time < 999) {
      const timer = setInterval(() => {
        setTime(time + 1);
      }, 1000);

      return () => {
        clearInterval(timer);
      };
    }
  }, [live, time]);

  useEffect(() => {
    if (hasLost) {
      setFace(Face.lost);
      setLive(false);
    }
  }, [hasLost]);

  useEffect(() => {
    if (hasWon) {
      setLive(false);
      setFace(Face.won);
    }
  }, [hasWon]);

  const handleCellClick = (rowParam: number, colParam: number) => (): void => {
    let newCells = cells.slice();

    if (!live) {
      let isBomb = newCells[rowParam][colParam].value === CellValue.bomb;

      while (isBomb) {
        console.log("bombbbb");
        newCells = generateCells();
        if (newCells[rowParam][colParam].value !== CellValue.bomb) {
          isBomb = false;
          break;
        }
      }
      setLive(true);
    }

    const currCell = newCells[rowParam][colParam];

    if (
      currCell.state === CellState.flagged ||
      currCell.state === CellState.visible
    ) {
      return;
    }

    if (currCell.value === CellValue.bomb) {
      setHasLost(true);
      newCells[rowParam][colParam].red = true;
      newCells = showAllBombs();
      setCells(newCells);
      setFace(Face.lost);
      return;
    } else if (currCell.value === CellValue.none) {
      newCells = openMultipleCells(newCells, rowParam, colParam);
    } else {
      newCells[rowParam][colParam].state = CellState.visible;
    }

    // check to see if you have won
    let safeOpenCellsExists = false;
    for (let row = 0; row < MAX_ROWS; row++) {
      for (let col = 0; col < MAX_COLS; col++) {
        const currCell = newCells[row][col];
        if (
          currCell.value !== CellValue.bomb &&
          currCell.state === CellState.open
        ) {
          safeOpenCellsExists = true;
          break;
        }
      }
    }

    if (!safeOpenCellsExists) {
      newCells = newCells.map((row) =>
        row.map((cell) => {
          if (cell.value === CellValue.bomb) {
            return {
              ...cell,
              state: CellState.flagged,
            };
          }
          return cell;
        })
      );
      setHasWon(true);
    }

    setCells(newCells);
  };

  const handleFaceClick = (): void => {
    setLive(false);
    setTime(0);
    setCells(generateCells());
    setbombCounter(MAX_FLAGS);
    setHasLost(false);
    setHasWon(false);
  };

  const handleCellContext =
    (rowParam: number, colParam: number) =>
    (e: React.MouseEvent<HTMLDivElement, MouseEvent>): void => {
      e.preventDefault();

      if (!live) {
        return;
      }

      const currCells = cells.slice();
      const currCell = cells[rowParam][colParam];

      if (currCell.state === CellState.visible) {
        return;
      } else if (currCell.state === CellState.open) {
        currCells[rowParam][colParam].state = CellState.flagged;
        setCells(currCells);
        setbombCounter(bombCounter - 1);
      } else if (currCell.state === CellState.flagged) {
        currCells[rowParam][colParam].state = CellState.open;
        setCells(currCells);
        setbombCounter(bombCounter + 1);
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
          red={cell.red}
        />
      ))
    );
  };

  const showAllBombs = (): Cell[][] => {
    const currCells = cells.slice();
    return currCells.map((row) =>
      row.map((cell) => {
        if (cell.value === CellValue.bomb) {
          return {
            ...cell,
            state: CellState.visible,
          };
        }
        return cell;
      })
    );
  };

  return (
    <div className="App">
      <div className="Header">
        <NumberDisplay value={bombCounter} />
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
