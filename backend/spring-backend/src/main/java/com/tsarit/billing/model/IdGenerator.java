package com.tsarit.billing.model;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

public class IdGenerator {

    private static String random(int len) {
        return UUID.randomUUID()
                .toString()
                .replace("-", "")
                .substring(0, len)
                .toUpperCase();
    }

    // USERS
    public static String userId() {
        return "USR" + random(8);
    }

    // BUSINESS
    public static String businessId() {
        return "BUS" + random(8);
    }

    // GST DETAILS
    public static String gstId() {
        return "GST" + random(8);
    }

    // USER ↔ BUSINESS MAPPING
    public static String userBusinessId() {
        return "UB" + random(8);
    }

    public static String PurchaseReturnId() {
        return "PR" + random(8);
    }

    // INVOICE (DATE BASED)
    public static String invoiceId() {
        String date = LocalDate.now()
                .format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        return "INV" + date + random(8);
    }

    public static String businessExtraId() {
        return "EXT" + random(8);
    }

    // STAFF
    public static String staffId() {
        return "STAFF" + random(8);
    }

    // ATTENDANCE
    public static String attendanceId() {
        return "ATT" + random(8);
    }

    // ONLINE ORDER
    public static String onlineOrderId() {
        return "OO" + random(8);
    }

    // ONLINE ORDER ITEM
    public static String onlineOrderItemId() {
        return "OOI" + random(8);
    }

    // ONLINE STORE
    public static String onlineStoreId() {
        return "OS" + random(8);
    }

    // ONLINE STORE PRODUCT
    public static String onlineStoreProductId() {
        return "OSP" + random(7);
    }

}
