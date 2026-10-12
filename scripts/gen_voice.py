"""ナレーション生成。
優先: ローカルの VOICEVOX ENGINE (http://127.0.0.1:50021, 環境変数 VOICEVOX_URL / VOICEVOX_SPEAKER)
代替: pyopenjtalk (pip install pyopenjtalk) ※ロボ声のプレビュー用
各セリフは max 秒に収まるよう atempo で詰め、実尺を src/voiceMeta.json に書く。
"""
import json, os, pathlib, subprocess, sys, tempfile, urllib.parse, urllib.request, wave
import numpy as np

ROOT = pathlib.Path(__file__).resolve().parent.parent
LINES = json.loads((ROOT / "src" / "lines.json").read_text())
OUT = ROOT / "public" / "voice"; OUT.mkdir(parents=True, exist_ok=True)
VV = os.environ.get("VOICEVOX_URL", "http://127.0.0.1:50021")
SPK = int(os.environ.get("VOICEVOX_SPEAKER", "3"))  # 3 = ずんだもん(ノーマル)
BOOST = float(os.environ.get("VOICE_SPEED", "1.12"))  # 全体の早口度


def voicevox(text, path):
    q = urllib.request.urlopen(urllib.request.Request(
        f"{VV}/audio_query?text={urllib.parse.quote(text)}&speaker={SPK}", method="POST"), timeout=20).read()
    q = json.loads(q); q["speedScale"] = 1.1; q["intonationScale"] = 1.3; q["prePhonemeLength"] = 0.0; q["postPhonemeLength"] = 0.05
    w = urllib.request.urlopen(urllib.request.Request(
        f"{VV}/synthesis?speaker={SPK}", data=json.dumps(q).encode(), headers={"Content-Type": "application/json"},
        method="POST"), timeout=60).read()
    pathlib.Path(path).write_bytes(w)


def openjtalk(text, path):
    import pyopenjtalk
    x, sr = pyopenjtalk.tts(text.replace('、', '').replace('。', ' '), speed=1.25)
    x = (np.clip(x / 32768.0 if np.abs(x).max() > 2 else x, -1, 1) * 32767).astype("<i2")
    with wave.open(str(path), "wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(sr); w.writeframes(x.tobytes())


def have_voicevox():
    try:
        urllib.request.urlopen(f"{VV}/version", timeout=2); return True
    except Exception:
        return False


def dur(p):
    with wave.open(str(p)) as w:
        return w.getnframes() / w.getframerate()


use_vv = have_voicevox()
print("TTS engine:", "VOICEVOX" if use_vv else "pyopenjtalk (fallback)")
meta = {}
with tempfile.TemporaryDirectory() as td:
    for ln in LINES:
        raw = pathlib.Path(td) / f"{ln['id']}.wav"
        (voicevox if use_vv else openjtalk)(ln["yomi"], raw)
        trim = pathlib.Path(td) / f"{ln['id']}_t.wav"
        subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(raw), "-af",
                        "silenceremove=start_periods=1:start_threshold=-45dB,areverse,silenceremove=start_periods=1:start_threshold=-45dB,areverse",
                        str(trim)], check=True)
        d = dur(trim)
        tempo = max(BOOST, d / (ln["max"] - 0.05))
        tempo = min(tempo, 1.9)
        dst = OUT / f"{ln['id']}.wav"
        subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(trim), "-af",
                        f"atempo={tempo:.3f},loudnorm=I=-14:TP=-1.5:LRA=7", "-ar", "44100", "-ac", "1", str(dst)], check=True)
        meta[ln["id"]] = round(dur(dst), 3)
        print(ln["id"], f"{d:.2f}s -> {meta[ln['id']]:.2f}s (tempo {tempo:.2f})")
(ROOT / "src" / "voiceMeta.json").write_text(json.dumps(meta, indent=1))
