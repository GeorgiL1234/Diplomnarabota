package com.example.webshop.config;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.regex.Pattern;

/**
 * Качени снимки на файловата система под {@code <user.dir>/data/item-uploads},
 * за да не се пълни базата с огромни TEXT/base64 стойности.
 */
public final class UploadStorage {

    public static final String IMAGE_PART_DELIMITER = "|||";
    /** Префикс в {@link com.example.webshop.models.Item#getImageUrl()} за файл на диска. */
    public static final String FS_PREFIX = "fs:";

    private static final Pattern SAFE_STORED_NAME = Pattern.compile(
            "\\d+_[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}\\.(jpg|jpeg|png|gif|webp)"
    );

    private static volatile Path cachedRoot;

    private UploadStorage() {
    }

    public static Path getUploadRoot() {
        if (cachedRoot == null) {
            synchronized (UploadStorage.class) {
                if (cachedRoot == null) {
                    try {
                        Path root = Paths.get(System.getProperty("user.dir"), "data", "item-uploads")
                                .toAbsolutePath()
                                .normalize();
                        Files.createDirectories(root);
                        cachedRoot = root;
                    } catch (IOException e) {
                        throw new UncheckedIOException(e);
                    }
                }
            }
        }
        return cachedRoot;
    }

    /** Абсолютен път с накрайна наклонена черта – за Spring resource locations. */
    public static String getUploadRootFileUri() {
        String abs = getUploadRoot().toString().replace('\\', '/');
        if (!abs.endsWith("/")) {
            abs = abs + "/";
        }
        return "file:" + abs;
    }

    public static boolean isSafeStoredFileName(String filename) {
        return filename != null && SAFE_STORED_NAME.matcher(filename).matches();
    }

    public static void deleteStoredFileIfExists(String filename) {
        if (!isSafeStoredFileName(filename)) {
            return;
        }
        try {
            Path base = getUploadRoot();
            Path file = base.resolve(filename).normalize();
            if (file.startsWith(base)) {
                Files.deleteIfExists(file);
            }
        } catch (IOException ignored) {
            // best-effort при изтриване на обява
        }
    }
}
