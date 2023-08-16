// ASMR Programming - Sudoku Solver
document.addEventListener('DOMContentLoaded', function () {
     const gridSize = 9;
     const solveButton = document.getElementById("solve-btn");
     solveButton.addEventListener('click', solveSudoku);

     const sudokuGrid = document.getElementById("sudoku-grid");
     // Create grid and inputs
     for (let row = 0; row < gridSize; row++) {
          const newRow = document.createElement("tr");
          for (let col = 0; col < gridSize; col++){
               const cell = document.createElement("td");
               const input = document.createElement("input");

               input.type = "number";
               input.className = "cell";
               input.id = `cell-${row}-${col}`;
               cell.appendChild(input)
               newRow.appendChild(cell);
          }
          sudokuGrid.appendChild(newRow);
     }
});

async function solveSudoku() {
     const gridSize = 9;
     const sudokuArray = [];

     // Fill array with input values provided from generated grid
     for (let row = 0; row < gridSize; row++){
          sudokuArray[row] = [];
          for (let col = 0; col < gridSize; col++) {
               const cellId = `cell-${row}-${col}`;
               const cellValue = document.getElementById(cellId).value;
               sudokuArray[row][col] = cellValue !== "" ? parseInt(cellValue) : 0;
          }
     }

     // Figure out user-inputs cells and where they are in the array
     for (let row = 0; row < gridSize; row++) {
          for (let col = 0; col < gridSize; col++) {
               const cellId = `cell-${row}-${col}`;
               const cell = document.getElementById(cellId)

               if (sudokuArray[row][col] !== 0) {
                    cell.classList.add("user-input");
               }
          }
     }


     // // Solve the sudoku and display the solution
     if (solveSudokuHelper(sudokuArray)) {
          for (let row = 0; row < gridSize; row++) {
               for (let col = 0; col < gridSize; col++) {
                    const cellId = `cell-${row}-${col}`;
                    const cell = document.getElementById(cellId);

                    // Fill in solved values and apply animation
                    if (!cell.classList.contains("user-input")) {
                         cell.value = sudokuArray[row][col];
                         cell.classList.add("solved");
                         await sleep(20); // Add a delay for visualization
                    }
               }
          }
     } else {
          alert("No solution found || No solution exists");
     }

     // // Create solve sudoku and display generated solution
     // if (solveSudokuHelper(sudokuArray)) {
     //      for (let row=0; row < gridSize; row++) {
     //           for (let col=0; col < gridSize; row++) {
     //                const cellId = `cell-${row}-${col}`;
     //                const cell = document.getElementById(cellId);

     //                // Fill in the solved values, animate?
     //                if (!cell.classList.contains("user-input")) {
     //                     cell.value = sudokuArray[row][col];
     //                     cell.classList.add("solved");
     //                     await sleep(20); // Add a delay for visualization
     //                }
     //           }
     //      }
     // } else {
     //      alert("No solution found || No solution exists");
     // }
}

function solveSudokuHelper(board) {
     const gridSize = 9;
     for (let row = 0; row < gridSize; row++) {
          for (let col = 0; col < gridSize; col++) {
               if (board[row][col] == 0) {
                    for (let num = 1; num <=9; num++) {
                         if(isValidMove(board, row, col, num)) {
                              board[row][col] = num;

                              // Recursive implementation to find solution
                              // Leetcode problem --> 
                              if (solveSudokuHelper(board)) {
                                   return true; // solved puzzle
                              }
                              board[row][col] = 0; // Backtracking implementation starts
                         }
                    }
                    return false; // no valid numbers were found
               }
          }
     }
     return true; // All cells have values generated / are filled
}

function isValidMove(board, row, col, num) {
     const gridSize = 9;

     // Check rows and columns for conflicts
     for (let i = 0; i < gridSize; i++) {
          if (board[row][i] === num || board[i][col] === num) {
               return false; // not a valid move, conflicts exist
          }
     }

     // Check the 3x3 subgrid for conflicts (second parameter to solve)
     const startRow = Math.floor(row / 3) * 3;
     const startCol = Math.floor(col / 3) * 3;

     for (let i = startRow; i < startRow+3; i++) {
          for (let j = startCol; j < startCol+3; j++) {
               if(board[i][j] === num){
                    return false; // subgrid has a conflict with existing numbers
               }
          }
     }

     return true; // No conflicts have been found so far, we have a valid move
}

function sleep(ms) {
     return new Promise(resolve => setTimeout(resolve, ms));
}