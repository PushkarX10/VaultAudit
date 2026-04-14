import { getDb } from '../src/db/client.js';

(async () => {
    try {
        console.log("Getting DB...");
        const db = await getDb();
        console.log("DB obtained", Object.keys(db));
        console.log("Executing DELETE...");
        await db.query('DELETE FROM transactions');
        console.log("DELETE successful.");
    } catch(err) {
        console.error("ERROR EXECUTING:", err);
    }
})();
