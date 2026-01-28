package com.shopsphere.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CampaignReportDTO {
    private Long campaignId;
    private String title;
    private BigDecimal budget;
    private Long ordersCount;
    private BigDecimal revenue;
    private BigDecimal roi; // (revenue - budget) / budget
}

