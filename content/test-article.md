---
title: Test Article
date: 2025-08-23
excerpt: Quick Start The fastest way to get started is using @milkdown/crepe: ``bash npm install @milkdown/crepe ` `typescript import { Crepe } from...
---

## Quick Start

The fastest way to get started is using `@milkdown/crepe`:

```bash
npm install @milkdown/crepe
```

```typescript
import { Crepe } from "@milkdown/crepe";
import "@milkdown/crepe/theme/common/style.css";
import "@milkdown/crepe/theme/frame.css";

const crepe = new Crepe({
  root: "#app",
  defaultValue: "Hello, Milkdown!",
});

crepe.create();
```
