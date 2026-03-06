---
title: Dynamic Settings & Workflow
status: Done
type: Feature
team: Frontend
tags: [settings, customization]
---

### Context
Different projects have different needs. Users must be able to customize their task categories and board columns.

### Business Rules

```gherkin
Feature: Dynamic Settings & Workflow
  
  Scenario: Customizing task types
    Given the user opens the "Application Settings" modal
    When the user adds a new task type named "Research" with a purple color
    Then "Research" should appear as a filter option in the header
    And new tasks can be created with the "Research" type

  Scenario: Managing Kanban columns
    Given the user is in the settings modal
    When the user adds a new column named "Review"
    Then the Kanban board should display a new "Review" swimlane
    And tasks can be moved into the "Review" column

  Scenario: Auto-generating slugs for task types
    Given the user is creating a new task type
    When the user types "User Research" in the label field
    Then the name (slug) field should automatically populate with "user-research"
```
