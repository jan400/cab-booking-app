package com.cabbooking.dto;

import com.cabbooking.entity.VehicleType;
import jakarta.validation.constraints.*;

public record BookingRequest(
        @NotNull(message = "customerId is required") Long customerId,
        @NotBlank(message = "pickupLocation is required") String pickupLocation,
        @NotBlank(message = "dropLocation is required") String dropLocation,
        @Positive(message = "distanceKm must be greater than 0") double distanceKm,
        @NotNull(message = "vehicleType is required") VehicleType vehicleType) {
}
