"""効果音(SE)をnumpyで合成して public/se/*.wav に書き出す。"""
import wave, pathlib
import numpy as np
from scipy import signal

SR = 44100
OUT = pathlib.Path(__file__).resolve().parent.parent / "public" / "se"
OUT.mkdir(parents=True, exist_ok=True)
rng = np.random.default_rng(7)


def t(d):
    return np.linspace(0, d, int(SR * d), endpoint=False)


def norm(x, peak=0.9):
    return x / (np.max(np.abs(x)) + 1e-9) * peak


def save(name, x):
    x = np.clip(norm(x), -1, 1)
    with wave.open(str(OUT / f"{name}.wav"), "wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((x * 32767).astype("<i2").tobytes())


def bandpass_noise(d, f0, f1, q=2.0):
    n = rng.standard_normal(int(SR * d))
    out = np.zeros_like(n)
    blocks = 40
    sz = len(n) // blocks
    for i in range(blocks):
        f = f0 + (f1 - f0) * i / (blocks - 1)
        b, a = signal.butter(2, [max(f / q, 80) / (SR / 2), min(f * 1.4, 18000) / (SR / 2)], "band")
        out[i * sz:(i + 1) * sz] = signal.lfilter(b, a, n[i * sz:(i + 1) * sz])
    return out


def whoosh():
    d = 0.45; x = bandpass_noise(d, 600, 5000)
    e = np.sin(np.pi * t(d) / d) ** 1.5
    return x * e


def swoosh():
    d = 0.35; x = bandpass_noise(d, 5000, 500)
    return x * np.sin(np.pi * t(d) / d) ** 1.2


def hit():
    d = 0.35; tt = t(d)
    f = 40 + 140 * np.exp(-tt * 30)
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 9)
    click = rng.standard_normal(len(tt)) * np.exp(-tt * 120) * 0.5
    return np.tanh(2.5 * (body + click))


def boom():
    d = 1.2; tt = t(d)
    f = 30 + 110 * np.exp(-tt * 12)
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 3.2)
    b, a = signal.butter(2, 900 / (SR / 2))
    noise = signal.lfilter(b, a, rng.standard_normal(len(tt))) * np.exp(-tt * 5)
    crack = rng.standard_normal(len(tt)) * np.exp(-tt * 80)
    return np.tanh(3 * (body + 0.6 * noise + 0.4 * crack))


def pop():
    d = 0.14; tt = t(d)
    f = 500 + 900 * (tt / d)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 28)


def tick():
    d = 0.05; tt = t(d)
    return (np.sin(2 * np.pi * 2400 * tt) + 0.3 * rng.standard_normal(len(tt))) * np.exp(-tt * 90)


def riser():
    d = 1.0; tt = t(d)
    f = 200 * (12 ** (tt / d))
    tone = np.sin(2 * np.pi * np.cumsum(f) / SR)
    noise = bandpass_noise(d, 400, 7000)
    return (0.5 * tone + noise) * (tt / d) ** 2.0


def ding():
    d = 1.0; tt = t(d); x = np.zeros_like(tt)
    for k, (fr, am) in enumerate([(1318, 1), (1976, .5), (2637, .35), (3951, .15)]):
        x += am * np.sin(2 * np.pi * fr * tt) * np.exp(-tt * (4 + k * 2))
    return x


def glitch():
    d = 0.28; n = int(SR * d); x = np.zeros(n)
    pos = 0
    while pos < n:
        ln = int(rng.integers(300, 1800)); seg = rng.standard_normal(ln)
        if rng.random() < .5:
            seg = np.sign(np.sin(2 * np.pi * rng.uniform(100, 1500) * np.arange(ln) / SR))
        x[pos:pos + ln] = seg[: n - pos] * rng.uniform(.3, 1)
        pos += ln + int(rng.integers(0, 600))
    q = np.round(x * 6) / 6
    return q * np.exp(-t(d) * 4)


def sparkle():
    d = 0.7; tt = t(d); x = np.zeros_like(tt)
    for i, fr in enumerate([1568, 1976, 2349, 2637, 3136, 3951]):
        s = int(i * 0.045 * SR)
        seg = tt[: len(tt) - s]
        x[s:] += np.sin(2 * np.pi * fr * seg) * np.exp(-seg * 14)
    return x


for name, fn in dict(whoosh=whoosh, swoosh=swoosh, hit=hit, boom=boom, pop=pop, tick=tick,
                     riser=riser, ding=ding, glitch=glitch, sparkle=sparkle).items():
    save(name, fn())
    print("SE:", name)
