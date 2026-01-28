package com.shopsphere.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateCampaignRequest {

    @NotBlank
    private String title;

    private String targetAudience;

    private String bannerImageUrl;

    @NotNull
    private BigDecimal budget;

    @NotNull
    private LocalDate startDate;

    @NotNull
    private LocalDate endDate;

    @NotEmpty
    @Valid
    private List<CampaignProductInput> products;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CampaignProductInput {
        @NotNull
        private Long productId;

        @NotNull
        @Min(0)
        @Max(100)
        private Integer discountPercent;
    }
}

