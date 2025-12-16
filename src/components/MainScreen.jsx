import { useEffect, useState } from "react";
import "./../assets/scss/MainScreen.scss";
import { useContext } from "react";
import { GlobalContext } from "./GlobalContext";

export default function MainScreen({ config, sendSolution }) {
  const { I18n } = useContext(GlobalContext);
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
      initializePuzzle(3, 3);
    }
  }, [config]);

  useEffect(() => {
    if (gridState.length > 0 && gridState.every((cell) => cell !== null)) {
      const orderedPieces = gridState.map((pieceId) =>
        pieces.find((p) => p.id === pieceId)
      );

      const firstSide = orderedPieces[0].currentSide;
      const allSameSide = orderedPieces.every((p) => p.currentSide === firstSide);
      const allCorrectPositions = orderedPieces.every((p, index) => p.correctPosition === index);

      if (allSameSide && allCorrectPositions) {
        sendSolution(firstSide);
      }
    }
  }, [gridState, pieces]);

  const initializePuzzle = (r, c) => {
    const totalPieces = r * c;
    const newPieces = [];
    for (let i = 0; i < totalPieces; i++) {
      newPieces.push({
        id: i,
        correctPosition: i,
        currentSide: Math.random() < 0.5 ? 1 : 2,
        isPlaced: false,
      });
    }

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
    const incomingPieceId = parseInt(e.dataTransfer.getData("pieceId"));
    if (isNaN(incomingPieceId)) return;

    const targetPieceId = gridState[index];
    const newGridState = [...gridState];
    const oldIndex = gridState.indexOf(incomingPieceId);

    if (oldIndex !== -1) {
      newGridState[oldIndex] = null;
    }

    newGridState[index] = incomingPieceId;

    if (targetPieceId !== null) {
      if (oldIndex !== -1) {
        newGridState[oldIndex] = targetPieceId;
      }
    }

    setGridState(newGridState);

    setPieces((prev) =>
      prev.map((p) => {
        if (p.id === incomingPieceId) {
          return { ...p, isPlaced: true };
        }
        if (targetPieceId !== null && oldIndex === -1 && p.id === targetPieceId) {
          return { ...p, isPlaced: false };
        }
        return p;
      })
    );
  };

  const handleDropToContainer = (e) => {
    e.preventDefault();
    const pieceId = parseInt(e.dataTransfer.getData("pieceId"));
    if (isNaN(pieceId)) return;

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
        <h3>{I18n.getTrans("i.pieces")}</h3>
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
          <h3>{I18n.getTrans("i.board")}</h3>
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
