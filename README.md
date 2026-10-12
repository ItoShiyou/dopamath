# DOPAMATH – 0.999…＝1 ショート動画 (Remotion)

1080x1920 / 30fps / 42.5s。高校数学(極限・無限級数)ネタ。フック→証明①(1/3)→証明②(代数)→極限→隙間ゼロ→フォローCTA。

## 手順
```bash
npm i
# 1) 素材生成
python3 scripts/gen_se.py      # SE(コード合成)
python3 scripts/gen_voice.py   # ナレーション: ローカル VOICEVOX 優先 (VOICEVOX_SPEAKER=3 など)、無ければ pyopenjtalk
ACESTEP_API=http://127.0.0.1:8001 python3 scripts/gen_bgm.py   # BGM: ローカル ACE-Step API
# 2) プレビュー / 書き出し
npm run studio
npm run render   # out/dopamath.mp4
```
- 構成・SEタイミングは `src/lines.json` / `src/timeline.ts`。
- `gen_bgm.py` は ACE-Step に繋がらないとプレビュー用シンセBGMに切り替わります。
