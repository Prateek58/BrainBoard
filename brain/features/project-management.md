---
title: Project & Sidebar Management
status: Done
type: Feature
team: Frontend
tags:
  - core
  - project-selector
  - sidebar
order: 4
---

### Context
Users need a way to manage multiple project roots and switch between them efficiently.

### Business Rules

```gherkin
Feature: Project & Sidebar Management
  
  Scenario: Adding a new project
    Given the user is on the main dashboard
    When the user clicks the "Add Project" button (+) in the sidebar
    Then a native folder picker should open
    And selecting a valid directory should add the project to the sidebar
    And a new "/brain" directory structure should be initialized in that folder

  Scenario: Switching projects
    Given the user has multiple projects in the sidebar
    When the user clicks on a project name
    Then the Kanban board should refresh
    And the tasks displayed should correspond to the new project's "/brain" folder

  Scenario: Renaming a project
    Given a project exists in the sidebar
    When the user selects "Rename" from the project options menu
    And enters a new display name
    Then the project name should update in the sidebar
    And the change should persist in the global configuration
```
