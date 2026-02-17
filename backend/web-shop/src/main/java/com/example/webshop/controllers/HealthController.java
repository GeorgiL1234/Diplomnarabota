package com.example.webshop.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@CrossOrigin(origins = "*")
public class HealthController {

    private static final String BUILD = "image-in-create-v2";

    /** Root health endpoint - за UptimeRobot и проверка на backend */
    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("OK");
    }

    /** Проверка дали backend е с новата версия (TomcatConfig, imageUrl в create) */
    @GetMapping("/health/build")
    public ResponseEntity<Map<String, String>> build() {
        return ResponseEntity.ok(Map.of("build", BUILD));
    }
}
