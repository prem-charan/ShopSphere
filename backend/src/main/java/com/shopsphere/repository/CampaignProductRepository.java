package com.shopsphere.repository;

import com.shopsphere.entity.CampaignProduct;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CampaignProductRepository extends JpaRepository<CampaignProduct, Long> {

    @Query("SELECT cp FROM CampaignProduct cp JOIN FETCH cp.product WHERE cp.campaign.campaignId = :campaignId")
    List<CampaignProduct> findByCampaignIdWithProduct(@Param("campaignId") Long campaignId);

    Optional<CampaignProduct> findByCampaign_CampaignIdAndProduct_ProductId(Long campaignId, Long productId);
}

