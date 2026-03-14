---
title: Deletion Modals (Custom Confirmation)
status: Done
type: Feature
team: Frontend
tags:
  - ui
  - modal
  - safety
order: 2
---

### Context
To prevent accidental data loss, critical actions like deletion must be explicitly confirmed via a stable UI component.

### Business Rules

```gherkin
Feature: Custom Deletion Confirmation
  
  Scenario: Permanently deleting a task
    Given a task card is visible on the board
    When the user clicks the "Delete Task" button in the task detail modal
    Then a custom "ConfirmationModal" should appear
    And clicking "Delete Permanently" should remove the .md file from the file system
    And the UI should immediately reflect the removal

  Scenario: Removing a project from sidebar
    Given a project is listed in the sidebar
    When the user clicks "Remove Project" in the project options
    Then the "ConfirmationModal" should warn that local files will NOT be deleted
    And clicking "Remove" should take the project out of the sidebar list
```
