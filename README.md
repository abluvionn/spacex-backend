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

### Uploading an application

You can submit the standard fields as JSON or multipart form data. To include a resume file, send a `multipart/form-data` request with a `resume` field:

```sh
curl -X POST http://localhost:3000/api/applications \
  -H "Authorization: Bearer <token>" \
  -F "fullName=Jane Doe" \
  -F "phoneNumber=+15551234567" \
  -F "email=jane@example.com" \
  -F "cdlLicense=DL123" \
  -F "state=CA" \
  -F "drivingExperience=3 years" \
  -F "truckTypes=[\"Flatbed\"]" \
  -F "longHaulTrips=true" \
  -F "resume=@/path/to/resume.pdf"
```

## Middleware

- `auth.js` handles authentication logic.

## Models

- `User.js` represents user data.
- `Application.js` represents application data. Applications now include a `status` field (pending, reviewing, rejected, accepted, etc.) instead of a simple archived flag. Applications also support an optional `resume` upload; files are saved under `uploads/resumes` and a `resumeUrl` is exposed on returned documents.

## Utils

- `formatValidationErrors.js` helps with formatting error messages.

## License

This project is for educational purposes.
