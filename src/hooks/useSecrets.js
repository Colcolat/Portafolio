import { useCallback, useEffect, useState } from 'react';
import { secretCatalog } from '../data/secrets.js';

export const secretsStorageKey = 'pocketfolio.secrets.v1';

function normalizeSecrets(ids) {
  if (!Array.isArray(ids)) return [];
  const requested = new Set(ids);
  return secretCatalog.filter(secret => requested.has(secret.id)).map(secret => secret.id);
}

function browserStorage(storage) {
  if (storage !== undefined) return storage;
  return typeof window === 'undefined' ? null : window.localStorage;
}

export function readSecrets(storage) {
  try {
    return normalizeSecrets(JSON.parse(browserStorage(storage)?.getItem(secretsStorageKey) ?? '[]'));
  } catch {
    return [];
  }
}

export function saveSecrets(ids, storage) {
  try {
    browserStorage(storage)?.setItem(secretsStorageKey, JSON.stringify(normalizeSecrets(ids)));
  } catch {
    // Discoveries still work for this visit if browser storage is unavailable.
  }
}

export function unlockSecret(ids, id) {
  const next = normalizeSecrets([...normalizeSecrets(ids), id]);
  if (Array.isArray(ids) && ids.length === next.length && ids.every((value, index) => value === next[index])) return ids;
  return next;
}

export default function useSecrets() {
  const [foundIds, setFoundIds] = useState(() => readSecrets());
  useEffect(() => { saveSecrets(foundIds); }, [foundIds]);
  const unlock = useCallback(id => {
    setFoundIds(previous => unlockSecret(previous, id));
  }, []);
  return { foundIds, unlock };
}
