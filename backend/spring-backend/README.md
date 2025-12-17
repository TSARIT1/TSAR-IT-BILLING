# Spring Boot Backend for Billing Frontend

This project is a minimal Spring Boot backend that implements many of the endpoints expected by the uploaded React frontend (billing-main). It is intentionally a compact demo to get you started — you should harden, add validation, error handling, and production-ready configuration before using in production.

## How to run

1. Install Java 17 and Maven.
2. Create a MySQL database `billing_db` and update `src/main/resources/application.properties` with your MySQL username/password.
3. Build & run:
   ```bash
   mvn clean package
   mvn spring-boot:run
   ```
4. The backend runs on port 8000 to match the frontend axios baseURL.

## Implemented endpoints (non-exhaustive)
- `POST /api/register/` - register user
- `POST /api/login/` - login -> returns JWT token
- `GET/POST/PUT/DELETE /api/products/` - product CRUD
- `GET/POST/PUT/DELETE /api/customers/`
- `GET/POST/PUT/DELETE /api/vendors/`
- `GET/POST /api/sales/`
- `GET /api/dashboard/stats/`
- `GET/POST /api/tickets/`
- `GET/POST /api/backups/` (stubs)

JWT handling is very basic. For demo purposes the filter sets a `user` request attribute when a valid token is provided.

