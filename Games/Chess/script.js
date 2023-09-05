// DOM --> fully loaded

document.addEventListener('DOMContentLoaded', () => {
     let board = null; // board initialization
     const game = new Chess(); // creates a new game instance
     const moveHistory = document.getElementById('move-history');
     // gets the move history container

     let moveCount = 1; // start chess notation for moves
     let userColor = 'w'; // white starts the game

     // Make Random Moves
     const makeRandomMove = () => {
          const possibleMoves = game.moves();

          if(game.game_over()) {
               alert("Checkmate!");
          } else{
               const randomIdx = Math.floor(Math.random() * possibleMoves.length);
               const move = possibleMoves[randomIdx];
               game.move(move);
               board.position(game.fen());
               recordMove(move, moveCount); // Chess Notation Fen-Notation
               moveCount++;
          }
     };

     // Record and Display Move History
     const recordMove = (move, count) => {
          const formattedMove = count % 2 === 1 ? `${Math.ceil(count / 2)}.${move}` : `${move} -`;
          moveHistory.textContent += formattedMove + ' ';
          moveHistory.scrollTop = moveHistory.scrollHeight;
          // keeps most recent move in the scroll view
     }

     // Function for start game --> drag piece to start
     const onDragStart = (source, piece) => {
          // User can only drag their color of piece
          return !game.game_over() && piece.search(userColor) === 0;
     }

     // Function for dropping a piece for the move
     const onDrop = (source, target) => {
          const move = game.move({
               from: source,
               to: target,
               promotion: 'q',
          });

          if(move === null) return 'snapback';

          window.setTimeout(makeRandomMove, 250);
          recordMove(move.san, moveCount); // Displays random move from comp
          moveCount++;
     };

     // Function to end of move and snap
     const onSnapEnd = () => {
          board.position(game.fen());
     };

     // Configuration for the chessboard
     const boardConfig ={
          showNotation: true,
          draggable: true,
          position: 'start',
          onDragStart,
          onDrop,
          onSnapEnd,
          moveSpeed: 'fast',
          snapBackSpeed: 500,
          snapSpeed: 100,
     };

     // Initialize board
     board = Chessboard('board', boardConfig);

     // Event Listener for "Play Again"
     document.querySelector('.play-again').addEventListener('click', () => {
          game.reset();
          board.start();
          moveHistory.textContent = ' ';
          moveCount = 1;
          userColor = 'w';
     });

     document.querySelector('.set-pos').addEventListener('click', () => {
          const fen = prompt("Enter FEN Notation for the Board Position")
          if(fen !== null) {
               if(game.load(fen)){
                    board.position(fen);
                    moveHistory.textContent = '';
                    moveCount = 1;
                    userColor = 'w';
               } else {
                    alert("Invalid FEN notation, check again");
               }
          }
     });

     document.querySelector('.flip-board').addEventListener('click', () => {
          board.flip();
          makeRandomMove();
          // Toggle user's color again after flipped board
          userColor = userColor === 'w' ? 'b' : 'w';
     });
})