const container = document.getElementById("Checkers_Board");
let whitePieces;
let blackPieces;
let blackSquares;
let header;
let isWhiteTurn = true;
let y = 0;
let pieceThatCanEat;
let queenThatCanEat = null;
let queenRemovedTimer = false;
let winning = false;
const myButton = document.getElementById("reset-button");
const myResignButtonContent = document.getElementById("Resign-modal");
const Resignation = document.getElementById("Resignation");
const myDrawnButtonCntent = document.getElementById("Draw-modal");
const DrawButton = document.getElementById("draw-button");
const DrawContent = document.getElementById("DrawContent");
const close = document.getElementById("NoButton");
const YesButton = document.getElementById("YesButton");
const resignAccept = document.getElementById("YesButton1");
const closeResignOption = document.getElementById("NoButton2");

const getWhitePieces = () => document.querySelectorAll(".white_player");
const getBlackPieces = () => document.querySelectorAll(".black_player");

function allowDrop(event) {
  event.preventDefault();
}

function createBoard() {
  for (let i = 1; i <= 8; i++) {
    for (let j = 1; j <= 8; j++) {
      const Board = document.createElement("div");
      container.appendChild(Board);
      const Piece = document.createElement("div");
      Board.id = y;

      y++;

      if ((i % 2 !== 0 && y % 2 === 0) || (i % 2 === 0 && y % 2 !== 0)) {
        Board.className = "black";

        if (i > 5) {
          Board.appendChild(Piece);
          Piece.className = "white_player";
          Piece.draggable = true;
        }

        if (i < 4) {
          Board.appendChild(Piece);
          Piece.className = "black_player";
          Piece.draggable = true;
        }
      } else Board.className = "white";
    }
  }

  whitePieces = getWhitePieces();
  blackPieces = getBlackPieces();
  blackSquares = document.querySelectorAll(".black");
  header = document.getElementById("header");
}

function headerColor() {
  header = document.getElementById("header");
  if (isWhiteTurn) {
    header.style.color = "white";
    header.style.backgroundColor = "#0000FF";
    header.innerHTML = "WHITE PLAYER TURN";
  } else {
    header.style.color = "black";
    header.style.backgroundColor = "#FF0000";
    header.innerHTML = "BLACK PLAYER TURN";
  }
}

function removePiece(cell) {
  cell.innerHTML = "";
}

function doubleEating(moveToCell, fromCell) {
  let Sign = isWhiteTurn ? -1 : 1;
  const idAsNumber = parseInt(fromCell.id);
  let Option1Id = parseInt(idAsNumber + Sign * 9);
  let Option2Id = parseInt(idAsNumber + Sign * 7);
  let iddiff = (parseInt(moveToCell.id) - parseInt(fromCell.id)) * Sign;
  const pieceThatMove = document.getElementById(parseInt(moveToCell.id));
  let isQueenMoved = pieceThatMove?.firstChild?.classList.contains("queen");
  if (isQueenMoved && iddiff < 0) {
    Sign *= -1;
    Option1Id = parseInt(idAsNumber + Sign * 9);
    Option2Id = parseInt(idAsNumber + Sign * 7);
  }
  const option1 = document.getElementById(Option1Id);
  const option2 = document.getElementById(Option2Id);

  switchDeletePieces(iddiff, option1, idAsNumber, Sign, option2);
}

function switchDeletePieces(iddiff, option1, idAsNumber, Sign, option2) {
  switch (iddiff) {
    case 36:
    case -36:
      deletePieces(option1, idAsNumber, 27, Sign);
      break;
    case 28:

    case -28:
      deletePieces(option2, idAsNumber, 21, Sign);
      break;
    case 32:
      if (
        isWhiteTurn &&
        isSquareHasOpponentPlayer(option1) &&
        !isSquareHasOpponentPlayer(option2)
      ) {
        deletePieces(option1, idAsNumber, 25, Sign);
      }

      if (isWhiteTurn && idAsNumber === 40) {
        deletePieces(option2, idAsNumber, 23, Sign);
      }

      if (
        !isWhiteTurn &&
        isSquareHasOpponentPlayer(option1) &&
        !isSquareHasOpponentPlayer(option2)
      ) {
        deletePieces(option1, idAsNumber, 25, Sign);
      }
      break;
    case -32:
      if (
        !isWhiteTurn &&
        !isSquareHasOpponentPlayer(option1) &&
        isSquareHasOpponentPlayer(option2)
      ) {
        deletePieces(option1, idAsNumber, 25, Sign);
      } else if (isWhiteTurn) {
        deletePieces(option2, idAsNumber, 23, Sign);
      }

      if (
        isWhiteTurn &&
        isSquareHasOpponentPlayer(option1) &&
        !isSquareHasOpponentPlayer(option2)
      ) {
        deletePieces(option2, idAsNumber, 23, Sign);
      } else if (!isWhiteTurn) {
        deletePieces(option1, idAsNumber, 25, Sign);
      }

      break;
  }
}

function deletePieces(option, idAsNumber, number, Sign) {
  removePiece(option);
  const idOption2 = parseInt(idAsNumber + Sign * number);
  const option2 = document.getElementById(idOption2);
  removePiece(option2);
}

function movePiece(moveToCell) {
  const moveToCellId = parseInt(moveToCell.id);
  const idOfPieceThatCanEat = parseInt(pieceThatCanEat?.id);
  const selectedPiece = document.querySelector(
    ".ClickPiece .white_player, .ClickPiece .black_player"
  );
  const { didEat, fromCell } = updateBoard(
    moveToCell,
    selectedPiece,
    moveToCellId
  );

  burntPiece(didEat, idOfPieceThatCanEat, fromCell, moveToCell);

  SwithchTurns();

  isQueenEat(moveToCell, didEat, fromCell);

  queenRemovedTimer = false;
  checkWin();

  if (!winning) {
    drawCheck();
  }
}

function burntPiece(didEat, idOfPieceThatCanEat, fromCell, moveToCell) {
  if (!didEat && pieceThatCanEat) {
    const didPieceThatCanEatMoved =
      parseInt(idOfPieceThatCanEat) === parseInt(fromCell.id);

    if (didPieceThatCanEatMoved) {
      removePiece(moveToCell);
    } else {
      pieceRemoved = true;
      removePiece(pieceThatCanEat);
    }
  }

  pieceThatCanEat = null;
}

function updateBoard(moveToCell, selectedPiece, moveToCellId) {
  moveToCell.appendChild(selectedPiece);
  queenTransform(moveToCell, selectedPiece, moveToCellId);
  const fromCell = document.querySelector(".ClickPiece");
  removePiece(fromCell);

  const idDiff = parseInt(fromCell.id) - parseInt(moveToCell.id);

  const didEat = idDiff > 9 || idDiff < -9;

  const didDoubleEat = idDiff > 18 || idDiff < -18;

  if (didEat && !didDoubleEat) {
    const idToRemove = parseInt(fromCell.id) - idDiff / 2;
    const cellToRemove = document.getElementById(idToRemove);

    removePiece(cellToRemove);
  }

  if (didDoubleEat) {
    doubleEating(moveToCell, fromCell);
  }

  fromCell.classList.remove("ClickPiece");

  clearCssClass("Possible_Moves");
  return { didEat, fromCell };
}

function isQueenEat(moveToCell, didEat, fromCell) {
  const whitePieces = getWhitePieces();
  const blackPieces = getBlackPieces();
  const pieceThatMove = document.getElementById(parseInt(moveToCell.id));
  let isQueenMoved = pieceThatMove?.firstChild?.classList.contains("queen");

  if (isWhiteTurn) {
    checkQueenBackEating(whitePieces);
  }
  if (!isWhiteTurn) {
    checkQueenBackEating(blackPieces);
  }
  if (queenThatCanEat !== null && !queenRemovedTimer && !didEat) {
    if (parseInt(fromCell.id) !== parseInt(queenThatCanEat.id)) {
      DeleteQueen();
    } else if (isQueenMoved) {
      const movediff = parseInt(moveToCell.id) - parseInt(fromCell.id);
      if (movediff < 10 && movediff > -10) {
        removePiece(pieceThatMove);
      }
    }

    queenThatCanEat = null;
  }
}

function queenTransform(moveToCell, selectedPiece, moveToCellId) {
  if (moveToCellId < 8 || moveToCellId > 55) {
    moveToCell.firstChild.classList.add("queen");
  }
}

function DeleteQueen() {
  if (queenThatCanEat !== null) {
    removePiece(queenThatCanEat);
    queenThatCanEat = null;
  }
}

function checkQueenBackEating(whitePieces) {
  const sign = isWhiteTurn ? 1 : -1;

  whitePieces.forEach((piece) => {
    if (piece.classList.contains("queen")) {
      const cell = piece.parentElement;
      const idAsNumber = parseInt(cell.id);
      const Option1Id = parseInt(idAsNumber + 9 * sign);
      const Option2Id = parseInt(idAsNumber + 7 * sign);
      const Option1 = document.getElementById(Option1Id);
      const Option2 = document.getElementById(Option2Id);
      const Option1EatingAvailable = parseInt(Option1Id + 9 * sign);
      const Option1EatingAvailableCell = document.getElementById(
        Option1EatingAvailable
      );
      const Option2EatingAvailable = parseInt(Option2Id + 7 * sign);
      const Option2EatingAvailableCell = document.getElementById(
        Option2EatingAvailable
      );

      if (
        isSquareHasOpponentPlayer(Option1) &&
        Option1EatingAvailableCell?.className === "black" &&
        Option1EatingAvailableCell.innerHTML === ""
      ) {
        queenThatCanEat = cell;
        queenRemovedTimer = true;
      }

      if (
        isSquareHasOpponentPlayer(Option2) &&
        Option2EatingAvailableCell?.className === "black" &&
        Option2EatingAvailableCell.innerHTML === ""
      ) {
        queenThatCanEat = cell;
        queenRemovedTimer = true;
      }
    }
  });
}

function onCellClick(event) {
  const cell = event.currentTarget;

  const piece =
    event.type === "dragstart"
      ? event.target
      : cell.querySelector(".white_player") ||
        cell.querySelector(".black_player");
  if (piece) {
    onPieceClick(piece);
  }

  if (cell.classList.contains("Possible_Moves")) {
    movePiece(cell);
  }
}

function startGame() {
  createBoard();
  headerColor();

  blackSquares.forEach((square) => {
    square.addEventListener("click", onCellClick);
    square.addEventListener("dragstart", onCellClick);
    square.addEventListener("drop", (event) => {
      if (square.classList.contains("Possible_Moves")) {
        movePiece(event.currentTarget);
      }
    });
  });

  markpiece();
  drawButtons();
}

function checkPossibleEating() {
  const playerPieces = isWhiteTurn ? getWhitePieces() : getBlackPieces();
  const sign = isWhiteTurn ? -1 : 1;
  const classNameOfOpponent = isWhiteTurn ? "black_player" : "white_player";

  playerPieces.forEach((piece) => {
    const cell = piece.parentElement;
    const idAsNumber = parseInt(cell.id);

    const oneStepLeft = document.getElementById(idAsNumber + sign * 9);
    const oneStepRight = document.getElementById(idAsNumber + sign * 7);
    const twoStepsLeft = document.getElementById(idAsNumber + sign * 9 * 2);
    const twoStepsRight = document.getElementById(idAsNumber + sign * 7 * 2);

    const leftOptionHasOpponentPlayer = oneStepLeft?.querySelector(
      `.${classNameOfOpponent}`
    );

    const rightOptionHasOpponentPlayer = oneStepRight?.querySelector(
      `.${classNameOfOpponent}`
    );

    if (
      twoStepsLeft &&
      twoStepsLeft.classList.contains("black") &&
      oneStepLeft &&
      leftOptionHasOpponentPlayer &&
      twoStepsLeft.innerHTML === ""
    ) {
      pieceThatCanEat = cell;
    }

    if (
      twoStepsRight &&
      twoStepsRight.classList.contains("black") &&
      oneStepRight &&
      rightOptionHasOpponentPlayer &&
      twoStepsRight.innerHTML === ""
    ) {
      pieceThatCanEat = cell;
    }
  });
}

function SwithchTurns() {
  if (isWhiteTurn) {
    isWhiteTurn = false;
  } else {
    isWhiteTurn = true;
  }
  markpiece();
  headerColor();
  checkPossibleEating();
}

function markpiece() {
  const active = isWhiteTurn ? "white_player" : "black_player";
  const inActive = !isWhiteTurn ? "white_player" : "black_player";

  document.querySelectorAll(`.${active}`).forEach((player) => {
    player.classList.add("piece");
  });
  document.querySelectorAll(`.${inActive}`).forEach((player) => {
    player.classList.remove("piece");
  });
}

function checkDoubleEating(firstEatingEndCell, sign) {
  const opponentClassName = isWhiteTurn ? "black_player" : "white_player";
  const idAsNumber = parseInt(firstEatingEndCell.id);
  const possibleMove1 = idAsNumber + sign * 9 * 2;
  const nearCellForMove1 = idAsNumber + sign * 9;

  const possibleMove1Cell = document.getElementById(possibleMove1);
  const isMove1Available =
    possibleMove1Cell?.innerHTML === "" &&
    possibleMove1Cell.classList.contains("black");
  const isNearCell1ContainsOpponent = document
    .getElementById(nearCellForMove1)
    ?.querySelector(`.${opponentClassName}`);

  const possibleMove2 = idAsNumber + sign * 7 * 2;
  const nearCellForMove2 = idAsNumber + sign * 7;

  const possibleMove2Cell = document.getElementById(possibleMove2);
  const isMove2Available =
    possibleMove2Cell?.innerHTML === "" &&
    possibleMove2Cell.classList.contains("black");
  const isNearCell2ContainsOpponent = document
    .getElementById(nearCellForMove2)
    ?.querySelector(`.${opponentClassName}`);

  markDoubleMove(
    isMove1Available,
    isNearCell1ContainsOpponent,
    possibleMove1Cell,
    isMove2Available,
    isNearCell2ContainsOpponent,
    possibleMove2Cell,
    firstEatingEndCell
  );
}

function markCellAsPossibleMove(cell) {
  cell.classList.add("Possible_Moves");
  cell.addEventListener("dragover", allowDrop);
}

function markDoubleMove(
  isMove1Available,
  isNearCell1ContainsOpponent,
  possibleMove1Cell,
  isMove2Available,
  isNearCell2ContainsOpponent,
  possibleMove2Cell,
  firstEatingEndCell
) {
  let canDoubleIt = false;
  if (
    isMove1Available &&
    isNearCell1ContainsOpponent &&
    possibleMove1Cell?.className === "black"
  ) {
    canDoubleIt = true;
    markCellAsPossibleMove(possibleMove1Cell);
  }
  if (
    isMove2Available &&
    isNearCell2ContainsOpponent &&
    possibleMove2Cell?.className === "black"
  ) {
    canDoubleIt = true;
    markCellAsPossibleMove(possibleMove2Cell);
  }

  if (!canDoubleIt && firstEatingEndCell?.className === "black") {
    markCellAsPossibleMove(firstEatingEndCell);
  }
}

function checkWin() {
  const whitePieces = getWhitePieces();
  const blackPieces = getBlackPieces();
  const whitePiecesCount = whitePieces.length;
  const blackPiecesCount = blackPieces.length;

  const winningContent = document.getElementById("Game-Over-Screen");
  const PlayerWonContent = document.createElement("p");
  const GameOverModal = document.getElementById("Game-Over-Modal");
  const gameIsOver = whitePiecesCount === 0 || blackPiecesCount === 0;
  const header = document.getElementById("header");

  GameOverModal.appendChild(PlayerWonContent);
  if (gameIsOver) {
    if (isWhiteTurn && whitePiecesCount === 0) {
      header.innerHTML = "BLACK PLAYER WINS!";
      PlayerWonContent.innerHTML = "BLACK PLAYER WINS!";
      header.style.color = "BLACK";
    } else {
      header.innerHTML = "WHITE PLAYER WINS!";
      header.style.color = "WHITE";
      PlayerWonContent.innerHTML = "WHITE PLAYER WINS!";
    }
    winning = true;
    winningContent.style.display = "flex";
  }
}

function drawCheck() {
  const playerPieces = isWhiteTurn ? getWhitePieces() : getBlackPieces();
  const sign = parseInt(isWhiteTurn ? -1 : 1);
  let Counter = 0;

  playerPieces.forEach((piece) => {
    const pieceId = parseInt(piece.parentElement.id);
    const possibleMoves1 = parseInt(pieceId + 9 * sign);
    const possibleDoubleMoves1 = parseInt(pieceId + 18 * sign);
    const possibleMoves2 = parseInt(pieceId + 7 * sign);
    const possibleDoubleMoves2 = parseInt(pieceId + 14 * sign);
    const leftOption = document.getElementById(possibleMoves1);
    const doubleleftOption = document.getElementById(possibleDoubleMoves1);
    const rightOption = document.getElementById(possibleMoves2);
    const doublerightOption = document.getElementById(possibleDoubleMoves2);
    if (
      leftOption?.classList.contains("black") &&
      leftOption.innerHTML === ""
    ) {
      Counter++;
    } else if (
      isSquareHasOpponentPlayer(leftOption) &&
      doubleleftOption?.classList.contains("black") &&
      doubleleftOption.innerHTML === ""
    ) {
      Counter++;
    }
    if (
      rightOption?.classList.contains("black") &&
      rightOption.innerHTML === ""
    ) {
      Counter++;
    } else if (
      isSquareHasOpponentPlayer(rightOption) &&
      doublerightOption?.classList.contains("black") &&
      doublerightOption.innerHTML === ""
    ) {
      Counter++;
    }
  });

  if (Counter === 0) {
    popDrawModal();
  }
}

function popDrawModal() {
  myDrawnButtonCntent.style.display = "flex";
  DrawContent.innerHTML =
    "The checkers game between the White and Black players ended in a Draw.";
  displayButtons(close, YesButton, "none");
}

function checkPossibleMoves(sign) {
  clearCssClass("Possible_Moves");

  const elementMarkedAsClicked = [...document.querySelectorAll(".ClickPiece")];

  if (elementMarkedAsClicked.length === 0) {
    return;
  }

  if (elementMarkedAsClicked.length > 1) {
    return clearCssClass("ClickPiece");
  }

  const selectedCell = elementMarkedAsClicked[0];
  const possibleMoves = calculatePossibleMoves(selectedCell, sign);
  const isQueen = selectedCell?.firstChild.classList.contains("queen");
  if (selectedCell && selectedCell.classList.contains("ClickPiece")) {
    markPossibleMoves(possibleMoves, selectedCell, sign, isQueen);
  }
}

function markPossibleMoves(possibleMoves, selectedPiece, sign, isQueen) {
  possibleMoves.forEach((move) => {
    const targetSquare = document.getElementById(move);

    if (
      targetSquare &&
      targetSquare.className === "black" &&
      !targetSquare.querySelector(".white_player") &&
      !targetSquare.querySelector(".black_player")
    ) {
      markCellAsPossibleMove(targetSquare);
    } else {
      if (isSquareHasOpponentPlayer(targetSquare)) {
        const IdTargetSquare = parseInt(targetSquare.id);
        if (
          parseInt(targetSquare.id - selectedPiece.id - parseInt(sign * 9)) ===
          0
        ) {
          let twoStepsFirstOption = document.getElementById(
            parseInt(IdTargetSquare + 9 * sign)
          );

          if (twoStepsFirstOption?.innerHTML === "") {
            checkDoubleEating(twoStepsFirstOption, sign);
          }
        }

        if (
          parseInt(targetSquare.id - selectedPiece.id - parseInt(sign * 7)) ===
          0
        ) {
          let twoStepsSecondOption = document.getElementById(
            parseInt(IdTargetSquare + 7 * sign)
          );

          if (twoStepsSecondOption?.innerHTML === "") {
            checkDoubleEating(twoStepsSecondOption, sign);
          }
        }

        if (
          parseInt(targetSquare.id - selectedPiece.id + parseInt(sign * 7)) ===
            0 &&
          isQueen
        ) {
          let twoStepsSecondOption = document.getElementById(
            parseInt(IdTargetSquare - 7 * sign)
          );

          if (twoStepsSecondOption?.innerHTML === "") {
            checkDoubleEating(twoStepsSecondOption, -sign);
          }
        }
        if (
          parseInt(targetSquare.id - selectedPiece.id + parseInt(sign * 9)) ===
            0 &&
          isQueen
        ) {
          let twoStepsFirstOption = document.getElementById(
            parseInt(IdTargetSquare - 9 * sign)
          );

          if (twoStepsFirstOption?.innerHTML === "") {
            checkDoubleEating(twoStepsFirstOption, -sign);
          }
        }
      }
    }
  });
}

function calculatePossibleMoves(square, sign) {
  const possibleMoves = [];

  const forwardLeft = parseInt(square.id) + 9 * sign;
  const forwardRight = parseInt(square.id) + 7 * sign;
  const backLeft = parseInt(square.id) - 9 * sign;
  const backRight = parseInt(square.id) - 7 * sign;
  const isQueen = square.firstChild.classList.contains("queen");

  if (isValidMove(forwardLeft)) {
    possibleMoves.push(forwardLeft);
  }

  if (isValidMove(forwardRight)) {
    possibleMoves.push(forwardRight);
  }

  if (isValidMove(backLeft) && isQueen) {
    possibleMoves.push(backLeft);
  }

  if (isValidMove(backRight) && isQueen) {
    possibleMoves.push(backRight);
  }

  return possibleMoves;
}

function isValidMove(move) {
  const targetSquare = document.getElementById(move);
  return targetSquare && targetSquare.className === "black";
}

function isSquareHasOpponentPlayer(square) {
  const classNameOfOpponent = isWhiteTurn ? "black_player" : "white_player";
  return !!square?.querySelector(`.${classNameOfOpponent}`);
}

function clearCssClass(classNames) {
  blackSquares.forEach((square) => {
    square.classList.remove(classNames);
  });
}

function onPieceClick(piece) {
  if (
    (isWhiteTurn && piece.classList.contains("white_player")) ||
    (!isWhiteTurn && piece.classList.contains("black_player"))
  ) {
    const isPieceSelected =
      piece.parentElement.classList.contains("ClickPiece");

    if (isPieceSelected) {
      piece.parentElement.classList.remove("ClickPiece");
    } else {
      piece.parentElement.classList.add("ClickPiece");
    }
  }
  const sign = parseInt(isWhiteTurn ? -1 : 1);
  checkPossibleMoves(sign);
}

function drawButtons() {
  resignButton();

  drawButton();

  displayContent(close, myDrawnButtonCntent, "none");

  YesButton.addEventListener("click", function () {
    DrawContent.innerHTML =
      "The checkers game between the White and Black players ended in a Draw.";
    newGame(YesButton, close, YesButton);
  });
}

function drawButton() {
  DrawButton.addEventListener("click", function () {
    myDrawnButtonCntent.style.display = "flex";

    if (isWhiteTurn) {
      DrawContent.innerHTML =
        "The White Player offers you a tie.<BR> Do you agree?";
      DrawContent.style.color = "red";
    } else {
      DrawContent.innerHTML =
        "The Black Player offers you a tie.<BR> Do you agree?";
      DrawContent.style.color = "blue";
    }

    displayButtons(close, YesButton, "flex");
  });
}

function resignButton() {
  myButton.addEventListener("click", function () {
    Resignation.innerHTML = "Are you sure you want to resign from the game?";

    myResignButtonContent.style.display = "flex";
  });

  resignAccept.addEventListener("click", function () {
    if (isWhiteTurn) {
      Resignation.innerHTML =
        "Resignation accepted.<br> The Black player emerges victorious";
      header.innerHTML = "BLACK PLAYER WINS!";
      header.style.color = "BLACK";
    } else {
      Resignation.innerHTML =
        "Resignation accepted.<br>The White player emerges victorious";
      header.innerHTML = "WHITE PLAYER WINS!";
      header.style.color = "WHITE";
    }

    newGame(resignAccept, closeResignOption, resignAccept);
  });

  displayContent(closeResignOption, myResignButtonContent, "none");
}

function displayButtons(close, YesButton, display) {
  close.style.display = display;
  YesButton.style.display = display;
}

function displayContent(closeResignOption, myResignButtonContent, display) {
  closeResignOption.addEventListener("click", function () {
    let display = "none";
    myResignButtonContent.style.display = display;
  });
}

function newGame(YesButton, closeResignOption, resignAccept) {
  resignAccept.innerHTML = "NEW GAME";
  closeResignOption.style.display = "none";
  YesButton.addEventListener("click", function () {
    window.location.reload();
  });
}
startGame();
