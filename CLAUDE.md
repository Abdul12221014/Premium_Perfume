# ARAR Parfums — Project Guide

## Health Stack

- lint: cd frontend && ./node_modules/.bin/eslint src --ext .js,.jsx
- test-frontend: cd frontend && ./node_modules/.bin/react-scripts test --watchAll=false --passWithNoTests 2>&1
- test-backend: cd backend && python -m pytest tests/ -v 2>&1
