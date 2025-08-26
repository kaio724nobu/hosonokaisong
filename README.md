# ほそのかい — アーティストページ

静的なシングルページです。白基調＋パステル（青／カモ色）でやわらかいデザインにしています。

## 使い方

- 開く: `index.html` をブラウザで開いてください。
- 画像: `assets/img/artist.jpg` を差し替えるとメイン写真が更新されます。
- カラー: `assets/css/styles.css` の CSS 変数（:root 内）を調整してください。

## ツイートの更新（簡単）

- `assets/js/tweets.js` を開き、配列にツイートのURLを追加します。

```js
// 例:
const TWEETS = [
  'https://twitter.com/Interior/status/463440424141459456',
  'https://x.com/XXXXX/status/XXXXXXXXXXXXXXX'
];
```

- 保存すると、`index.html` を再読み込みした際に自動で埋め込み表示されます。
- 表示にはインターネット接続が必要です（Twitter/X の `widgets.js` を読み込みます）。

## よくある編集箇所

- SNSリンク: `index.html` の `.socials` 部分の URL をご自身のアカウントに変更。
- プロフィール文: `#profile` セクション内のテキストを編集。
- お問い合わせ: `mailto:` のメールアドレスを差し替え。

## 補足

- ローカルで `file://` で開いて動作します（fetchは使わず、`tweets.js` を読み込む方式）。
- さらにセクション追加やCMS化なども可能です。必要ならお知らせください。
- 写真ギャラリー: `assets/js/photos.js` の `PHOTOS` 配列に画像のパスを追加すると、
  - ヒーロー背景のローテーション
  - 「ギャラリー」セクションのグリッドとライトボックス
  に反映されます。画像は `assets/gallery/` に置くのがおすすめです。
