package com.example.webshop.validation;

import java.util.regex.Pattern;

/**
 * Валидация на email за API входове (формат, дължина). Без нормализация на малки/големи букви,
 * за да не се чупи login спрямо вече записани потребители.
 */
public final class EmailValidation {

    private static final int MAX_TOTAL_LENGTH = 254;
    /** Практичен шаблон: локална част @ домейн с поне една точка в домейна */
    private static final Pattern PATTERN = Pattern.compile(
            "^[a-zA-Z0-9_!#$%&'*+/=?`{|}~^.-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$"
    );

    private EmailValidation() {
    }

    public static String trim(String email) {
        return email == null ? "" : email.trim();
    }

    /**
     * @param email стойността може да е null; проверява се след {@link #trim(String)}.
     */
    public static boolean isValid(String email) {
        String t = trim(email);
        if (t.isEmpty() || t.length() > MAX_TOTAL_LENGTH) {
            return false;
        }
        int at = t.indexOf('@');
        if (at < 1 || at != t.lastIndexOf('@')) {
            return false;
        }
        return PATTERN.matcher(t).matches();
    }
}
