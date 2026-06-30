# ログインエラーハンドリング整備 実装計画

> **このプロジェクトの実行方式:** Claude がチャットでコードを小出しにする → IK が手でタイプ → 理解確認 → 次へ。エージェント自動実行は使わない。

**Goal:** ログインページのエラーを日本語で表示し、送信中は loading 状態を制御する。

**Architecture:** `useAuth` カスタムフックにSupabase認証ロジックを集約し、`LoginPage.jsx` はUIのみに専念する。`useGames.js` と同じパターン。

**Tech Stack:** React（useState）、Supabase Auth

## Global Constraints

- `.js` `.jsx` ファイルへの直接書き込みは Claude がしない（IK が手でタイプ）
- TypeScript は使わない
- コメントは日本語

---

## ファイル構成

| ファイル | 種別 | 責務 |
|---|---|---|
| `src/hooks/useAuth.js` | 新規作成 | Supabase認証・エラー変換・loading管理 |
| `src/pages/LoginPage.jsx` | 修正 | UIのみ。useAuth を呼ぶ |

---

### Task 1: `src/hooks/useAuth.js` を新規作成

**Files:**
- Create: `src/hooks/useAuth.js`

**Interfaces:**
- Produces: `useAuth()` → `{ isLoading, error, login, signUp }`

- [ ] **Step 1: ファイルを新規作成し、import と エラーマップを書く**

```js
import { useState } from "react";
import supabase from "../lib/supabase";

const ERROR_MESSAGES = {
  "Invalid login credentials": "メールアドレスまたはパスワードが違います",
  "User already registered": "このメールアドレスはすでに登録されています",
  "Email not confirmed": "メールアドレスの確認が完了していません",
  "Password should be at least 6 characters": "パスワードは6文字以上で入力してください",
  "Unable to validate email address: invalid format": "メールアドレスの形式が正しくありません",
};
```

確認：「`ERROR_MESSAGES` はどんなオブジェクトですか？」

- [ ] **Step 2: 変換ヘルパー関数を書く**

```js
function toJapanese(message) {
  return ERROR_MESSAGES[message] ?? "エラーが発生しました。もう一度お試しください";
}
```

確認：「`??` は何をしていますか？」

- [ ] **Step 3: フック本体を書く（state と login 関数）**

```js
export function useAuth() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  async function login(email, password) {
    setIsLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setError(toJapanese(error.message));
    setIsLoading(false);
  }
```

確認：「`setError(null)` を最初に呼ぶのはなぜですか？」

- [ ] **Step 4: signUp 関数と return を書く**

```js
  async function signUp(email, password) {
    setIsLoading(true);
    setError(null);
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) setError(toJapanese(error.message));
    setIsLoading(false);
  }

  return { isLoading, error, login, signUp };
}
```

- [ ] **Step 5: ブラウザで確認**

`npm run dev` を起動し、存在しないメールでログインを試みる。
期待：「メールアドレスまたはパスワードが違います」が表示される。

- [ ] **Step 6: コミット**

```
git add src/hooks/useAuth.js
git commit -m "feat: useAuth フックを追加（日本語エラー・loading管理）"
```

---

### Task 2: `src/pages/LoginPage.jsx` を修正

**Files:**
- Modify: `src/pages/LoginPage.jsx`

**Interfaces:**
- Consumes: `useAuth()` → `{ isLoading, error, login, signUp }`

- [ ] **Step 1: import を書き換える**

```jsx
// 変更前
import { useState } from "react";
import supabase from "../lib/supabase";
import { Button } from "@/components/ui/button";

// 変更後
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "../hooks/useAuth";
```

確認：「`supabase` の import を消せる理由は？」

- [ ] **Step 2: フックを呼び出し、`error` state を削除する**

```jsx
function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const { isLoading, error, login, signUp } = useAuth();
```

- [ ] **Step 3: handleSubmit を書き換える**

```jsx
  async function handleSubmit(e) {
    e.preventDefault();
    if (isSignUp) {
      await signUp(email, password);
    } else {
      await login(email, password);
    }
  }
```

確認：「変更前の handleSubmit と何が違いますか？」

- [ ] **Step 4: ボタンに `disabled` と loading テキストを追加**

```jsx
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "処理中..." : isSignUp ? "新規登録" : "ログイン"}
          </Button>
```

- [ ] **Step 5: エラー表示にスタイルを追加**

```jsx
        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
```

- [ ] **Step 6: ブラウザで動作確認**

| テストケース | 手順 | 期待する結果 |
|---|---|---|
| 誤ったパスワード | 存在するメールで間違ったパスワードを入力してログイン | 「メールアドレスまたはパスワードが違います」が赤字で表示 |
| 送信中 | ログインボタンを押した瞬間 | ボタンが「処理中...」になり無効化される |
| 登録済みメールで新規登録 | サインアップ画面で既存メールを入力 | 「このメールアドレスはすでに登録されています」が赤字で表示 |

- [ ] **Step 7: コミット**

```
git add src/pages/LoginPage.jsx
git commit -m "refactor: LoginPage を useAuth フックを使うように変更"
```

---

## 完了基準

- [ ] 誤認証時に日本語エラーが赤字で表示される
- [ ] 送信中はボタンが「処理中...」になり無効化される
- [ ] `LoginPage.jsx` から `supabase` の直接 import がなくなっている
