# Brew & Bite POS

A React and Vite cafe POS with Firebase Authentication and Cloud Firestore. Staff take orders, manage table drafts, settle bills, print invoices, and record expenses. Owners manage the catalog, tables, customers, expenses, reports, settings, and staff access. Owners can view invoice history. POS settlement requires an active staff account.

## Setup

```sh
npm ci
npm test
npm run dev
npm run build
```

The app uses the Firebase web registration for `thebillingapp` in [src/services/firebaseApp.js](src/services/firebaseApp.js). Firebase uses its own operator email and password accounts. There is no public sign-up page.

1. In [Firebase Console](https://console.firebase.google.com/project/thebillingapp/overview), create the default Cloud Firestore database if necessary and enable **Email/Password** in Authentication. Create a user for the owner. Copy the User UID.
2. Review [firestore.rules](firestore.rules) against the project’s existing Firestore rules before publishing. If the project hosts other applications, retain their rules alongside these rules. Deploy to this project with an authorized Firebase CLI session.

   ```sh
   npx firebase-tools login
   npx firebase-tools deploy --only firestore:rules --project thebillingapp
   ```

3. In the Firestore console, create `operators/{ownerUid}` with `role` set to the string `owner`, `active` set to the boolean `true`, and `name` set to the owner’s display name. The first owner sign-in creates the POS workspace.
4. Sign in as owner, open **Staff & Roles**, and enter the staff member's name, email, and password. The app creates the login and grants staff access. Select **Disable access** to suspend it.
5. Confirm the business identity, invoice prefix, paper defaults, and UPI recipient in **Cafe Settings**. Sign in separately with the staff account to bill.

## Local emulator

Use a dedicated demo project ID to keep test data separate from the live project.

```sh
npx firebase-tools emulators:start --project demo-billingapp --only auth,firestore
VITE_USE_FIREBASE_EMULATORS=true npm run dev
```

Create local users in the Auth emulator and seed the initial owner profile in the Firestore emulator. The production build always uses the registered Firebase project. Production setup instructions are also covered in the [Firebase web SDK guide](https://firebase.google.com/docs/web/setup).

## Operating behavior

- Firestore stores shared business data. Checkout needs a connection and records success after the invoice, table release, and customer update commit. An unpaid counter draft is retained across refreshes in that browser tab. Shared table drafts follow their tables. Starting a table order from a populated counter bill offers a choice to transfer the items or leave them at the counter.
- UPI QR codes request payment. Staff confirm the transfer in the payment app or Card approval on the external terminal before completing the bill. Firestore does not receive a provider settlement callback. An owner can enable recording full manual refunds. Staff return the funds through the original payment method before recording the refund. Original invoices stay in history. Customer visit and spend totals represent gross activity.
- Staff can view and record their own cash expenses. Owners can view and record expenses across the workspace.
- Reports use India time, weeks begin Monday, and new bills apply discounts to menu prices without adding GST. New invoices save merchant details at settlement. Reprints of older invoices show their stored tax amounts and totals. Use your driver’s appropriate paper preset for the selected print format.
