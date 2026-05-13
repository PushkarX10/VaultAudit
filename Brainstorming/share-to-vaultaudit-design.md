# Share to VaultAudit - Design Document

## 1. Understanding Summary
- **What:** Implementing a "Share to VaultAudit" feature via the PWA Web Share Target API, along with an in-app "Receipt Inbox/Queue".
- **Why:** To eliminate the friction of manually initiating OCR for every transaction. Users can instantly share payment confirmations from apps like GooglePay/PhonePe directly to VaultAudit.
- **Who:** VaultAudit mobile users.
- **Key Constraints:** Relies on PWA installation (Add to Home Screen) and Web Share Target support on the device's OS/Browser. Images must be stored efficiently offline until processed.
- **Explicit Non-Goals:** 
  - We are not building a fully native app (Capacitor/React Native); we are sticking to a PWA.
  - We are not doing background/silent OCR processing; text extraction happens when the user explicitly reviews the queue.

## 2. Assumptions
- Users will primarily use this on Android (Chrome/Edge), as iOS Safari has historically limited support for PWA Web Share Targets.
- We will store the shared raw images temporarily in a local IndexedDB store until the user processes them, which allows the Service Worker to save them without booting the entire React/PGLite environment.

## 3. Decision Log
- **Decision 1: Architecture format**
  - *Decided:* Progressive Web App (PWA) using Web Share Target API.
  - *Alternatives considered:* Hybrid App (Capacitor) or Native App (React Native).
  - *Why:* Keeps the project unified in a single web codebase without the overhead of native mobile toolchains, leveraging the existing Vite setup.
- **Decision 2: Image Processing Flow**
  - *Decided:* Queue the images for later processing.
  - *Alternatives considered:* Process and confirm immediately, or silently save in the background.
  - *Why:* Users often want to share the receipt quickly and return to what they were doing. Queuing allows bulk processing later without interrupting their flow.
- **Decision 3: Receiving the Shared Image**
  - *Decided:* Service Worker intercepts the `POST` share payload and writes directly to IndexedDB.
  - *Alternatives considered:* Pointing the share target to a React UI route that handles parsing the file.
  - *Why:* The Service Worker approach allows lightning-fast saving in the background without needing to wait for the React DOM to mount, resulting in a much more "native" feeling share experience.

## 4. Final Design

### Architecture & PWA Manifest
The `vite-plugin-pwa` configuration will be updated to include a `share_target`:
- **Method:** `POST`
- **Enctype:** `multipart/form-data`
- **Action:** `/receive-share`
- **Files:** Accepts `image/*`

### Service Worker Interceptor
A custom fetch event listener in the Service Worker will intercept requests to `/receive-share`. It will:
1. Parse the incoming `formData` for the image file.
2. Save the image blob to an IndexedDB object store (e.g., `vaultaudit_share_queue`).
3. Return an HTTP 303 Redirect to send the user to the app's queue UI (`/queue?success=true`).

### Application Components
- **ReceiptQueue Component (`/queue`):** A new page that reads from the `vaultaudit_share_queue` IndexedDB store. It displays thumbnails of all unprocessed shared receipts.
- **Processing:** Clicking a thumbnail from the queue passes the image blob directly to the existing VaultAudit OCR flow. Upon successful extraction and saving of the transaction, the image is deleted from the queue.

### Edge Cases
- **Data Loss:** Since it is a temporary queue, clearing site data will wipe the queue. This is acceptable for temporary processing.
- **Unsupported Devices:** Users on browsers/devices without Web Share Target v2 support simply won't see the app in their native share menu, but the core app functionality remains unaffected.
