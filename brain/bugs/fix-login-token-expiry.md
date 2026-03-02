---
title: Fix Login Token Expiry
status: Done
type: Feature
team: Backend
tags:
  - auth
  - critical
---
### Context
JWT tokens are not being refreshed properly, causing users to be logged out unexpectedly after 15 minutes.

### Implementation Tasks
- [ ] Investigate token lifecycle
- [ ] Add refresh token logic
- [ ] Add automated tests for token expiry
