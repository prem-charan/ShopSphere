package com.shopsphere.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CampaignDTO {
    private Long campaignId;
    private String title;
    private String bannerImageUrl;
    private LocalDate startDate;
    private LocalDate endDate;
    private boolean active;
    private Integer productCount;
}

