import { useCallback, useState, useMemo, useEffect } from "react";
import { Game } from "./Game";
import "./App.css";
import { Modal } from "./Modal";

const App = () => {
	const [isLeftPlaying, setLeftPlaying] = useState(Math.random() < 0.5);
	const [isLeftComplete, setLeftComplete] = useState(false);
	const [isRightComplete, setRightComplete] = useState(false);
	const [showModal, setShowModal] = useState(false);
	const [modalText, setModalText] = useState("");
	const [leftMoves, setLeftMoves] = useState(0);
	const [rightMoves, setRightMoves] = useState(0);
	const [leftWord, setLeftWord] = useState("");
	const [rightWord, setRightWord] = useState("");

	const onLeftComplete = useCallback((won, word, moves) => {
		// if (won) alert("Left side completed their board");
		// else alert("Left side failed, word was " + word);
		setLeftComplete(true);
		setLeftWord(word);
		setLeftMoves(won ? moves : null);
	}, []);

	const onRightComplete = useCallback((won, word, moves) => {
		// if (won) alert("Right side completed their board");
		// else alert("Right side failed, word was " + word);
		setRightComplete(true);
		setRightWord(word);
		setRightMoves(won ? moves : null);
	}, []);

	const cols = useMemo(() => 5 + Math.round(Math.random()), []);

	useEffect(() => {
		if (leftMoves !== 0 && rightMoves !== 0) {
			const display = (moves: number, pfx = "with", sfx = "", word = "") =>
				moves <= 0 || moves === null
					? `failed and the word was "${word}"`
					: `${pfx} ${moves} move${moves > 1 ? "s" : ""}${sfx ? ` ${sfx}` : ""
					}`;

			if (leftMoves === rightMoves) {
				if (leftMoves === null) {
					setModalText(
						`Left side ${display(
							leftMoves,
							"",
							"",
							leftWord
						)}. Right side ${display(rightMoves, "", "", rightWord)}.`
					);
				} else {
					setModalText(`Both sides ${display(leftMoves, "took")}. Draw!`);
				}
			} else if (
				leftMoves !== null &&
				(leftMoves < rightMoves || rightMoves === null)
			)
				setModalText(
					`Left side won ${display(leftMoves)}! Right side ${display(
						rightMoves - leftMoves,
						"was",
						"off",
						rightWord
					)}.`
				);
			else
				setModalText(
					`Right side won ${display(rightMoves)}! Left side ${display(
						leftMoves - rightMoves,
						"was",
						"off",
						leftWord
					)}.`
				);

			setShowModal(true);
		}
	}, [leftMoves, rightMoves, leftWord, rightWord]);

	const onLeftEnter = useCallback(() => {
		setLeftPlaying(isRightComplete);
	}, [isRightComplete]);

	const onRightEnter = useCallback(() => {
		setLeftPlaying(!isLeftComplete);
	}, [isLeftComplete]);

	return (
		<div className="root">
			<header>
				<div />
				<p className="title">TNG Churchle</p>
				<div className="reload-container">
					<div className="reload" onClick={() => window.location.reload()}>
						<p className="label">Restart</p>
					</div>
				</div>
			</header>
			<Modal
				active={showModal}
				text={modalText}
				onClose={() => setShowModal(false)}
			/>
			<div className="body">
				<Game
					cols={cols}
					onEnter={onLeftEnter}
					onComplete={onLeftComplete}
					active={!isLeftComplete && isLeftPlaying}
				/>
				<Game
					cols={cols}
					onEnter={onRightEnter}
					onComplete={onRightComplete}
					active={!isRightComplete && !isLeftPlaying}
				/>
			</div>
		</div>
	);
};

export default App;
