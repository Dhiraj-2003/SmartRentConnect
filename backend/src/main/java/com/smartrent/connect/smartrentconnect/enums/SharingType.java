package com.smartrent.connect.smartrentconnect.enums;

public enum SharingType {
    SINGLE("SINGLE"),
    DOUBLE("DOUBLE"),
    TRIPLE("TRIPLE");

    private final String name;

    SharingType(String name) {
        this.name = name;
    }

    public String getName() {
        return name;
    }

    @Override
    public String toString() {
        return name;
    }
}
