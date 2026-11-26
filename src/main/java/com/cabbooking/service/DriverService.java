package com.cabbooking.service;

import com.cabbooking.entity.Driver;
import com.cabbooking.entity.DriverStatus;
import com.cabbooking.exception.BadRequestException;
import com.cabbooking.exception.ResourceNotFoundException;
import com.cabbooking.repository.DriverRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class DriverService {

    private final DriverRepository driverRepository;

    public DriverService(DriverRepository driverRepository) {
        this.driverRepository = driverRepository;
    }

    public Driver create(Driver driver) {
        if (driverRepository.existsByLicenseNumber(driver.getLicenseNumber())) {
            throw new BadRequestException("License already registered: " + driver.getLicenseNumber());
        }
        if (driverRepository.existsByVehicleNumber(driver.getVehicleNumber())) {
            throw new BadRequestException("Vehicle already registered: " + driver.getVehicleNumber());
        }
        driver.setId(null);
        driver.setStatus(DriverStatus.AVAILABLE);
        return driverRepository.save(driver);
    }

    @Transactional(readOnly = true)
    public List<Driver> getAll(DriverStatus status) {
        return status == null ? driverRepository.findAll() : driverRepository.findByStatus(status);
    }

    @Transactional(readOnly = true)
    public Driver getById(Long id) {
        return driverRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Driver not found with id " + id));
    }

    public Driver update(Long id, Driver updated) {
        Driver existing = getById(id);
        existing.setName(updated.getName());
        existing.setPhone(updated.getPhone());
        existing.setLicenseNumber(updated.getLicenseNumber());
        existing.setVehicleNumber(updated.getVehicleNumber());
        existing.setVehicleType(updated.getVehicleType());
        return driverRepository.save(existing);
    }

    public Driver updateStatus(Long id, DriverStatus status) {
        Driver driver = getById(id);
        if (driver.getStatus() == DriverStatus.BUSY && status != DriverStatus.BUSY) {
            throw new BadRequestException("Driver is on a trip; complete or cancel the booking first");
        }
        driver.setStatus(status);
        return driverRepository.save(driver);
    }

    public void delete(Long id) {
        driverRepository.delete(getById(id));
    }
}
