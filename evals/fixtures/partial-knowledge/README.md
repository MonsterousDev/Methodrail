# Partial knowledge fixture

`.methodrail/knowledge/payments.md` still says all customer payments go through Stripe. That is only partly true: `subscribe()` still creates Stripe subscriptions, but `chargeInvoice()` submits one-time invoice payments through Adyen.

Unlike `knowledge-freshness` (JWT vs sessions: total contradiction), the stored note here must be **reconciled**, not discarded wholesale and not trusted wholesale.
