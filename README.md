# Systemic

A browser-based system design simulator. Drag components onto a canvas, wire
them together, run a traffic scenario, and get scored — green, yellow, or red.

Visualizer (animated traffic, live metrics), calculator (realistic capacity
and queueing math), and judge (pass/fail against scenario thresholds), in one
loop: build, run, get scored, fix, run again.

## Stack

- React + TypeScript + Vite
- [@xyflow/react](https://xyflow.com) for the node-based canvas
- Zustand for graph and simulation state
- A pure, unit-tested simulation engine (`src/simulation`) — no backend,
  no worker; the sim is a function of time, so replay/scrubbing is free
- Tailwind CSS v4, GSAP for the verdict beacon

## Run it

```bash
npm install
npm run dev
```

## Test

```bash
npx vitest run
```

## Current scope

One scenario ("Launch Day"), four component types (client, load balancer,
server, database), round-robin load balancing only. Deliberately cut for
this MVP: DB replicas, other LB strategies, failure injection, surprise
mode, and persistence beyond in-memory state.
