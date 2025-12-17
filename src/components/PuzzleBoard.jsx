import PuzzlePiece from "./PuzzlePiece";
import { useEffect, useRef, useState, useMemo } from "react";

export default function PuzzleBoard({
    gridState,
    pieces,
    rows,
    cols,
    config,
    onDragOver,
    onDrop,
    onDragStart,
    onPieceClick,
    I18n,
    isLocked,
}) {
    const boardWrapperRef = useRef(null);
    const [containerSize, setContainerSize] = useState({
        width: 0,
        height: 0,
    });

    useEffect(() => {
        if (!boardWrapperRef.current) return;
        const observer = new ResizeObserver(([entry]) => {
            setContainerSize({ width: entry.contentRect.width, height: entry.contentRect.height });
        });
        observer.observe(boardWrapperRef.current);

        return () => observer.disconnect();
    }, []);

    const gridStyle = useMemo(() => {
        const { width: availWidth, height: availHeight } = containerSize;
        if (availWidth === 0 || availHeight === 0 || !rows || !cols) return {};

        const gap = 1;
        const maxCellWidth = (availWidth - gap * (cols - 1)) / cols;
        const maxCellHeight = (availHeight - gap * (rows - 1)) / rows;

        const cellSize = Math.min(maxCellWidth, maxCellHeight);

        if (cellSize <= 0) return { opacity: 0 };

        const totalWidth = cellSize * cols + gap * (cols - 1);
        const totalHeight = cellSize * rows + gap * (rows - 1);

        return {
            width: `${totalWidth}px`,
            height: `${totalHeight}px`,
            gridTemplateColumns: `repeat(${cols}, 1fr)`,
            gridTemplateRows: `repeat(${rows}, 1fr)`,
        };
    }, [containerSize, rows, cols]);

    return (
        <div className="puzzle-board">
            <h3>{I18n.getTrans("i.board")}</h3>
            <div
                className="board-area"
                ref={boardWrapperRef}
                style={{
                    flex: 1,
                    width: "100%",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    overflow: "hidden"
                }}
            >
                <div
                    className="grid"
                    style={gridStyle}
                >
                    {gridState.map((pieceId, index) => {
                        const piece = pieces.find((p) => p.id === pieceId);
                        return (
                            <div
                                key={index}
                                className="grid-cell"
                                onDragOver={onDragOver}
                                onDrop={(e) => onDrop(e, index)}
                                style={{
                                    opacity: isLocked ? 0.8 : 1,
                                }}
                            >
                                {piece && (
                                    <PuzzlePiece
                                        piece={piece}
                                        config={config}
                                        rows={rows}
                                        cols={cols}
                                        onDragStart={onDragStart}
                                        onPieceClick={onPieceClick}
                                        isLocked={isLocked}
                                    />
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
