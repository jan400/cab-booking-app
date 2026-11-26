package com.cabbooking.repository;

import com.cabbooking.entity.Driver;
import com.cabbooking.entity.DriverStatus;
import com.cabbooking.entity.VehicleType;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DriverRepository extends JpaRepository<Driver, Long> {
    Optional<Driver> findFirstByVehicleTypeAndStatus(VehicleType vehicleType, DriverStatus status);
    List<Driver> findByStatus(DriverStatus status);
    boolean existsByLicenseNumber(String licenseNumber);
    boolean existsByVehicleNumber(String vehicleNumber);
}
