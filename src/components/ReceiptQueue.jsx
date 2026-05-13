import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function ReceiptQueue() {
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadQueue();
  }, []);

  const loadQueue = () => {
    const request = indexedDB.open('VaultAuditShareQueue', 1);
    request.onsuccess = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains('receipts')) {
        setQueue([]);
        setLoading(false);
        return;
      }
      
      const tx = db.transaction('receipts', 'readonly');
      const store = tx.objectStore('receipts');
      const getAllRequest = store.getAll();
      
      getAllRequest.onsuccess = () => {
        setQueue(getAllRequest.result.sort((a, b) => b.timestamp - a.timestamp));
        setLoading(false);
      };
      getAllRequest.onerror = () => {
        console.error('Failed to load queue');
        setLoading(false);
      };
    };
    
    request.onerror = () => {
      console.error('Failed to open queue DB');
      setLoading(false);
    };
  };

  const deleteFromQueue = (id) => {
    const request = indexedDB.open('VaultAuditShareQueue', 1);
    request.onsuccess = (e) => {
      const db = e.target.result;
      const tx = db.transaction('receipts', 'readwrite');
      const store = tx.objectStore('receipts');
      store.delete(id);
      tx.oncomplete = () => {
        setQueue(queue.filter(item => item.id !== id));
      };
    };
  };

  const processReceipt = (item) => {
    // Navigate to ingest route and pass the file via state
    navigate('/ingest', { state: { queuedFile: item.file, queueId: item.id } });
  };

  if (loading) {
    return <div className="text-sm text-slate-500 py-8">Loading queue...</div>;
  }

  if (queue.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="rounded-full bg-slate-100 p-6">
          <p className="text-slate-400 text-3xl">📭</p>
        </div>
        <p className="text-lg font-medium text-slate-700">Queue is empty</p>
        <p className="text-sm text-slate-500">Shared receipts will appear here</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {queue.map(item => (
        <div key={item.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex gap-4 items-center">
          <div className="w-16 h-16 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0">
             {item.file && item.file.type.startsWith('image/') ? (
               <img src={URL.createObjectURL(item.file)} alt="Receipt thumbnail" className="w-full h-full object-cover" />
             ) : (
               <div className="w-full h-full flex items-center justify-center text-slate-400 text-xl">📄</div>
             )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-900 truncate">{item.file?.name || 'Shared Receipt'}</p>
            <p className="text-xs text-slate-500">{new Date(item.timestamp).toLocaleString()}</p>
          </div>
          <div className="flex flex-col gap-2">
            <button 
              onClick={() => processReceipt(item)}
              className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-medium rounded-lg hover:bg-indigo-700"
            >
              Process
            </button>
            <button 
              onClick={() => deleteFromQueue(item.id)}
              className="px-3 py-1.5 bg-white text-red-600 text-xs font-medium rounded-lg border border-red-200 hover:bg-red-50"
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
