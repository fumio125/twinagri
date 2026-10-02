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

## 公開手順（GitHub Pages × JPDirect）

GitHub: ユーザー `fumio125` / リポジトリ `twinagri`

1. リポジトリ https://github.com/fumio125/twinagri （Public）にこのフォルダの中身を push
2. Settings → Pages：Source = `Deploy from a branch`、Branch = `main` / `/(root)`
3. 同じ画面の Custom domain に `www.twinagri.org` → Save（**DNS設定より先に行う**）
4. JPDirect お客様専用ページ → 対象ドメイン → DNSサービス で以下を登録

   | ホスト名 | タイプ | 値 |
   |---|---|---|
   | www | CNAME | fumio125.github.io.（末尾のピリオド必須） |
   | （空欄＝twinagri.org） | A | 185.199.108.153 |
   | （空欄） | A | 185.199.109.153 |
   | （空欄） | A | 185.199.110.153 |
   | （空欄） | A | 185.199.111.153 |

   ※ JPDirectのDNSサービスはネームサーバー設定・Webリダイレクトと併用不可
5. 確認: `nslookup www.twinagri.org` が fumio125.github.io を返し、Pages画面に「DNS check successful」
6. Enforce HTTPS にチェック（証明書発行まで最大24時間）
7. （推奨）GitHub 個人 Settings → Pages → Add a domain で twinagri.org を検証（TXTレコードを追加）

## よくある更新

- **お知らせ**: `index.html` と `en/index.html` の `<ul class="news-list">` の先頭に `<li>` を追加
- **業績**: `#publications` のコメント内の `<ol class="pub-list">` を使い、`pub-empty` を削除
- **メンバー写真**: `assets/img/` に置き、`<div class="avatar">` 内を `<img src="assets/img/okura.jpg" alt="">` に差し替え（英語版は `../assets/img/...`）

## 画像クレジット

- `assets/img/challenge-field.jpg`：“Original 1986 Syrah planting at Red Willow” by Agne27, [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/) — [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Original_1986_Syrah_planting_at_Red_Willow.jpg)（トリミング・縮小）。改変画像も CC BY-SA 3.0 で提供。ページ上の画像右上にクレジット表示あり（削除しないこと）
- メンバー写真のリンク先は各PIの `<a class="avatar" href=...>` と「ウェブサイト ↗」リンクで変更可能
