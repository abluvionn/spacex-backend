# SpaceX Backend

This repository contains a simple Node.js backend for a SpaceX application. It provides authentication and basic application management API endpoints.

## Project Structure

```
config.js
fixtures.js
index.js
package.json
swagger.js
middleware/
    auth.js
models/
    Application.js
    User.js
routes/
    applications.js
    auth.js
utils/
    formatValidationErrors.js
```

## Installation

1. Ensure Node.js (version 14 or higher) is installed.
2. Run `npm install` to install dependencies.

## Usage

- Start the server with `npm run dev`.
- API endpoints are defined in the `routes` directory.
- Swagger documentation is available via the `swagger.js` configuration.

## Middleware

- `auth.js` handles authentication logic.

## Models

- `User.js` represents user data.
- `Application.js` represents application data.

## Utils

- `formatValidationErrors.js` helps with formatting error messages.

## License

This project is for educational purposes.
