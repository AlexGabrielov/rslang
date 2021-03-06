import React, {
  useState, useEffect, useMemo,
} from 'react';
import './WordBuilderMainPage.scss';
import { Container } from 'react-bootstrap';
import WordBuilderStatsPage from '../word-builder-stats/WordBuilderStatsPage';
import WordBuilderGamePage from '../word-builder-game/WordBuilderGamePage';
import EndGameModal from '../../endGameModal/endGameModal';
import userStatsServices from '../../../services/user.statistic.services';
import BG from '../../../assets/images/bg-green.svg';

const {
  formStatistics,
  sendStatistics,
} = userStatsServices;

const getShuffledArr = (arr) => {
  if (!arr) return [];
  const newArr = arr.slice();
  for (let i = newArr.length - 1; i > 0; i -= 1) {
    const rand = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[rand]] = [newArr[rand], newArr[i]];
  }
  return newArr;
};
const randomizePage = () => Math.floor(Math.random() * 30);
const convertCodeToLetter = (code) => code.includes('Key') && code.slice(-1).toLowerCase();

const WordBuilderMainPage = () => {
  const [wordObjects, setWordsObj] = useState([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentLetterIndex, setCurrentLetterIndex] = useState(0);
  const [guessedLettersIndexes, setGuessedLettersIndexes] = useState([]);
  const [solved, setSolved] = useState(false);
  const [finished, setFinished] = useState(false);
  const [difficulty, setDifficulty] = useState(0);
  const [restartCounter, setRestartCounter] = useState(0);
  const [isShowModal, setShowModal] = useState(false);

  const nameOfTheGame = 'Word-Builder';

  const currentWordObj = wordObjects[currentWordIndex];
  const currentLetter = currentWordObj?.word[currentLetterIndex];
  const shuffledArray = useMemo(() => getShuffledArr(currentWordObj?.word.split('')), [currentWordObj]);

  const nextButtonHandler = () => {
    if (solved && !(currentWordIndex === wordObjects.length - 1)) {
      setSolved(false);
      setCurrentWordIndex(currentWordIndex + 1);
      setCurrentLetterIndex(0);
      setGuessedLettersIndexes([]);
    } else if (!solved) {
      currentWordObj.status = false;
      setSolved(true);
    } else if (solved && (currentWordIndex === wordObjects.length - 1)) {
      setFinished(true);
      const stats = formStatistics(nameOfTheGame, difficulty + 1, wordObjects);
      sendStatistics(stats);
    }
  };

  useEffect(() => {
    async function fetchData() {
      const page = randomizePage();
      const WORDS_URL = `https://afternoon-falls-25894.herokuapp.com/words?page=${page}&group=${difficulty}`;
      const data = await fetch(WORDS_URL);
      const res = await data.json();
      const wordsArray = res
        .map(({
          audio, image, audioExample, textExample, transcription, word, wordTranslate,
        }) => ({
          audio: `https://raw.githubusercontent.com/alexgabrielov/rslang-data/master/${audio}`,
          image: `https://raw.githubusercontent.com/alexgabrielov/rslang-data/master/${image}`,
          audioExample: `https://raw.githubusercontent.com/alexgabrielov/rslang-data/master/${audioExample}`,
          textExample: textExample.replace('<b>', '').replace('</b>', ''),
          transcription,
          word: word.toLowerCase(),
          wordTranslate,
          status: true,
        })).slice(0, 10);
      setWordsObj(wordsArray);
    }
    fetchData();
  }, [difficulty, restartCounter]);

  useEffect(() => {
    const handleLetterKeyPress = ({ code }) => {
      const key = convertCodeToLetter(code);
      if (currentLetter === key) {
        setGuessedLettersIndexes([...guessedLettersIndexes, shuffledArray
          .findIndex((letter, index) => letter === key && !guessedLettersIndexes.includes(index))]);
        setCurrentLetterIndex(currentLetterIndex + 1);
        if (currentLetterIndex === currentWordObj?.word.length - 1) {
          setSolved(true);
        }
      } else if (code === 'Enter' || code === 'NumpadEnter') {
        nextButtonHandler();
      } else if ((currentLetter !== key)
        && (shuffledArray.includes(key))
        && (!guessedLettersIndexes.includes(shuffledArray.indexOf(key)))) {
        currentWordObj.status = false;
      }
    };
    document.addEventListener('keypress', handleLetterKeyPress);
    return () => document.removeEventListener('keypress', handleLetterKeyPress);
  });
  return (
    <Container fluid className="word-builder">
      <img className="word-builder_bg" src={BG} alt="Background" />
      <EndGameModal
        onHide={() => setShowModal(false)}
        show={isShowModal}
      />
      <button type="button" className="btn btn-outline-primary close-button word-builder-btn" onClick={() => setShowModal(true)}>
        <svg className="svg-cross" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 12 12">
          <path fill="currentColor" d="M.974 0L0 .974 5.026 6 0 11.026.974 12 6 6.974 11.026 12l.974-.974L6.974 6 12 .974 11.026 0 6 5.026z" />
        </svg>
      </button>

      <div className="word-constructor-wrapper">
        {finished
          ? (
            <WordBuilderStatsPage
              wordObjects={wordObjects}
              setRestartCounter={setRestartCounter}
              restartCounter={restartCounter}
              setCurrentWordIndex={setCurrentWordIndex}
              setCurrentLetterIndex={setCurrentLetterIndex}
              setGuessedLettersIndexes={setGuessedLettersIndexes}
              setSolved={setSolved}
              setFinished={setFinished}
            />
          )
          : (
            <WordBuilderGamePage
              currentWordObj={currentWordObj}
              currentWordIndex={currentWordIndex}
              solved={solved}
              currentLetterIndex={currentLetterIndex}
              shuffledArray={shuffledArray}
              guessedLettersIndexes={guessedLettersIndexes}
              currentLetter={currentLetter}
              setGuessedLettersIndexes={setGuessedLettersIndexes}
              setCurrentLetterIndex={setCurrentLetterIndex}
              setSolved={setSolved}
              nextButtonHandler={nextButtonHandler}
              setDifficulty={setDifficulty}
              difficulty={difficulty}
              setCurrentWordIndex={setCurrentWordIndex}
            />
          )}
      </div>
    </Container>
  );
};

export default WordBuilderMainPage;
