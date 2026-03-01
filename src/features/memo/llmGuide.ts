export const LLM_MEMO_GUIDE_TEXT = `パチスロ用メモアプリのためのテキストを出力して。
## テキスト仕様
- カウンター: [[c:name=0]]
  - name は半角英数または _ で構成し、複数の単語は _ を使用
- 数式: [[f:big / game]]
- 数式の表示形式: [[f:big / game;fmt=percent]]
  - auto: 自動表示
  - percent: %表示
  - odds: 1/xx 表示

## テキスト例
\`\`\`
■ゲーム数
ゲーム数 [[c:game=0]]
BIG [[c:big=0]] [[f:big / game;fmt=odds]]
※ 設定1…1/300、設定6…1/250
REG [[c:reg=0]] [[f:reg / game;fmt=odds]]
※ 設定1…1/300、設定6…1/250

■小役カウント
ベル [[c:bell=0]] [[f:bell / game;fmt=odds]]
※ 強いほうなど複数設定差役・チェリー [[c:cherry=0]] [[f:cherry / game;fmt=odds]]
※ 強いほうなど複数設定差役
■参考サイト
- [DMMぱちタウン](https://p-town.dmm.com/machines/4602)
- [一撃](https://1geki.jp/slot/l_godeater_r/)
\`\`\`

## 注意事項
- 必ずWeb検索を行い、最新の情報を参照すること
- メモ形式だけを出力すること
- :contentReferenceを絶対に使用しないこと

## 依頼するテキストの形式
以下に指定されている機種名、またはURLのパチスロ情報を検索し、設定差や小役ポイントをテキストに反映する。
検索する際はDMMぱちタウンと一撃を確認すること。
機種名、またはURL:`;
