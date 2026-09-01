package com.tsarit.billing.sync;

import android.content.Context;
import android.util.Log;
import androidx.work.*;
import java.util.concurrent.TimeUnit;

public class AutoSyncManager {

    private static final String TAG = "AutoSyncManager";
    private final Context context;

    public AutoSyncManager(Context context) {
        this.context = context;
    }

    public void startPeriodicAutoSync() {
        Constraints constraints = new Constraints.Builder()
                .setRequiredNetworkType(NetworkType.CONNECTED)
                .build();

        PeriodicWorkRequest syncWork = new PeriodicWorkRequest.Builder(AutoSyncWorker.class, 15, TimeUnit.MINUTES)
                .setConstraints(constraints)
                .build();

        WorkManager.getInstance(context).enqueueUniquePeriodicWork(
                "TSAR_IT_AUTO_SYNC",
                ExistingPeriodicWorkPolicy.KEEP,
                syncWork
        );
        Log.d(TAG, "Periodic Auto-Sync registered (every 15 min on network reconnect).");
    }

    public void triggerOneTimeSync() {
        Constraints constraints = new Constraints.Builder()
                .setRequiredNetworkType(NetworkType.CONNECTED)
                .build();

        OneTimeWorkRequest syncWork = new OneTimeWorkRequest.Builder(AutoSyncWorker.class)
                .setConstraints(constraints)
                .build();

        WorkManager.getInstance(context).enqueue(syncWork);
        Log.d(TAG, "Immediate One-Time Sync triggered.");
    }
}
