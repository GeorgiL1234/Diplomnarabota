package com.example.webshop.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Idempotent schema migrator. Defensive `ADD COLUMN IF NOT EXISTS` for tables
 * that exist in older Render deployments where Hibernate `ddl-auto=update`
 * silently skipped adding new non-null columns. Runs before any other
 * ApplicationRunner (e.g. DataInitializer) so the rest of the app can rely
 * on the latest schema.
 *
 * Supported dialects:
 *  - PostgreSQL (production, Render): native IF NOT EXISTS support.
 *  - H2 (local/dev profile): supports IF NOT EXISTS since 2.0.
 */
@Component
@Order(0)
public class SchemaMigrator implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(SchemaMigrator.class);

    private final JdbcTemplate jdbc;

    public SchemaMigrator(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    @Override
    public void run(ApplicationArguments args) {
        List<String> statements = List.of(
                // item table – the column that was returning "column i1_0.sold does not exist"
                "ALTER TABLE item ADD COLUMN IF NOT EXISTS sold BOOLEAN DEFAULT FALSE",
                "ALTER TABLE item ADD COLUMN IF NOT EXISTS is_vip BOOLEAN DEFAULT FALSE",
                "ALTER TABLE item ADD COLUMN IF NOT EXISTS owner_email VARCHAR(255)",
                "ALTER TABLE item ADD COLUMN IF NOT EXISTS category VARCHAR(255)",
                "ALTER TABLE item ADD COLUMN IF NOT EXISTS contact_email VARCHAR(255)",
                "ALTER TABLE item ADD COLUMN IF NOT EXISTS contact_phone VARCHAR(255)",
                "ALTER TABLE item ADD COLUMN IF NOT EXISTS payment_method VARCHAR(255)",
                // Backfill any rows that pre-existed before we added these columns
                "UPDATE item SET sold = FALSE WHERE sold IS NULL",
                "UPDATE item SET is_vip = FALSE WHERE is_vip IS NULL",
                // Render free tier has no persistent disk, so any `fs:<filename>`
                // tokens left over from the old filesystem-based upload flow now
                // point to deleted files. Wipe them so the UI shows the
                // placeholder rather than a broken image. New uploads are
                // stored as `data:image/...;base64,...` and survive restarts.
                "UPDATE item SET image_url = NULL WHERE image_url LIKE 'fs:%'"
        );

        for (String sql : statements) {
            try {
                if (sql.startsWith("UPDATE ")) {
                    int rows = jdbc.update(sql);
                    log.info("Schema migration applied ({} rows): {}", rows, sql);
                } else {
                    jdbc.execute(sql);
                    log.info("Schema migration applied: {}", sql);
                }
            } catch (Exception e) {
                // Don't crash the app if the item table doesn't exist yet (fresh install)
                // or if a dialect doesn't recognize a statement – the JPA layer will
                // create the table from scratch with the correct schema.
                log.warn("Schema migration skipped (probably first boot or unsupported dialect): {} -> {}",
                        sql, e.getMessage());
            }
        }
    }
}
