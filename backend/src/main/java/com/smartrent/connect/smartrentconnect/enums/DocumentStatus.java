package com.smartrent.connect.smartrentconnect.enums;

public enum DocumentStatus {
    PENDING("Pending Verification"),
    VERIFIED("Verified"),
    REJECTED("Rejected"),
    EXPIRED("Expired");

    private final String displayName;

    DocumentStatus(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
