package com.shopsphere.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(
        name = "campaign_products",
        uniqueConstraints = @UniqueConstraint(name = "uk_campaign_product", columnNames = {"campaign_id", "product_id"})
)
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CampaignProduct {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "campaign_product_id")
    private Long campaignProductId;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "campaign_id", nullable = false)
    private Campaign campaign;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    // Keep simple: percent discount only
    @NotNull
    @Min(0)
    @Max(100)
    @Column(name = "discount_percent", nullable = false)
    private Integer discountPercent;
}

