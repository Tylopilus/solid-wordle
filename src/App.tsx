import {
  Component,
  createEffect,
  createSignal,
  For,
  onCleanup,
  onMount,
  Show,
} from 'solid-js';

const App: Component = () => {
  return (
    <div class="grid bg-gray-700 h-screen place-items-center text-white">
      <h1 class="text-6xl absolute top-[10%]">Wordle in solidjs</h1>
      <Grid />
    </div>
  );
};

export default App;

const Grid = () => {
  const allowedWords = ['pizza', 'chips', 'hello', 'world', 'sugar', 'style'];
  const secret = 'world';
  const [guesses, setGuesses] = createSignal<string[]>([]);
  const [currentGuess, setCurrentGuess] = createSignal('');
  const [currAttempt, setCurrAttempt] = createSignal<string>('');
  const [winnered, setWinnered] = createSignal(false);

  // check wincondition
  createEffect(() => {
    if (guesses().includes(secret)) {
      setWinnered(true);
      return;
    }
    if (guesses().length === 6) {
      setWinnered(true);
      alert('sucker, you lost!');
    }
  });

  // normalize guesses to be length of 5
  createEffect(() => {
    let word = currentGuess().split('');
    while (word.length < 5) {
      word.push(' ');
    }
    setCurrAttempt(word.join(''));
  });

  const keyDownHandler = (e: KeyboardEvent) => {
    if (winnered()) return;
    // check if key is letter
    if (
      e.key.length === 1 &&
      e.key.match(/[a-z]/i) &&
      currentGuess().length < 5
    ) {
      setCurrentGuess(currentGuess() + e.key);
    } else if (e.key === 'Backspace') {
      setCurrentGuess(currentGuess().slice(0, -1));
    } else if (e.key === 'Enter') {
      if (currentGuess().length < 5) return;
      if (!allowedWords.includes(currentGuess())) {
        alert('not a valid word');
        return;
      }
      setGuesses([...guesses(), currentGuess()]);
      setCurrentGuess('');
    }
  };

  // register keydown handler
  onMount(() => document.addEventListener('keydown', keyDownHandler));
  onCleanup(() => document.removeEventListener('keydown', keyDownHandler));

  return (
    <div class="grid grid-rows-6 grid-cols-5 gap-2">
      <For each={guesses()}>
        {(guess) => <GridRow word={guess} secret={secret} attempted={true} />}
      </For>

      {/* only render if not winnered */}
      <Show when={guesses().length < 6}>
        <GridRow word={currAttempt()} secret={secret} attempted={false} />
        <For each={[...Array(6 - guesses().length - 1)]}>
          {() => (
            <GridRow
              word={[...Array(5).fill(' ')].join('')}
              secret={secret}
              attempted={false}
            />
          )}
        </For>
      </Show>
    </div>
  );
};

interface IGridRow {
  word: string;
  secret: string;
  attempted: boolean;
}
const GridRow = (props: IGridRow) => {
  return (
    <>
      <For each={props.word.split('')}>
        {(letter, idx) => (
          <GridCell
            letter={letter}
            secret={props.secret}
            index={idx()}
            attempted={props.attempted}
          />
        )}
      </For>
    </>
  );
};

interface IGridCell {
  index: number;
  letter: string;
  secret: string;
  attempted: boolean;
}
const GridCell = (props: IGridCell) => {
  let color = 'bg-gray-800';
  if (props.letter === props.secret[props.index]) {
    color = 'green';
  } else if (props.secret.includes(props.letter)) {
    color = 'orange';
  }
  return (
    <div
      style={props.attempted ? { 'background-color': color } : {}}
      class="w-[50px] h-[50px] flex items-center justify-center uppercase border border-white rounded">
      {props.letter}
    </div>
  );
};
