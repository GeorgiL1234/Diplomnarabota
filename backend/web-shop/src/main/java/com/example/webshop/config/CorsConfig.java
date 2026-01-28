package com.example.webshop.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
public class CorsConfig {

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        
        // Позволи всички origins (за production можеш да ограничиш до конкретни домейни)
        configuration.setAllowedOrigins(List.of("*"));
        
        // Позволи всички HTTP методи
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        
        // Позволи всички headers
        configuration.setAllowedHeaders(List.of("*"));
        
        // Позволи credentials (ако е необходимо)
        configuration.setAllowCredentials(false);
        
        // Позволи всички exposed headers
        configuration.setExposedHeaders(List.of("*"));
        
        // Cache preflight заявки за 1 час
        configuration.setMaxAge(3600L);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        
        return source;
    }
}
