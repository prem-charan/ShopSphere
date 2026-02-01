package com.shopsphere.validation;

import jakarta.validation.Constraint;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import jakarta.validation.Payload;
import java.lang.annotation.*;

/**
 * This file contains all custom validation annotations and their validators
 * to reduce the number of separate files while maintaining all functionality.
 */
public class CustomValidators {

    // ==================== PASSWORD VALIDATION ====================

    @Documented
    @Constraint(validatedBy = PasswordValidator.class)
    @Target({ElementType.FIELD, ElementType.PARAMETER})
    @Retention(RetentionPolicy.RUNTIME)
    public @interface ValidPassword {
        String message() default "Password must contain at least one alphabet, one digit, and one special character";
        Class<?>[] groups() default {};
        Class<? extends Payload>[] payload() default {};
    }

    public static class PasswordValidator implements ConstraintValidator<ValidPassword, String> {
        @Override
        public boolean isValid(String password, ConstraintValidatorContext context) {
            if (password == null) {
                return false;
            }

            // Check minimum length (at least 6 characters)
            if (password.length() < 6) {
                return false;
            }

            // Check for at least one alphabet (upper or lower case)
            boolean hasAlphabet = password.matches(".*[a-zA-Z].*");

            // Check for at least one digit
            boolean hasDigit = password.matches(".*\\d.*");

            // Check for at least one special character
            boolean hasSpecialChar = password.matches(".*[!@#$%^&*()_+\\-=\\[\\]{};':\"\\\\|,.<>\\/?].*");

            return hasAlphabet && hasDigit && hasSpecialChar;
        }
    }

    // ==================== PHONE VALIDATION ====================

    @Documented
    @Constraint(validatedBy = PhoneValidator.class)
    @Target({ElementType.FIELD, ElementType.PARAMETER})
    @Retention(RetentionPolicy.RUNTIME)
    public @interface ValidPhone {
        String message() default "Invalid phone number format";
        Class<?>[] groups() default {};
        Class<? extends Payload>[] payload() default {};
    }

    public static class PhoneValidator implements ConstraintValidator<ValidPhone, String> {
        @Override
        public boolean isValid(String phone, ConstraintValidatorContext context) {
            if (phone == null || phone.trim().isEmpty()) {
                return false;
            }

            // Remove common separators and spaces
            String cleanedPhone = phone.replaceAll("[\\s\\-\\(\\)\\.]", "");

            // Check if it contains only digits and optional + at the beginning
            if (!cleanedPhone.matches("^\\+?\\d{10,15}$")) {
                return false;
            }

            // Extract the actual phone number (remove country code if present)
            String phoneNumber = cleanedPhone;
            if (cleanedPhone.startsWith("+91")) {
                phoneNumber = cleanedPhone.substring(3);
            } else if (cleanedPhone.startsWith("+")) {
                phoneNumber = cleanedPhone.substring(1);
            }

            // For Indian phone numbers: must be 10 digits and start with 6, 7, 8, or 9
            if (phoneNumber.length() == 10) {
                char firstDigit = phoneNumber.charAt(0);
                return firstDigit == '6' || firstDigit == '7' || firstDigit == '8' || firstDigit == '9';
            }

            return false;
        }
    }
}
