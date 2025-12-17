package com.tsarit.billing.model;

import com.fasterxml.jackson.annotation.JsonCreator;

public enum BusinessType {
	PROPRIETORSHIP,
    PARTNERSHIP,
    LLP,
    OTHERS,
    PRIVATE;
    
    @JsonCreator
    public static BusinessType fromValue(String value) {
        return BusinessType.valueOf(value.toUpperCase());
    }
}
