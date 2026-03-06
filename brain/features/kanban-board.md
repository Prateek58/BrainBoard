---
title: Kanban Board & Drag-and-Drop
status: Done
type: Feature
team: Frontend
tags: [core, kanban, dnd]
---

### Context
The core value of BrainBoard is the ability to visualize and manipulate task status via a Kanban board.

### Business Rules

```gherkin
Feature: Kanban Board & Drag-and-Drop
  
  Scenario: Dragging a task between columns
    Given a task exists in the "To Do" column
    When the user drags the task card to the "Doing" column
    Then the task status in the underlying Markdown file should update to "Doing"
    And the task card should remain in the "Doing" column after a page refresh

  Scenario: Filtering tasks by type
    Given the board contains "Feature", "Bug", and "Chore" tasks
    When the user deactivates the "Bug" filter in the header
    Then all red-bordered "Bug" task cards should be hidden from the board
    And the remaining tasks should maintain their relative order

  Scenario: Visual distinction of task types
    Given the user is viewing the Kanban board
    Then "Feature" tasks should have a bold purple left border
    And "Bug" tasks should have a red left border
    And "Chore" tasks should be visually muted with gray backgrounds
```
