# Testing Guide

Quick, minimal tests to verify Pup Pantry works locally.

---

## Prereqs

- **Backend** running at `http://localhost:5000` (`npm run dev` in `/backend`)
- **Frontend** not required for backend tests

---

## Backend Tests

### 1) Unit-style (Jest, no DB)

Runs the Express app with the DB disabled and pings health/root.

From `/backend`:

```bash
npm run test:unit
```
