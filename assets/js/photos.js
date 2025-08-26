// 写真のパスをここに列挙すると、
// ヒーロー背景のローテーションとギャラリーに反映されます。
// 画像は assets/gallery/ に置くのがおすすめです。
// 写真の見せたい位置（顔など）を `pos` で指定できます。
// 値は CSS の object-position と同じ指定です（例: '50% 30%'）。
// ここでは全体的にやや上寄せ（30%）で顔が切れにくいようにしています。
window.PHOTOS = [
  // さらに下へ。1枚目は18%、2枚目は12%まで下げる
  { src: 'assets/gallery/IMG_3290.JPG', pos: '50% 18%' },
  { src: 'assets/gallery/IMG_8690.JPG', pos: '50% 12%' },
  { src: 'assets/gallery/IMG_8763.JPG', pos: '50% 30%' },
];
