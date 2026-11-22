import { act, fireEvent, render, screen } from '@testing-library/react';
import App from './App';

const PHRASE_NAMES = [
  "What's your name?",
  'My name is',
  'How are you',
  'I am happy',
  'I am tired',
  'I am hungry',
  'I am thirsty',
];

const WORD_NAMES = [
  'stop',
  'exit',
  'open',
  'sale',
  'bus',
  'taxi',
  'push',
  'pull',
  'up',
  'down',
  'closed',
  'parking lot',
];

const FOOD_NAMES = [
  'water',
  'coffee',
  'soup',
  'milk',
  'noodles',
  'tea',
  'rice',
  'juice',
  'fruit',
  'food',
  'beef',
  'pork',
  'chicken',
  'fish',
];

const REQUEST_NAMES = [
  "I'm thirsty",
  'I want water please',
  'I want coffee please',
  'I want milk please',
  'I want tea please',
  'I want juice please',
  'Thank you',
];

const STATE_NAMES = [
  'hot',
  'cool',
  'cold',
  'sick',
  'sleepy',
  'nervous',
  'excited',
  'awake',
  'relaxed',
  'bored',
  'lazy',
  'calm',
];

let voices;
let utterances;
let audioElements;
let speechSynthesisMock;

const languageButton = () =>
  screen.getByRole('button', { name: /switch language/i });
const nextPageButton = () =>
  screen.getByRole('button', { name: 'Next page' });
const previousPageButton = () =>
  screen.getByRole('button', { name: 'Previous page' });

beforeEach(() => {
  jest.useFakeTimers();

  voices = [
    { name: 'French', lang: 'fr-FR' },
    { name: 'English', lang: 'en-US' },
    { name: 'Japanese', lang: 'ja-JP' },
  ];
  utterances = [];
  audioElements = [];
  speechSynthesisMock = {
    getVoices: jest.fn(() => voices),
    cancel: jest.fn(),
    speak: jest.fn((utterance) => utterances.push(utterance)),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  };

  Object.defineProperty(window, 'speechSynthesis', {
    configurable: true,
    value: speechSynthesisMock,
  });
  window.SpeechSynthesisUtterance = class SpeechSynthesisUtterance {
    constructor(text) {
      this.text = text;
    }
  };
  window.Audio = class Audio {
    constructor(src) {
      this.src = src;
      this.play = jest.fn(() => Promise.resolve());
      this.pause = jest.fn();
      audioElements.push(this);
    }
  };
});

afterEach(() => {
  jest.clearAllTimers();
  jest.useRealTimers();
  delete window.speechSynthesis;
  delete window.SpeechSynthesisUtterance;
  delete window.Audio;
});

test('renders the Words title and every word button', () => {
  render(<App />);

  expect(screen.getByRole('heading', { name: /words/i })).toBeInTheDocument();

  WORD_NAMES.forEach((name) => {
    expect(screen.getByRole('button', { name })).toBeInTheDocument();
  });
});

test('speaks the pressed word with an explicitly selected voice', () => {
  render(<App />);

  fireEvent.click(screen.getByRole('button', { name: 'parking lot' }));

  expect(speechSynthesisMock.cancel).toHaveBeenCalled();
  expect(speechSynthesisMock.speak).not.toHaveBeenCalled();

  act(() => {
    jest.advanceTimersByTime(120);
  });

  expect(speechSynthesisMock.speak).toHaveBeenCalledTimes(1);
  expect(utterances[0].text).toBe('parking lot');
  expect(utterances[0].voice).toBe(voices[1]);
  expect(utterances[0].rate).toBe(0.85);
});

test('highlights the active word and clears it when speech ends', () => {
  render(<App />);
  const button = screen.getByRole('button', { name: 'open' });

  fireEvent.click(button);
  expect(button).toHaveTextContent('打開');

  act(() => {
    jest.advanceTimersByTime(120);
  });

  act(() => {
    utterances[0].onend();
  });

  expect(button).toHaveTextContent('open');
});

test('falls back to a timed reset when speech synthesis is unavailable', () => {
  delete window.speechSynthesis;
  delete window.SpeechSynthesisUtterance;

  render(<App />);
  const button = screen.getByRole('button', { name: 'bus' });

  fireEvent.click(button);
  expect(button).toHaveTextContent('公車');

  act(() => {
    jest.advanceTimersByTime(900);
  });

  expect(button).toHaveTextContent('bus');
});

test('switches to Japanese, shows kanji, and speaks the kana', () => {
  render(<App />);

  fireEvent.click(languageButton());

  expect(screen.getByRole('heading', { name: /単語/ })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: '停止' })).toBeInTheDocument();

  const button = screen.getByRole('button', { name: '押す' });
  expect(button).toHaveTextContent('押す');

  fireEvent.click(button);
  expect(button).toHaveTextContent('推');

  act(() => {
    jest.advanceTimersByTime(120);
  });

  expect(speechSynthesisMock.speak).toHaveBeenCalledTimes(1);
  expect(utterances[0].text).toBe('おす');
  expect(utterances[0].rate).toBe(0.5);
  expect(utterances[0].lang).toBe('ja-JP');
  expect(utterances[0].voice).toBe(voices[2]);

  act(() => {
    utterances[0].onend();
  });

  expect(button).toHaveTextContent('押す');
});

test('shows kana when the Japanese label already matches the Chinese characters', () => {
  render(<App />);

  fireEvent.click(languageButton());

  const button = screen.getByRole('button', { name: '停止' });
  fireEvent.click(button);
  expect(button).toHaveTextContent('とまれ');

  act(() => {
    jest.advanceTimersByTime(120);
  });

  expect(utterances[0].text).toBe('とまれ');

  act(() => {
    utterances[0].onend();
  });

  expect(button).toHaveTextContent('停止');
});

test('switches to Taigi and plays the matching audio clip', () => {
  render(<App />);

  fireEvent.click(languageButton());
  fireEvent.click(languageButton());

  expect(screen.getByRole('heading', { name: /詞彙/ })).toBeInTheDocument();

  const button = screen.getByRole('button', { name: '公車' });
  fireEvent.click(button);

  expect(button).toHaveTextContent('kong-tshia');
  expect(audioElements).toHaveLength(1);
  expect(audioElements[0].src).toBe('/audio/公車_kong-tshia.mp3');
  expect(audioElements[0].play).toHaveBeenCalled();
  expect(audioElements[0].playbackRate).toBe(1);
  expect(audioElements[0].defaultPlaybackRate).toBe(1);
  expect(speechSynthesisMock.speak).not.toHaveBeenCalled();

  act(() => {
    audioElements[0].onended();
  });

  expect(button).toHaveTextContent('公車');
});

test('cycles back to English after Taigi', () => {
  render(<App />);

  fireEvent.click(languageButton());
  fireEvent.click(languageButton());
  fireEvent.click(languageButton());

  expect(screen.getByRole('heading', { name: /words/i })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'stop' })).toBeInTheDocument();
});

test('gives each button a random background with readable text', () => {
  const { container } = render(<App />);
  const buttons = container.querySelectorAll('.word-button');

  expect(buttons).toHaveLength(12);

  buttons.forEach((button) => {
    expect(button.style.backgroundColor).toMatch(/^rgb\(/);
    expect(['rgb(0, 0, 0)', 'rgb(255, 255, 255)']).toContain(button.style.color);
  });
});

test('navigates through all five pages with arrows', () => {
  const { container } = render(<App />);

  expect(previousPageButton()).toBeDisabled();
  expect(nextPageButton()).toBeEnabled();

  fireEvent.click(nextPageButton());

  expect(screen.getByRole('heading', { name: /phrases/i })).toBeInTheDocument();
  expect(container.querySelector('.app')).toHaveClass('phrases');
  PHRASE_NAMES.forEach((name) => {
    expect(screen.getByRole('button', { name })).toBeInTheDocument();
  });
  expect(previousPageButton()).toBeEnabled();
  expect(nextPageButton()).toBeEnabled();

  fireEvent.click(nextPageButton());

  expect(screen.getByRole('heading', { name: /food/i })).toBeInTheDocument();
  expect(container.querySelector('.app')).toHaveClass('food');
  FOOD_NAMES.forEach((name) => {
    expect(screen.getByRole('button', { name })).toBeInTheDocument();
  });
  expect(previousPageButton()).toBeEnabled();
  expect(nextPageButton()).toBeEnabled();

  fireEvent.click(nextPageButton());

  expect(screen.getByRole('heading', { name: /phrases 2/i })).toBeInTheDocument();
  expect(container.querySelector('.app')).toHaveClass('requests');
  REQUEST_NAMES.forEach((name) => {
    expect(screen.getByRole('button', { name })).toBeInTheDocument();
  });
  expect(previousPageButton()).toBeEnabled();
  expect(nextPageButton()).toBeEnabled();

  fireEvent.click(nextPageButton());

  expect(screen.getByRole('heading', { name: /states/i })).toBeInTheDocument();
  expect(container.querySelector('.app')).toHaveClass('states');
  STATE_NAMES.forEach((name) => {
    expect(screen.getByRole('button', { name })).toBeInTheDocument();
  });
  expect(previousPageButton()).toBeEnabled();
  expect(nextPageButton()).toBeDisabled();

  fireEvent.click(previousPageButton());

  expect(screen.getByRole('heading', { name: /phrases 2/i })).toBeInTheDocument();
  expect(previousPageButton()).toBeEnabled();
  expect(nextPageButton()).toBeEnabled();

  fireEvent.click(previousPageButton());

  expect(screen.getByRole('heading', { name: /food/i })).toBeInTheDocument();
  expect(previousPageButton()).toBeEnabled();
  expect(nextPageButton()).toBeEnabled();

  fireEvent.click(previousPageButton());

  expect(screen.getByRole('heading', { name: /phrases/i })).toBeInTheDocument();
  expect(previousPageButton()).toBeEnabled();
  expect(nextPageButton()).toBeEnabled();

  fireEvent.click(previousPageButton());

  expect(screen.getByRole('heading', { name: /words/i })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'stop' })).toBeInTheDocument();
  expect(previousPageButton()).toBeDisabled();
  expect(nextPageButton()).toBeEnabled();
});

test('pronounces a phrase and flashes its Chinese translation', () => {
  render(<App />);

  fireEvent.click(nextPageButton());

  const button = screen.getByRole('button', { name: 'I am happy' });
  fireEvent.click(button);
  expect(button).toHaveTextContent('我很快樂');

  act(() => {
    jest.advanceTimersByTime(120);
  });

  expect(speechSynthesisMock.speak).toHaveBeenCalledTimes(1);
  expect(utterances[0].text).toBe('I am happy');

  act(() => {
    utterances[0].onend();
  });

  expect(button).toHaveTextContent('I am happy');
});

test('plays a Taigi phrase clip on the phrase page', () => {
  render(<App />);

  fireEvent.click(nextPageButton());
  fireEvent.click(languageButton());
  fireEvent.click(languageButton());

  const button = screen.getByRole('button', { name: '我真歡喜' });
  fireEvent.click(button);

  expect(button).toHaveTextContent('Guá tsin huann-hí');
  expect(audioElements).toHaveLength(1);
  expect(audioElements[0].src).toBe('/audio/phrase-i-am-happy.mp3');
  expect(audioElements[0].play).toHaveBeenCalled();
  expect(audioElements[0].playbackRate).toBe(1);

  act(() => {
    audioElements[0].onended();
  });

  expect(button).toHaveTextContent('我真歡喜');
});

test('plays a Taigi audio clip on the food page', () => {
  render(<App />);

  fireEvent.click(nextPageButton());
  fireEvent.click(nextPageButton());
  fireEvent.click(languageButton());
  fireEvent.click(languageButton());

  const button = screen.getByRole('button', { name: '牛肉' });
  fireEvent.click(button);

  expect(button).toHaveTextContent('gû-bah');
  expect(audioElements).toHaveLength(1);
  expect(audioElements[0].src).toBe('/audio/牛肉_gû-bah.mp3');
  expect(audioElements[0].play).toHaveBeenCalled();
  expect(audioElements[0].playbackRate).toBe(1);

  act(() => {
    audioElements[0].onended();
  });

  expect(button).toHaveTextContent('牛肉');
});

test('plays a Taigi audio clip on the fourth phrase page', () => {
  render(<App />);

  fireEvent.click(nextPageButton());
  fireEvent.click(nextPageButton());
  fireEvent.click(nextPageButton());
  fireEvent.click(languageButton());
  fireEvent.click(languageButton());

  const button = screen.getByRole('button', { name: '我欲水，拜託' });
  fireEvent.click(button);

  expect(button).toHaveTextContent('Guá beh tsuí, pài-thok');
  expect(audioElements).toHaveLength(1);
  expect(audioElements[0].src).toBe('/audio/phrase-want-water.mp3');
  expect(audioElements[0].play).toHaveBeenCalled();
  expect(audioElements[0].playbackRate).toBe(1);

  act(() => {
    audioElements[0].onended();
  });

  expect(button).toHaveTextContent('我欲水，拜託');
});

test('plays a Taigi audio clip on the states page', () => {
  render(<App />);

  fireEvent.click(nextPageButton());
  fireEvent.click(nextPageButton());
  fireEvent.click(nextPageButton());
  fireEvent.click(nextPageButton());
  fireEvent.click(languageButton());
  fireEvent.click(languageButton());

  const button = screen.getByRole('button', { name: '緊張' });
  fireEvent.click(button);

  expect(button).toHaveTextContent('kín-tiunn');
  expect(audioElements).toHaveLength(1);
  expect(audioElements[0].src).toBe('/audio/緊張_kín-tiunn.mp3');
  expect(audioElements[0].play).toHaveBeenCalled();
  expect(audioElements[0].playbackRate).toBe(1);

  act(() => {
    audioElements[0].onended();
  });

  expect(button).toHaveTextContent('緊張');
});
