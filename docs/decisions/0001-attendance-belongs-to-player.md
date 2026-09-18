# 0001. 出欠は選手（Player）に紐付ける

## Status

Accepted

## Context

父・母がそれぞれアプリを利用するため、出欠を「回答したユーザー」に紐付けると、同じ子について2件の出欠が発生し食い違う。既存サービス（TeamHub）で分かりにくいと指摘された点でもある。将来的に選手本人がアカウントを持つ可能性もある。

## Decision

- 出欠（Player Attendance）は Event × Player で一意とし、User には紐付けない。
- 誰が回答したかは `updatedByUserId` として記録するだけにする。
- 保護者本人の参加（帯同・お手伝い）は Member Attendance として別に持つ。
- User（保護者・選手）は `playerIds` で Player を参照する。

## Consequences

- 父・母どちらが回答しても同じ1件が更新され、食い違いが起きない。
- 選手本人アカウントを追加しても、既存の出欠データに影響しない。
- 「両親のどちらが回答したか」を見せたい場合は `updatedByUserId` の表示が必要。
