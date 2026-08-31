Origin: mattpocock/skills / skills/engineering/research
Import mode: adapted
Fidelity: upstream-preserved-with-extensions
Upstream revision: 5b15a47f2d7150f545fbcacbfe381787fc0230dc
License: MIT (Copyright (c) 2026 Matt Pocock)

Methodrail changes:
- distinguished from how / why / observe
- background agent optional per host capabilities
- findings return in chat by default; persist only when the user asks, never to `.methodrail/knowledge/`
- cheap path: one obvious primary source stays in this context; spawn a child only for broad searches
