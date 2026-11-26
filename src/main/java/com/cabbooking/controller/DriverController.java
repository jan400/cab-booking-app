package com.cabbooking.controller;

import com.cabbooking.entity.Driver;
import com.cabbooking.entity.DriverStatus;
import com.cabbooking.service.DriverService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/drivers")
public class DriverController {

    private final DriverService driverService;

    public DriverController(DriverService driverService) {
        this.driverService = driverService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Driver create(@Valid @RequestBody Driver driver) {
        return driverService.create(driver);
    }

    @GetMapping
    public List<Driver> getAll(@RequestParam(required = false) DriverStatus status) {
        return driverService.getAll(status);
    }

    @GetMapping("/{id}")
    public Driver getById(@PathVariable Long id) { return driverService.getById(id); }

    @PutMapping("/{id}")
    public Driver update(@PathVariable Long id, @Valid @RequestBody Driver driver) {
        return driverService.update(id, driver);
    }

    @PatchMapping("/{id}/status")
    public Driver updateStatus(@PathVariable Long id, @RequestParam DriverStatus status) {
        return driverService.updateStatus(id, status);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) { driverService.delete(id); }
}
