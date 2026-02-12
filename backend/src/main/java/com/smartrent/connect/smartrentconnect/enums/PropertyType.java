package com.smartrent.connect.smartrentconnect.enums;

public enum PropertyType {
    FLAT("FLAT"),
    PG("PG");

    private final String name;

    PropertyType(String name) {
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
