# Architecture

## Overview

Prototypeではシンプルな構成を優先する。

Default:

Browser
↓
TanStack Start
↓
Cloudflare Workers
↓
Optional Data Layer

## Frontend

- React
- TanStack Start
- Tailwind CSS
- shadcn/ui

## Backend

原則としてTanStack Start / Cloudflare Workers内で構築する。

Prototype段階では不要なService分割を行わない。

## Database

Prototypeでは利用しない。Serverのin-memory store（`src/server/store.ts`）で保持し、Server再起動でSeedに戻る。

永続化が必要になった時点の候補:

Cloudflare D1

## Authentication

未実装。招待コードによる参加、または初期設定画面でのUser選択を擬似的なログインとして扱う（Server側で現在のUserを1つ保持する）。招待コードは認証ではなく、Playerへの紐付けキーとしてのみ使う。

本格的なAuthentication / Authorization設計は商品化フェーズで再評価する。

## External Services

利用なし。

## Current Implementation

```
src/routes/__root.tsx        Layout（チーム名・現在のUser・切替）
src/routes/index.tsx         予定と出欠（Core画面）
src/routes/setup.tsx         初期設定（招待コードで参加 / 登録済みUserへ切替）
src/routes/roster.tsx        選手名簿と招待コード（指導者のみ）
src/routes/events.new.tsx    イベント作成（指導者）
src/routes/events.$eventId.tsx  イベント詳細・出欠一覧
src/server/functions.ts      Server Function（読み書きのEntry Point）
src/server/store.ts          in-memory store + Seed
src/features/team/types.ts   Domain型
src/features/attendance/     出欠の集計ロジック（Unit Test対象）
src/components/ui.tsx        共通UI
```

各RouteのLoaderが `getTeam()` でSnapshotを取得し、更新後は `router.invalidate()` で再取得する。

## Architecture Principles

- Simple
- Replaceable
- Observable enough to debug
- Minimal dependencies
- Avoid premature abstraction
