package com.smartrent.connect.smartrentconnect.enums;

public enum DocumentType {
    OWNERSHIP_PROOF("Ownership Proof"),
    TAX_RECEIPT("Tax Receipt"),
    NOC("No Objection Certificate"),
    BUILDING_PLAN("Building Plan"),
    FIRE_SAFETY("Fire Safety Certificate"),
    ELECTRICITY_BILL("Electricity Bill"),
    WATER_BILL("Water Bill"),
    SOCIETY_NOC("Society NOC"),
    RENTAL_AGREEMENT("Rental Agreement"),
    OTHER("Other");

    private final String displayName;

    DocumentType(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
