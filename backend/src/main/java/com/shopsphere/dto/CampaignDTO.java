package com.shopsphere.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CampaignDTO {
    private Long campaignId;
    private String title;
    private String targetAudience;
    private String bannerImageUrl;
    private BigDecimal budget;
    private LocalDate startDate;
    private LocalDate endDate;
    private boolean active;
}

