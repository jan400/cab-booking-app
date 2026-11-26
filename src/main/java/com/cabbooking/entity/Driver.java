package com.cabbooking.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;

@Entity
@Table(name = "drivers")
public class Driver {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "name is required")
    private String name;

    @NotBlank(message = "phone is required")
    @Pattern(regexp = "^[0-9]{10}$", message = "phone must be 10 digits")
    private String phone;

    @NotBlank(message = "licenseNumber is required")
    @Column(unique = true, nullable = false)
    private String licenseNumber;

    @NotBlank(message = "vehicleNumber is required")
    @Column(unique = true, nullable = false)
    private String vehicleNumber;

    @NotNull(message = "vehicleType is required")
    @Enumerated(EnumType.STRING)
    private VehicleType vehicleType;

    @Enumerated(EnumType.STRING)
    private DriverStatus status = DriverStatus.AVAILABLE;

    public Driver() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public String getLicenseNumber() { return licenseNumber; }
    public void setLicenseNumber(String licenseNumber) { this.licenseNumber = licenseNumber; }
    public String getVehicleNumber() { return vehicleNumber; }
    public void setVehicleNumber(String vehicleNumber) { this.vehicleNumber = vehicleNumber; }
    public VehicleType getVehicleType() { return vehicleType; }
    public void setVehicleType(VehicleType vehicleType) { this.vehicleType = vehicleType; }
    public DriverStatus getStatus() { return status; }
    public void setStatus(DriverStatus status) { this.status = status; }
}
