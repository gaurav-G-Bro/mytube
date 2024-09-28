# PROJECT: MYTUBE
# Backend Only: Node.js, Express.js, MongoDB, Multer, Cloudinary, JWT, OAUTH, and much more.

A Node.js-based video watching  and surfing app with **Express.js**, **Mongoose**, and **Cloudinary**. The system allows managing users, videos, and more.

## Technologies Used
- **Node.js** with **Express.js** for backend routing.
- **MongoDB** for database storage.
- **Mongoose** as an ODM (Object Data Modeling) library.
- **CORS** middleware for cross-origin requests.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v14 or higher)
- [MongoDB](https://www.mongodb.com/) (or any other database, if desired)
- [Postman](https://www.postman.com/) or a similar API client for testing
- A .env file for environment variables

### Installation

1. **Clone the repository:**
    ```bash
    git clone https://github.com/gaurav-G-Bro/edunova-assessment.git
    ```

2. **Install the dependencies:**
    ```bash
    npm install
    ```

3. **Set up environment variables:**

   Create a `.env` file in the root directory and add the following:

    ```env
    PORT=3000

    MONGO_URI=mongodb://localhost:27017/your-database-name
                      or
    MONGO_URI=mongodb+srv://username:password@cluster0.ocxwbhi.mongodb.net/database_name?authSource=admin

    ```

4. **Run the application:**
    ```bash
    npm run start 
        or 
    npm run dev
    ```
5. **package.json file should have:**
    ```bash
    "start": "node src/index.js",
    "dev": "nodemon src/index.js"
    ```

## Error Handling

The API uses comprehensive error handling to ensure that all errors are captured and meaningful messages are returned to the client. Common HTTP status codes used include:

- **400 Bad Request**: The request could not be understood or was missing required parameters.
- **401 Unauthorized**: Authentication failed or user does not have permissions for the requested operation.
- **404 Not Found**: The requested resource could not be found.
- **500 Internal Server Error**: An error occurred on the server.

## Contributing

If you'd like to contribute, please fork the repository and make changes as you'd like. Pull requests are warmly welcome.

## License

This project is open to use for the Intermediate to Advanced level students, programmers or coders.

---

**Happy Coding!**
**Gaurav**
**LinkedIn: https://www.linkedin.com/in/gaurav-kumar-a945231b0/**
