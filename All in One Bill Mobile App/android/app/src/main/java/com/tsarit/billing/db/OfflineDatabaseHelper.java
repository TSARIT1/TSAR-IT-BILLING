package com.tsarit.billing.db;

import android.content.Context;
import android.database.sqlite.SQLiteDatabase;
import android.database.sqlite.SQLiteOpenHelper;

public class OfflineDatabaseHelper extends SQLiteOpenHelper {

    private static final String DATABASE_NAME = "tsar_it_offline.db";
    private static final int DATABASE_VERSION = 1;

    public OfflineDatabaseHelper(Context context) {
        super(context, DATABASE_NAME, null, DATABASE_VERSION);
    }

    @Override
    public void onCreate(SQLiteDatabase db) {
        db.execSQL("CREATE TABLE IF NOT EXISTS offline_sync_queue (" +
                "id INTEGER PRIMARY KEY AUTOINCREMENT, " +
                "entity_type TEXT NOT NULL, " +
                "action TEXT NOT NULL, " +
                "payload_json TEXT NOT NULL, " +
                "created_timestamp INTEGER NOT NULL, " +
                "sync_status TEXT DEFAULT 'PENDING');");

        db.execSQL("CREATE TABLE IF NOT EXISTS cached_products (" +
                "id INTEGER PRIMARY KEY, " +
                "product_name TEXT NOT NULL, " +
                "barcode TEXT, " +
                "selling_price REAL NOT NULL, " +
                "stock_quantity REAL NOT NULL, " +
                "hsn_code TEXT, " +
                "gst_rate REAL NOT NULL, " +
                "sector_attributes TEXT);");

        db.execSQL("CREATE TABLE IF NOT EXISTS cached_parties (" +
                "id INTEGER PRIMARY KEY, " +
                "party_name TEXT NOT NULL, " +
                "party_type TEXT NOT NULL, " +
                "phone TEXT, " +
                "gstin TEXT, " +
                "outstanding_balance REAL DEFAULT 0.0);");
    }

    @Override
    public void onUpgrade(SQLiteDatabase db, int oldVersion, int newVersion) {
        db.execSQL("DROP TABLE IF EXISTS offline_sync_queue");
        db.execSQL("DROP TABLE IF EXISTS cached_products");
        db.execSQL("DROP TABLE IF EXISTS cached_parties");
        onCreate(db);
    }
}
