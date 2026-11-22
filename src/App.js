import { useEffect, useRef, useState } from 'react';
import './App.css';

const LANGUAGES = ['en', 'ja', 'taigi'];

const TITLES = {
  words: {
    en: '英文 Words',
    ja: '日文 単語',
    taigi: '台語 詞彙',
  },
  phrases: {
    en: '英文 Phrases',
    ja: '日文 文',
    taigi: '台語 語句',
  },
  food: {
    en: '英文 Food',
    ja: '日文 食べ物',
    taigi: '台語 食物',
  },
  requests: {
    en: '英文 Phrases 2',
    ja: '日文 文 2',
    taigi: '台語 語句 2',
  },
  states: {
    en: '英文 States',
    ja: '日文 状態',
    taigi: '台語 狀態',
  },
};

const WORDS = [
  {
    id: 'stop',
    chinese: '停止',
    en: { label: 'stop', speech: 'stop' },
    ja: { label: '停止', speech: 'とまれ' },
    taigi: {
      label: '停',
      display: 'thîng',
      speech: 'thîng',
      audio: '停_thîng.mp3',
    },
  },
  {
    id: 'exit',
    chinese: '出口',
    en: { label: 'exit', speech: 'exit' },
    ja: { label: '出口', speech: 'でぐち' },
    taigi: {
      label: '出口',
      display: 'tshut-kháu',
      speech: 'tshut-kháu',
      audio: '出口_tshut-kháu.mp3',
    },
  },
  {
    id: 'open',
    chinese: '打開',
    en: { label: 'open', speech: 'open' },
    ja: { label: '開', speech: 'あく' },
    taigi: {
      label: '打開',
      display: 'khui--khui',
      speech: 'khui--khui',
      audio: '打開_khui--khui.mp3',
    },
  },
  {
    id: 'sale',
    chinese: '特價',
    en: { label: 'sale', speech: 'sale' },
    ja: { label: 'セール', speech: 'セール' },
    taigi: {
      label: '折扣',
      display: 'tsiat-khàu',
      speech: 'tsiat-khàu',
      audio: '折扣_tsiat-khàu.mp3',
    },
  },
  {
    id: 'bus',
    chinese: '公車',
    en: { label: 'bus', speech: 'bus' },
    ja: { label: 'バス', speech: 'バス' },
    taigi: {
      label: '公車',
      display: 'kong-tshia',
      speech: 'kong-tshia',
      audio: '公車_kong-tshia.mp3',
    },
  },
  {
    id: 'taxi',
    chinese: '計程車',
    en: { label: 'taxi', speech: 'taxi' },
    ja: { label: 'タクシー', speech: 'タクシー' },
    taigi: {
      label: '計程車',
      display: 'kè-thîng-tshia',
      speech: 'kè-thîng-tshia',
      audio: '計程車_kè-thîng-tshia.mp3',
    },
  },
  {
    id: 'push',
    chinese: '推',
    en: { label: 'push', speech: 'push' },
    ja: { label: '押す', speech: 'おす' },
    taigi: {
      label: '推',
      display: 'thui',
      speech: 'thui',
      audio: '推_thui.mp3',
    },
  },
  {
    id: 'pull',
    chinese: '拉',
    en: { label: 'pull', speech: 'pull' },
    ja: { label: '引く', speech: 'ひく' },
    taigi: {
      label: '拉',
      display: 'thuah',
      speech: 'thuah',
      audio: '拉_thuah.mp3',
    },
  },
  {
    id: 'up',
    chinese: '上',
    en: { label: 'up', speech: 'up' },
    ja: { label: '上', speech: 'うえ' },
    taigi: {
      label: '上',
      display: 'siōng',
      speech: 'siōng',
      audio: '上_siōng.mp3',
    },
  },
  {
    id: 'down',
    chinese: '下',
    en: { label: 'down', speech: 'down' },
    ja: { label: '下', speech: 'した' },
    taigi: { label: '下', display: 'ē', speech: 'ē', audio: '下_ē.mp3' },
  },
  {
    id: 'closed',
    chinese: '關閉',
    en: { label: 'closed', speech: 'closed' },
    ja: { label: '閉じる', speech: 'とじる' },
    taigi: {
      label: '關',
      display: 'kuainn',
      speech: 'kuainn',
      audio: '關_kuainn.mp3',
    },
  },
  {
    id: 'parking-lot',
    chinese: '停車場',
    en: { label: 'parking lot', speech: 'parking lot' },
    ja: { label: '駐車場', speech: 'ちゅうしゃじょう' },
    taigi: {
      label: '停車場',
      display: 'thîng-tshia-tiûnn',
      speech: 'thîng-tshia-tiûnn',
      audio: '停車場_thîng-tshia-tiûnn.mp3',
    },
  },
];

const FOOD_WORDS = [
  {
    id: 'water',
    chinese: '水',
    en: { label: 'water', speech: 'water' },
    ja: { label: '水', speech: 'みず' },
    taigi: {
      label: '水',
      display: 'tsuí',
      speech: 'tsuí',
      audio: '水_tsuí.mp3',
    },
  },
  {
    id: 'coffee',
    chinese: '咖啡',
    en: { label: 'coffee', speech: 'coffee' },
    ja: { label: 'コーヒー', speech: 'コーヒー' },
    taigi: {
      label: '咖啡',
      display: 'ka-pi',
      speech: 'ka-pi',
      audio: '咖啡_ka-pi.mp3',
    },
  },
  {
    id: 'soup',
    chinese: '湯',
    en: { label: 'soup', speech: 'soup' },
    ja: { label: 'スープ', speech: 'スープ' },
    taigi: { label: '湯', display: 'thng', speech: 'thng', audio: '湯_thng.mp3' },
  },
  {
    id: 'milk',
    chinese: '牛奶',
    en: { label: 'milk', speech: 'milk' },
    ja: { label: '牛乳', speech: 'ぎゅうにゅう' },
    taigi: {
      label: '牛奶',
      display: 'gû-ling',
      speech: 'gû-ling',
      audio: '牛奶_gû-ling.mp3',
    },
  },
  {
    id: 'noodles',
    chinese: '麵',
    en: { label: 'noodles', speech: 'noodles' },
    ja: { label: '麺', speech: 'めん' },
    taigi: { label: '麵', display: 'mī', speech: 'mī', audio: '麵_mī.mp3' },
  },
  {
    id: 'tea',
    chinese: '茶',
    en: { label: 'tea', speech: 'tea' },
    ja: { label: 'お茶', speech: 'おちゃ' },
    taigi: { label: '茶', display: 'tê', speech: 'tê', audio: '茶_tê.mp3' },
  },
  {
    id: 'rice',
    chinese: '飯',
    en: { label: 'rice', speech: 'rice' },
    ja: { label: 'ご飯', speech: 'ごはん' },
    taigi: { label: '飯', display: 'pn̄g', speech: 'pn̄g', audio: '飯_pn̄g.mp3' },
  },
  {
    id: 'juice',
    chinese: '果汁',
    en: { label: 'juice', speech: 'juice' },
    ja: { label: 'ジュース', speech: 'ジュース' },
    taigi: {
      label: '果汁',
      display: 'kó-tsiap',
      speech: 'kó-tsiap',
      audio: '果汁_kó-tsiap.mp3',
    },
  },
  {
    id: 'fruit',
    chinese: '水果',
    en: { label: 'fruit', speech: 'fruit' },
    ja: { label: '果物', speech: 'くだもの' },
    taigi: {
      label: '水果',
      display: 'tsuí-kó',
      speech: 'tsuí-kó',
      audio: '水果_tsuí-kó.mp3',
    },
  },
  {
    id: 'food',
    chinese: '食物',
    en: { label: 'food', speech: 'food' },
    ja: { label: '食べ物', speech: 'たべもの' },
    taigi: {
      label: '食物',
      display: 'si̍t-bu̍t',
      speech: 'si̍t-bu̍t',
      audio: '食物_si̍t-bu̍t.mp3',
    },
  },
  {
    id: 'beef',
    chinese: '牛肉',
    en: { label: 'beef', speech: 'beef' },
    ja: { label: '牛肉', speech: 'ぎゅうにく' },
    taigi: {
      label: '牛肉',
      display: 'gû-bah',
      speech: 'gû-bah',
      audio: '牛肉_gû-bah.mp3',
    },
  },
  {
    id: 'pork',
    chinese: '豬肉',
    en: { label: 'pork', speech: 'pork' },
    ja: { label: '豚肉', speech: 'ぶたにく' },
    taigi: {
      label: '豬肉',
      display: 'ti-bah',
      speech: 'ti-bah',
      audio: '豬肉_ti-bah.mp3',
    },
  },
  {
    id: 'chicken',
    chinese: '雞肉',
    en: { label: 'chicken', speech: 'chicken' },
    ja: { label: '鶏肉', speech: 'とりにく' },
    taigi: {
      label: '雞肉',
      display: 'ke-bah',
      speech: 'ke-bah',
      audio: '雞肉_ke-bah.mp3',
    },
  },
  {
    id: 'fish',
    chinese: '魚',
    en: { label: 'fish', speech: 'fish' },
    ja: { label: '魚', speech: 'さかな' },
    taigi: { label: '魚', display: 'hî', speech: 'hî', audio: '魚_hî.mp3' },
  },
];

const PHRASES = [
  {
    id: 'whats-your-name',
    chinese: '你叫什麼名字？',
    en: { label: "What's your name?", speech: "What's your name?" },
    ja: { label: 'お名前は何ですか？', speech: 'おなまえはなんですか？' },
    taigi: {
      label: '你叫啥物名？',
      display: 'Lí kiò siánn-mih miâ?',
      speech: 'Lí kiò siánn-mih miâ?',
      audio: 'phrase-whats-your-name.mp3',
    },
  },
  {
    id: 'my-name-is',
    chinese: '我的名字是',
    en: { label: 'My name is', speech: 'My name is' },
    ja: { label: '私の名前は', speech: 'わたしのなまえは' },
    taigi: {
      label: '我的名是',
      display: 'Guá ê miâ sī',
      speech: 'Guá ê miâ sī',
      audio: 'phrase-my-name-is.mp3',
    },
  },
  {
    id: 'how-are-you',
    chinese: '你好嗎？',
    en: { label: 'How are you', speech: 'How are you' },
    ja: { label: 'お元気ですか？', speech: 'おげんきですか？' },
    taigi: {
      label: '你好無？',
      display: 'Lí hó bô?',
      speech: 'Lí hó bô?',
      audio: 'phrase-how-are-you.mp3',
    },
  },
  {
    id: 'i-am-happy',
    chinese: '我很快樂',
    en: { label: 'I am happy', speech: 'I am happy' },
    ja: { label: '私は幸せです', speech: 'わたしはしあわせです' },
    taigi: {
      label: '我真歡喜',
      display: 'Guá tsin huann-hí',
      speech: 'Guá tsin huann-hí',
      audio: 'phrase-i-am-happy.mp3',
    },
  },
  {
    id: 'i-am-tired',
    chinese: '我很累',
    en: { label: 'I am tired', speech: 'I am tired' },
    ja: { label: '私は疲れました', speech: 'わたしはつかれました' },
    taigi: {
      label: '我真忝',
      display: 'Guá tsin thiám',
      speech: 'Guá tsin thiám',
      audio: 'phrase-i-am-tired.mp3',
    },
  },
  {
    id: 'i-am-hungry',
    chinese: '我餓了',
    en: { label: 'I am hungry', speech: 'I am hungry' },
    ja: { label: 'お腹が空きました', speech: 'おなかがすきました' },
    taigi: {
      label: '我腹肚枵矣',
      display: 'Guá pak-tóo-iau--ah',
      speech: 'Guá pak-tóo-iau--ah',
      audio: 'phrase-i-am-hungry.mp3',
    },
  },
  {
    id: 'i-am-thirsty',
    chinese: '我口渴了',
    en: { label: 'I am thirsty', speech: 'I am thirsty' },
    ja: { label: '喉が渇きました', speech: 'のどがかわきました' },
    taigi: {
      label: '我喙焦',
      display: 'Guá tshuì-ta',
      speech: 'Guá tshuì-ta',
      audio: 'phrase-i-am-thirsty.mp3',
    },
  },
];

const REQUEST_PHRASES = [
  {
    id: 'im-thirsty',
    chinese: '我口渴了',
    en: { label: "I'm thirsty", speech: "I'm thirsty" },
    ja: { label: '喉が渇きました', speech: 'のどがかわきました' },
    taigi: {
      label: '我喙焦',
      display: 'Guá tshuì-ta',
      speech: 'Guá tshuì-ta',
      audio: 'phrase-im-thirsty.mp3',
    },
  },
  {
    id: 'want-water',
    chinese: '我要水，謝謝',
    en: { label: 'I want water please', speech: 'I want water please' },
    ja: { label: '水をください', speech: 'みずをください' },
    taigi: {
      label: '我欲水，拜託',
      display: 'Guá beh tsuí, pài-thok',
      speech: 'Guá beh tsuí, pài-thok',
      audio: 'phrase-want-water.mp3',
    },
  },
  {
    id: 'want-coffee',
    chinese: '我要咖啡，謝謝',
    en: { label: 'I want coffee please', speech: 'I want coffee please' },
    ja: { label: 'コーヒーをください', speech: 'コーヒーをください' },
    taigi: {
      label: '我欲咖啡，拜託',
      display: 'Guá beh ka-pi, pài-thok',
      speech: 'Guá beh ka-pi, pài-thok',
      audio: 'phrase-want-coffee.mp3',
    },
  },
  {
    id: 'want-milk',
    chinese: '我要牛奶，謝謝',
    en: { label: 'I want milk please', speech: 'I want milk please' },
    ja: { label: '牛乳をください', speech: 'ぎゅうにゅうをください' },
    taigi: {
      label: '我欲牛奶，拜託',
      display: 'Guá beh gû-ling, pài-thok',
      speech: 'Guá beh gû-ling, pài-thok',
      audio: 'phrase-want-milk.mp3',
    },
  },
  {
    id: 'want-tea',
    chinese: '我要茶，謝謝',
    en: { label: 'I want tea please', speech: 'I want tea please' },
    ja: { label: 'お茶をください', speech: 'おちゃをください' },
    taigi: {
      label: '我欲茶，拜託',
      display: 'Guá beh tê, pài-thok',
      speech: 'Guá beh tê, pài-thok',
      audio: 'phrase-want-tea.mp3',
    },
  },
  {
    id: 'want-juice',
    chinese: '我要果汁，謝謝',
    en: { label: 'I want juice please', speech: 'I want juice please' },
    ja: { label: 'ジュースをください', speech: 'ジュースをください' },
    taigi: {
      label: '我欲果汁，拜託',
      display: 'Guá beh kó-tsiap, pài-thok',
      speech: 'Guá beh kó-tsiap, pài-thok',
      audio: 'phrase-want-juice.mp3',
    },
  },
  {
    id: 'thank-you',
    chinese: '謝謝你',
    en: { label: 'Thank you', speech: 'Thank you' },
    ja: { label: 'ありがとう', speech: 'ありがとう' },
    taigi: {
      label: '多謝',
      display: 'to-siā',
      speech: 'to-siā',
      audio: 'phrase-thank-you.mp3',
    },
  },
];

const STATE_WORDS = [
  {
    id: 'hot',
    chinese: '熱',
    en: { label: 'hot', speech: 'hot' },
    ja: { label: '暑い', speech: 'あつい' },
    taigi: { label: '熱', display: 'jia̍t', speech: 'jia̍t', audio: '熱_jia̍t.mp3' },
  },
  {
    id: 'cool',
    chinese: '涼',
    en: { label: 'cool', speech: 'cool' },
    ja: { label: '涼しい', speech: 'すずしい' },
    taigi: { label: '涼', display: 'liâng', speech: 'liâng', audio: '涼_liâng.mp3' },
  },
  {
    id: 'cold',
    chinese: '冷',
    en: { label: 'cold', speech: 'cold' },
    ja: { label: '寒い', speech: 'さむい' },
    taigi: { label: '冷', display: 'líng', speech: 'líng', audio: '冷_líng.mp3' },
  },
  {
    id: 'sick',
    chinese: '病',
    en: { label: 'sick', speech: 'sick' },
    ja: { label: '病気', speech: 'びょうき' },
    taigi: { label: '病', display: 'pēnn', speech: 'pēnn', audio: '病_pēnn.mp3' },
  },
  {
    id: 'sleepy',
    chinese: '睏',
    en: { label: 'sleepy', speech: 'sleepy' },
    ja: { label: '眠い', speech: 'ねむい' },
    taigi: { label: '睏', display: 'khùn', speech: 'khùn', audio: '睏_khùn.mp3' },
  },
  {
    id: 'nervous',
    chinese: '緊張',
    en: { label: 'nervous', speech: 'nervous' },
    ja: { label: '緊張', speech: 'きんちょう' },
    taigi: {
      label: '緊張',
      display: 'kín-tiunn',
      speech: 'kín-tiunn',
      audio: '緊張_kín-tiunn.mp3',
    },
  },
  {
    id: 'excited',
    chinese: '激動',
    en: { label: 'excited', speech: 'excited' },
    ja: { label: '興奮', speech: 'こうふん' },
    taigi: {
      label: '激動',
      display: 'kik-tōng',
      speech: 'kik-tōng',
      audio: '激動_kik-tōng.mp3',
    },
  },
  {
    id: 'awake',
    chinese: '清醒',
    en: { label: 'awake', speech: 'awake' },
    ja: { label: '目覚めている', speech: 'めざめている' },
    taigi: {
      label: '清醒',
      display: 'tshing-tshénn',
      speech: 'tshing-tshénn',
      audio: '清醒_tshing-tshénn.mp3',
    },
  },
  {
    id: 'relaxed',
    chinese: '輕鬆',
    en: { label: 'relaxed', speech: 'relaxed' },
    ja: { label: 'リラックス', speech: 'リラックス' },
    taigi: {
      label: '輕鬆',
      display: 'khin-sang',
      speech: 'khin-sang',
      audio: '輕鬆_khin-sang.mp3',
    },
  },
  {
    id: 'bored',
    chinese: '無聊',
    en: { label: 'bored', speech: 'bored' },
    ja: { label: '退屈', speech: 'たいくつ' },
    taigi: {
      label: '無聊',
      display: 'bô-liâu',
      speech: 'bô-liâu',
      audio: '無聊_bô-liâu.mp3',
    },
  },
  {
    id: 'lazy',
    chinese: '懶',
    en: { label: 'lazy', speech: 'lazy' },
    ja: { label: '怠け者', speech: 'なまけもの' },
    taigi: { label: '懶', display: 'lán', speech: 'lán', audio: '懶_lán.mp3' },
  },
  {
    id: 'calm',
    chinese: '平靜',
    en: { label: 'calm', speech: 'calm' },
    ja: { label: '静か', speech: 'しずか' },
    taigi: {
      label: '平靜',
      display: 'pîng-tsīng',
      speech: 'pîng-tsīng',
      audio: '平靜_pîng-tsīng.mp3',
    },
  },
];

const PAGES = [
  { id: 'words', items: WORDS },
  { id: 'phrases', items: PHRASES },
  { id: 'food', items: FOOD_WORDS },
  { id: 'requests', items: REQUEST_PHRASES },
  { id: 'states', items: STATE_WORDS },
];

function hslToRgb(hue, saturation, lightness) {
  const s = saturation / 100;
  const l = lightness / 100;
  const k = (n) => (n + hue / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const channel = (n) =>
    l - a * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1));

  return [channel(0), channel(8), channel(4)].map((value) =>
    Math.round(value * 255)
  );
}

function relativeLuminance([red, green, blue]) {
  const channels = [red, green, blue].map((value) => {
    const channel = value / 255;
    return channel <= 0.03928
      ? channel / 12.92
      : ((channel + 0.055) / 1.055) ** 2.4;
  });

  return (
    0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2]
  );
}

function randomButtonStyle() {
  const hue = Math.floor(Math.random() * 360);
  const saturation = 55 + Math.floor(Math.random() * 25);
  const lightness = 40 + Math.floor(Math.random() * 30);
  const rgb = hslToRgb(hue, saturation, lightness);
  const textColor = relativeLuminance(rgb) > 0.179 ? '#000000' : '#ffffff';

  return {
    backgroundColor: `rgb(${rgb.join(', ')})`,
    color: textColor,
    boxShadow:
      textColor === '#ffffff'
        ? 'inset 0 0 0 1px rgba(255, 255, 255, 0.25)'
        : 'none',
  };
}

const PAGE_STYLES = PAGES.map((page) => page.items.map(randomButtonStyle));

const BASE_SPEECH_RATE = 0.85;
const JAPANESE_SPEECH_RATE = 0.5;
const TAIGI_PLAYBACK_RATE = 1;
const SPEECH_DELAY_MS = 120;
const RESET_TIMEOUT_MS = 5000;
const NO_SPEECH_RESET_MS = 900;

function canSpeak() {
  return (
    typeof window !== 'undefined' &&
    'speechSynthesis' in window &&
    typeof window.SpeechSynthesisUtterance === 'function'
  );
}

function pickVoice(voices, language) {
  const primary = language === 'ja' ? 'ja-JP' : 'en-US';
  const prefix = language === 'ja' ? 'ja' : 'en';

  return (
    voices.find((voice) => voice.lang === primary) ||
    voices.find((voice) => voice.lang.toLowerCase().startsWith(prefix)) ||
    voices[0] ||
    null
  );
}

function stopPlayback({ resetTimer, speakTimer, utteranceRef, audioRef }) {
  if (speakTimer.current) {
    clearTimeout(speakTimer.current);
    speakTimer.current = null;
  }
  if (resetTimer.current) {
    clearTimeout(resetTimer.current);
    resetTimer.current = null;
  }
  if (utteranceRef.current) {
    utteranceRef.current.onend = null;
    utteranceRef.current.onerror = null;
    utteranceRef.current = null;
  }
  if (audioRef.current) {
    audioRef.current.onended = null;
    audioRef.current.onerror = null;
    if (typeof audioRef.current.pause === 'function') {
      audioRef.current.pause();
    }
    audioRef.current = null;
  }
  if (canSpeak()) {
    window.speechSynthesis.cancel();
  }
}

function audioUrl(filename) {
  return `${process.env.PUBLIC_URL || ''}/audio/${filename}`;
}

function App() {
  const [language, setLanguage] = useState('en');
  const [pageIndex, setPageIndex] = useState(0);
  const [activeWord, setActiveWord] = useState(null);
  const resetTimer = useRef(null);
  const speakTimer = useRef(null);
  const utteranceRef = useRef(null);
  const audioRef = useRef(null);

  useEffect(() => {
    const synth = canSpeak() ? window.speechSynthesis : null;

    const loadVoices = () => {
      if (synth) {
        synth.getVoices();
      }
    };

    if (synth) {
      loadVoices();
      if (typeof synth.addEventListener === 'function') {
        synth.addEventListener('voiceschanged', loadVoices);
      }
    }

    return () => {
      if (synth && typeof synth.removeEventListener === 'function') {
        synth.removeEventListener('voiceschanged', loadVoices);
      }
      stopPlayback({ resetTimer, speakTimer, utteranceRef, audioRef });
    };
  }, []);

  const handleLanguageChange = () => {
    stopPlayback({ resetTimer, speakTimer, utteranceRef, audioRef });
    setActiveWord(null);
    setLanguage((current) => {
      const nextIndex = (LANGUAGES.indexOf(current) + 1) % LANGUAGES.length;
      return LANGUAGES[nextIndex];
    });
  };

  const handlePageChange = (nextIndex) => {
    if (nextIndex < 0 || nextIndex >= PAGES.length || nextIndex === pageIndex) {
      return;
    }
    stopPlayback({ resetTimer, speakTimer, utteranceRef, audioRef });
    setActiveWord(null);
    setPageIndex(nextIndex);
  };

  const handlePress = (word) => {
    stopPlayback({ resetTimer, speakTimer, utteranceRef, audioRef });

    const translation = word[language];
    const active = `${language}:${word.id}`;
    setActiveWord(active);

    const reset = () => {
      if (resetTimer.current) {
        clearTimeout(resetTimer.current);
        resetTimer.current = null;
      }
      setActiveWord((current) => (current === active ? null : current));
    };

    resetTimer.current = setTimeout(reset, RESET_TIMEOUT_MS);

    if (language === 'taigi') {
      const audio = new Audio(audioUrl(translation.audio));
      audio.defaultPlaybackRate = TAIGI_PLAYBACK_RATE;
      audio.playbackRate = TAIGI_PLAYBACK_RATE;
      audio.onended = reset;
      audio.onerror = reset;
      audioRef.current = audio;

      const playPromise = audio.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(reset);
      }
      return;
    }

    if (!canSpeak()) {
      if (resetTimer.current) {
        clearTimeout(resetTimer.current);
      }
      resetTimer.current = setTimeout(reset, NO_SPEECH_RESET_MS);
      return;
    }

    const synth = window.speechSynthesis;

    speakTimer.current = setTimeout(() => {
      speakTimer.current = null;

      const utterance = new window.SpeechSynthesisUtterance(translation.speech);
      utterance.lang = language === 'ja' ? 'ja-JP' : 'en-US';
      utterance.rate =
        language === 'ja' ? JAPANESE_SPEECH_RATE : BASE_SPEECH_RATE;
      utterance.pitch = 1;
      utterance.onend = reset;
      utterance.onerror = reset;

      const voice = pickVoice(synth.getVoices(), language);
      if (voice) {
        utterance.voice = voice;
      }

      utteranceRef.current = utterance;
      synth.speak(utterance);
    }, SPEECH_DELAY_MS);
  };

  const page = PAGES[pageIndex];
  const title = TITLES[page.id][language];

  return (
    <main className={`app ${page.id}`}>
      <div className="page-header">
        <button
          type="button"
          className="nav-button"
          onClick={() => handlePageChange(pageIndex - 1)}
          disabled={pageIndex === 0}
          aria-label="Previous page"
        >
          ←
        </button>
        <h1 className="title">
          <button
            type="button"
            className="title-button"
            onClick={handleLanguageChange}
            aria-label={`${title}, switch language`}
          >
            {title}
          </button>
        </h1>
        <button
          type="button"
          className="nav-button"
          onClick={() => handlePageChange(pageIndex + 1)}
          disabled={pageIndex === PAGES.length - 1}
          aria-label="Next page"
        >
          →
        </button>
      </div>
      <div className="word-grid">
        {page.items.map((word, index) => {
          const translation = word[language];
          const isActive = activeWord === `${language}:${word.id}`;
          const activeDisplay =
            language === 'taigi'
              ? translation.display
              : language === 'ja' && word.chinese === translation.label
                ? translation.speech
                : word.chinese;

          return (
            <button
              key={word.id}
              type="button"
              className={`word-button${isActive ? ' is-active' : ''}`}
              data-word={word.id}
              style={PAGE_STYLES[pageIndex][index]}
              onClick={() => handlePress(word)}
              aria-label={translation.label}
            >
              {isActive ? activeDisplay : translation.label}
            </button>
          );
        })}
      </div>
    </main>
  );
}

export default App;
