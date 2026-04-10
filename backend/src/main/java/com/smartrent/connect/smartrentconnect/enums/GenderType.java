package com.smartrent.connect.smartrentconnect.enums;

public enum GenderType {
    MALE("MALE"),
    FEMALE("FEMALE"),
    ANY("ANY");

    private final String name;

    GenderType(String name) {
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
