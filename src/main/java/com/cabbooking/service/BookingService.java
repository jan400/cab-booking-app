package com.cabbooking.service;

import com.cabbooking.dto.BookingRequest;
import com.cabbooking.entity.*;
import com.cabbooking.exception.BadRequestException;
import com.cabbooking.exception.ResourceNotFoundException;
import com.cabbooking.repository.BookingRepository;
import com.cabbooking.repository.CustomerRepository;
import com.cabbooking.repository.DriverRepository;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class BookingService {

    public static final double BASE_FARE = 50.0;

    private final BookingRepository bookingRepository;
    private final CustomerRepository customerRepository;
    private final DriverRepository driverRepository;

    public BookingService(BookingRepository bookingRepository,
                          CustomerRepository customerRepository,
                          DriverRepository driverRepository) {
        this.bookingRepository = bookingRepository;
        this.customerRepository = customerRepository;
        this.driverRepository = driverRepository;
    }

    public Booking createBooking(BookingRequest request) {
        Customer customer = customerRepository.findById(request.customerId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Customer not found with id " + request.customerId()));

        Driver driver = driverRepository
                .findFirstByVehicleTypeAndStatus(request.vehicleType(), DriverStatus.AVAILABLE)
                .orElseThrow(() -> new BadRequestException(
                        "No " + request.vehicleType() + " driver available right now"));

        driver.setStatus(DriverStatus.BUSY);
        driverRepository.save(driver);

        Booking booking = new Booking();
        booking.setCustomer(customer);
        booking.setDriver(driver);
        booking.setPickupLocation(request.pickupLocation());
        booking.setDropLocation(request.dropLocation());
        booking.setDistanceKm(request.distanceKm());
        booking.setFare(calculateFare(request.vehicleType(), request.distanceKm()));
        booking.setStatus(BookingStatus.CONFIRMED);
        booking.setBookedAt(LocalDateTime.now());
        return bookingRepository.save(booking);
    }

    @Transactional(readOnly = true)
    public List<Booking> getAll() {
        return bookingRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Booking getById(Long id) {
        return bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id " + id));
    }

    @Transactional(readOnly = true)
    public List<Booking> getByCustomer(Long customerId) {
        if (!customerRepository.existsById(customerId)) {
            throw new ResourceNotFoundException("Customer not found with id " + customerId);
        }
        return bookingRepository.findByCustomerId(customerId);
    }

    public Booking complete(Long id) {
        Booking booking = getById(id);
        requireConfirmed(booking, "completed");
        booking.setStatus(BookingStatus.COMPLETED);
        booking.setCompletedAt(LocalDateTime.now());
        freeDriver(booking.getDriver());
        return bookingRepository.save(booking);
    }

    public Booking cancel(Long id) {
        Booking booking = getById(id);
        requireConfirmed(booking, "cancelled");
        booking.setStatus(BookingStatus.CANCELLED);
        freeDriver(booking.getDriver());
        return bookingRepository.save(booking);
    }

    public static double calculateFare(VehicleType type, double distanceKm) {
        double fare = BASE_FARE + type.getRatePerKm() * distanceKm;
        return Math.round(fare * 100.0) / 100.0;
    }

    private void requireConfirmed(Booking booking, String action) {
        if (booking.getStatus() != BookingStatus.CONFIRMED) {
            throw new BadRequestException("Booking " + booking.getId() + " is "
                    + booking.getStatus() + " and cannot be " + action);
        }
    }

    private void freeDriver(Driver driver) {
        driver.setStatus(DriverStatus.AVAILABLE);
        driverRepository.save(driver);
    }
}
