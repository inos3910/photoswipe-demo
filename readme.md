# PhotoSwipe DEMO

## 環境
- gulp 4.0.2
  - sassコンパイル
- webpack 5.52.1
  - js バンドル 圧縮 最適化
- babel 7.15
  - js es6+最適化
- browserSync
  - ライブリロード

## メモ
- タスクランナーはテーマに設置してあるのでテーマディレクトリで起動する
- `sudo yarn` or `npm install`で環境作成
- node_modulesがpermission errorの場合は `sudo chmod 777 [node_modulesのパス]`で権限を変更すればOK

### npm scripts
- `npm run dev` or `yarn dev` 開発モードでビルド
- `npm run build` or `yarn build` 本番モードでビルド
