import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';


function Square(props) {
    let style = {background: '#fff'};
    if (props.colorFlag){
        style = {background: '#ff5252'};
    }
    return (
        <button className="square" onClick={props.onClick} style={ style }>
            {props.value}
        </button>
    );
}

class Board extends React.Component {
    renderSquare(i) {
        let won = false;
        if (this.props.winnerLine && this.props.winnerLine.includes(i)){
            won = true;
        }
        return (
            <Square
                value={this.props.squares[i]}
                onClick={() => this.props.onClick(i)}
                colorFlag={won}
            />
        );
    }

    createSquares() {
        let rows = [];
        for(let i = 0; i < 3; i++){
            let squares = [];
            for(let j = 0; j < 3; j++){
                squares.push(this.renderSquare(3*i+j));
            }
            rows.push(<div className="board-row">{squares}</div>);
        }
        return rows;
    }

    render() {
        return (
            <div>
                {this.createSquares()}
            </div>
        );
    }
}

class Game extends React.Component {
    constructor() {
        super();
        this.state = {
            history: [
                {
                    squares: new Array(9).fill(null),
                    indexes: new Array(9).fill(null)
                }
            ],
            stepNumber: 0,
            stepIndex: [null, null],
            xIsNext: true,
            strictStepOrder: true
        };
    }

    handleClick(i) {
        const history = this.state.history.slice(0, this.state.stepNumber + 1);
        const current = history[history.length - 1];
        const squares = current.squares.slice();
        const indexRow = Math.floor(i / 3) + 1;
        const indexCol = (i % 3) + 1;
        const stepIndex = [indexRow, indexCol];

        if (calculateWinner(squares) || squares[i]) {
            return;
        }
        squares[i] = this.state.xIsNext ? "X" : "O";

        this.setState({
            history: history.concat([
                {
                    squares: squares,
                    indexes: stepIndex
                }
            ]),
            stepNumber: history.length,
            stepIndex: stepIndex,
            xIsNext: !this.state.xIsNext
        });
    }

    jumpTo(step) {
        this.setState({
            stepNumber: step,
            stepIndex: this.state.history[step].indexes,
            xIsNext: (step % 2) === 0
        });
    }

    switchOrder(){
        this.setState({
            strictStepOrder: !this.state.strictStepOrder
        });
    }

    render() {
        const history = this.state.history;
        const current = history[this.state.stepNumber];
        const winner = calculateWinner(current.squares);
        const index = this.state.stepIndex;
        const moves = history.map((step, move) => {
            const pos =  history[move].indexes;
            const desc = move ?
                'Go to move #' + move + ', position: ' + Object.values(pos):
                'Go to game start';
            
            if (index === pos){
                return (
                    <li key={move}>
                        <button onClick={() => this.jumpTo(move)}><b>{desc}</b></button>
                    </li>
                );
            }
            return (
                <li key={move}>
                    <button onClick={() => this.jumpTo(move)}>{desc}</button>
                </li>
            );
        });

        if (!this.state.strictStepOrder){
            moves.reverse()
        }

        let status;
        let winnerLine;
        if (winner) {
            status = "Winner: " + Object.values(winner.winner);
            winnerLine = Object.values(winner.line);
        } else {
            status = "Next player: " + (this.state.xIsNext ? "X" : "O");
            winnerLine = false;
        }

        return (
            <div className="game">
                <div className="game-board">
                    <Board
                        squares={current.squares}
                        winnerLine={winnerLine}
                        onClick={i => this.handleClick(i)}
                    />
                </div>
                <div className="game-info">
                    <div>{status}</div>
                    <button onClick={() => this.switchOrder()}>{'Switch move order'}</button>
                    <ol>{moves}</ol>
                </div>
            </div>
        );
    }
}

// ========================================

ReactDOM.render(<Game />, document.getElementById("root"));

function calculateWinner(squares) {
    const lines = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6]
    ];

    for (let i = 0; i < lines.length; i++) {
        const [a, b, c] = lines[i];
        if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
            return {
                winner: squares[a],
                line: [a, b, c]
            };
        }
    }
}
