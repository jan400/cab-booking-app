package com.cabbooking.controller;

import com.cabbooking.dto.BookingRequest;
import com.cabbooking.entity.Booking;
import com.cabbooking.service.BookingService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Booking create(@Valid @RequestBody BookingRequest request) {
        return bookingService.createBooking(request);
    }

    @GetMapping
    public List<Booking> getAll() { return bookingService.getAll(); }

    @GetMapping("/{id}")
    public Booking getById(@PathVariable Long id) { return bookingService.getById(id); }

    @GetMapping("/customer/{customerId}")
    public List<Booking> getByCustomer(@PathVariable Long customerId) {
        return bookingService.getByCustomer(customerId);
    }

    @PutMapping("/{id}/complete")
    public Booking complete(@PathVariable Long id) { return bookingService.complete(id); }

    @PutMapping("/{id}/cancel")
    public Booking cancel(@PathVariable Long id) { return bookingService.cancel(id); }
}
