package com.example.webshop.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfigurationSource;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final CorsConfigurationSource corsConfigurationSource;
    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(
            CorsConfigurationSource corsConfigurationSource,
            JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.corsConfigurationSource = corsConfigurationSource;
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {

        http
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/ws/**", "/ws").permitAll()
                        .requestMatchers(HttpMethod.POST, "/auth/register", "/auth/login").permitAll()
                        .requestMatchers(HttpMethod.GET, "/auth/health").permitAll()
                        .requestMatchers("/actuator/**").permitAll()
                        .requestMatchers("/health", "/health/**").permitAll()
                        // Съобщения по обяви – само с валиден JWT
                        .requestMatchers(HttpMethod.GET, "/items/messages/**").authenticated()
                        // Публичен каталог и детайли на обяви (GET)
                        .requestMatchers(HttpMethod.GET, "/items/**").permitAll()
                        // Създаване/редакция/изтриване на обяви, въпроси, отговори, ревюта
                        .requestMatchers(HttpMethod.POST, "/items", "/items/**").authenticated()
                        .requestMatchers(HttpMethod.PUT, "/items/**").authenticated()
                        .requestMatchers(HttpMethod.DELETE, "/items/**").authenticated()
                        .requestMatchers("/favorites/**").authenticated()
                        .requestMatchers("/upload/**").authenticated()
                        .requestMatchers("/item-orders/**").authenticated()
                        .requestMatchers("/vip/**").authenticated()
                        .requestMatchers("/vip-payment/**").authenticated()
                        .requestMatchers("/cart/**").authenticated()
                        .requestMatchers("/orders/**").authenticated()
                        .requestMatchers("/auth/me").authenticated()
                        .anyRequest().permitAll())
                .headers(headers -> headers.frameOptions(frame -> frame.disable()))
                .formLogin(form -> form.disable())
                .httpBasic(basic -> basic.disable())
                .cors(cors -> cors.configurationSource(corsConfigurationSource));

        return http.build();
    }
}
