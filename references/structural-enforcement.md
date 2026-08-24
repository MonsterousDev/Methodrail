# Structural enforcement

When the same failure repeatedly occurs, move the lesson downward toward stronger enforcement.

```text
conversation reminder
↓
project knowledge
↓
skill
↓
script/tool
↓
test
↓
lint/static check
↓
type/API constraint
↓
CI gate
↓
architecture
```

A prompt that must be restated every session is a candidate for a skill or a check. A skill that agents still skip is a candidate for a test, type, or CI gate. Architecture is the strongest lever: make the failure unrepresentable.

## Build the lever

If repeated nontrivial work is mechanical, prefer a generator, codemod, script, or reusable tool instead of asking an agent to repeat the task by hand.

Ask:

- Can this lesson be enforced structurally instead of narrated?
- Will a future agent still need to rediscover this, or can the repository refuse the wrong action?

Do not add methodology text to paper over a missing type, test, or interface.
