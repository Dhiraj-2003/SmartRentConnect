package com.smartrent.connect.smartrentconnect.enums;

public enum Role {
    TENANT("TENANT"),
    OWNER("OWNER"), 
    ADMIN("ADMIN"),
    WATCHMAN("WATCHMAN");

    private final String name;

    Role(String name) {
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
