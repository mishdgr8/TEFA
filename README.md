# TÉFA - African Fashion Brand

Welcome to **TÉFA**, a modern e-commerce platform showcasing premium African fashion. This project is built with React, TypeScript, and Firebase to deliver a seamless shopping experience.

## Features

- **Storefront**: Browse a curated collection of African fashion with category filtering and sorting.
- **Customer Spotlight**: Interactive video reviews that auto-play on hover, highlighting community feedback.
- **Shopping Experience**: 
  - Real-time cart updates with a slide-out drawer.
  - Multi-currency support (NGN, USD, GBP, EUR).
  - Express request option for made-to-order items.
- **Admin Dashboard**:
  - Manage products, categories, and customer spotlights.
  - Upload product images and videos directly to Firebase Storage.
  - Real-time inventory updates.
- **User Accounts**: Secure authentication via Google Sign-In.

## Tech Stack

- **Frontend**: React, Vite, TypeScript
- **Styling**: CSS Modules / Scoped CSS, Lucide React (Icons)
- **State Management**: Zustand
- **Backend**: Firebase (Authentication, Firestore, Storage)
- **Animation**: Framer Motion

## Getting Started

Follow these steps to run the project locally.

### Prerequisites

- Node.js (v18 or higher recommended)
- A Firebase project

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/mishdgr8/TEFA.git
    cd TEFA
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Configure Firebase:**
    - Create a project in the [Firebase Console](https://console.firebase.google.com/).
    - Enable **Authentication** (Google & Email/Password providers).
    - Enable **Cloud Firestore** (start in test mode or set up security rules).
    - Enable **Storage**.
    - Create a `.env.local` file in the root directory and add your Firebase configuration:

    ```env
    VITE_FIREBASE_API_KEY=your_api_key
    VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
    VITE_FIREBASE_PROJECT_ID=your_project_id
    VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
    VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
    VITE_FIREBASE_APP_ID=your_app_id
    ```

4.  **Run the development server:**
    ```bash
    npm run dev
    ```

5.  **Build for production:**
    ```bash
    npm run build
    ```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.
