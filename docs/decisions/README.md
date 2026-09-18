# Architecture Decisions

重要なArchitecture Decisionをここに記録する。

## Format

1ファイル1決定。ファイル名は `NNNN-title.md`（例：`0001-use-cloudflare-d1.md`）。

```md
# NNNN. Title

## Status

Accepted / Superseded

## Context

なぜこの決定が必要になったか。

## Decision

何を決定したか。

## Consequences

この決定によって何が起きるか（移行コスト等を含む）。
```

## Decisions

- [0001. 出欠は選手（Player）に紐付ける](0001-attendance-belongs-to-player.md)
- [0002. 選手名簿は指導者が管理し、家庭は招待コードで参加する](0002-coach-managed-roster-with-invite-codes.md)
