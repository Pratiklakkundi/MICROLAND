# 📱 Start Mobile App - Quick Guide

## Step 1: Install Expo Go on Your Phone

### Android
Download from Play Store: https://play.google.com/store/apps/details?id=host.exp.exponent

### iOS  
Download from App Store: https://apps.apple.com/app/expo-go/id982107779

## Step 2: Make Sure Backend & Frontend Are Running

✅ Backend: http://localhost:8000
✅ Frontend: http://localhost:3000

## Step 3: Start Mobile App

### Option A: Use the batch file
```bash
run-mobile.bat
```

### Option B: Manual start
```bash
cd mobile
npx expo start
```

## Step 4: Open on Your Phone

1. Open Expo Go app on your phone
2. Scan the QR code shown in the terminal
3. Wait for the app to load
4. Enjoy the mobile experience!

## Your Network Info

Your computer IP: **172.27.84.107**
Frontend URL: **http://172.27.84.107:3000**

The mobile app is configured to connect to this URL.

## Troubleshooting

### Can't scan QR code?
- Make sure your phone and computer are on the same WiFi network
- WiFi Network: Check both devices are connected to the same network

### Connection timeout?
Try tunnel mode:
```bash
npx expo start --tunnel
```

### App won't load?
1. Check if frontend is accessible from phone browser: http://172.27.84.107:3000
2. Check Windows Firewall settings
3. Restart the Expo server

## Features in Mobile App

- 🔐 Biometric authentication (Face ID/Fingerprint)
- 📱 Native mobile interface
- 🌐 WebView integration with full web app
- 🎨 Modern UI optimized for mobile
- ⚡ Fast and responsive

## Next Steps

After the app loads:
1. Authenticate with biometrics
2. Login with sample credentials
3. Browse projects and users
4. Use AI team builder
5. Enjoy the mobile experience!
