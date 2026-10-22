# Customer Mobile App (React Native CLI)

Production-grade, complete React Native CLI (TypeScript, Hermes, New Architecture, no Expo) customer mobile application for instant grocery delivery. Consumes the Express backend located in the sibling `blinkit-backend` directory.

---

## 1. Architecture Overview

- **Framework**: React Native 0.88.0 (Hermes Engine, New Architecture enabled by default).
- **Language**: TypeScript in strict mode (`tsc --noEmit` clean).
- **Navigation**: React Navigation v7 with Native Stack and Bottom Tabs (`@react-navigation/native`, `@react-navigation/native-stack`, `@react-navigation/bottom-tabs`).
- **Server State**: TanStack Query v5 with automatic retries for 5xx/network errors, no retry on 4xx, and optimistic updates with rollback for cart operations.
- **Client State**: Zustand stores:
  - `auth.store.ts`: In-memory session, current user, authentication status.
  - `location.store.ts`: Active store, current coordinates, active delivery address.
  - `ui.store.ts`: Global toast system, offline status banner.
  - `search.store.ts`: Persisted recent search queries.
- **Networking**: Axios client with custom envelope unwrapping (`ResponseModel`), single-flight 401 refresh-token rotation to prevent concurrency revocation, and automatic `x-store-id` injection.
- **Secure Persistence**: `react-native-keychain` for access and refresh tokens. Non-sensitive persistence via `@react-native-async-storage/async-storage`.
- **Styling**: Vanilla React Native StyleSheet with unified design tokens (`src/config/theme.ts`). Light mode forced across both platforms.

---

## 2. Setup & Installation

### Prerequisites
- Node.js >= 18
- JDK 17
- Android Studio with Android SDK (API 34/35) and Android Emulator
- Xcode 15+ and CocoaPods (for macOS / iOS development)

### Install Dependencies
From the `customer-app` directory:
```bash
npm install --legacy-peer-deps
```

### iOS CocoaPods Setup
```bash
cd ios
bundle exec pod install
cd ..
```

---

## 3. Environment Configuration

Copy the example environment file:
```bash
cp .env.example .env
```

Edit `.env` based on your testing target:

| Target Environment | `API_BASE_URL` | Notes |
| :--- | :--- | :--- |
| **Android Emulator** | `http://10.0.2.2:3000/api` | Maps to `localhost:3000` on the host machine |
| **Android Device (USB with adb)** | `http://localhost:3000/api` | Requires `adb reverse tcp:3000 tcp:3000` |
| **Android Device (Wi-Fi LAN)** | `http://<YOUR_LAN_IP>:3000/api` | Host machine and phone must be on the same Wi-Fi |
| **iOS Simulator** | `http://localhost:3000/api` | Directly accesses the host's localhost |
| **iOS Physical Device** | `http://<YOUR_LAN_IP>:3000/api` | Host machine and iPhone must be on the same Wi-Fi |

Optionally set `DEFAULT_STORE_ID` if connecting directly to a known store ID.

---

## 4. Running the Application

### Start the Backend First
Ensure the sibling Express server is running:
```bash
cd ../blinkit-backend
npm run dev
```

### Start Metro Bundler
Start Metro with a clean cache:
```bash
npm start -- --reset-cache
```

### Run on Android
```bash
# Optional USB reverse if testing on physical device
adb reverse tcp:3000 tcp:3000
adb reverse tcp:8081 tcp:8081

npm run android
```

### Run on iOS
```bash
npm run ios
```

---

## 5. Changing App Identity & Branding

The application identity is centralized and neutral:

1. **Display Name**:
   - `app.json`: Change `"displayName": "CustomerApp"`.
   - Android: `android/app/src/main/res/values/strings.xml` (`<string name="app_name">YourAppName</string>`).
   - iOS: `ios/CustomerApp/Info.plist` (`CFBundleDisplayName`).

2. **Package Name / Application ID**:
   - Android: `android/app/build.gradle` (`applicationId "com.customerapp"`).
   - Android Directory: Rename `android/app/src/main/java/com/customerapp` to match the new package structure.
   - iOS: Open `ios/CustomerApp.xcworkspace` in Xcode, select the root target, and change **Bundle Identifier** under Signing & Capabilities.

---

## 6. Design System & Theme Tokens

All design tokens are defined in [`src/config/theme.ts`](file:///d:/Demo%20Projects/customer-app/src/config/theme.ts):

| Token Category | Values | Usage |
| :--- | :--- | :--- |
| **Primary** | `#0E9F6E` (Dark: `#087F56`, Soft: `#E6F6EF`) | CTAs, ADD buttons, floating cart bar, icons |
| **Accent / Header** | `#FFD84D` to `#FFF4C7` | Yellow home header gradient and status bar contrast |
| **Discount Badge** | `#6D4AFF` (Violet with white text) | Product card discount tags |
| **Neutral Text** | `#1F2937` (Base), `#6B7280` (Muted), `#9CA3AF` (Light) | Typography hierarchy with high contrast |
| **Surfaces** | `#FFFFFF` (Surface), `#F5F6F8` (Screen Background) | Clean layered cards and rails |
| **Semantic** | `#E5484D` (Danger), `#F59E0B` (Warning), `#12B76A` (Success) | Badges, toasts, alerts, and timeline states |
| **Spacing Scale** | `4, 8, 12, 16, 20, 24, 32` | Standard 4px grid throughout |
| **Radii** | `8` (sm), `12` (md), `16` (lg), `999` (full) | Rounded corners |
| **Shadows** | `subtle`, `card`, `floating` | Platform-tuned Android elevations and iOS shadows |

---

## 7. Safe Area & System UI Verification Checklist

Content never renders under system UI elements. To verify on physical devices and emulators:

- [ ] **Android 15+ Gesture Navigation (Edge-to-Edge)**: Ensure `Screen.tsx` pads content above navigation indicator line.
- [ ] **Android 3-Button Navigation**: Ensure bottom floating bars and tabs rest cleanly above the 3-button software navigation bar.
- [ ] **Colored Header Status Bar**: In `HomeScreen.tsx`, verify that the yellow gradient extends behind the status bar and icons are dark.
- [ ] **iPhone with Dynamic Island (iPhone 14 Pro / 15 / 16)**: Verify header titles and primers do not collide with Dynamic Island.
- [ ] **iPhone with Notch (iPhone 11 / 12 / 13 / 14)**: Verify top inset padding.
- [ ] **iPhone SE (Home Button, No Insets)**: Verify that zero-insets do not collapse layout spacing (minimum 12px fallback applied).
- [ ] **Keyboard Awareness**: In `CheckoutScreen`, `AddEditAddressScreen`, `EditProfileScreen`, inputs pan up cleanly above the keyboard via `useKeyboardHeight`.
- [ ] **Orientation**: Confirmed locked to portrait in `AndroidManifest.xml` (`android:screenOrientation="portrait"`) and `Info.plist` (`UISupportedInterfaceOrientations`).

---

## 8. Backend Endpoint to Screen Mapping

| Backend Endpoint | HTTP Method | Screen / Component | Query Hook |
| :--- | :--- | :--- | :--- |
| `/auth/request-otp` | `POST` | `LoginScreen`, `OtpVerifyScreen` | `useRequestOtpMutation` |
| `/auth/verify-otp` | `POST` | `OtpVerifyScreen` | `useVerifyOtpMutation` |
| `/auth/refresh` | `POST` | Axios Client Interceptor (Automatic) | Single-flight rotation |
| `/auth/logout` | `POST` | `ProfileScreen` | `useLogoutMutation` |
| `/auth/logout-all` | `POST` | `ProfileScreen` | `useLogoutAllMutation` |
| `/users/me` | `GET` | `BootstrapScreen`, `ProfileScreen` | `useMeQuery` |
| `/users/me` | `PATCH` | `EditProfileScreen` | `useUpdateMeMutation` |
| `/users/me` | `DELETE` | `ProfileScreen` (Account Deletion) | `useDeleteAccountMutation` |
| `/addresses` | `GET` | `AddressListScreen`, `LocationScreen` | `useAddressesQuery` |
| `/addresses` | `POST` | `AddEditAddressScreen` | `useCreateAddressMutation` |
| `/addresses/:id` | `PATCH` | `AddEditAddressScreen` | `useUpdateAddressMutation` |
| `/addresses/:id` | `DELETE` | `AddressListScreen` | `useDeleteAddressMutation` |
| `/addresses/:id/default`| `PATCH` | `AddressListScreen`, `AddEditAddressScreen`| `useSetDefaultAddressMutation`|
| `/stores` | `GET` | `LocationScreen`, `ProfileScreen` | `useStoresQuery` |
| `/stores/nearby` | `GET` | `LocationScreen` | `useNearbyStoresQuery` |
| `/stores/:id` | `GET` | `BootstrapScreen`, `HomeScreen` | `useStoreDetailQuery` |
| `/stores/:id/serviceability` | `GET` | `HomeScreen`, `LocationScreen` | `useStoreServiceabilityQuery` |
| `/catalog/home` | `GET` | `HomeScreen` | `useHomeCatalogQuery` |
| `/categories` | `GET` | `CategoriesScreen`, `HomeScreen` | `useCategoriesQuery` |
| `/categories/:id` | `GET` | `CategoryProductsScreen` | `useCategoryDetailQuery` |
| `/products` | `GET` | `CategoryProductsScreen`, `SearchScreen`| `useInfiniteProductsQuery`, `useProductsQuery`|
| `/products/:id` | `GET` | `ProductDetailScreen` | `useProductDetailQuery` |
| `/cart` | `GET` | `CartScreen`, `FloatingCartBar` | `useCartDetailQuery` |
| `/cart/items` | `PUT` | `ProductCard`, `ProductDetailScreen`, `CartScreen`| `useUpdateCartItemMutation` |
| `/cart/items/:productId` | `DELETE` | `CartScreen` | `useRemoveCartItemMutation` |
| `/cart/clear` | `DELETE` | `CartScreen` | `useClearCartMutation` |
| `/cart/coupon` | `POST` | `CartScreen`, `CouponSheet` | `useApplyCouponMutation` |
| `/cart/coupon` | `DELETE` | `CartScreen` | `useRemoveCouponMutation` |
| `/coupons` | `GET` | `CouponSheet`, `BannerCarousel` | `useCouponsQuery` |
| `/orders` | `POST` | `CheckoutScreen` | `useCreateOrderMutation` |
| `/orders` | `GET` | `OrdersScreen` | `useOrdersQuery` |
| `/orders/:id` | `GET` | `OrderDetailScreen` | `useOrderDetailQuery` |
| `/orders/:id/track` | `GET` | `OrderTrackScreen` | `useOrderTrackingQuery` |
| `/orders/:id/cancel` | `POST` | `OrderDetailScreen` | `useCancelOrderMutation` |
| `/orders/:id/reorder` | `POST` | `OrderDetailScreen`, `OrdersScreen`| `useReorderMutation` |

---

## 9. Known Backend Gaps & App Workarounds

1. **Promotional Banners**: The backend provides coupon codes but does not have a dedicated marketing banner endpoint. The mobile app pairs coupons returned from `GET /coupons` with vibrant local vector designs (`BannerCarousel.tsx`).
2. **Reverse Geocoding**: The backend accepts and stores lat/lng coordinates and street address strings, but does not provide reverse geocoding from GPS. The app acquires precise coordinates via GPS and allows users to input their street, landmark, and pincode.
3. **Push Notifications**: Push token registration is intentionally not implemented in the backend. Android `POST_NOTIFICATIONS` is declared for future readiness.
4. **Online Payment Gateway**: Orders support `COD` and `ONLINE`. Since a payment gateway SDK (e.g. Razorpay / Stripe) is not integrated on the backend, online payment is displayed as "Online Payment (Coming Soon)" and COD is active.
5. **Interactive Delivery Map**: Delivery coordinates and store coordinates are tracked with Euclidean distance estimation; live map rendering relies on static timeline steps from `IStatusHistoryEntry`.

---

## 10. Troubleshooting

### 1. Metro Cache Issues
If you encounter resolver or alias errors:
```bash
npx react-native start --reset-cache
```

### 2. Cleartext HTTP Traffic on Android
For local development, cleartext HTTP (`http://10.0.2.2:3000`) is enabled exclusively in:
`android/app/src/debug/AndroidManifest.xml` (`android:usesCleartextTraffic="true"`).
The production release manifest strictly disallows cleartext traffic.

### 3. Port Forwarding for Physical Android Device
If testing over a USB cable:
```bash
adb reverse tcp:3000 tcp:3000
adb reverse tcp:8081 tcp:8081
```

### 4. CocoaPods Mismatches (macOS)
```bash
cd ios
pod deintegrate
pod cache clean --all
bundle exec pod install
cd ..
```
