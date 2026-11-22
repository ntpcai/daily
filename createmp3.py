import os
import re
import shutil
import subprocess
import tempfile
import time
import urllib.parse
import requests

OUTPUT_DIR = "taigi_audio"
NUMBERS_OUTPUT_DIR = "taigi_audio"
os.makedirs(OUTPUT_DIR, exist_ok=True)
os.makedirs(NUMBERS_OUTPUT_DIR, exist_ok=True)

COMPONENTS = {
    "0": ("零", "lîng", 16447, 13332),
    "1": ("一", "it", 2, None),
    "2": ("二", "jī", 44, None),
    "3": ("三", "sann", 163, None),
    "4": ("四", "sì", 1408, None),
    "5": ("五", "gōo", 565, None),
    "6": ("六", "la̍k", 578, None),
    "7": ("七", "tshit", 40, None),
    "8": ("八", "peh", 49, None),
    "9": ("九", "káu", 41, None),
    "10": ("十", "tsa̍p", 54, None),
    "百": ("百", "pah", 2585, None),
    "一百": ("一", "tsi̍t", 1, None),
    "千": ("千", "tshing", 181, None),
    "萬": ("萬", "bān", 9861, None),
    "停車": ("停車", "thîng-tshia", 23488, None),
    "場": ("場", "tiûnn", 8251, None),
    "你": ("你", "lí", 2868, None),
    "我": ("我", "guá", 3139, None),
    "的": ("的", "ê", 4371, None),
    "名": ("名", "miâ", 2116, None),
    "是": ("是", "sī", 4997, None),
    "好": ("好", "hó", 2272, None),
    "無": ("無", "bô", 8563, None),
    "真": ("真", "tsin", 6374, None),
    "歡喜": ("歡喜", "huann-hí", 13206, None),
    "忝": ("忝", "thiám", 3879, None),
    "喙焦": ("喙焦", "tshuì-ta", 8225, None),
    "欲": ("欲", "beh", 7469, None),
    "拜託": ("拜託", "pài-thok", 4952, None),
    "多謝": ("多謝", "to-siā", 2415, None),
    "水": ("水", "tsuí", 814, None),
    "咖啡": ("咖啡", "ka-pi", 3728, None),
    "牛奶": ("牛奶", "gû-ling", 1228, None),
    "茶": ("茶", "tê", 6537, None),
    "果汁": ("果汁", "kó-tsiap", 25116, None),
}

WORDS = [
    ("停", "thîng", 6914),
    ("出口", "tshut-kháu", 1418),
    ("打開", "khui--khui", 9188),
    ("折扣", "tsiat-khàu", 22863),
    ("公車", "kong-tshia", 23445),
    ("計程車", "kè-thîng-tshia", 5537),
    ("推", "thui", 7310),
    ("拉", "thuah", 5960),
    ("上", "siōng", 166),
    ("下", "ē", 167),
    ("關", "kuainn", 12900),
    ("水", "tsuí", 814),
    ("咖啡", "ka-pi", 3728),
    ("湯", "thng", 8549),
    ("牛奶", "gû-ling", 1228),
    ("麵", "mī", 13053),
    ("茶", "tê", 6537),
    ("飯", "pn̄g", 9222),
    ("果汁", "kó-tsiap", 25116),
    ("水果", "tsuí-kó", 966),
    ("食物", "si̍t-bu̍t", 5602),
    ("牛肉", "gû-bah", 22747),
    ("豬肉", "ti-bah", 11411),
    ("雞肉", "ke-bah", 26735),
    ("魚", "hî", 8084),
    ("熱", "jia̍t", 11203),
    ("涼", "liâng", 7474),
    ("冷", "líng", 2874),
    ("病", "pēnn", 6342),
    ("睏", "khùn", 8764),
    ("緊張", "kín-tiunn", 10769),
    ("激動", "kik-tōng", 25359),
    ("清醒", "tshing-tshénn", 25235),
    ("輕鬆", "khin-sang", 10902),
    ("無聊", "bô-liâu", 24119),
    ("懶", "lán", 12769),
    ("平靜", "pîng-tsīng", 1811),
]

COMPOSED_WORDS = [
    ("停車場", "thîng-tshia-tiûnn", ["停車", "場"]),
]

AUDIO_BASE_URL = "https://sutian.moe.edu.tw"
SYLLABLE_SECONDS = 0.32
PHRASE_PAUSE_SECONDS = 0.12
SILENCE_FILTER = (
    "silenceremove=start_periods=1:start_duration=0:start_threshold=-50dB:"
    "stop_periods=-1:stop_duration=0.12:stop_threshold=-50dB,"
    "areverse,"
    "silenceremove=start_periods=1:start_duration=0:start_threshold=-50dB:"
    "stop_periods=-1:stop_duration=0.12:stop_threshold=-50dB,"
    "areverse"
)

PHRASES = [
    (
        "whats-your-name",
        "你叫啥物名？",
        "Lí kiò siánn-mih miâ?",
        {"url": f"{AUDIO_BASE_URL}/media/senn/mp3/imtong/leku/46/46975.mp3"},
    ),
    (
        "my-name-is",
        "我的名是",
        "Guá ê miâ sī",
        {"keys": ["我", "的", "名", "是"]},
    ),
    (
        "how-are-you",
        "你好無？",
        "Lí hó bô?",
        {"keys": ["你", "好", "無"]},
    ),
    (
        "i-am-happy",
        "我真歡喜",
        "Guá tsin huann-hí",
        {"keys": ["我", "真", "歡喜"]},
    ),
    (
        "i-am-tired",
        "我真忝",
        "Guá tsin thiám",
        {"keys": ["我", "真", "忝"]},
    ),
    (
        "i-am-hungry",
        "我腹肚枵矣",
        "Guá pak-tóo-iau--ah",
        {"url": f"{AUDIO_BASE_URL}/media/senn/mp3/imtong/leku/50/50912.mp3"},
    ),
    (
        "i-am-thirsty",
        "我喙焦",
        "Guá tshuì-ta",
        {"keys": ["我", "喙焦"]},
    ),
    (
        "im-thirsty",
        "我喙焦",
        "Guá tshuì-ta",
        {"keys": ["我", "喙焦"]},
    ),
    (
        "want-water",
        "我欲水，拜託",
        "Guá beh tsuí, pài-thok",
        {"keys": ["我", "欲", "水", "拜託"]},
    ),
    (
        "want-coffee",
        "我欲咖啡，拜託",
        "Guá beh ka-pi, pài-thok",
        {"keys": ["我", "欲", "咖啡", "拜託"]},
    ),
    (
        "want-milk",
        "我欲牛奶，拜託",
        "Guá beh gû-ling, pài-thok",
        {"keys": ["我", "欲", "牛奶", "拜託"]},
    ),
    (
        "want-tea",
        "我欲茶，拜託",
        "Guá beh tê, pài-thok",
        {"keys": ["我", "欲", "茶", "拜託"]},
    ),
    (
        "want-juice",
        "我欲果汁，拜託",
        "Guá beh kó-tsiap, pài-thok",
        {"keys": ["我", "欲", "果汁", "拜託"]},
    ),
    (
        "thank-you",
        "多謝",
        "to-siā",
        {"keys": ["多謝"]},
    ),
]

NUMBERS = [
    ("0", "零", "lîng", ["0"]),
    ("1", "一", "it", ["1"]),
    ("2", "二", "jī", ["2"]),
    ("3", "三", "sann", ["3"]),
    ("4", "四", "sì", ["4"]),
    ("5", "五", "gōo", ["5"]),
    ("6", "六", "la̍k", ["6"]),
    ("7", "七", "tshit", ["7"]),
    ("8", "八", "peh", ["8"]),
    ("9", "九", "káu", ["9"]),
    ("10", "十", "tsa̍p", ["10"]),
    ("20", "二十", "jī-tsa̍p", ["2", "10"]),
    ("30", "三十", "sann-tsa̍p", ["3", "10"]),
    ("40", "四十", "sì-tsa̍p", ["4", "10"]),
    ("50", "五十", "gōo-tsa̍p", ["5", "10"]),
    ("60", "六十", "la̍k-tsa̍p", ["6", "10"]),
    ("70", "七十", "tshit-tsa̍p", ["7", "10"]),
    ("80", "八十", "peh-tsa̍p", ["8", "10"]),
    ("90", "九十", "káu-tsa̍p", ["9", "10"]),
    ("100", "一百", "tsi̍t-pah", ["一百", "百"]),
    ("500", "五百", "gōo-pah", ["5", "百"]),
    ("1000", "一千", "tsi̍t-tshing", ["一百", "千"]),
    ("10000", "一萬", "tsi̍t-bān", ["一百", "萬"]),
]

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
}


def find_audio_url(word_id):
    page_url = f"https://sutian.moe.edu.tw/zh-hant/su/{word_id}/"
    page_resp = requests.get(page_url, headers=HEADERS)

    if page_resp.status_code != 200:
        print(f"Page error ({page_resp.status_code}): {page_url}")
        return None

    match = re.search(r'(/media/[^"\']+\.(?:mp3|wav))', page_resp.text)
    time.sleep(0.3)

    if not match:
        return None

    return urllib.parse.urljoin("https://sutian.moe.edu.tw", match.group(1))


def download_audio(audio_url, filepath):
    audio_resp = requests.get(audio_url, headers=HEADERS)

    if audio_resp.status_code != 200:
        print(f"Audio download failed ({audio_resp.status_code}): {audio_url}")
        return False

    with open(filepath, "wb") as f:
        f.write(audio_resp.content)
    return True


def concatenate_mp3s(parts, output_path, work_dir):
    list_path = os.path.join(work_dir, f"concat_{os.path.basename(output_path)}.txt")
    with open(list_path, "w") as f:
        for part in parts:
            f.write(f"file '{part}'\n")

    result = subprocess.run(
        ["ffmpeg", "-y", "-loglevel", "error", "-f", "concat", "-safe", "0",
         "-i", list_path, "-c", "copy", output_path],
        capture_output=True,
        text=True,
    )

    if result.returncode != 0:
        print(f"ffmpeg failed for {output_path}: {result.stderr.strip()}")
        return False
    return True


def syllable_count(tailo):
    parts = [part for part in re.split(r"[\s\-]+", tailo.strip("?!.,")) if part]
    return max(1, len(parts))


def probe_duration(filepath):
    result = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration",
         "-of", "default=noprint_wrappers=1:nokey=1", filepath],
        capture_output=True,
        text=True,
    )
    try:
        return float(result.stdout.strip())
    except ValueError:
        return None


def atempo_filter(tempo):
    filters = []
    while tempo > 2:
        filters.append("atempo=2.0")
        tempo /= 2
    while tempo < 0.5:
        filters.append("atempo=0.5")
        tempo /= 0.5
    filters.append(f"atempo={tempo:.3f}")
    return ",".join(filters)


def normalize_speech(filepath, tailo, work_dir):
    base = os.path.basename(filepath)
    cleaned_path = os.path.join(work_dir, f"cleaned_{base}")

    result = subprocess.run(
        ["ffmpeg", "-y", "-loglevel", "error", "-i", filepath, "-af",
         SILENCE_FILTER, "-ar", "44100", "-ac", "1", cleaned_path],
        capture_output=True,
        text=True,
    )
    if result.returncode != 0:
        print(f"ffmpeg cleanup failed for {base}: {result.stderr.strip()}")
        return False

    cleaned_duration = probe_duration(cleaned_path)
    if not cleaned_duration:
        print(f"Could not measure duration for {base}")
        return False

    target_duration = syllable_count(tailo) * SYLLABLE_SECONDS + PHRASE_PAUSE_SECONDS
    filters = f"{atempo_filter(cleaned_duration / target_duration)},loudnorm=I=-16:TP=-1.5:LRA=11"
    normalized_path = os.path.join(work_dir, f"normalized_{base}")

    result = subprocess.run(
        ["ffmpeg", "-y", "-loglevel", "error", "-i", cleaned_path, "-af",
         filters, "-ar", "44100", "-ac", "1", normalized_path],
        capture_output=True,
        text=True,
    )
    if result.returncode != 0:
        print(f"ffmpeg normalization failed for {base}: {result.stderr.strip()}")
        return False

    shutil.move(normalized_path, filepath)
    return True


with tempfile.TemporaryDirectory() as work_dir:
    cache = {}

    for key, (hanzi, tailo, word_id, fallback_id) in COMPONENTS.items():
        filepath = os.path.join(work_dir, f"component_{key}.mp3")
        audio_url = find_audio_url(word_id)

        if audio_url is None and fallback_id is not None:
            print(f"No audio for {hanzi} ({tailo}), using fallback {fallback_id}")
            audio_url = find_audio_url(fallback_id)

        if audio_url is None or not download_audio(audio_url, filepath):
            print(f"Skipping component: {hanzi} ({tailo})")
            continue

        cache[key] = filepath

    for number, hanzi, tailo, keys in NUMBERS:
        if any(key not in cache for key in keys):
            print(f"Missing audio for {number} {hanzi} ({tailo})")
            continue

        filename = f"{number}_{hanzi}_{tailo}.mp3"
        filepath = os.path.join(NUMBERS_OUTPUT_DIR, filename)

        if len(keys) == 1:
            shutil.copyfile(cache[keys[0]], filepath)
        elif not concatenate_mp3s([cache[key] for key in keys], filepath, work_dir):
            continue

        print(f"Created: {filename}")

    for word, tailo, word_id in WORDS:
        filepath = os.path.join(OUTPUT_DIR, f"{word}_{tailo}.mp3")
        audio_url = find_audio_url(word_id)

        if audio_url is None or not download_audio(audio_url, filepath):
            print(f"Skipping word: {word} ({tailo})")
            continue

        normalize_speech(filepath, tailo, work_dir)
        print(f"Created: {os.path.basename(filepath)}")

    for word, tailo, keys in COMPOSED_WORDS:
        if any(key not in cache for key in keys):
            print(f"Missing audio for {word} ({tailo})")
            continue

        filepath = os.path.join(OUTPUT_DIR, f"{word}_{tailo}.mp3")
        if not concatenate_mp3s([cache[key] for key in keys], filepath, work_dir):
            continue

        normalize_speech(filepath, tailo, work_dir)
        print(f"Created: {os.path.basename(filepath)}")

    for phrase_id, hanzi, tailo, source in PHRASES:
        filename = f"phrase-{phrase_id}.mp3"
        filepath = os.path.join(OUTPUT_DIR, filename)

        if "url" in source:
            if not download_audio(source["url"], filepath):
                print(f"Skipping phrase: {hanzi} ({tailo})")
                continue
        else:
            keys = source["keys"]
            if any(key not in cache for key in keys):
                print(f"Missing audio for {hanzi} ({tailo})")
                continue

            if len(keys) == 1:
                shutil.copyfile(cache[keys[0]], filepath)
            elif not concatenate_mp3s([cache[key] for key in keys], filepath, work_dir):
                continue

        normalize_speech(filepath, tailo, work_dir)
        print(f"Created: {filename}")
