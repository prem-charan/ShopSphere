package com.shopsphere.controller;

import com.shopsphere.dto.ApiResponse;
import com.shopsphere.dto.StoreInventoryDTO;
import com.shopsphere.service.StoreInventoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/store-inventory")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class StoreInventoryController {

    private final StoreInventoryService inventoryService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<StoreInventoryDTO>> addOrUpdateInventory(
            @Valid @RequestBody StoreInventoryDTO dto) {
        log.info("REST request to add/update store inventory for product {} at store {}", 
                dto.getProductId(), dto.getStoreLocation());
        StoreInventoryDTO response = inventoryService.addOrUpdateStoreInventory(dto);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponse<>(true, "Store inventory saved successfully", response));
    }

    @GetMapping("/product/{productId}")
    public ResponseEntity<ApiResponse<List<StoreInventoryDTO>>> getInventoryByProduct(
            @PathVariable Long productId) {
        log.info("REST request to get inventory for product: {}", productId);
        List<StoreInventoryDTO> inventory = inventoryService.getInventoryByProduct(productId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Inventory retrieved successfully", inventory));
    }

    @GetMapping("/store/{storeLocation}")
    public ResponseEntity<ApiResponse<List<StoreInventoryDTO>>> getInventoryByStore(
            @PathVariable String storeLocation) {
        log.info("REST request to get inventory for store: {}", storeLocation);
        List<StoreInventoryDTO> inventory = inventoryService.getInventoryByStore(storeLocation);
        return ResponseEntity.ok(new ApiResponse<>(true, "Store inventory retrieved successfully", inventory));
    }

    @GetMapping("/product/{productId}/store/{storeLocation}")
    public ResponseEntity<ApiResponse<StoreInventoryDTO>> getInventoryByProductAndStore(
            @PathVariable Long productId,
            @PathVariable String storeLocation) {
        log.info("REST request to get inventory for product {} at store {}", productId, storeLocation);
        StoreInventoryDTO inventory = inventoryService.getInventoryByProductAndStore(productId, storeLocation);
        return ResponseEntity.ok(new ApiResponse<>(true, "Inventory retrieved successfully", inventory));
    }

    @GetMapping("/product/{productId}/stores")
    public ResponseEntity<ApiResponse<List<String>>> getStoresWithProduct(@PathVariable Long productId) {
        log.info("REST request to get stores with product: {}", productId);
        List<String> stores = inventoryService.getStoresWithProduct(productId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Stores retrieved successfully", stores));
    }

    @GetMapping("/product/{productId}/store/{storeLocation}/available")
    public ResponseEntity<ApiResponse<Boolean>> checkProductAvailability(
            @PathVariable Long productId,
            @PathVariable String storeLocation) {
        log.info("REST request to check if product {} is available at store {}", productId, storeLocation);
        boolean isAvailable = inventoryService.isProductAvailableAtStore(productId, storeLocation);
        return ResponseEntity.ok(new ApiResponse<>(true, 
                isAvailable ? "Product is available" : "Product is not available", isAvailable));
    }

    @PatchMapping("/product/{productId}/store/{storeLocation}/stock")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> updateStockQuantity(
            @PathVariable Long productId,
            @PathVariable String storeLocation,
            @RequestParam Integer quantity) {
        log.info("REST request to update stock for product {} at store {} to {}", 
                productId, storeLocation, quantity);
        inventoryService.updateStockQuantity(productId, storeLocation, quantity);
        return ResponseEntity.ok(new ApiResponse<>(true, "Stock quantity updated successfully", null));
    }

    @GetMapping("/store/{storeLocation}/low-stock")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<StoreInventoryDTO>>> getLowStockAtStore(
            @PathVariable String storeLocation,
            @RequestParam(defaultValue = "10") int threshold) {
        log.info("REST request to get low stock items at store {} (threshold: {})", storeLocation, threshold);
        List<StoreInventoryDTO> lowStockItems = inventoryService.getLowStockAtStore(storeLocation, threshold);
        return ResponseEntity.ok(new ApiResponse<>(true, "Low stock items retrieved successfully", lowStockItems));
    }

    @GetMapping("/stores")
    public ResponseEntity<ApiResponse<List<String>>> getAllStoreLocations() {
        log.info("REST request to get all store locations");
        List<String> stores = inventoryService.getAllStoreLocations();
        return ResponseEntity.ok(new ApiResponse<>(true, "Store locations retrieved successfully", stores));
    }

    @DeleteMapping("/{inventoryId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteInventory(@PathVariable Long inventoryId) {
        log.info("REST request to delete inventory: {}", inventoryId);
        inventoryService.deleteInventory(inventoryId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Inventory deleted successfully", null));
    }
}
