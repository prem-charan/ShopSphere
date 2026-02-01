package com.shopsphere.dto;

import com.shopsphere.validation.CustomValidators.ValidPassword;
import com.shopsphere.validation.CustomValidators.ValidPhone;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SignupRequest {
    
    @NotBlank(message = "Name is required")
    @Size(min = 2, max = 100)
    private String name;
    
    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;
    
    @NotBlank(message = "Password is required")
    @Size(min = 6, message = "Password must be at least 6 characters")
    @ValidPassword
    private String password;

    @NotBlank(message = "Phone number is required")
    @ValidPhone
    private String phone;
    
    private String address;
}
