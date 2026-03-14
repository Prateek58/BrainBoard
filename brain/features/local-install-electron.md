---
title: Local Desktop Install (Electron)
status: To Do
type: Feature
team: Frontend
tags:
  - electron
  - desktop
  - packaging
  - install
order: 8
---

### Context
BrainBoard is currently a Next.js web app running locally via `npm run dev`. The goal is to package it as a proper Electron desktop app so it can be installed on Mac (M1/M2) and Windows like any other app — no terminal required.

### Business Rules

```gherkin
Feature: Local Desktop Install via Electron

  Scenario: First-time install on Mac
    Given the user downloads the BrainBoard .dmg file
    When they drag it into the Applications folder and launch it
    Then the app should open without requiring a terminal or Node.js
    And the native file system picker should be available for linking projects

  Scenario: App launches with the last open project
    Given the user has previously linked a project
    When they relaunch the Electron app
    Then the last active project should be automatically loaded
    And the Kanban board should appear without any manual steps

  Scenario: Native folder linking
    Given the user is on the main screen
    When they click "Add Project"
    Then a native OS folder picker dialog should appear (not a browser dialog)
    And the selected folder should be added to the sidebar
```
