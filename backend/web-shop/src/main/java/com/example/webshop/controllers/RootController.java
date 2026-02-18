package com.example.webshop.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/** Прост root endpoint – за проверка дали backend-ът работи */
@RestController
@CrossOrigin(origins = "*")
public class RootController {

    @GetMapping(value = {"/", "/status"}, produces = "text/plain")
    public ResponseEntity<String> status() {
        return ResponseEntity.ok("OK");
    }

    @GetMapping(value = "/status/version", produces = "application/json")
    public ResponseEntity<Map<String, String>> version() {
        return ResponseEntity.ok(Map.of("build", "v3-feb2026"));
    }
}
