package com.shopsphere.repository;

import com.shopsphere.entity.CampaignProduct;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Modifying;

import java.util.List;
import java.util.Optional;

@Repository
public interface CampaignProductRepository extends JpaRepository<CampaignProduct, Long> {

    @Query("SELECT cp FROM CampaignProduct cp JOIN FETCH cp.product WHERE cp.campaign.campaignId = :campaignId")
    List<CampaignProduct> findByCampaignIdWithProduct(@Param("campaignId") Long campaignId);

    Optional<CampaignProduct> findByCampaign_CampaignIdAndProduct_ProductId(Long campaignId, Long productId);
    
    Integer countByCampaign_CampaignId(Long campaignId);
    
    @Modifying
    @Query("DELETE FROM CampaignProduct cp WHERE cp.campaign.campaignId = :campaignId")
    void deleteByCampaign_CampaignId(@Param("campaignId") Long campaignId);

    @Modifying
    @Query("DELETE FROM CampaignProduct cp WHERE cp.product.productId = :productId")
    void deleteByProduct_ProductId(@Param("productId") Long productId);
}

