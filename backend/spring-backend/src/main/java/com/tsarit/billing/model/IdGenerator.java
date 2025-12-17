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

    // INVOICE (DATE BASED)
    public static String invoiceId() {
        String date = LocalDate.now()
                .format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        return "INV" + date + random(8);
    }
    public static String businessExtraId() {
        return "EXT" + random(8);
    }
}
