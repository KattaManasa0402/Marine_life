#!/usr/bin/env bash
# exit on error
set -o errexit

# Install dependencies
pip install -r requirements.txt

# Run Alembic migrations
alembic upgrade head

# Note: Render will run the start command separately