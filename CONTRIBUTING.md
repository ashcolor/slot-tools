# CONTRIBUTING

このリポジトリの開発手順とルールです。

## 開発コマンド

```bash
pnpm install
pnpm run dev
```

## 必須チェック

コード変更後は、必ず次の順に実行してください。

```bash
pnpm run lint
pnpm run fmt
pnpm run build
```

いずれかが失敗した場合は、その時点で修正してから次へ進みます。

## ディレクトリ構成

```text
slot-tools/
├─ src/
│  ├─ components/
│  ├─ constants/
│  ├─ features/
│  ├─ routes/
│  └─ utils/
├─ public/
├─ docs/
└─ dist/
```
