# Admin Panel Documentation

The administration system is located at `/admin` and does not require complex build steps or node modules on the hosting server.

### Features
- **Authentication Guard:** Protected by session tokens and database role checks (`role_id = 1`).
- **Dynamic Entity CRUD:** Browse, search, filter, approve, reject, and delete records.
- **CMS Manager:** Instant editing of Privacy Policy, Terms of Service, and About Us pages.
- **Payment Keys Manager:** Safely store Stripe and PayPal production or sandbox keys in the database.
