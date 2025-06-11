# Firebase Setup Guide for Aadya Fashions

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or "Add project"
3. Enter project name: `aadya-fashions` (or your preferred name)
4. Disable Google Analytics (optional for this project)
5. Click "Create project"

## Step 2: Enable Firestore Database

1. In your Firebase project console, click "Firestore Database"
2. Click "Create database"
3. Choose "Start in test mode" (for development)
4. Select a location (choose closest to your users)
5. Click "Done"

## Step 3: Enable Firebase Storage

1. In Firebase console, click "Storage"
2. Click "Get started"
3. Choose "Start in test mode"
4. Select the same location as Firestore
5. Click "Done"

## Step 4: Get Firebase Configuration

1. In Firebase console, click the gear icon ⚙️ → "Project settings"
2. Scroll down to "Your apps" section
3. Click the web icon `</>` to add a web app
4. Enter app nickname: "Aadya Fashions Website"
5. Don't check "Firebase Hosting" (we're using GitHub Pages)
6. Click "Register app"
7. Copy the `firebaseConfig` object

## Step 5: Update Your Code

### In `index.html` (line ~18):
Replace this section:
```javascript
const firebaseConfig = {
    // Replace with your actual Firebase config from Firebase Console
    apiKey: "your-api-key-here",
    authDomain: "your-project.firebaseapp.com",
    projectId: "your-project-id",
    storageBucket: "your-project.appspot.com",
    messagingSenderId: "123456789",
    appId: "your-app-id"
};
```

With your actual config:
```javascript
const firebaseConfig = {
    apiKey: "AIzaSyC...",  // Your actual API key
    authDomain: "aadya-fashions.firebaseapp.com",
    projectId: "aadya-fashions",
    storageBucket: "aadya-fashions.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abcdef123456"
};
```

### In `add-kurti.html` (line ~18):
Update the same `firebaseConfig` section with your actual config.

## Step 6: Configure Security Rules (Important!)

### Firestore Rules (for public read access):
1. Go to Firestore → Rules
2. Replace the rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read access to all products
    match /products/{productId} {
      allow read: if true;
      allow write: if false; // Only allow writes through admin panel
    }
    
    // Allow read/write for orders (you can restrict this later)
    match /orders/{orderId} {
      allow read, write: if true;
    }
  }
}
```

### Storage Rules (for public read access):
1. Go to Storage → Rules
2. Replace the rules with:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /product-images/{allPaths=**} {
      allow read: if true;
      allow write: if false; // Only allow writes through admin panel
    }
  }
}
```

## Step 7: Test the Setup

1. Save all your files
2. Open your website
3. Use Ctrl+Shift+A to access admin panel
4. Try adding a product with an image
5. Check if it appears on the homepage

## Troubleshooting

### Common Issues:

1. **"Permission denied" error**: Check Firestore rules allow public read
2. **"Firebase config error"**: Verify you copied the correct config
3. **Images not loading**: Check Storage rules and image upload
4. **Products not appearing**: Check browser console for errors

### Check Browser Console:
Press F12 → Console tab to see detailed error messages.

### Verify Configuration:
- Project ID should match in both files
- API key should be exactly as provided by Firebase
- All URLs should end with your project ID

## Security Notes for Production

- Current rules allow public read access (good for e-commerce)
- Consider adding authentication for admin actions
- Monitor usage in Firebase console
- Set up billing alerts if needed

## Next Steps

After setup works:
1. Add more products through admin panel
2. Test full cart → order flow
3. Consider adding user authentication
4. Set up proper admin authentication
5. Add product categories and filtering

---

**Need help?** Check the Firebase documentation or browser console for specific error messages.
