---
title: AI Task Description Refiner
status: Done
type: Feature
order: 1
---
### Context
Implement an AI-powered text refiner within the New Task Modal to automatically enhance raw bullet points or brief context into professional business rules and Gherkin formatting. Utilizes OpenRouter API.

### Business Rules
```gherkin
Feature: AI Task Description Refiner
  Scenario: Refining a raw feature description
    Given the user opens the New Task Modal
    And enters raw text into the description field
    When the user clicks "✨ Enhance with AI"
    Then the system calls OpenRouter API with the OpenRouter API Key
    And replaces the raw text with a structured Context and Gherkin formatted block
```
