package com.example.webshop;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import java.net.URI;

@SpringBootApplication
public class WebShopApplication {

    public static void main(String[] args) {
        configureDatasourceFromDatabaseUrl();
        SpringApplication.run(WebShopApplication.class, args);
    }

    private static void configureDatasourceFromDatabaseUrl() {
        String activeProfiles = System.getenv("SPRING_PROFILES_ACTIVE");
        boolean productionProfile = activeProfiles != null && activeProfiles.contains("production");
        if (!productionProfile) {
            return;
        }

        String configuredDatasourceUrl = System.getProperty("spring.datasource.url");
        if (configuredDatasourceUrl == null || configuredDatasourceUrl.isBlank()) {
            configuredDatasourceUrl = System.getenv("SPRING_DATASOURCE_URL");
        }
        if (configuredDatasourceUrl != null && !configuredDatasourceUrl.isBlank()) {
            return;
        }

        String databaseUrl = System.getenv("DATABASE_URL");
        if (databaseUrl == null || databaseUrl.isBlank()) {
            return;
        }

        String jdbcUrl = toJdbcUrl(databaseUrl);
        if (jdbcUrl == null) {
            return;
        }

        System.setProperty("spring.datasource.url", jdbcUrl);
        setDatasourceCredentialsFromUri(databaseUrl);
    }

    private static String toJdbcUrl(String databaseUrl) {
        if (databaseUrl.startsWith("jdbc:postgresql://")) {
            return databaseUrl;
        }
        if (!databaseUrl.startsWith("postgres://") && !databaseUrl.startsWith("postgresql://")) {
            return null;
        }

        URI uri = URI.create(databaseUrl);
        String host = uri.getHost();
        String dbName = uri.getPath() == null ? "" : uri.getPath().replaceFirst("^/", "");
        int port = uri.getPort() == -1 ? 5432 : uri.getPort();
        if (host == null || host.isBlank() || dbName.isBlank()) {
            return null;
        }

        String query = uri.getQuery();
        if (query == null || query.isBlank()) {
            query = "sslmode=require";
        }
        return "jdbc:postgresql://" + host + ":" + port + "/" + dbName + "?" + query;
    }

    private static void setDatasourceCredentialsFromUri(String databaseUrl) {
        URI uri = URI.create(databaseUrl);
        String userInfo = uri.getUserInfo();
        if (userInfo == null || userInfo.isBlank()) {
            return;
        }

        String[] parts = userInfo.split(":", 2);
        if ((System.getProperty("spring.datasource.username") == null || System.getProperty("spring.datasource.username").isBlank())
                && (System.getenv("SPRING_DATASOURCE_USERNAME") == null || System.getenv("SPRING_DATASOURCE_USERNAME").isBlank())
                && parts.length >= 1 && !parts[0].isBlank()) {
            System.setProperty("spring.datasource.username", parts[0]);
        }
        if ((System.getProperty("spring.datasource.password") == null || System.getProperty("spring.datasource.password").isBlank())
                && (System.getenv("SPRING_DATASOURCE_PASSWORD") == null || System.getenv("SPRING_DATASOURCE_PASSWORD").isBlank())
                && parts.length == 2 && !parts[1].isBlank()) {
            System.setProperty("spring.datasource.password", parts[1]);
        }
    }
}
