<div align="center">

# Cab Booking API

**A RESTful backend for managing customers, drivers, and cab bookings.**

[![Java 17](https://img.shields.io/badge/Java-17-ED8B00?logo=openjdk&logoColor=white)](https://openjdk.org/)
[![Spring Boot 3.2.5](https://img.shields.io/badge/Spring%20Boot-3.2.5-6DB33F?logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![Maven](https://img.shields.io/badge/Maven-build-C71A36?logo=apachemaven&logoColor=white)](https://maven.apache.org/)
[![MySQL](https://img.shields.io/badge/MySQL-database-4479A1?logo=mysql&logoColor=white)](https://www.mysql.com/)
[![REST API](https://img.shields.io/badge/API-REST-005571?logo=fastapi&logoColor=white)](https://en.wikipedia.org/wiki/REST)
[![Version](https://img.shields.io/badge/version-1.0.0-informational)](pom.xml)

</div>

Cab Booking API is a Spring Boot service for registering customers and drivers, matching bookings with available vehicles, calculating fares, and tracking booking and driver status. It uses Spring Web, Spring Data JPA, Bean Validation, and MySQL.

## Contents

- [Features](#features)
- [Technology](#technology)
- [Getting Started](#getting-started)
- [API Reference](#api-reference)
- [Booking Rules](#booking-rules)
- [Errors](#errors)
- [Tests](#tests)
- [Project Structure](#project-structure)
- [Configuration](#configuration)
- [Security and Production Notes](#security-and-production-notes)
- [License](#license)

## Features

- Create, list, retrieve, update, and delete customer records.
- Manage driver profiles and filter drivers by availability.
- Assign an available driver matching a requested vehicle type.
- Calculate fares from a base fare and per-kilometer vehicle rate.
- Complete or cancel confirmed bookings and release the assigned driver.
- Validate request data and return structured JSON errors.
- Includes a Postman collection for exercising the API.

## Technology

| Component | Technology |
| --- | --- |
| Language | Java 17 |
| Application framework | Spring Boot 3.2.5 |
| HTTP API | Spring Web (Spring MVC) |
| Persistence | Spring Data JPA / Hibernate |
| Database | MySQL |
| Validation | Jakarta Bean Validation |
| Build | Apache Maven |
| Tests | JUnit 5, Mockito, Spring Boot Test |

## Getting Started

### Prerequisites

- JDK 17 or newer
- Apache Maven 3.6.3 or newer
- MySQL 8.0 or a compatible MySQL server
- Git

### Clone the repository

```bash
git clone https://github.com/jan400/cab-booking-app.git
cd cab-booking-app
```

### Configure the database

Start MySQL and provide credentials for a MySQL account that can create the `cab_booking` database and tables. The JDBC URL enables database creation if it does not already exist. Hibernate updates the schema at application startup.

On PowerShell:

```powershell
$env:DB_USERNAME = "root"
$env:DB_PASSWORD = "your-mysql-password"
```

On macOS or Linux:

```bash
export DB_USERNAME=root
export DB_PASSWORD=your-mysql-password
```

The application currently defaults to `root` / `root` when these environment variables are not set. Override the defaults for local development; never use root credentials or commit secrets in a deployed environment.

### Run the application

```bash
mvn spring-boot:run
```

The API will be available at `http://localhost:8080`.

### Import the Postman collection

Import [`postman/CabBooking.postman_collection.json`](postman/CabBooking.postman_collection.json) into Postman. Its `baseUrl` collection variable defaults to `http://localhost:8080`.

## API Reference

All endpoints are prefixed with `/api`. JSON request bodies should use `Content-Type: application/json`.

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/api/customers` | Create a customer |
| `GET` | `/api/customers` | List customers |
| `GET` | `/api/customers/{id}` | Get a customer |
| `PUT` | `/api/customers/{id}` | Update a customer |
| `DELETE` | `/api/customers/{id}` | Delete a customer |
| `POST` | `/api/drivers` | Create a driver |
| `GET` | `/api/drivers` | List drivers; optional `?status=AVAILABLE` filter |
| `GET` | `/api/drivers/{id}` | Get a driver |
| `PUT` | `/api/drivers/{id}` | Update a driver |
| `PATCH` | `/api/drivers/{id}/status?status=OFFLINE` | Change driver status |
| `DELETE` | `/api/drivers/{id}` | Delete a driver |
| `POST` | `/api/bookings` | Create a booking and assign a driver |
| `GET` | `/api/bookings` | List bookings |
| `GET` | `/api/bookings/{id}` | Get a booking |
| `GET` | `/api/bookings/customer/{customerId}` | List a customer's bookings |
| `PUT` | `/api/bookings/{id}/complete` | Complete a confirmed booking |
| `PUT` | `/api/bookings/{id}/cancel` | Cancel a confirmed booking |

### Example workflow

Create a customer:

```http
POST /api/customers
Content-Type: application/json
```

```json
{
   "name": "Arun Kumar",
   "email": "arun@example.com",
   "phone": "9876543210"
}
```

Create a driver. The `vehicleType` must be `HATCHBACK`, `SEDAN`, or `SUV`; new drivers default to `AVAILABLE`.

```http
POST /api/drivers
Content-Type: application/json
```

```json
{
   "name": "Ravi",
   "phone": "9123456780",
   "licenseNumber": "TN01-2020-0001",
   "vehicleNumber": "TN01AB1234",
   "vehicleType": "SEDAN"
}
```

Create a booking using the customer ID returned from the first request:

```http
POST /api/bookings
Content-Type: application/json
```

```json
{
   "customerId": 1,
   "pickupLocation": "T Nagar",
   "dropLocation": "Airport",
   "distanceKm": 10,
   "vehicleType": "SEDAN"
}
```

The API returns the created booking, including its assigned driver, fare, `CONFIRMED` status, and booking time. Complete it with `PUT /api/bookings/{id}/complete` or cancel it with `PUT /api/bookings/{id}/cancel`.

## Booking Rules

The service selects the first available driver matching the requested vehicle type. A successful booking marks that driver `BUSY`. Completing or cancelling a confirmed booking changes the driver back to `AVAILABLE`. A booking that is not `CONFIRMED` cannot be completed or cancelled again.

Fare is calculated as:

```text
fare = 50.00 + (vehicle rate per km × distance in km)
```

| Vehicle type | Rate per km |
| --- | ---: |
| `HATCHBACK` | 12.00 |
| `SEDAN` | 15.00 |
| `SUV` | 20.00 |

The calculated fare is rounded to two decimal places. Booking statuses are `CONFIRMED`, `COMPLETED`, and `CANCELLED`. Driver statuses are `AVAILABLE`, `BUSY`, and `OFFLINE`.

## Errors

Errors are returned as JSON with a timestamp, HTTP status, reason, and message. Validation failures also include an `errors` object keyed by field.

| HTTP status | Meaning |
| --- | --- |
| `400 Bad Request` | Invalid request, validation failure, invalid enum, no matching available driver, or invalid booking transition |
| `404 Not Found` | Requested customer, driver, or booking does not exist |
| `409 Conflict` | Duplicate unique value or deletion of a record that is still referenced |

## Tests

Run the test suite with:

```bash
mvn test
```

The existing unit tests cover fare calculation, driver assignment, unavailable-driver handling, and driver release after cancellation.

## Project Structure

```text
src/
├── main/
│   ├── java/com/cabbooking/
│   │   ├── controller/   # REST endpoints
│   │   ├── dto/          # Request models
│   │   ├── entity/       # JPA entities and enums
│   │   ├── exception/    # API exceptions and error responses
│   │   ├── repository/   # Spring Data repositories
│   │   └── service/      # Booking and domain logic
│   └── resources/
│       └── application.properties
└── test/java/com/cabbooking/
      └── service/          # Service unit tests
```

The application follows a controller-service-repository structure: controllers handle HTTP, services implement business rules, and repositories handle persistence.

## Configuration

| Setting | Default | Description |
| --- | --- | --- |
| `server.port` | `8080` | HTTP server port |
| `spring.datasource.url` | `jdbc:mysql://localhost:3306/cab_booking...` | MySQL connection URL |
| `DB_USERNAME` | `root` | Database username |
| `DB_PASSWORD` | `root` | Database password |
| `spring.jpa.hibernate.ddl-auto` | `update` | Update the database schema on startup |

Database settings are defined in [`src/main/resources/application.properties`](src/main/resources/application.properties). Environment variables can override the database username and password without editing the file.

## Security and Production Notes

- The API currently has no authentication or authorization. Do not expose it to untrusted networks as-is.
- The default database credentials are for local development only. Use managed secrets and a least-privilege database account in deployed environments.
- Hibernate schema auto-update and SQL statement logging are enabled in the current configuration. Review these settings before production use.
- No production deployment profile, API documentation specification, or CI workflow is currently included in this repository.

## License

No license has been specified in this repository yet. Add a `LICENSE` file before distributing or reusing this project.
