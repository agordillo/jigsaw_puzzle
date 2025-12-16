import React, { useState, useEffect } from "react";
import "./../assets/scss/MainScreen.scss";

export default function MainScreen({ config, sendInput, result }) {
  const [pieces, setPieces] = useState([]);
  const [gridState, setGridState] = useState([]);
  const [rows, setRows] = useState(3);
  const [cols, setCols] = useState(3);

  useEffect(() => {
    if (config) {
      const r = config.rows || 3;
      const c = config.cols || 3;
      setRows(r);
      setCols(c);
      initializePuzzle(r, c);
    } else {
      // Fallback if config is not yet loaded
      initializePuzzle(3, 3);
    }
  }, [config]);

  const initializePuzzle = (r, c) => {
    const totalPieces = r * c;
    const newPieces = [];
    for (let i = 0; i < totalPieces; i++) {
      newPieces.push({
        id: i,
        correctPosition: i,
        currentSide: Math.random() < 0.5 ? 1 : 2, // Randomize initial side
        isPlaced: false,
      });
    }

    // Shuffle pieces
    for (let i = newPieces.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newPieces[i], newPieces[j]] = [newPieces[j], newPieces[i]];
    }

    setPieces(newPieces);
    setGridState(Array(totalPieces).fill(null));
  };

  const handleDragStart = (e, pieceId) => {
    e.dataTransfer.setData("pieceId", pieceId);
  };

  const handleDrop = (e, index) => {
    e.preventDefault();
    const pieceId = parseInt(e.dataTransfer.getData("pieceId"));
    if (isNaN(pieceId)) return;

    // Check if spot is occupied
    if (gridState[index] !== null) return;

    // Move piece to grid
    const newGridState = [...gridState];

    // If piece was already on grid, remove it from old spot
    const oldIndex = gridState.indexOf(pieceId);
    if (oldIndex !== -1) {
      newGridState[oldIndex] = null;
    }

    newGridState[index] = pieceId;
    setGridState(newGridState);

    // Update piece status
    setPieces((prev) =>
      prev.map((p) => (p.id === pieceId ? { ...p, isPlaced: true } : p))
    );
  };

  const handleDropToContainer = (e) => {
    e.preventDefault();
    const pieceId = parseInt(e.dataTransfer.getData("pieceId"));
    if (isNaN(pieceId)) return;

    // Remove from grid if it was there
    const oldIndex = gridState.indexOf(pieceId);
    if (oldIndex !== -1) {
      const newGridState = [...gridState];
      newGridState[oldIndex] = null;
      setGridState(newGridState);
    }

    setPieces((prev) =>
      prev.map((p) => (p.id === pieceId ? { ...p, isPlaced: false } : p))
    );
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const togglePieceSide = (pieceId) => {
    setPieces((prev) =>
      prev.map((p) =>
        p.id === pieceId
          ? { ...p, currentSide: p.currentSide === 1 ? 2 : 1 }
          : p
      )
    );
  };

  const getBackgroundStyle = (piece) => {
    const imgUrl = piece.currentSide === 1 ? config.image1 : config.image2;
    const row = Math.floor(piece.correctPosition / cols);
    const col = piece.correctPosition % cols;

    // Calculate percentage positions
    // Avoid division by zero if rows/cols = 1 (though unlikely for a puzzle)
    const xPos = cols > 1 ? (col * 100) / (cols - 1) : 0;
    const yPos = rows > 1 ? (row * 100) / (rows - 1) : 0;

    return {
      backgroundImage: `url(${imgUrl})`,
      backgroundPosition: `${xPos}% ${yPos}%`,
      backgroundSize: `${cols * 100}% ${rows * 100}%`,
    };
  };

  return (
    <div id="MainScreen" className="screen_wrapper">
      <div
        className="pieces-pool"
        onDragOver={handleDragOver}
        onDrop={handleDropToContainer}
      >
        <h3>Piezas (Click para girar)</h3>
        <div className="pieces-list">
          {pieces.filter(p => !p.isPlaced).map((piece) => (
            <div
              key={piece.id}
              className="puzzle-piece"
              draggable
              onDragStart={(e) => handleDragStart(e, piece.id)}
              onClick={() => togglePieceSide(piece.id)}
              style={getBackgroundStyle(piece)}
            />
          ))}
        </div>
      </div>
      <div className="puzzle-container">


        <div className="puzzle-board">
          <h3>Tablero</h3>
          <div className="grid" style={{
            gridTemplateColumns: `repeat(${cols}, 1fr)`,
            gridTemplateRows: `repeat(${rows}, 1fr)`
          }}>
            {gridState.map((pieceId, index) => {
              const piece = pieces.find(p => p.id === pieceId);
              return (
                <div
                  key={index}
                  className="grid-cell"
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, index)}
                >
                  {piece && (
                    <div
                      className="puzzle-piece"
                      draggable
                      onDragStart={(e) => handleDragStart(e, piece.id)}
                      onClick={() => togglePieceSide(piece.id)}
                      style={getBackgroundStyle(piece)}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
