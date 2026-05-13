package com.example.webshop.config;

import com.example.webshop.models.Item;
import com.example.webshop.repositories.ItemRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

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
    private final ItemRepository itemRepository;

    public SchemaMigrator(JdbcTemplate jdbc, ItemRepository itemRepository) {
        this.jdbc = jdbc;
        this.itemRepository = itemRepository;
    }

    @Override
    @Transactional
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
                "UPDATE item SET is_vip = FALSE WHERE is_vip IS NULL"
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
                log.warn("Schema migration skipped (probably first boot or unsupported dialect): {} -> {}",
                        sql, e.getMessage());
            }
        }

        // Render free tier has no persistent disk, so any `fs:<filename>` tokens
        // left over from the old filesystem-based upload flow now point to deleted
        // files. Done via JPA (not raw SQL with LIKE) because `image_url` is mapped
        // via `@Lob` and on PostgreSQL becomes an OID/TEXT column where LIKE may not
        // be applicable. New uploads use `data:image/...;base64,...`.
        try {
            int cleared = 0;
            for (Item item : itemRepository.findAll()) {
                String url = item.getImageUrl();
                if (url != null && url.startsWith("fs:")) {
                    item.setImageUrl(null);
                    itemRepository.save(item);
                    cleared++;
                }
            }
            log.info("Schema migration applied (JPA): cleared fs: image_url on {} item(s)", cleared);
        } catch (Exception e) {
            log.warn("Schema migration: fs: image_url cleanup skipped: {}", e.getMessage());
        }
    }
}
