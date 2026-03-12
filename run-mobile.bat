@echo off
echo ========================================
echo   Starting Mobile App
echo ========================================
echo.
echo Make sure:
echo 1. Backend is running on port 8000
echo 2. Frontend is running on port 3000
echo 3. Expo Go app is installed on your phone
echo.
echo Starting Expo development server...
cd mobile
npx expo start
