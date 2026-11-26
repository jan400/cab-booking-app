package com.cabbooking.repository;

import com.cabbooking.entity.Booking;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BookingRepository extends JpaRepository<Booking, Long> {
    List<Booking> findByCustomerId(Long customerId);
    List<Booking> findByDriverId(Long driverId);
}
