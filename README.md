# Project RQ: Task Management System

## Running the project

```bash
docker-compose up -**d**
npm run dev
```

---

## Project Setup

* [x] Initialize Node.js project with Typescript along with TypeORM
(docker-compose)
* [x] Setup Express server
* [x] Configure environment variables using `dotenv`
* [x] Setup Redis and BullMQ integration
* [x] Setup Jest and Supertest
* [x] Seed default Admin user on app start

---

## Authentication

* [x] Create DTOs for Register/Login
* [x] Implement JWT-based login and register
* [x] Add role-based middleware
* [x] Secure routes with `authMiddleware`
* [x] Endpoint: `POST /auth/register` (Admin-only)
* [x] Endpoint: `POST /auth/login`
* [x] Endpoint: `GET /auth/profile`

---

## User Management (Admin Only)

* [x] Endpoint: `POST /users` - Create user with role
* [x] Endpoint: `GET /users` - List all users
* [x] Endpoint: `PATCH /users/:id/role` - Update role
* [x] Validate user DTOs
* [x] Exclude password field using class-transformer

---

## Project Management

* [x] Endpoint: `POST /projects` (Admin)
* [x] Endpoint: `GET /projects` (Admin/User with caching)
* [x] Endpoint: `GET /projects/:id` (Admin/User access control)
* [x] Endpoint: `DELETE /projects/:id` (Admin)
* [x] Implement Redis caching by role
* [x] Invalidate cache on create/update/delete
* [x] Trigger BullMQ job: `Create Default Task` on creation

---

## Task Management

* [x] Endpoint: `POST /projects/:projectId/tasks` (Admin)
* [x] Endpoint: `GET /projects/:projectId/tasks` (Admin/User)
* [x] Endpoint: `PATCH /tasks/:id` (Both - User limited to status updates)
* [x] Endpoint: `DELETE /tasks/:id` (Admin)
* [x] Validate task DTOs
* [x] Enforce permission checks
* [x] Cache user-task lists in Redis
* [x] Invalidate cache appropriately

---

## 📬 BullMQ Queues & Jobs

* [x] `user.queue.ts` – Send welcome email on user creation
* [x] `project.queue.ts` – Create default task
* [x] `reminder.queue.ts` – Daily job at 9 AM for due task reminders
* [x] Use `nodemailer` or console log for email mock
* [x] Add retry/backoff settings

---

## DTOs & Validation

* [x] Define DTOs for user, auth, project, task
* [x] Use `class-validator` for input validation
* [x] Use `class-transformer` to hide sensitive fields

---

## Testing

* [x] Setup test PostgreSQL DB
* [x] Mock Redis and BullMQ where needed
* [x] Integration tests for:

  * [x] Auth flows
  * [x] User endpoints
  * [x] Project endpoints
  * [x] Task endpoints
* [x] Edge cases, invalid data, unauthorized access
* [x] Coverage target: 90%+

---

## CI/CD (optional)

* [ ] GitHub Actions for test runs
* [ ] Linting and formatting checks

---

# Requirement Document

**Project Title:** Task Management System  
**Type:** Node.js Backend Training Project  
**Roles:** Admin, User  
**Architecture:** Layered (Controllers, Services, Repositories)

## Objective
Design and implement a backend task management platform to manage users, projects, and tasks. This will demonstrate practical use of:
*   Role-based access
*   Redis caching
*   BullMQ background jobs
*   DTO-based validation and transformation
*   Clean modular architecture (segregated folders)

## Tech Stack

| Layer | Tool / Library |
| :--- | :--- |
| **Language** | Node.js + TypeScript |
| **Framework** | Express |
| **ORM** | TypeORM + PostgreSQL |
| **Auth** | JWT |
| **Validation** | class-validator |
| **Transformation** | class-transformer |
| **Cache** | Redis |
| **Queue** | BullMQ |
| **Testing** | Jest + Supertest |

## Roles

### 1. Admin
*   Create users (admin/user roles)
*   Create/delete projects
*   Create/assign/edit/delete tasks
*   View all projects and tasks

### 2. User
*   View assigned projects and tasks
*   Update status of their own tasks

## Authentication

| Endpoint | Method | Access |
| :--- | :--- | :--- |
| `/auth/register` | POST | Admin |
| `/auth/login` | POST | Public |
| `/auth/profile` | GET | Auth |

*   JWT-based access control
*   Role-based middleware for authorization

## User Management (Admin-only)

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/users` | POST | Create a new user (admin/user) |
| `/users` | GET | List all users |
| `/users/:id/role` | PATCH | Update user role |

## Project Management

| Endpoint | Method | Role |
| :--- | :--- | :--- |
| `/projects` | POST | Admin |
| `/projects` | GET | Both |
| `/projects/:id` | GET | Both |
| `/projects/:id` | DELETE | Admin |

*   Admin can view/create/delete all
*   Users only view their assigned projects
*   Redis caches project list (by role)

## Task Management

| Endpoint | Method | Role |
| :--- | :--- | :--- |
| `/projects/:projectId/tasks` | POST | Admin |
| `/projects/:projectId/tasks` | GET | Both |
| `/tasks/:id` | PATCH | Both |
| `/tasks/:id` | DELETE | Admin |

*   Fields: title, description, priority, status, dueDate, assignedTo, projectId
*   Admin: full access
*   User: can only view/update status of their assigned tasks

## Redis Caching

| Cache Target | Key Format |
| :--- | :--- |
| Project list (Admin) | `projects:admin` |
| Project list (User) | `projects:user:{userId}` |
| Task list | `tasks:{projectId}:{userId}` |

*   Invalidate on project/task create, update, delete

## BullMQ Background Jobs

| Feature | Queue File | Trigger | Description |
| :--- | :--- | :--- | :--- |
| **Welcome Email** | `user.queue.ts` | On user creation | Send mock welcome email (use nodemailer or a logger) |
| **Default Task Creation** | `project.queue.ts`| On project creation| Create a default "Welcome Task" |
| **Daily Task Reminder** | `reminder.queue.ts`| Daily (e.g. 9 AM)| Notify users of tasks due today |

## DTO Validation & Transformation
*   Use `class-validator` for validating API request data
*   Use `class-transformer` to exclude internal fields like passwords and to format responses

## Default Admin Seed
*   On application startup, check if an Admin user exists
*   If not, create one with credentials from `.env`: `ADMIN_EMAIL`, `ADMIN_PASSWORD`
*   Ensures first-time access is always available

## Testing Scope
*   Cover all controllers, services, and repositories with integration tests
*   Test edge cases, unauthorized access, invalid inputs, and expected success flows
*   Mock Redis and BullMQ where necessary to isolate logic
*   Have a Test Db, for test cases
*   Target Test Coverage: 90%+

## Sample Structure

```bash
src/
├── controllers/
├── services/
├── repositories/
├── routes/
├── dto/
├── entities/
├── middlewares/
├── queues/
├── jobs/
├── config/
├── common/
└── main.ts
```
