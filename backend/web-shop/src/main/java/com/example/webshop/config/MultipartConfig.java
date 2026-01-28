package com.example.webshop.config;

import org.springframework.boot.web.servlet.MultipartConfigFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.util.unit.DataSize;
import org.springframework.web.multipart.MultipartResolver;
import org.springframework.web.multipart.support.StandardServletMultipartResolver;

import jakarta.servlet.MultipartConfigElement;

@Configuration
public class MultipartConfig {

    /**
     * Конфигурира multipart resolver да държи файловете в паметта вместо на диска.
     * Това е необходимо за Render.com, където файловата система е ефемерна.
     */
    @Bean
    public MultipartConfigElement multipartConfigElement() {
        MultipartConfigFactory factory = new MultipartConfigFactory();
        
        // Максимален размер на файл: 20MB
        factory.setMaxFileSize(DataSize.ofMegabytes(20));
        
        // Максимален размер на цялата заявка: 20MB
        factory.setMaxRequestSize(DataSize.ofMegabytes(20));
        
        // КРИТИЧНО: Задаваме file-size-threshold на 0, което означава че всички файлове
        // ще се държат в паметта вместо да се записват на диска
        // Това решава проблема с липсващите директории на Render.com
        factory.setFileSizeThreshold(DataSize.ofBytes(0));
        
        // Задаваме location на null, за да не се опитва да създава директория
        factory.setLocation(null);
        
        return factory.createMultipartConfig();
    }

    @Bean
    public MultipartResolver multipartResolver() {
        StandardServletMultipartResolver resolver = new StandardServletMultipartResolver();
        resolver.setResolveLazily(true); // Разрешаваме lazy resolution за по-добра производителност
        return resolver;
    }
}
