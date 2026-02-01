package com.shopsphere.repository;

import com.shopsphere.entity.StoreProductInventory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StoreProductInventoryRepository extends JpaRepository<StoreProductInventory, Long> {

    // Find inventory by product ID
    List<StoreProductInventory> findByProductId(Long productId);

    // Find inventory by store location
    List<StoreProductInventory> findByStoreLocation(String storeLocation);

    // Find inventory by product and store
    Optional<StoreProductInventory> findByProductIdAndStoreLocation(Long productId, String storeLocation);

    // Check if product is available at a specific store
    @Query("SELECT CASE WHEN COUNT(s) > 0 THEN true ELSE false END FROM StoreProductInventory s " +
           "WHERE s.productId = :productId AND s.storeLocation = :storeLocation " +
           "AND s.isAvailable = true AND s.stockQuantity > 0")
    boolean isProductAvailableAtStore(@Param("productId") Long productId, 
                                     @Param("storeLocation") String storeLocation);

    // Find all available products at a store
    @Query("SELECT s FROM StoreProductInventory s WHERE s.storeLocation = :storeLocation " +
           "AND s.isAvailable = true AND s.stockQuantity > 0")
    List<StoreProductInventory> findAvailableProductsAtStore(@Param("storeLocation") String storeLocation);

    // Find low stock items at a store
    @Query("SELECT s FROM StoreProductInventory s WHERE s.storeLocation = :storeLocation " +
           "AND s.stockQuantity <= :threshold AND s.isAvailable = true")
    List<StoreProductInventory> findLowStockAtStore(@Param("storeLocation") String storeLocation, 
                                                     @Param("threshold") int threshold);

    // Get all distinct store locations
    @Query("SELECT DISTINCT s.storeLocation FROM StoreProductInventory s")
    List<String> findAllStoreLocations();

    // Get stores where product is available
    @Query("SELECT s.storeLocation FROM StoreProductInventory s " +
           "WHERE s.productId = :productId AND s.isAvailable = true AND s.stockQuantity > 0")
    List<String> findStoresWithProduct(@Param("productId") Long productId);

    // Delete all inventory entries for a product
    @Modifying
    @Query("DELETE FROM StoreProductInventory s WHERE s.productId = :productId")
    void deleteByProductId(@Param("productId") Long productId);
}
