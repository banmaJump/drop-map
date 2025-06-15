# DropMap/ README

# 🛠️基本的な機能：

## > 使用したツール

- フロント
    - React
    - TypeScript
    - i18n
    - TimePicker
    

- バックエンド
    - FastAPI
    - Python
    - Google Directions API
- デプロイツール
    - Render

## > イメージ図

![](/frontend/src/assets/readMe.png.png)

※本番環境では別のイメージになっています。

## > 画面フロー

---

**✅ Page 1(検索画面)：**

- ユーザーが意図通りに経由地を並べられるUI(**ドラッグ&ドロップ、上下ボタン**)

---

**✅ Page 2 (ルート選択画面)：**

- Google Mapから最短プランを作り、開発者の条件で、最安プランを提示。
- 最初のページは必ず最安タブにする！

---

**✅ Page 3 (ブックマーク画面)：**

- ハンバーガメニューで一定期間、自分が保存したプランを保持。
- Page1の情報をユーザーのローカルストレージに一定期間保存する。
- Page2で受け取る詳細データは開発者サーバーに保存する。

---

## > ルート検索のデータフロー

### > 全体的な処理ステップ

```python
1. RouteInputPage.tsx
   ↓
2. routeApi.ts (リクエスト)
   ↓
3. route_search.py の `/api/search_route` エンドポイント
   ↓
4. `/directions_api.py` の get_best_and_cheapest_routes
   ↓
5. routeApi.ts (レスポンス)
   ↓
7. RouteResultPage.tsxで結果を表示
```

### > 詳細な処理ステップ

```python
// フロント
[RouteInputPage.tsx]
  └─ 入力: 出発地, 経由地[], 目的地 + 出発時刻 + 滞在時間[]
  └─ ローカル保存: latestRouteData
  └─ API呼び出し: searchRoute(RouteRequest)

// バックエンド
[search_route API (FastAPI)]
  └─ キャッシュ検索: (出発地, 目的地, 経由地) → HITなら即返却
  └─ MISSなら: Directions API 2回呼び出し → 最適＋最安ルート構築
  └─ キャッシュ保存（出発時刻はキャッシュキーに含めない）

// フロント
[RouteResultPage.tsx]
  └─ フロントで受け取ったデータを `departureTime`, `stayTimes` で再計算
  └─ segments[].departureTime / arrivalTime に反映
  └─ step_info への反映も最近の修正で対応済
```

### > データフロー概要図

```jsx
[types/route.ts]（共通型定義）
   ├── Route                   // ルート情報型
   ├── Segment                 // 区間情報型
   ├── StepInfo                // 区間詳細情報型
   └── RouteQueryParams        // ルート検索パラメータ型 (origin, destination, waypoints, departureTime など)

[frontend/src/pages/RouteInputPage.tsx]
   ├── sends → [routeApi.ts]  
        params: RouteQueryParams = { origin, destination, waypoints?, departureTime? }
   ├── receives ← [routeApi.ts]  
        routes: Route[]
   ├── sends → [cacheApi.ts]  
        params: RouteQueryParams
   ├── receives ← [cacheApi.ts]  
        cachedRoutes: Route[] | null
   ├── passes → [RouteList.tsx]  
        routes: Route[]
   ├── passes → [RouteDetails.tsx]  
        route: Route

[routeApi.ts]
   ├── receives ← [RouteInputPage.tsx]  
        params: RouteQueryParams
   └── returns → [RouteInputPage.tsx]  
        routes: Route[]

[cacheApi.ts]
   ├── receives ← [RouteInputPage.tsx]  
        params: RouteQueryParams
   └── returns → [RouteInputPage.tsx]  
        cachedRoutes: Route[] | null

[frontend/src/pages/RouteResultPage.tsx]
   ├── receives ← [RouteInputPage.tsx]  
        routes: Route[]
   ├── emits → [RouteInputPage.tsx]  
        selectedRoute: Route  // ルート選択イベントで親へ返す

[frontend/src/pages/RouteDetailsPage.tsx]
   └── receives ← [RouteInputPage.tsx or RouteList.tsx]  
        route: Route

[frontend/src/pages/SavedRoutesPage.tsx]
   ├── receives ← [親コンポーネント]  
        savedRoutes: SavedRoute[]  // localStorageまたはDB由来
   ├── uses → [utils/storage.ts]  
        displayRoutes = convertToDisplayData(savedRoutes)  // 保存データを画面表示用に変換
   ├── emits → [utils/storage.ts]  
        deleteSavedRoute(id: string)  // 保存ルート削除要求
   ├── uses → [components/RouteDetail.tsx]  
        displayRoute: DisplayRoute  // 表示用データを詳細コンポーネントへ

[backend/routes/route_search.py]
   ├── receives ← [frontend (routeApi.ts)]  
        body: RouteRequest = { origin: string, destination: string, waypoints: string[], mode: string, departure_time: string, stay_times?: number[] }
   ├── uses → [services/route_cache.py]  
        cachedData = get_from_cache(origin, destination, waypoints)
   ├── sends → [services/directions_api.py]  
        params = { origin, destination, waypoints, mode, departure_time }
   ├── uses → [services/route_cache.py]  
        save_to_cache(origin, destination, waypoints, route_data)
   └── returns → [frontend (routeApi.ts)]  
        response = { origin, destination, optimal: Route, cheapest: Route, ... }

[services/directions_api.py]
   ├── receives ← [backend/routes/route_search.py]  
        params = { origin, destination, waypoints, mode, departure_time }
   ├── uses → [services/route_cache.py]  
        cachedData = get_from_cache(origin, destination, waypoints)
   ├── uses → [services/route_cache.py]  
        save_to_cache(origin, destination, waypoints, api_response)
   └── returns → [backend/routes/route_search.py]  
        api_response: dict

[backend/routes/cache.py]
   ├── receives ← [frontend (cacheApi.ts)]  
        action: 'clear_cache'
   ├── uses → [services/route_cache.py]  
        clear_cache()
   └── returns → [frontend (cacheApi.ts)]  
        cache_keys: string[]

[services/route_cache.py]
   ├── exposes → get_from_cache(origin: string, destination: string, waypoints: string[]) -> cachedData | None
   ├── exposes → save_to_cache(origin: string, destination: string, waypoints: string[], data)
   ├── exposes → clear_cache()
   └── exposes → get_cache_keys() -> string[]

```

---

# 🔖目次：

---

# 🛠️ディレクトリ構造：

```python
.
├── backend
│   ├── __init___.py
│   ├── app.py
│   ├── requirements.txt
│   ├── routes
│   │   ├── cache.py
│   │   ├── route_search.py
│   │   └── warmup.py
│   └── services
│       ├── directions_api.py
│       └── route_cache.py
├── frontend
│   ├── favicon.ico
│   ├── index.html
│   ├── index.tsx
│   ├── src
│   │   ├── api
│   │   │   ├── cacheApi.ts
│   │   │   └── routeApi.ts
│   │   ├── App.tsx
│   │   ├── assets
│   │   ├── components
│   │   │   ├── CommonPageLayout.tsx
│   │   │   ├── Footer.scss
│   │   │   ├── Footer.tsx
│   │   │   ├── HamburgerMenu.scss
│   │   │   ├── HamburgerMenu.tsx
│   │   │   ├── Header.tsx
│   │   │   ├── Loading.scss
│   │   │   ├── Loading.tsx
│   │   │   ├── RouteDetail.scss
│   │   │   ├── RouteDetail.tsx
│   │   │   ├── rules
│   │   │   │   ├── baton-privacy.tsx
│   │   │   │   ├── contact.tsx
│   │   │   │   ├── disclaimer.tsx
│   │   │   │   ├── privacy-policy.tsx
│   │   │   │   ├── terms_of_service.tsx
│   │   │   │   └── writers.tsx
│   │   │   ├── SearchingOverlay.scss
│   │   │   └── SearchingOverlay.tsx
│   │   ├── i18n.ts
│   │   ├── locales
│   │   │   ├── en.json
│   │   │   ├── es.json
│   │   │   └── ja.json
│   │   ├── main.tsx
│   │   ├── pages
│   │   │   ├── LoginPage.scss
│   │   │   ├── LoginPage.tsx
│   │   │   ├── RouteInputPage.scss
│   │   │   ├── RouteInputPage.tsx
│   │   │   ├── RouteResultPage.scss
│   │   │   ├── RouteResultPage.tsx
│   │   │   ├── SavedRoutesPage.scss
│   │   │   └── SavedRoutesPage.tsx
│   │   ├── styles
│   │   │   └── global.scss
│   │   ├── types
│   │   │   ├── react-ios-time-picker.d.ts
│   │   │   └── route.ts
│   │   ├── utils
│   │   │   ├── formatTime.ts
│   │   │   └── storage.ts
│   │   └── vite-env.d.ts
│   └── vite.config.ts
└── README.md

15 directories, 53 files
```

---

# 🛠️関数名：

// RouteInputPage.tsx

| **ステップ** | **関数名** | **機能** | **目的** |
| --- | --- | --- | --- |
| 1 | handlePointChange | 出発地や経由地の入力値を更新 | ユーザーの入力地点情報を保存。 |
| 1 | handleStayTimeChange | 経由地の滞在時間を更新 | 各経由地の滞在時間を記録。 |
| 1 | addWaypoint | ユーザが経由地を追加 | 細かいルート設定が可能。 |
| 1 | removeWaypoint | ユーザが経由地を削除 | ユーザーが経由地を自由に消せる。 |
| 1 | handleSubmit | 入力内容を整形・API(routeApi.ts)呼び出し・画面遷移 | ユーザーの入力を操作しやすいように加工し画面遷移して待機する。 |

// route app.ts

| **ステップ** | **関数名** | **機能** | **目的** |
| --- | --- | --- | --- |
| 2 | searchRoute | ルート検索APIを呼び出す | handleSubmitの情報を受け取り、APIの呼び出しをする。 |
| 2 | convertApiRoute | バックエンドからのデータをフロント用に変換 | バックエンドからのデータをフロントで使える形に変換する。 |
| 2 | convertApiRouteToRouteResult | バックエンドからのAPI全体レスポンスをフロント用に変換 | バックエンドからのデータ全体をフロントの形式に整形するため |

// direction_api.py

| **ステップ** | **関数名** | **機能** | **目的** |
| --- | --- | --- | --- |
| 3 | search_route | ルート検索リクエスト受け取り、入力チェック、キャッシュ確認 | 入力の妥当性を確認し、キャッシュがあれば再利用、なければルート検索実行 |
| 3 | get_best_and_cheapest_routes | バックエンドから送られた最適・最安ルートを取得、比較 | 公共交通機関と徒歩ルートを比較し、最適・最安ルートを生成する |

// route app.ts

| **ステップ** | **関数名** | **機能** | **目的** |
| --- | --- | --- | --- |
| 4 | get_best_and_cheapest_routes | Google Maps APIを呼び出しルートデータ取得・解析 | 移動手段や時間、料金情報を分解して扱いやすくし、最適・最安ルートを作成 |
| 4 | generate_route_name | 出発地、経由地、目的地を繋いでルート名を作成 | ルートをわかりやすく表現するため |

// routeApi.ts

| **ステップ** | **関数名** | **機能** | **目的** |
| --- | --- | --- | --- |
| 5 | searchRoute (レスポンス処理) | APIレスポンスを受け取りフロント用に変換 | バックエンドのレスポンスを表示用に整形するため |

// RouteResultPage.tsx

| **ステップ** | **関数名** | **機能** | **目的** |
| --- | --- | --- | --- |
| 6 | useEffect (時刻再計算) | ルートの各区間の出発・到着時刻を正確に再計算 | 表示用に時間を調整し、正確なスケジュールを見せるため |
| 6 | useState(タブ切り替え用) | 最適ルートと最安ルートの切り替えを管理 | ユーザーが希望のルートを簡単に選べるようにするため |
| 6 | localStorage読み込み保存 | 検索結果を保存・読み込み | ユーザーの検索結果を保持し、画面更新時に復元するため |
| 6 | ルート保存ボタン処理 | ルート保存ボタン処理 | ユーザーが気に入ったルートをあとで参照できるようにするため |

---

# 📚ポリシー：

- 画面遷移、UIタグは必要最小限に設置し、ユーザビリティーを第一に。
- 多言語対応（例: JP/EN切替）
- 背景色は白を基調とし、文字は基本的に黒色。サイズは３パターンを用意。あとは絵文字で凌ぐ。page2の写真は、固定とする。
- 降水を憂慮する機能がDirectionAPIにはあるらしいが、このサイトを使うユーザは徒歩を選びたい意思があるので、考慮しない。
- 電車かバスで移動時間が大きく異なることがあるので、これらは考慮する。

---

# 🔍その他：

### >今後拡張を考えている機能

- Loading画面の開発(少ない容量で、特徴あるものを作りたい)
- ログイン画面 (フロント＆バックのサーバー立ち上げのラグを相殺)
- 詳しいルートの表示。(JR京浜東北線｜2番線など)
- 徒歩の代替案があった場合は、注釈付きで提示。(電車なら○分短縮)
- リアルタイム運行情報の表示(遅延や運休の表示)⇒無理そう
- 天気に応じて、メッセージを入れる(このサイト使ってる意思に応える)