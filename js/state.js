export const state = {
    SIZE: 0,
    MINES: 0,
    expert: false,
    board: [],      // Matriz lógica (números y bombas)
    revealed: [],   // Matriz de revelados (true/false)
    flagged: [],    // Matriz de banderas (true/false)
    cellsDOM: [],   // Referencias a los divs del tablero
    gameOver: false,
    firstClick: true,
    timer: null,
    seconds: 0,
    flagsUsed: 0,
    lastConfig: {}  // Para reiniciar rápido
};