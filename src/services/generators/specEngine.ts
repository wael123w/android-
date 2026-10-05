import { AppSpec, DatabaseTable, DatabaseColumn, ApiEndpoint, AdminPage, AndroidScreen } from '../../types';

export class SpecEngine {
  /**
   * Generates a comprehensive AppSpec from user natural language prompt and options
   */
  public static createSpecification(
    prompt: string,
    options: {
      appName?: string;
      packageName?: string;
      primaryColor?: string;
      secondaryColor?: string;
      currency?: string;
      aiProvider?: string;
    } = {}
  ): AppSpec {
    const lowerPrompt = prompt.toLowerCase();
    
    // Detect category
    let category = 'E-Commerce / Marketplace';
    let entityName = 'item';
    let entityPlural = 'items';
    let isCarMarketplace = false;
    let isRestaurant = false;
    let isRealEstate = false;

    if (lowerPrompt.includes('سيار') || lowerPrompt.includes('car') || lowerPrompt.includes('auto') || lowerPrompt.includes('vehicle')) {
      category = 'Automotive Marketplace';
      entityName = 'car';
      entityPlural = 'cars';
      isCarMarketplace = true;
    } else if (lowerPrompt.includes('مطعم') || lowerPrompt.includes('طعام') || lowerPrompt.includes('وجب') || lowerPrompt.includes('food') || lowerPrompt.includes('restaurant')) {
      category = 'Food Delivery & Restaurant';
      entityName = 'food_item';
      entityPlural = 'food_items';
      isRestaurant = true;
    } else if (lowerPrompt.includes('عقار') || lowerPrompt.includes('شقق') || lowerPrompt.includes('real estate') || lowerPrompt.includes('property')) {
      category = 'Real Estate & Properties';
      entityName = 'property';
      entityPlural = 'properties';
      isRealEstate = true;
    }

    const appName = options.appName || (
      isCarMarketplace ? 'AutoForge Marketplace' :
      isRestaurant ? 'FastBite App' :
      isRealEstate ? 'EstateForge' : 'AppForge Mobile'
    );

    const packageName = options.packageName || `com.appforge.${appName.toLowerCase().replace(/[^a-z0-9]/g, '')}`;

    // Modules detection
    const hasAuth = true;
    const hasPayments = lowerPrompt.includes('دفع') || lowerPrompt.includes('pay') || lowerPrompt.includes('stripe') || lowerPrompt.includes('paypal') || true;
    const hasMessaging = lowerPrompt.includes('محادث') || lowerPrompt.includes('chat') || lowerPrompt.includes('رسائل') || lowerPrompt.includes('message');
    const hasFavorites = lowerPrompt.includes('مفضل') || lowerPrompt.includes('favorite') || lowerPrompt.includes('wishlist') || true;
    const hasReviews = lowerPrompt.includes('تقييم') || lowerPrompt.includes('review') || lowerPrompt.includes('rating') || true;
    const hasNotifications = lowerPrompt.includes('إشعار') || lowerPrompt.includes('notif') || true;
    const hasCoupons = lowerPrompt.includes('كوبون') || lowerPrompt.includes('coupon') || lowerPrompt.includes('discount');

    // Build database tables
    const tables: DatabaseTable[] = [];

    // 1. Roles table
    tables.push({
      name: 'roles',
      description: 'User access levels and authorization roles',
      module: 'core',
      columns: [
        { name: 'id', type: 'INT', nullable: false, primaryKey: true, autoIncrement: true },
        { name: 'name', type: 'VARCHAR', length: '50', nullable: false },
        { name: 'display_name', type: 'VARCHAR', length: '100', nullable: false },
        { name: 'created_at', type: 'TIMESTAMP', nullable: false, defaultValue: 'CURRENT_TIMESTAMP' }
      ]
    });

    // 2. Users table
    tables.push({
      name: 'users',
      description: 'User accounts, hashed credentials, and profiles',
      module: 'auth',
      columns: [
        { name: 'id', type: 'INT', nullable: false, primaryKey: true, autoIncrement: true },
        { name: 'role_id', type: 'INT', nullable: false, defaultValue: '3', foreignKey: { table: 'roles', column: 'id', onDelete: 'RESTRICT' } },
        { name: 'name', type: 'VARCHAR', length: '150', nullable: false },
        { name: 'email', type: 'VARCHAR', length: '191', nullable: false },
        { name: 'password', type: 'VARCHAR', length: '255', nullable: false },
        { name: 'phone', type: 'VARCHAR', length: '50', nullable: true },
        { name: 'avatar', type: 'VARCHAR', length: '255', nullable: true },
        { name: 'status', type: 'ENUM', length: "'active','pending','banned'", nullable: false, defaultValue: 'active' },
        { name: 'created_at', type: 'TIMESTAMP', nullable: false, defaultValue: 'CURRENT_TIMESTAMP' }
      ],
      indexes: ['email', 'role_id']
    });

    // 3. Categories table
    tables.push({
      name: 'categories',
      description: 'Hierarchical catalog categories',
      module: 'catalog',
      columns: [
        { name: 'id', type: 'INT', nullable: false, primaryKey: true, autoIncrement: true },
        { name: 'name', type: 'VARCHAR', length: '100', nullable: false },
        { name: 'slug', type: 'VARCHAR', length: '120', nullable: false },
        { name: 'icon', type: 'VARCHAR', length: '50', nullable: true },
        { name: 'image', type: 'VARCHAR', length: '255', nullable: true },
        { name: 'sort_order', type: 'INT', nullable: false, defaultValue: '0' },
        { name: 'is_active', type: 'BOOLEAN', nullable: false, defaultValue: '1' }
      ]
    });

    // 4. Primary Business Entity Table (e.g. cars, properties, products)
    const entityColumns: DatabaseColumn[] = [
      { name: 'id', type: 'INT', nullable: false, primaryKey: true, autoIncrement: true },
      { name: 'user_id', type: 'INT', nullable: false, foreignKey: { table: 'users', column: 'id', onDelete: 'CASCADE' } },
      { name: 'category_id', type: 'INT', nullable: false, foreignKey: { table: 'categories', column: 'id', onDelete: 'RESTRICT' } },
      { name: 'title', type: 'VARCHAR', length: '200', nullable: false },
      { name: 'description', type: 'TEXT', nullable: true },
      { name: 'price', type: 'DECIMAL', length: '12,2', nullable: false, defaultValue: '0.00' },
      { name: 'currency', type: 'VARCHAR', length: '10', nullable: false, defaultValue: options.currency || 'USD' },
      { name: 'status', type: 'ENUM', length: "'pending','approved','active','sold','inactive'", nullable: false, defaultValue: 'pending' },
      { name: 'views_count', type: 'INT', nullable: false, defaultValue: '0' },
      { name: 'created_at', type: 'TIMESTAMP', nullable: false, defaultValue: 'CURRENT_TIMESTAMP' }
    ];

    if (isCarMarketplace) {
      entityColumns.push(
        { name: 'brand', type: 'VARCHAR', length: '80', nullable: false, defaultValue: 'General' },
        { name: 'model', type: 'VARCHAR', length: '80', nullable: false, defaultValue: 'Standard' },
        { name: 'year', type: 'INT', nullable: false, defaultValue: '2023' },
        { name: 'mileage', type: 'INT', nullable: false, defaultValue: '0' },
        { name: 'transmission', type: 'VARCHAR', length: '30', nullable: true, defaultValue: 'Automatic' },
        { name: 'fuel_type', type: 'VARCHAR', length: '30', nullable: true, defaultValue: 'Petrol' },
        { name: 'location', type: 'VARCHAR', length: '150', nullable: true, defaultValue: 'Downtown' }
      );
    }

    tables.push({
      name: entityPlural,
      description: `Primary ${entityPlural} catalog records`,
      module: entityPlural,
      columns: entityColumns,
      indexes: ['user_id', 'category_id', 'status']
    });

    // 5. Entity Images
    tables.push({
      name: `${entityName}_images`,
      description: `High resolution gallery photos for ${entityPlural}`,
      module: entityPlural,
      columns: [
        { name: 'id', type: 'INT', nullable: false, primaryKey: true, autoIncrement: true },
        { name: `${entityName}_id`, type: 'INT', nullable: false, foreignKey: { table: entityPlural, column: 'id', onDelete: 'CASCADE' } },
        { name: 'image_url', type: 'VARCHAR', length: '255', nullable: false },
        { name: 'is_featured', type: 'BOOLEAN', nullable: false, defaultValue: '0' },
        { name: 'sort_order', type: 'INT', nullable: false, defaultValue: '0' }
      ]
    });

    // 6. Favorites
    if (hasFavorites) {
      tables.push({
        name: 'favorites',
        description: 'User bookmarks and saved wishlists',
        module: 'favorites',
        columns: [
          { name: 'id', type: 'INT', nullable: false, primaryKey: true, autoIncrement: true },
          { name: 'user_id', type: 'INT', nullable: false, foreignKey: { table: 'users', column: 'id', onDelete: 'CASCADE' } },
          { name: `${entityName}_id`, type: 'INT', nullable: false, foreignKey: { table: entityPlural, column: 'id', onDelete: 'CASCADE' } },
          { name: 'created_at', type: 'TIMESTAMP', nullable: false, defaultValue: 'CURRENT_TIMESTAMP' }
        ]
      });
    }

    // 7. Messages & Conversations
    if (hasMessaging) {
      tables.push({
        name: 'messages',
        description: 'In-app real-time messaging between users and buyers/sellers',
        module: 'messaging',
        columns: [
          { name: 'id', type: 'INT', nullable: false, primaryKey: true, autoIncrement: true },
          { name: 'sender_id', type: 'INT', nullable: false, foreignKey: { table: 'users', column: 'id', onDelete: 'CASCADE' } },
          { name: 'receiver_id', type: 'INT', nullable: false, foreignKey: { table: 'users', column: 'id', onDelete: 'CASCADE' } },
          { name: `${entityName}_id`, type: 'INT', nullable: true, foreignKey: { table: entityPlural, column: 'id', onDelete: 'SET NULL' } },
          { name: 'message_text', type: 'TEXT', nullable: false },
          { name: 'is_read', type: 'BOOLEAN', nullable: false, defaultValue: '0' },
          { name: 'created_at', type: 'TIMESTAMP', nullable: false, defaultValue: 'CURRENT_TIMESTAMP' }
        ]
      });
    }

    // 8. Payments & Orders
    if (hasPayments) {
      tables.push({
        name: 'payments',
        description: 'Payment transactions, receipts, and settlement records',
        module: 'payments',
        columns: [
          { name: 'id', type: 'INT', nullable: false, primaryKey: true, autoIncrement: true },
          { name: 'user_id', type: 'INT', nullable: false, foreignKey: { table: 'users', column: 'id', onDelete: 'RESTRICT' } },
          { name: 'transaction_id', type: 'VARCHAR', length: '100', nullable: false },
          { name: 'gateway', type: 'VARCHAR', length: '50', nullable: false },
          { name: 'amount', type: 'DECIMAL', length: '12,2', nullable: false },
          { name: 'currency', type: 'VARCHAR', length: '10', nullable: false, defaultValue: 'USD' },
          { name: 'status', type: 'ENUM', length: "'pending','completed','failed','refunded'", nullable: false, defaultValue: 'pending' },
          { name: 'created_at', type: 'TIMESTAMP', nullable: false, defaultValue: 'CURRENT_TIMESTAMP' }
        ]
      });
    }

    // 9. Coupons table (if requested or added via edit)
    if (hasCoupons) {
      tables.push({
        name: 'coupons',
        description: 'Promotional discount voucher codes',
        module: 'coupons',
        columns: [
          { name: 'id', type: 'INT', nullable: false, primaryKey: true, autoIncrement: true },
          { name: 'code', type: 'VARCHAR', length: '30', nullable: false },
          { name: 'discount_type', type: 'ENUM', length: "'percentage','fixed'", nullable: false, defaultValue: 'percentage' },
          { name: 'discount_value', type: 'DECIMAL', length: '8,2', nullable: false },
          { name: 'min_order_amount', type: 'DECIMAL', length: '10,2', nullable: true, defaultValue: '0.00' },
          { name: 'usage_limit', type: 'INT', nullable: false, defaultValue: '100' },
          { name: 'expires_at', type: 'DATE', nullable: true },
          { name: 'is_active', type: 'BOOLEAN', nullable: false, defaultValue: '1' }
        ]
      });
    }

    // 10. Reviews
    if (hasReviews) {
      tables.push({
        name: 'reviews',
        description: 'Verified ratings and customer feedback',
        module: 'reviews',
        columns: [
          { name: 'id', type: 'INT', nullable: false, primaryKey: true, autoIncrement: true },
          { name: 'user_id', type: 'INT', nullable: false, foreignKey: { table: 'users', column: 'id', onDelete: 'CASCADE' } },
          { name: `${entityName}_id`, type: 'INT', nullable: false, foreignKey: { table: entityPlural, column: 'id', onDelete: 'CASCADE' } },
          { name: 'rating', type: 'INT', nullable: false, defaultValue: '5' },
          { name: 'comment', type: 'TEXT', nullable: true },
          { name: 'created_at', type: 'TIMESTAMP', nullable: false, defaultValue: 'CURRENT_TIMESTAMP' }
        ]
      });
    }

    // 11. Notifications
    tables.push({
      name: 'notifications',
      description: 'System and activity push alert logs',
      module: 'notifications',
      columns: [
        { name: 'id', type: 'INT', nullable: false, primaryKey: true, autoIncrement: true },
        { name: 'user_id', type: 'INT', nullable: false, foreignKey: { table: 'users', column: 'id', onDelete: 'CASCADE' } },
        { name: 'title', type: 'VARCHAR', length: '150', nullable: false },
        { name: 'body', type: 'TEXT', nullable: false },
        { name: 'is_read', type: 'BOOLEAN', nullable: false, defaultValue: '0' },
        { name: 'created_at', type: 'TIMESTAMP', nullable: false, defaultValue: 'CURRENT_TIMESTAMP' }
      ]
    });

    // 12. Settings & CMS
    tables.push({
      name: 'settings',
      description: 'Application branding, contact info, and payment parameters',
      module: 'system',
      columns: [
        { name: 'id', type: 'INT', nullable: false, primaryKey: true, autoIncrement: true },
        { name: 'setting_key', type: 'VARCHAR', length: '80', nullable: false },
        { name: 'setting_value', type: 'TEXT', nullable: true },
        { name: 'group_name', type: 'VARCHAR', length: '50', nullable: false, defaultValue: 'general' }
      ]
    });

    tables.push({
      name: 'pages',
      description: 'Legal policies and content management pages',
      module: 'content',
      columns: [
        { name: 'id', type: 'INT', nullable: false, primaryKey: true, autoIncrement: true },
        { name: 'slug', type: 'VARCHAR', length: '100', nullable: false },
        { name: 'title', type: 'VARCHAR', length: '150', nullable: false },
        { name: 'content', type: 'LONGTEXT', nullable: true },
        { name: 'is_published', type: 'BOOLEAN', nullable: false, defaultValue: '1' },
        { name: 'created_at', type: 'TIMESTAMP', nullable: false, defaultValue: 'CURRENT_TIMESTAMP' }
      ]
    });

    // API Endpoints
    const endpoints: ApiEndpoint[] = [
      { method: 'POST', path: '/api/auth/register', description: 'User registration with bcrypt password encryption', module: 'auth', authRequired: false },
      { method: 'POST', path: '/api/auth/login', description: 'Authenticate user and issue JWT bearer token', module: 'auth', authRequired: false },
      { method: 'GET', path: '/api/auth/me', description: 'Retrieve authenticated user session profile', module: 'auth', authRequired: true },
      { method: 'GET', path: `/api/${entityPlural}`, description: `Paginated search and filter for ${entityPlural}`, module: entityPlural, authRequired: false },
      { method: 'GET', path: `/api/${entityPlural}/:id`, description: `Get single record details for ${entityName}`, module: entityPlural, authRequired: false },
      { method: 'POST', path: `/api/${entityPlural}`, description: `Submit new ${entityName} with admin review workflow`, module: entityPlural, authRequired: true },
      { method: 'PUT', path: `/api/${entityPlural}/:id`, description: `Update owned ${entityName} parameters`, module: entityPlural, authRequired: true },
      { method: 'DELETE', path: `/api/${entityPlural}/:id`, description: `Remove ${entityName} listing`, module: entityPlural, authRequired: true },
      { method: 'POST', path: '/api/upload', description: 'Secure multi-format image upload handler', module: 'upload', authRequired: true },
      { method: 'POST', path: '/api/payments', description: 'Process checkout transaction via Stripe or PayPal', module: 'payments', authRequired: true },
      { method: 'GET', path: '/api/pages/:slug', description: 'Read legal pages (privacy, terms, refund)', module: 'content', authRequired: false }
    ];

    // Admin Pages
    const adminPages: AdminPage[] = [
      { slug: 'users', title: 'User Management', module: 'auth', icon: 'users', table: 'users', supportsCreate: true, supportsEdit: true, supportsDelete: true, supportsExport: true, searchColumns: ['name', 'email'] },
      { slug: entityPlural, title: `${isCarMarketplace ? 'Cars Catalog' : isRestaurant ? 'Food Menu' : 'Catalog Items'}`, module: entityPlural, icon: isCarMarketplace ? 'car' : isRestaurant ? 'utensils' : 'box-open', table: entityPlural, supportsCreate: true, supportsEdit: true, supportsDelete: true, supportsExport: true, supportsApproval: true, searchColumns: ['title'] },
      { slug: 'categories', title: 'Categories', module: 'catalog', icon: 'tags', table: 'categories', supportsCreate: true, supportsEdit: true, supportsDelete: true, supportsExport: false, searchColumns: ['name'] },
      { slug: 'payments', title: 'Payments & Revenue', module: 'payments', icon: 'credit-card', table: 'payments', supportsCreate: false, supportsEdit: false, supportsDelete: false, supportsExport: true, searchColumns: ['transaction_id'] }
    ];

    if (hasCoupons) {
      adminPages.push({
        slug: 'coupons',
        title: 'Coupons & Discounts',
        module: 'coupons',
        icon: 'ticket',
        table: 'coupons',
        supportsCreate: true,
        supportsEdit: true,
        supportsDelete: true,
        supportsExport: true,
        searchColumns: ['code']
      });
    }

    // Android Screens
    const androidScreens: AndroidScreen[] = [
      { id: 'home', title: 'Home Discovery', module: 'core', route: '/home', type: 'dashboard', description: 'Main browsing hub with hero banner and featured cards', widgets: ['SearchBar', 'BannerCarousel', 'CategoryChips', 'FeaturedGrid'] },
      { id: 'details', title: `${entityName.toUpperCase()} Details`, module: entityPlural, route: '/details', type: 'detail', description: 'Detailed view with photo gallery, specs, and order button', widgets: ['ImageSlider', 'TitleAndPrice', 'SpecTable', 'ContactSellerCTA'] },
      { id: 'search', title: 'Search & Filters', module: 'catalog', route: '/search', type: 'list', description: 'Multi-criteria filter with price range and sort order', widgets: ['FilterSheet', 'SearchResults'] },
      { id: 'auth_login', title: 'Sign In', module: 'auth', route: '/login', type: 'auth', description: 'Email and password authentication', widgets: ['EmailField', 'PasswordField', 'SubmitButton'] },
      { id: 'checkout', title: 'Checkout & Pay', module: 'payments', route: '/checkout', type: 'form', description: 'Select Stripe or PayPal gateway', widgets: ['OrderSummary', 'PaymentMethodSelector', 'PayButton'] },
      { id: 'profile', title: 'User Account', module: 'profile', route: '/profile', type: 'profile', description: 'Profile information and orders history', widgets: ['AvatarHeader', 'ListTiles', 'LogoutButton'] }
    ];

    return {
      appName,
      packageName,
      version: '1.0.0',
      versionCode: 1,
      description: prompt,
      category,
      theme: {
        primaryColor: options.primaryColor || '#4F46E5',
        secondaryColor: options.secondaryColor || '#6366F1',
        accentColor: '#10B981',
        backgroundColor: '#F8FAFC',
        darkBackgroundColor: '#0F172A',
        fontFamily: 'Roboto'
      },
      backend: {
        type: 'php',
        phpVersion: '8.2+',
        databaseType: 'mysql',
        authType: 'jwt',
        uploadStorage: 'local_storage',
        cpanelCompatible: true
      },
      payments: {
        enabled: hasPayments,
        gateways: ['stripe', 'paypal', 'manual'],
        currency: options.currency || 'USD'
      },
      modules: {
        auth: hasAuth,
        catalog: true,
        [entityPlural]: true,
        favorites: hasFavorites,
        messaging: hasMessaging,
        payments: hasPayments,
        reviews: hasReviews,
        notifications: hasNotifications,
        coupons: hasCoupons,
        adminPanel: true,
        pages: true
      },
      tables,
      endpoints,
      adminPages,
      androidScreens,
      cmsPages: {
        privacyPolicy: true,
        termsAndConditions: true,
        aboutUs: true,
        contactUs: true,
        refundPolicy: true
      }
    };
  }

  /**
   * Modifies an existing AppSpec when user requests incremental edits
   * (e.g. "Add coupons system" or "Add Google login")
   */
  public static applyModification(currentSpec: AppSpec, modificationPrompt: string): { updatedSpec: AppSpec; newModules: string[]; summary: string } {
    const updated = JSON.parse(JSON.stringify(currentSpec)) as AppSpec;
    const lower = modificationPrompt.toLowerCase();
    const newModules: string[] = [];
    const summaries: string[] = [];

    // Increment version
    updated.versionCode += 1;
    const parts = updated.version.split('.');
    parts[parts.length - 1] = String(parseInt(parts[parts.length - 1] || '0') + 1);
    updated.version = parts.join('.');

    // Check for Coupons
    if ((lower.includes('كوبون') || lower.includes('coupon') || lower.includes('discount')) && !updated.modules.coupons) {
      updated.modules.coupons = true;
      newModules.push('coupons');
      summaries.push('Added Coupons and Discount Voucher module');

      updated.tables.push({
        name: 'coupons',
        description: 'Discount codes and voucher thresholds',
        module: 'coupons',
        columns: [
          { name: 'id', type: 'INT', nullable: false, primaryKey: true, autoIncrement: true },
          { name: 'code', type: 'VARCHAR', length: '30', nullable: false },
          { name: 'discount_type', type: 'ENUM', length: "'percentage','fixed'", nullable: false, defaultValue: 'percentage' },
          { name: 'discount_value', type: 'DECIMAL', length: '8,2', nullable: false },
          { name: 'min_order_amount', type: 'DECIMAL', length: '10,2', nullable: true, defaultValue: '0.00' },
          { name: 'usage_limit', type: 'INT', nullable: false, defaultValue: '100' },
          { name: 'expires_at', type: 'DATE', nullable: true },
          { name: 'is_active', type: 'BOOLEAN', nullable: false, defaultValue: '1' }
        ]
      });

      updated.endpoints.push({
        method: 'POST',
        path: '/api/coupons/validate',
        description: 'Verify coupon validity and calculate discount amount',
        module: 'coupons',
        authRequired: true
      });

      updated.adminPages.push({
        slug: 'coupons',
        title: 'Coupons Management',
        module: 'coupons',
        icon: 'ticket',
        table: 'coupons',
        supportsCreate: true,
        supportsEdit: true,
        supportsDelete: true,
        supportsExport: true,
        searchColumns: ['code']
      });
    }

    // Check for Admin Approval Workflow
    if (lower.includes('موافق') || lower.includes('approval') || lower.includes('approve')) {
      summaries.push('Configured strict administrative approval workflow for listings');
      // Ensure status column exists and default to pending
      for (const t of updated.tables) {
        if (t.name.includes('car') || t.name.includes('item') || t.name.includes('property') || t.name.includes('food')) {
          const statusCol = t.columns.find(c => c.name === 'status');
          if (statusCol) {
            statusCol.defaultValue = 'pending';
          }
        }
      }
    }

    // Check for Stripe
    if ((lower.includes('stripe') || lower.includes('دفع')) && !updated.payments.gateways.includes('stripe')) {
      updated.payments.gateways.push('stripe');
      summaries.push('Configured Stripe payment gateway support');
    }

    const summary = summaries.length > 0 ? summaries.join('. ') : `Applied modifications for: "${modificationPrompt.slice(0, 60)}"`;

    return {
      updatedSpec: updated,
      newModules,
      summary
    };
  }
}
