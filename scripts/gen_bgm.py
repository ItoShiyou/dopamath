"""BGM生成。ローカルの ACE-Step (API サーバー) に投げて public/bgm.wav を作る。
  ACESTEP_API=http://127.0.0.1:8001 python3 scripts/gen_bgm.py
ACE-Step に繋がらない時だけ、プレビュー用の簡易シンセBGMにフォールバックする(--fallback で強制)。
"""
import argparse, json, os, pathlib, subprocess, sys, tempfile, time, urllib.request, wave
import numpy as np

ROOT = pathlib.Path(__file__).resolve().parent.parent
ap = argparse.ArgumentParser(); ap.add_argument("--video", default="nine"); ap.add_argument("--fallback", action="store_true"); ARGS = ap.parse_args()
VDIR = ROOT / "src" / "videos" / ARGS.video
VMETA = json.loads((VDIR / "meta.json").read_text())
OUT = ROOT / "public" / ARGS.video / "bgm.wav"; OUT.parent.mkdir(parents=True, exist_ok=True)
API = os.environ.get("ACESTEP_API", "http://127.0.0.1:8001").rstrip("/")
KEY = os.environ.get("ACESTEP_API_KEY", "")
DURATION = int(VMETA["duration"]) + 2
BPM = VMETA["bpm"]
PROMPT = os.environ.get("BGM_PROMPT", VMETA.get("bgmPrompt") or (
    "high energy hyperpop, glitchy electronic dance, 150 bpm, punchy four on the floor kick, "
    "bouncy staccato synth lead, heavy sub bass, fast trap hi-hats, risers and drops, "
    "addictive hook, instrumental, no vocals"))


def post(path, body):
    h = {"Content-Type": "application/json"}
    if KEY: h["Authorization"] = f"Bearer {KEY}"
    r = urllib.request.Request(API + path, data=json.dumps(body).encode(), headers=h, method="POST")
    return json.loads(urllib.request.urlopen(r, timeout=60).read())


def acestep(dst):
    r = post("/release_task", {"prompt": PROMPT, "lyrics": "[Instrumental]", "audio_duration": DURATION,
                               "bpm": BPM, "batch_size": 1, "audio_format": "wav", "thinking": False})
    tid = (r.get("data") or r)["task_id"]
    print("ACE-Step task:", tid)
    for _ in range(600):
        time.sleep(3)
        q = post("/query_result", {"task_id_list": [tid]})
        item = (q.get("data") or q)[0]
        if item.get("status") == 1:
            res = json.loads(item["result"]) if isinstance(item["result"], str) else item["result"]
            f = res[0]["file"]
            url = f if f.startswith("http") else API + f
            raw = pathlib.Path(dst).with_suffix(".raw")
            raw.write_bytes(urllib.request.urlopen(url, timeout=120).read())
            return raw
        if item.get("status") == 2:
            raise RuntimeError("ACE-Step generation failed: " + str(item))
        print("  generating...")
    raise TimeoutError("ACE-Step timeout")


def synth(dst):
    """フォールバック: 150BPMのハイパーポップ風を numpy で作る(プレビュー用)。"""
    SR = 44100; n = DURATION * SR; rng = np.random.default_rng(3)
    beat = 60 / BPM; out = np.zeros(n)
    def add(x, t0, g=1.0):
        i = int(t0 * SR); x = x[: max(0, n - i)]; out[i:i + len(x)] += x * g
    tk = np.arange(int(.25 * SR)) / SR
    kick = np.sin(2 * np.pi * np.cumsum(45 + 130 * np.exp(-tk * 35)) / SR) * np.exp(-tk * 11)
    th = np.arange(int(.05 * SR)) / SR; hat = rng.standard_normal(len(th)) * np.exp(-th * 90)
    ts = np.arange(int(.2 * SR)) / SR; snare = (rng.standard_normal(len(ts)) * .8 + np.sin(2 * np.pi * 190 * ts)) * np.exp(-ts * 22)
    scale = [0, 3, 5, 7, 10, 12, 15, 17]; root = 57  # Am pentatonic
    prog = [0, -2, -4, -2]  # i VI IV VI 風
    total_beats = int(DURATION / beat)
    for b in range(total_beats):
        t0 = b * beat; bar = b // 4; r = prog[bar % 4]
        drop = bar >= 1
        if drop: add(kick, t0, .9)
        if b % 4 in (1, 3) and drop: add(snare, t0, .5)
        for h in range(2): add(hat, t0 + h * beat / 2, .25 if h == 0 else .35)
        if drop and b % 2 == 0: add(hat, t0 + beat / 4, .2); add(hat, t0 + beat * .75, .2)
        # bass (sidechain-ish ducking by decay)
        f = 440 * 2 ** ((root + r - 24 - 69) / 12); tb = np.arange(int(beat * SR)) / SR
        add(np.tanh(2 * np.sin(2 * np.pi * f * tb)) * (1 - np.exp(-tb * 60)) * np.exp(-tb * 2.5) * .5, t0)
        # staccato lead arps (16th)
        for s in range(4):
            deg = scale[int(rng.integers(0, len(scale)))] if drop else scale[(b * 2 + s) % 5]
            fl = 440 * 2 ** ((root + r + 12 + deg - 69) / 12); tl = np.arange(int(beat / 4 * SR)) / SR
            saw = 2 * ((fl * tl) % 1) - 1; sq = np.sign(np.sin(2 * np.pi * fl * tl))
            add((saw * .5 + sq * .5) * np.exp(-tl * 14) * (.22 if drop else .15), t0 + s * beat / 4)
    fade = np.minimum(1, np.minimum(np.arange(n) / (.05 * SR), (n - np.arange(n)) / (1.2 * SR)))
    out = np.tanh(out * 1.2) * fade * .8
    with wave.open(str(dst), "wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((out * 32767).astype("<i2").tobytes())


with tempfile.TemporaryDirectory() as td:
    tmp = pathlib.Path(td) / "bgm.wav"
    src = None
    if not ARGS.fallback:
        try:
            src = acestep(tmp); print("BGM source: ACE-Step")
        except Exception as e:
            print(f"!! ACE-Step に接続できません ({API}): {e}\n!! フォールバックのシンセBGMを使います", file=sys.stderr)
    if src is None:
        synth(tmp); src = tmp; print("BGM source: fallback synth (PREVIEW ONLY)")
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(src), "-t", str(DURATION), "-af",
                    f"afade=t=out:st={DURATION-1.5}:d=1.5,loudnorm=I=-16:TP=-1.5", "-ar", "44100", "-ac", "2", str(OUT)], check=True)
print("wrote", OUT)
