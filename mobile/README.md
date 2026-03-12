# Team Builder Mobile App

## Quick Start

### 1. Install Expo Go on Your Phone
- **Android:** [Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)
- **iOS:** [App Store](https://apps.apple.com/app/expo-go/id982107779)

### 2. Start the App
```bash
cd mobile
npx expo start
```

### 3. Scan QR Code
- Open Expo Go app
- Scan the QR code from terminal
- App will load on your phone

## Features
- Biometric authentication (Face ID/Fingerprint)
- WebView integration with web app
- Native mobile experience

## Update Backend URL

If using a physical device, update `App.js`:

```javascript
// Find your computer's IP address
// Windows: ipconfig
// Mac: ifconfig

const [webViewUrl] = useState('http://YOUR_IP:3000');
// Example: http://192.168.1.100:3000
```

## Troubleshooting

### Can't connect?
- Ensure phone and computer are on same WiFi
- Check firewall settings
- Try tunnel mode: `npx expo start --tunnel`

### Module errors?
```bash
rm -rf node_modules
npm install
```
