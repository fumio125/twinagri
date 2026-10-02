# CREST Twin Agriculture — Website

JST CREST「ツイン農業のための栽培環境のマルチスケール時空間仮想化」プロジェクトサイト  
公開URL: https://www.twinagri.org/

ビルド不要の静的サイト（HTML / CSS / JS のみ）です。

```
index.html          日本語トップ
en/index.html       英語トップ
assets/css/style.css
assets/js/main.js   ヘッダー・スクロール演出・ヒーローの3D植物アニメーション
assets/img/         favicon / OGP画像 / 写真置き場
CNAME               独自ドメイン（www.twinagri.org）
```

## 公開手順（GitHub Pages）

1. GitHub で新規リポジトリを作成（例: `twinagri.github.io` または `crest-twinagri`、Public）
2. このフォルダの中身を push
   ```
   git init && git add . && git commit -m "Initial site"
   git branch -M main
   git remote add origin https://github.com/<ACCOUNT>/<REPO>.git
   git push -u origin main
   ```
3. リポジトリの **Settings → Pages** で Source を `Deploy from a branch`、Branch を `main` / `/(root)` に設定
4. 同じ画面の **Custom domain** に `www.twinagri.org` を入力 → Save
5. ドメインのDNS設定（レジストラ側）
   | ホスト | タイプ | 値 |
   |---|---|---|
   | www | CNAME | `<ACCOUNT>.github.io` |
   | @（apex） | A | 185.199.108.153 / 185.199.109.153 / 185.199.110.153 / 185.199.111.153 |
   apex（twinagri.org）の A レコードも入れておくと、`twinagri.org` → `www.twinagri.org` に自動転送されます。
6. DNS反映後（数分〜数時間）、**Enforce HTTPS** にチェック

推奨: Settings → Pages の「Verified domains」（アカウント設定 → Pages）でドメインを検証しておくと、ドメイン乗っ取り対策になります。

## よくある更新

- **お知らせ**: `index.html` と `en/index.html` の `<ul class="news-list">` の先頭に `<li>` を追加
- **業績**: `#publications` のコメント内の `<ol class="pub-list">` を使い、`pub-empty` を削除
- **メンバー写真**: `assets/img/` に置き、`<div class="avatar">` 内を `<img src="assets/img/okura.jpg" alt="">` に差し替え（英語版は `../assets/img/...`）
