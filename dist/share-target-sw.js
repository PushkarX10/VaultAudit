self.addEventListener('fetch', (event) => {
  if (event.request.method === 'POST' && event.request.url.endsWith('/receive-share')) {
    event.respondWith(
      (async () => {
        try {
          const formData = await event.request.formData();
          const imageFile = formData.get('image');

          if (imageFile) {
            // Save to IndexedDB
            await new Promise((resolve, reject) => {
              const request = indexedDB.open('VaultAuditShareQueue', 1);
              request.onupgradeneeded = (e) => {
                const db = e.target.result;
                if (!db.objectStoreNames.contains('receipts')) {
                  db.createObjectStore('receipts', { keyPath: 'id', autoIncrement: true });
                }
              };
              request.onsuccess = (e) => {
                const db = e.target.result;
                const tx = db.transaction('receipts', 'readwrite');
                const store = tx.objectStore('receipts');
                store.add({
                  file: imageFile,
                  timestamp: Date.now()
                });
                tx.oncomplete = () => resolve();
                tx.onerror = () => reject(tx.error);
              };
              request.onerror = (e) => reject(e.target.error);
            });
          }

          // Redirect to the queue UI
          return Response.redirect('/queue?success=true', 303);
        } catch (error) {
          console.error('Error handling share target:', error);
          return Response.redirect('/queue?error=share_failed', 303);
        }
      })()
    );
  }
});
