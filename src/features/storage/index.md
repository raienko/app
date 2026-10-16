[Docs](../../../docs/index.md) › [Features](../../../docs/features/index.md) › App services

# Storage

Two reactive values cover different data: `LocalValue` for ordinary on-device preferences, and `SecureValue` for small secrets.

<sub>`src/features/storage` · Tests: [`local-value`](local-value/index.test.ts), [`secure-value`](secure-value/index.test.ts), [`persistence.test.ts`](persistence.test.ts)</sub>

```ts
import { LocalValue, SecureValue } from "@/features/storage";

const theme = new LocalValue<string>("theme");
theme.setValue("dark");
theme.getValue(); // "dark"
theme.useValue(); // reactive read inside a component
theme.reset(); // synchronous

const token = new SecureValue<string>("access-token");
token.setValue("jwt");
token.getValue(); // "jwt"
token.useValue(); // reactive read inside a component
await token.reset(); // asynchronous deletion
```

|                | `LocalValue`                | `SecureValue`                           |
| -------------- | --------------------------- | --------------------------------------- |
| Use for        | theme, locale, app settings | tokens, keys, other small secrets       |
| Native backend | MMKV                        | iOS Keychain / Android Keystore         |
| Web backend    | browser `localStorage`      | memory only; values disappear on reload |
| Deletion       | synchronous                 | asynchronous; await `reset()`           |

Both use the same JSON encoding and corrupt-value fallback. `SecureValue` keys must contain only letters, digits, `.`, `-`, or `_`; invalid keys are rejected so different keys cannot alias the same secret.

## Auth and account data

Authentication owns its own state and cleanup. During sign-out it should await deletion of every credential it owns before allowing another sign-in. If deletion fails, `reset()` rejects and the value is re-read from secure storage so the caller can handle the failure. A write to the same key while deletion is pending throws; this prevents an old deletion from removing a new credential.

There is no storage-owned session or persisted user identity. If the app later needs account-scoped drafts or carts, the authenticated account should select their storage namespace. It should use a collision-free account identifier, and decide whether that data survives sign-out.

On web, secrets are kept in memory only. A browser page has no persistent storage that its own scripts cannot read. A reload therefore requires the auth flow to re-establish credentials.

## LocalValue on the web

MMKV supplies a web implementation backed by `localStorage`. When access is denied, it may fall back to memory. `isStoragePersistent()` probes a real write so the app can warn that values may disappear on reload. Its server-side answer is not cached for the later browser visit.

> **Migration note:** MMKV namespaces web keys as `local-storage\<key>`. Apps previously storing bare `localStorage` keys need a migration.

---

[All features](../../../docs/features/index.md) · [Docs index](../../../docs/index.md)
