# ADR-0002 File-backed order store

We will persist orders as a JSON file in-process rather than SQLite.

Hard to reverse: migrating live order rows later is a data move. Surprising without context: a later reader would expect SQLite after ADR-0001's single-node shop language. Real trade-off: SQLite gives querying; a JSON file keeps zero native deps.

This ADR stands alone if decisions.tsv is discarded.
