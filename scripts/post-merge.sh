#!/bin/bash
set -e

pnpm install --frozen-lockfile
# The Replit-provisioned dev DB has a remote hostname, so the db-safety guard
# requires --production to allow writes. This is the dev database, not the
# deployment; DATABASE_URL here always points to the dev instance.
pnpm db:migrate:prod
