# 36 Project Delete Confirmation Plan

## User Story

As a BrandBrain user, I need to delete old projects from the Projects page without accidentally removing work.

## Acceptance Criteria

- Each saved project shows a delete button beside the open editor action.
- Clicking delete asks for confirmation before the project is removed.
- Canceling the confirmation does not call the delete action.
- Confirming submits the project id to the delete action.
- Project deletion is ownership-checked in the service/repository layer.

## TDD Steps

1. Add failing tests for the delete button confirmation and ownership-checked project deletion.
2. Capture red test output in `Docs/tdd/logs/36-project-delete-confirmation-red.txt`.
3. Implement the project delete service, repository method, server action, and Projects page UI.
4. Capture green test output in `Docs/tdd/logs/36-project-delete-confirmation-green.txt`.
5. Visually confirm the Projects page before continuing.
