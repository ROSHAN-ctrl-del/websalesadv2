@echo off
echo Starting MongoDB and Sales Management System...
echo.

echo 1. Starting MongoDB service...
net start MongoDB
if %errorlevel% neq 0 (
    echo MongoDB service failed to start. Please ensure MongoDB is installed.
    echo You can download MongoDB from: https://www.mongodb.com/try/download/community
    pause
    exit /b 1
)

echo.
echo 2. MongoDB service started successfully!
echo.
echo 3. Starting the application...
echo.
echo Connection details for MongoDB Compass:
echo - Connection String: mongodb://localhost:27017
echo - Database: sales-management
echo.
echo Press any key to start the application...
pause

npm start 