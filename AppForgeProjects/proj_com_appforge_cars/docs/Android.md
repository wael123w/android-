# Android Application (Flutter) Specification

- **Framework:** Flutter 3.2+
- **Minimum SDK:** API Level 24 (Android 7.0 Nougat)
- **Target SDK:** API Level 34 (Android 14)
- **Architecture:** Clean Feature-First Architecture
  - `lib/core/`: Network client, config constants, theme engine
  - `lib/features/`: Modular presentation screens and viewmodels
  - `lib/features/auth/`: JWT login and registration flows
  - `lib/features/home/`: Dynamic banners, search trigger, and item grids
  - `lib/features/details/`: Rich product cards and action CTA
  - `lib/features/checkout/`: Multi-gateway payment selector
