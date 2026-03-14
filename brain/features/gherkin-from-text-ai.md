---
title: Gherkin from text AI
status: Done
type: Feature
order: 0
team: Feature development
tags:
  - AI
---


### Context
When creating a newtask, a dialog opens where the user provides a description. For feature-type tasks, the system pre-fills sample context data. The business rules section includes a sample Gherkin scenario, which the user must manually update. The desired feature is a highlight button that converts the context into Gherkin format, replacing the sample with actual Gherkin.

### Business Rules
```gherkin
Feature: Gherkin from text AI
  Scenario: Convert context to Gherkin
    Given the user has written a task description
    When they click the highlight button
    Then the context is converted into a Gherkin scenario
```
