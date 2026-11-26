package com.cabbooking.entity;

public enum VehicleType {
    HATCHBACK(12.0), SEDAN(15.0), SUV(20.0);

    private final double ratePerKm;

    VehicleType(double ratePerKm) { this.ratePerKm = ratePerKm; }

    public double getRatePerKm() { return ratePerKm; }
}
