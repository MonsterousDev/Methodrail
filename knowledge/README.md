# Knowledge

Methodrail owns schemas, conventions, acquisition methods, and maintenance methods.

A consuming project owns authoritative knowledge, typically under `.ai/knowledge/`.

Do not use the knowledge base as a stale cache of easily inspectable repository state.

Promotion path:

```text
observation → candidate knowledge → evidence validation → classification → promotion
```

Statuses: `candidate` | `validated` | `rejected` | `stale` | `superseded`

Code-derived claims should name a repository revision or source fingerprint when practical.
