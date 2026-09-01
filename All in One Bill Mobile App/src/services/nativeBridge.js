// JavaScript Native Bridge communicating with Android Java Native layer
export const NativeBridge = {
  isAndroid: () => typeof window !== "undefined" && window.AndroidNative !== undefined,

  showToast: (message) => {
    if (window.AndroidNative && window.AndroidNative.showToast) {
      window.AndroidNative.showToast(message);
    } else {
      console.log("[Native Toast]:", message);
    }
  },

  printThermalReceipt: (receiptData) => {
    if (window.AndroidNative && window.AndroidNative.printThermalReceipt) {
      window.AndroidNative.printThermalReceipt(JSON.stringify(receiptData));
    } else {
      console.log("[Native Print]: Browser simulation printing receipt", receiptData);
      window.print();
    }
  },

  triggerManualSync: () => {
    if (window.AndroidNative && window.AndroidNative.triggerManualSync) {
      window.AndroidNative.triggerManualSync();
    } else {
      console.log("[Native Sync]: Triggered Web LocalStorage Sync");
    }
  },

  shareInvoiceWhatsApp: (summary, pdfUrl) => {
    if (window.AndroidNative && window.AndroidNative.shareInvoiceWhatsApp) {
      window.AndroidNative.shareInvoiceWhatsApp(summary, pdfUrl || "");
    } else {
      const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(summary)}`;
      window.open(waUrl, "_blank");
    }
  }
};
