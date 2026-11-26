# Cab Booking Application

Backend for a cab booking system. Java 17, Spring Boot 3, Spring Data JPA (Hibernate), MySQL, Maven.

Architecture: Controller -> Service -> Repository. Entities: Customer, Driver, Booking.

## Run
1. Install JDK 17+, Maven, MySQL.
2. DB auto-created (`cab_booking`). Set creds if not root/root:
   `DB_USERNAME=root DB_PASSWORD=yourpass` (env vars) or edit `application.properties`.
3. `mvn spring-boot:run` -> http://localhost:8080
4. Tests: `mvn test`
5. Import `postman/CabBooking.postman_collection.json` into Postman.

Eclipse/STS: File > Import > Existing Maven Projects.

## Flow
1. `POST /api/customers`, `POST /api/drivers` (vehicleType: HATCHBACK | SEDAN | SUV)
2. `POST /api/bookings` -> auto-assigns first AVAILABLE driver of that type, driver -> BUSY, fare computed.
3. `PUT /api/bookings/{id}/complete` or `/cancel` -> driver -> AVAILABLE.

Fare = 50 + ratePerKm x distanceKm (HATCHBACK 12, SEDAN 15, SUV 20).

## Endpoints
| Method | Path | Purpose |
|---|---|---|
| POST/GET | /api/customers | create / list |
| GET/PUT/DELETE | /api/customers/{id} | read / update / delete |
| POST/GET | /api/drivers (?status=AVAILABLE) | create / list |
| GET/PUT/DELETE | /api/drivers/{id} | read / update / delete |
| PATCH | /api/drivers/{id}/status?status=OFFLINE | change status |
| POST/GET | /api/bookings | create / list |
| GET | /api/bookings/{id} | read |
| GET | /api/bookings/customer/{customerId} | customer history |
| PUT | /api/bookings/{id}/complete, /cancel | finish / cancel |

Errors return JSON: 400 validation, 404 not found, 409 duplicate/referenced.
