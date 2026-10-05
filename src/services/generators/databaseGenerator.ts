import { AppSpec, DatabaseTable } from '../../types';

export class DatabaseGenerator {
  /**
   * Generates the primary database.sql file containing tables, keys, and seed data.
   */
  public static generateSql(spec: AppSpec): string {
    const lines: string[] = [];

    lines.push(`-- ========================================================`);
    lines.push(`-- AppForge AI Database Schema`);
    lines.push(`-- App: ${spec.appName} (${spec.packageName})`);
    lines.push(`-- Generated: ${new Date().toISOString()}`);
    lines.push(`-- Engine: MySQL 8.0+ / MariaDB 10.5+`);
    lines.push(`-- Target: cPanel, VPS, DirectAdmin, or Local MySQL`);
    lines.push(`-- ========================================================`);
    lines.push(``);
    lines.push(`SET FOREIGN_KEY_CHECKS = 0;`);
    lines.push(`SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";`);
    lines.push(`SET time_zone = "+00:00";`);
    lines.push(``);

    // Generate each table
    for (const table of spec.tables) {
      lines.push(`-- Table structure for table \`${table.name}\``);
      lines.push(`DROP TABLE IF EXISTS \`${table.name}\`;`);
      lines.push(`CREATE TABLE \`${table.name}\` (`);

      const colDefs: string[] = [];
      const primaryKeys: string[] = [];
      const foreignKeys: string[] = [];

      for (const col of table.columns) {
        let def = `  \`${col.name}\` ${col.type}`;
        if (col.length) {
          def += `(${col.length})`;
        }
        if (!col.nullable) {
          def += ` NOT NULL`;
        } else {
          def += ` NULL`;
        }
        if (col.autoIncrement) {
          def += ` AUTO_INCREMENT`;
        }
        if (col.defaultValue !== undefined) {
          if (col.defaultValue === 'CURRENT_TIMESTAMP') {
            def += ` DEFAULT CURRENT_TIMESTAMP`;
          } else {
            def += ` DEFAULT '${col.defaultValue}'`;
          }
        }
        colDefs.push(def);

        if (col.primaryKey) {
          primaryKeys.push(`\`${col.name}\``);
        }

        if (col.foreignKey) {
          foreignKeys.push(
            `  CONSTRAINT \`fk_${table.name}_${col.name}\` FOREIGN KEY (\`${col.name}\`) REFERENCES \`${col.foreignKey.table}\` (\`${col.foreignKey.column}\`) ON DELETE ${col.foreignKey.onDelete || 'CASCADE'}`
          );
        }
      }

      if (primaryKeys.length > 0) {
        colDefs.push(`  PRIMARY KEY (${primaryKeys.join(', ')})`);
      }

      // Add indexes
      if (table.indexes && table.indexes.length > 0) {
        for (const idx of table.indexes) {
          colDefs.push(`  KEY \`idx_${table.name}_${idx}\` (\`${idx}\`)`);
        }
      }

      // Combine column definitions and foreign keys
      const allDefinitions = [...colDefs, ...foreignKeys];
      lines.push(allDefinitions.join(',\n'));
      lines.push(`) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`);
      lines.push(``);
    }

    lines.push(`SET FOREIGN_KEY_CHECKS = 1;`);
    lines.push(``);

    // Seed Data
    lines.push(`-- ========================================================`);
    lines.push(`-- Default Seed Data & Initial Admin Account`);
    lines.push(`-- ========================================================`);
    lines.push(``);

    // Roles Seed
    lines.push(`-- Default User Roles`);
    lines.push(`INSERT INTO \`roles\` (\`id\`, \`name\`, \`display_name\`, \`created_at\`) VALUES`);
    lines.push(`(1, 'admin', 'Super Administrator', NOW()),`);
    lines.push(`(2, 'moderator', 'Moderator', NOW()),`);
    lines.push(`(3, 'user', 'Regular Customer / User', NOW());`);
    lines.push(``);

    // Admin User Seed (Password is Admin@123456 hashed with standard bcrypt)
    lines.push(`-- Default Super Admin User (Password: Admin@123456)`);
    lines.push(`INSERT INTO \`users\` (\`id\`, \`role_id\`, \`name\`, \`email\`, \`password\`, \`status\`, \`created_at\`) VALUES`);
    lines.push(`(1, 1, 'System Admin', 'admin@appforge.local', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'active', NOW());`);
    lines.push(``);

    // Settings Seed
    lines.push(`-- Default App Settings`);
    lines.push(`INSERT INTO \`settings\` (\`setting_key\`, \`setting_value\`, \`group_name\`) VALUES`);
    lines.push(`('app_name', '${spec.appName.replace(/'/g, "\\'")}', 'general'),`);
    lines.push(`('app_package', '${spec.packageName}', 'general'),`);
    lines.push(`('primary_color', '${spec.theme.primaryColor}', 'theme'),`);
    lines.push(`('secondary_color', '${spec.theme.secondaryColor}', 'theme'),`);
    lines.push(`('currency', '${spec.payments.currency}', 'finance'),`);
    lines.push(`('contact_email', 'support@${spec.packageName.split('.')[1] || 'app'}.com', 'contact'),`);
    lines.push(`('stripe_mode', 'sandbox', 'payments'),`);
    lines.push(`('paypal_mode', 'sandbox', 'payments'),`);
    lines.push(`('maintenance_mode', '0', 'general');`);
    lines.push(``);

    // CMS Pages Seed
    lines.push(`-- Default Legal & Content Pages`);
    lines.push(`INSERT INTO \`pages\` (\`slug\`, \`title\`, \`content\`, \`is_published\`, \`created_at\`) VALUES`);
    lines.push(`('privacy-policy', 'Privacy Policy', '<h2>Privacy Policy</h2><p>Your privacy is strictly guarded. We collect minimal information required to deliver services.</p>', 1, NOW()),`);
    lines.push(`('terms-of-service', 'Terms & Conditions', '<h2>Terms & Conditions</h2><p>By using ${spec.appName.replace(/'/g, "\\'")}, you agree to abide by community standards and applicable laws.</p>', 1, NOW()),`);
    lines.push(`('about-us', 'About Us', '<h2>About Us</h2><p>Welcome to ${spec.appName.replace(/'/g, "\\'")}. Engineered with passion for unmatched user convenience.</p>', 1, NOW());`);
    lines.push(``);

    return lines.join('\n');
  }

  /**
   * Generates incremental migration SQL when modifying an existing project
   */
  public static generateMigration(spec: AppSpec, newModules: string[]): string {
    const lines: string[] = [];
    const timestamp = new Date().toISOString().replace(/[-:T.]/g, '').slice(0, 14);

    lines.push(`-- ========================================================`);
    lines.push(`-- Migration: V${spec.versionCode}_${timestamp}`);
    lines.push(`-- Added Modules: ${newModules.join(', ')}`);
    lines.push(`-- ========================================================`);
    lines.push(``);

    for (const table of spec.tables) {
      if (newModules.includes(table.module)) {
        lines.push(`CREATE TABLE IF NOT EXISTS \`${table.name}\` (`);
        const colDefs = table.columns.map(col => {
          let def = `  \`${col.name}\` ${col.type}`;
          if (col.length) def += `(${col.length})`;
          if (!col.nullable) def += ` NOT NULL`;
          if (col.autoIncrement) def += ` AUTO_INCREMENT`;
          if (col.defaultValue) def += ` DEFAULT '${col.defaultValue}'`;
          return def;
        });
        const pks = table.columns.filter(c => c.primaryKey).map(c => `\`${c.name}\``);
        if (pks.length > 0) colDefs.push(`  PRIMARY KEY (${pks.join(', ')})`);
        lines.push(colDefs.join(',\n'));
        lines.push(`) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`);
        lines.push(``);
      }
    }

    return lines.join('\n');
  }
}
