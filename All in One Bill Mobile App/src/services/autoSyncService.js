import api from "./apiService";
import { NativeBridge } from "./nativeBridge";

const QUEUE_STORAGE_KEY = "tsar_offline_sync_queue";
const LAST_SYNC_KEY = "tsar_last_sync_timestamp";

export const AutoSyncService = {
  // Queue offline transaction
  queueOfflineAction: (entityType, action, payload) => {
    const queue = JSON.parse(localStorage.getItem(QUEUE_STORAGE_KEY) || "[]");
    const item = {
      id: Date.now() + "_" + Math.random().toString(36).substr(2, 9),
      entityType,
      action,
      payload,
      timestamp: Date.now(),
      status: "PENDING"
    };
    queue.push(item);
    localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(queue));
    NativeBridge.showToast(`Saved locally in offline queue (${queue.length} pending)`);
    return item;
  },

  getPendingQueue: () => {
    return JSON.parse(localStorage.getItem(QUEUE_STORAGE_KEY) || "[]");
  },

  clearQueue: () => {
    localStorage.setItem(QUEUE_STORAGE_KEY, "[]");
  },

  // Perform full bi-directional sync with Spring Boot backend
  performFullSync: async () => {
    const queue = AutoSyncService.getPendingQueue();
    const lastSync = localStorage.getItem(LAST_SYNC_KEY) || "0";

    const payload = {
      deviceId: "android-client-" + (localStorage.getItem("userId") || "guest"),
      tenantId: localStorage.getItem("tenantId") || "default",
      lastSyncTimestamp: lastSync,
      offlineInvoices: queue.filter(q => q.entityType === "INVOICE").map(q => q.payload),
      offlineParties: queue.filter(q => q.entityType === "PARTY").map(q => q.payload),
      offlineStockAdjustments: queue.filter(q => q.entityType === "STOCK").map(q => q.payload)
    };

    try {
      const res = await api.post("/api/v1/sync/push", payload);
      if (res.data && res.data.success) {
        // Clear synced items from offline queue
        AutoSyncService.clearQueue();
        localStorage.setItem(LAST_SYNC_KEY, Date.now().toString());
        NativeBridge.showToast("All offline data synced with server!");
        return { success: true, message: res.data.message, timestamp: Date.now() };
      }
      return { success: false, message: "Sync failed to verify on server" };
    } catch (err) {
      console.warn("Auto-sync offline fallback:", err.message);
      return { success: false, message: "Network unavailable. Transactions safely stored offline.", error: err.message };
    }
  }
};
