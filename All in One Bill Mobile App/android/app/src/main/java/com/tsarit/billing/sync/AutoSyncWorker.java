package com.tsarit.billing.sync;

import android.content.Context;
import android.util.Log;
import androidx.annotation.NonNull;
import androidx.work.Worker;
import androidx.work.WorkerParameters;
import okhttp3.*;
import java.io.IOException;

public class AutoSyncWorker extends Worker {

    private static final String TAG = "AutoSyncWorker";
    private static final String SYNC_ENDPOINT = "http://10.0.2.2:8081/api/v1/sync/push";
    private final OkHttpClient httpClient = new OkHttpClient();

    public AutoSyncWorker(@NonNull Context context, @NonNull WorkerParameters workerParams) {
        super(context, workerParams);
    }

    @NonNull
    @Override
    public Result doWork() {
        Log.d(TAG, "Executing background auto-sync delta push/pull...");

        try {
            RequestBody body = RequestBody.create(
                    "{\"deviceId\":\"android-device-01\",\"lastSyncTimestamp\":\"" + System.currentTimeMillis() + "\"}",
                    MediaType.get("application/json; charset=utf-8")
            );

            Request request = new Request.Builder()
                    .url(SYNC_ENDPOINT)
                    .post(body)
                    .build();

            try (Response response = httpClient.newCall(request).execute()) {
                if (response.isSuccessful()) {
                    Log.d(TAG, "Auto-Sync completed successfully with server status 200 OK.");
                    return Result.success();
                } else {
                    Log.w(TAG, "Server returned response code: " + response.code());
                    return Result.retry();
                }
            }
        } catch (IOException e) {
            Log.e(TAG, "Network sync failed, will retry: " + e.getMessage());
            return Result.retry();
        }
    }
}
