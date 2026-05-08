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
        String configuredDatasourceUrl = System.getProperty("spring.datasource.url");
        if (configuredDatasourceUrl == null || configuredDatasourceUrl.isBlank()) {
            configuredDatasourceUrl = System.getenv("SPRING_DATASOURCE_URL");
        }

        if (configuredDatasourceUrl != null && !configuredDatasourceUrl.isBlank() && !isLocalhostDatasourceUrl(configuredDatasourceUrl)) {
            return;
        }

        String databaseUrl = System.getenv("DATABASE_URL");
        if (databaseUrl != null && !databaseUrl.isBlank()) {
            String jdbcUrl = toJdbcUrl(databaseUrl);
            if (jdbcUrl == null) {
                return;
            }
            System.setProperty("spring.datasource.url", jdbcUrl);
            setDatasourceCredentialsFromUri(databaseUrl);
            return;
        }

        String jdbcUrlFromEnvVars = toJdbcUrlFromDiscreteEnv();
        if (jdbcUrlFromEnvVars == null) {
            return;
        }
        System.setProperty("spring.datasource.url", jdbcUrlFromEnvVars);
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

    private static String toJdbcUrlFromDiscreteEnv() {
        String host = firstNonBlank(System.getenv("DB_HOST"), System.getenv("PGHOST"));
        String port = firstNonBlank(System.getenv("DB_PORT"), System.getenv("PGPORT"));
        String dbName = firstNonBlank(System.getenv("DB_NAME"), System.getenv("PGDATABASE"));
        String sslMode = firstNonBlank(System.getenv("DB_SSLMODE"), System.getenv("PGSSLMODE"), "require");

        if (host == null || dbName == null) {
            return null;
        }
        if (port == null) {
            port = "5432";
        }

        String user = firstNonBlank(System.getenv("SPRING_DATASOURCE_USERNAME"), System.getenv("DB_USER"), System.getenv("PGUSER"));
        String password = firstNonBlank(System.getenv("SPRING_DATASOURCE_PASSWORD"), System.getenv("DB_PASSWORD"), System.getenv("PGPASSWORD"));

        if ((System.getProperty("spring.datasource.username") == null || System.getProperty("spring.datasource.username").isBlank())
                && user != null) {
            System.setProperty("spring.datasource.username", user);
        }
        if ((System.getProperty("spring.datasource.password") == null || System.getProperty("spring.datasource.password").isBlank())
                && password != null) {
            System.setProperty("spring.datasource.password", password);
        }

        return "jdbc:postgresql://" + host + ":" + port + "/" + dbName + "?sslmode=" + sslMode;
    }

    private static String firstNonBlank(String... values) {
        for (String value : values) {
            if (value != null && !value.isBlank()) {
                return value;
            }
        }
        return null;
    }

    private static boolean isLocalhostDatasourceUrl(String datasourceUrl) {
        String normalized = datasourceUrl.toLowerCase();
        return normalized.contains("localhost") || normalized.contains("127.0.0.1") || normalized.contains("0.0.0.0");
    }
}
