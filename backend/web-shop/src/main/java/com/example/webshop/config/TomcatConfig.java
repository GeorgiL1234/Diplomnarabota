package com.example.webshop.config;

import org.springframework.boot.web.embedded.tomcat.TomcatServletWebServerFactory;
import org.springframework.boot.web.server.WebServerFactoryCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Увеличава maxPostSize за Tomcat - необходимо за JSON body с base64 снимки.
 * Default е 2MB, което е твърде малко за data URI на компресирана снимка.
 */
@Configuration
public class TomcatConfig {

    private static final int MAX_POST_SIZE_MB = 20;

    @Bean
    public WebServerFactoryCustomizer<TomcatServletWebServerFactory> tomcatCustomizer() {
        return factory -> factory.addConnectorCustomizers(connector ->
                connector.setMaxPostSize(MAX_POST_SIZE_MB * 1024 * 1024)
        );
    }
}
