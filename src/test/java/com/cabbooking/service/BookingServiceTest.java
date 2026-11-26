package com.cabbooking.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import com.cabbooking.dto.BookingRequest;
import com.cabbooking.entity.*;
import com.cabbooking.exception.BadRequestException;
import com.cabbooking.repository.BookingRepository;
import com.cabbooking.repository.CustomerRepository;
import com.cabbooking.repository.DriverRepository;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class BookingServiceTest {

    @Mock BookingRepository bookingRepository;
    @Mock CustomerRepository customerRepository;
    @Mock DriverRepository driverRepository;
    @InjectMocks BookingService bookingService;

    @Test
    void fareIsBasePlusRatePerKm() {
        assertEquals(200.0, BookingService.calculateFare(VehicleType.SEDAN, 10));
        assertEquals(170.0, BookingService.calculateFare(VehicleType.HATCHBACK, 10));
        assertEquals(450.0, BookingService.calculateFare(VehicleType.SUV, 20));
    }

    @Test
    void createBookingAssignsDriverAndMarksBusy() {
        Customer customer = new Customer();
        customer.setId(1L);
        Driver driver = new Driver();
        driver.setId(5L);
        driver.setVehicleType(VehicleType.SEDAN);
        driver.setStatus(DriverStatus.AVAILABLE);

        when(customerRepository.findById(1L)).thenReturn(Optional.of(customer));
        when(driverRepository.findFirstByVehicleTypeAndStatus(VehicleType.SEDAN, DriverStatus.AVAILABLE))
                .thenReturn(Optional.of(driver));
        when(bookingRepository.save(any(Booking.class))).thenAnswer(i -> i.getArgument(0));

        Booking b = bookingService.createBooking(
                new BookingRequest(1L, "T Nagar", "Airport", 10, VehicleType.SEDAN));

        assertEquals(BookingStatus.CONFIRMED, b.getStatus());
        assertEquals(200.0, b.getFare());
        assertEquals(DriverStatus.BUSY, driver.getStatus());
    }

    @Test
    void createBookingFailsWhenNoDriverAvailable() {
        when(customerRepository.findById(1L)).thenReturn(Optional.of(new Customer()));
        when(driverRepository.findFirstByVehicleTypeAndStatus(any(), any())).thenReturn(Optional.empty());

        assertThrows(BadRequestException.class, () -> bookingService.createBooking(
                new BookingRequest(1L, "A", "B", 5, VehicleType.SUV)));
    }

    @Test
    void cancelFreesDriver() {
        Driver driver = new Driver();
        driver.setStatus(DriverStatus.BUSY);
        Booking booking = new Booking();
        booking.setId(9L);
        booking.setDriver(driver);
        booking.setStatus(BookingStatus.CONFIRMED);

        when(bookingRepository.findById(9L)).thenReturn(Optional.of(booking));
        when(bookingRepository.save(any(Booking.class))).thenAnswer(i -> i.getArgument(0));

        Booking result = bookingService.cancel(9L);

        assertEquals(BookingStatus.CANCELLED, result.getStatus());
        assertEquals(DriverStatus.AVAILABLE, driver.getStatus());
        assertThrows(BadRequestException.class, () -> bookingService.complete(9L));
    }
}
