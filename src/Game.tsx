import { useCallback, useEffect, useMemo, useState, FC } from "react";
import data from "./words.json";
import "./Game.css";

interface GameProps {
    cols: number;
    active: boolean;
    onComplete: (won: boolean, word: string, moves: number) => void;
    onEnter: () => void;
}

interface Key {
    key: string;
}

interface Keys {
    [key: string]: 0 | 1 | 2;
}

export const Game: FC<GameProps> = ({ cols, active, onEnter, onComplete }) => {
    // 1. choose random word from 'possible'
    // 2. this decides the cols and rows
    // 3. filter all words of same length
    // 4. create the style of the table

    const rows = useMemo(() => {
        return Math.floor(cols * 1.3);
    }, [cols]);

    const WORD = useMemo(() => {
        const possible = data.possible.filter((word) => word.length === cols);
        const chosen = possible[Math.floor(Math.random() * possible.length)];
        return chosen.toUpperCase();
    }, [cols]);

    const getWordMap = useCallback(() => {
        return WORD.split("").reduce((map, char, i) => {
            if (!map.has(char)) map.set(char, []);
            map.get(char)!.push(i);
            return map;
        }, new Map<string, number[]>());
    }, [WORD]);

    const all = useMemo(() => {
        const { all: fake, possible } = data;
        return fake.concat(possible).filter((word) => word.length === cols);
    }, [cols]);

    const style = useMemo(() => {
        return {
            gridTemplateColumns: `repeat(${cols}, 1fr)`,
        };
    }, [cols]);

    const [currRow, setRow] = useState(0);
    const [words, setWords] = useState<string[]>([]);
    const [matrix, setMatrix] = useState(
        Array.from({ length: rows }).map(() => new Array(cols).fill(0))
    );
    const [keys, setKeys] = useState<Keys>({});
    const [word, setWord] = useState("");

    // 0 = playing, 1 = win, 2 = fail
    const [gameState, setGameState] = useState<0 | 1 | 2>(0);

    const keyListener = useCallback(
        ({ key }: Key) => {
            if (!active || gameState !== 0) return;

            if (/^[a-z]$/i.test(key)) {
                if (word.length < cols) {
                    setWord(word + key.toUpperCase());
                }
            } else if (/Backspace/.test(key)) {
                setWord(word.slice(0, -1));
            } else if (/Enter/.test(key)) {
                // if word is valid
                if (all.includes(word.toLowerCase())) {
                    setKeys((keys) => {
                        setMatrix((copy) => {
                            const correct = getWordMap();
                            let isExit = false;

                            for (let i = 0; i < cols; i++) {
                                if (correct.has(word[i])) {
                                    const indices = correct.get(word[i])!;
                                    let index = indices.indexOf(i);
                                    if (index !== -1) {
                                        console.log('chonk');
                                        indices.splice(index, 1);
                                        copy[currRow][i] = 2;
                                        keys[word[i]] = 2;
                                    }
                                }
                            }

                            for (let i = 0; i < cols; i++) {
                                if (correct.has(word[i]) && copy[currRow][i] !== 2) {
                                    const positions = correct.get(word[i])!;
                                    if (positions.length > 0) {
                                        copy[currRow][i] = 1;
                                        keys[word[i]] = 1;
                                        positions.pop();
                                        continue;
                                    }
                                }

                                copy[currRow][i] ??= 0;
                                keys[word[i]] ??= 0;
                            }

                            if (copy[currRow].every((value) => value === 2)) {
                                setGameState(1);
                                isExit = true;
                            } else if (currRow === rows - 1) {
                                setGameState(2);
                                isExit = true;
                            }

                            setWords(words.concat(word));

                            if (isExit) return copy;

                            setRow(currRow + 1);
                            setWord("");

                            return copy;
                        });

                        return keys;
                    });
                }
            }
        },
        [gameState, word, getWordMap, currRow, words, all, cols, rows, active]
    );

    useEffect(onEnter, [onEnter, currRow]);

    useEffect(() => {
        const didWin = gameState === 1;
        if (gameState !== 0)
            setTimeout(() => onComplete(didWin, WORD, currRow + 1), 250);
    }, [gameState, onComplete, WORD, currRow]);

    useEffect(() => {
        document.addEventListener("keydown", keyListener);

        // when we unload the component
        return () => document.removeEventListener("keydown", keyListener);
    }, [keyListener]);

    const boxes = Array.from({ length: rows * cols }).map((_, i) => {
        const row = Math.floor(i / cols);
        const col = i % cols;
        const char =
            row < currRow // sus
                ? words[row][col]
                : row === currRow && word[col];

        return (
            <div
                className={[
                    "box",
                    matrix[row][col] === 2 && "box-green",
                    matrix[row][col] === 1 && "box-yellow",
                ].join(" ")}
                key={i}
            >
                <p>{char}</p>
            </div>
        );
    });

    const toKey = useCallback(
        (char: string) => {
            const key =
                {
                    "↩": "Enter",
                    "⌫": "Backspace",
                }[char] || char.toUpperCase();

            const value = keys[key];

            return (
                <div
                    className={[
                        "key",
                        value === 0
                            ? "key-grey"
                            : value === 1
                                ? "key-yellow"
                                : value === 2
                                    ? "key-green"
                                    : "",
                    ].join(" ")}
                    key={char}
                    onClick={keyListener.bind(this, { key })}
                >
                    {char.toUpperCase()}
                </div>
            );
        },
        [keyListener, keys]
    );

    const keyboard = {
        "top-row": ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"].map(toKey),
        "middle-row": ["a", "s", "d", "f", "g", "h", "j", "k", "l"].map(toKey),
        "bottom-row": ["↩", "z", "x", "c", "v", "b", "n", "m", "⌫"].map(toKey),
    };

    return (
        <div className={"container " + (active ? "active" : "inactive")}>
            <div className="game" style={style}>
                {boxes}
            </div>
            <div className="keyboard">
                {Object.entries(keyboard).map(([className, divs], i) => {
                    return (
                        <div className={"row " + className} key={i}>
                            {divs}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
