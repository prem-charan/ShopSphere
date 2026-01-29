package com.shopsphere.repository;

import com.shopsphere.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    // Find products by category
    List<Product> findByCategory(String category);

    // Find products with stock quantity less than or equal to threshold
    @Query("SELECT p FROM Product p WHERE p.stockQuantity <= :threshold AND p.isActive = true")
    List<Product> findLowStockProducts(@Param("threshold") int threshold);

    // Find active products
    List<Product> findByIsActiveTrue();

    // Find products by name containing (case-insensitive search)
    List<Product> findByNameContainingIgnoreCase(String name);

    // Find product by SKU
    Optional<Product> findBySku(String sku);

    // Find products by store location
    List<Product> findByStoreLocation(String storeLocation);

    // Get distinct categories
    @Query("SELECT DISTINCT p.category FROM Product p WHERE p.isActive = true ORDER BY p.category")
    List<String> findAllDistinctCategories();

    // Count low stock products
    @Query("SELECT COUNT(p) FROM Product p WHERE p.stockQuantity <= :threshold AND p.isActive = true")
    Long countLowStockProducts(@Param("threshold") int threshold);

    @Query("SELECT p FROM Product p WHERE p.isActive = true AND p.productId NOT IN " +
       "(SELECT cp.product.productId FROM CampaignProduct cp JOIN cp.campaign c " +
       "WHERE c.startDate <= :today AND c.endDate >= :today)")
        List<Product> findProductsNotInAnyActiveCampaign(@Param("today") LocalDate today);

    @Query("SELECT p FROM Product p JOIN CampaignProduct cp ON p.productId = cp.product.productId WHERE cp.campaign.campaignId = :campaignId")
    List<Product> findProductsByCampaignId(@Param("campaignId") Long campaignId);
}
