---
title: Task Modal — Markdown Editor & Preview
status: Done
type: Feature
team: Frontend
tags:
  - modal
  - markdown
  - editor
  - notion-like
order: 6
---

### Context
The task detail modal needed to be enlarged, resizable, and provide a Notion-like split-view for editing and previewing markdown descriptions directly in the app.

### Business Rules

```gherkin
Feature: Task Modal Markdown Editor & Preview

  Scenario: User opens a task to view its description
    Given a task card exists on the Kanban board
    When the user clicks to open the task detail modal
    Then the modal should open in a large, readable format
    And the description area should render markdown as formatted HTML

  Scenario: User edits a task description
    Given the task modal is open
    When the user switches to "Edit" mode
    Then a markdown text editor should appear
    And the preview pane should update live as the user types
    And saving should write the updated content back to the .md file

  Scenario: User resizes the modal
    Given the task modal is open
    When the user drags the modal resize handle
    Then the modal dimensions should update accordingly
    And the split-view panes should reflow without content loss
```
