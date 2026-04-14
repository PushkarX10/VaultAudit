/**
 * VaultAudit AI — PGLite Database Client
 *
 * Creates a singleton PGlite instance backed by IndexedDB so data
 * persists across browser sessions.  Every module that needs the DB
 * should call `getDb()` — the first call boots the WASM engine,
 * subsequent calls return the cached instance.
 *
 * OFFLINE: PGLite runs entirely in the browser — no server needed.
 */

import { PGlite } from '@electric-sql/pglite';
import { PGLITE_DB_NAME } from '../utils/constants.js';

/** @type {PGlite | null} */
let dbInstance = null;

/** @type {Promise<PGlite> | null} */
let dbInitPromise = null;

/**
 * Returns the singleton PGlite database instance.
 * Initialises on first call; all subsequent calls return the same
 * instance (or wait for the first init to complete).
 *
 * @returns {Promise<PGlite>}
 */
export async function getDb() {
  // Fast-path: already initialised
  if (dbInstance) return dbInstance;

  // Prevent concurrent initialisations (React StrictMode double-render)
  if (dbInitPromise) return dbInitPromise;

  dbInitPromise = (async () => {
    try {
      const db = new PGlite(PGLITE_DB_NAME, {
        // Relaxed durability trades crash-safety for significantly
        // faster writes — acceptable for a local-first app where
        // the "server" is the same machine.
        relaxedDurability: true,
      });

      // Wait for the WASM engine to fully initialise
      await db.waitReady;

      dbInstance = db;
      console.log('[VaultAudit] PGLite database initialised ✓');
      return db;
    } catch (err) {
      dbInitPromise = null; // allow retry on failure
      console.error('[VaultAudit] PGLite init failed:', err);
      throw err;
    }
  })();

  return dbInitPromise;
}

/**
 * Closes the database connection and clears the singleton.
 * Useful for testing or graceful shutdown.
 */
export async function closeDb() {
  if (dbInstance) {
    await dbInstance.close();
    dbInstance = null;
    dbInitPromise = null;
    console.log('[VaultAudit] PGLite database closed');
  }
}
