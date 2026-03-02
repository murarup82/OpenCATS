import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const fixturePath = resolve(scriptDir, 'fixtures', 'mutation-safe-replays.json');

function fail(message) {
  console.error(`[fixtures:lint] ${message}`);
}

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim() !== '';
}

function validateFixture(fixture, index, seenIDs) {
  const errors = [];
  const prefix = `fixture[${index}]`;

  if (!fixture || typeof fixture !== 'object') {
    errors.push(`${prefix} is not an object`);
    return errors;
  }

  const id = fixture.id;
  if (!isNonEmptyString(id)) {
    errors.push(`${prefix}.id must be a non-empty string`);
  } else if (seenIDs.has(id)) {
    errors.push(`${prefix}.id "${id}" is duplicated`);
  } else {
    seenIDs.add(id);
  }

  if (!isNonEmptyString(fixture.sourceCheckID)) {
    errors.push(`${prefix}.sourceCheckID must be a non-empty string`);
  }
  if (!isNonEmptyString(fixture.method)) {
    errors.push(`${prefix}.method must be a non-empty string`);
  }
  if (!isNonEmptyString(fixture.endpointPath)) {
    errors.push(`${prefix}.endpointPath must be a non-empty string`);
  }
  if (!isNonEmptyString(fixture.expectsBooleanField)) {
    errors.push(`${prefix}.expectsBooleanField must be a non-empty string`);
  }

  if (!fixture.body || typeof fixture.body !== 'object' || Array.isArray(fixture.body)) {
    errors.push(`${prefix}.body must be an object`);
  }

  if (fixture.tokenPath || fixture.tokenField) {
    if (!isNonEmptyString(fixture.tokenPath)) {
      errors.push(`${prefix}.tokenPath must be provided when tokenField is used`);
    }
    if (!isNonEmptyString(fixture.tokenField)) {
      errors.push(`${prefix}.tokenField must be provided when tokenPath is used`);
    }
  }

  return errors;
}

function main() {
  let fixtures = null;
  try {
    fixtures = JSON.parse(readFileSync(fixturePath, 'utf8'));
  } catch (error) {
    fail(`unable to parse fixture file: ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
  }

  if (!Array.isArray(fixtures)) {
    fail('fixture file must contain a JSON array');
    process.exit(1);
  }

  const seenIDs = new Set();
  const errors = [];

  fixtures.forEach((fixture, index) => {
    errors.push(...validateFixture(fixture, index, seenIDs));
  });

  if (errors.length > 0) {
    errors.forEach((error) => fail(error));
    process.exit(1);
  }

  console.log(`[fixtures:lint] OK (${fixtures.length} fixtures validated)`);
}

main();
