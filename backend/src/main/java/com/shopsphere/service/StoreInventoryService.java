package com.shopsphere.service;

import com.shopsphere.dto.StoreInventoryDTO;
import com.shopsphere.entity.Product;
import com.shopsphere.entity.StoreProductInventory;
import com.shopsphere.exception.ResourceNotFoundException;
import com.shopsphere.repository.ProductRepository;
import com.shopsphere.repository.StoreProductInventoryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class StoreInventoryService {

    private final StoreProductInventoryRepository inventoryRepository;
    private final ProductRepository productRepository;

    @Transactional
    public StoreInventoryDTO addOrUpdateStoreInventory(StoreInventoryDTO dto) {
        log.info("Adding/Updating inventory for product {} at store {}", dto.getProductId(), dto.getStoreLocation());

        // Verify product exists
        Product product = productRepository.findById(dto.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + dto.getProductId()));

        // Check if inventory already exists for this product-store combination
        StoreProductInventory inventory = inventoryRepository
                .findByProductIdAndStoreLocation(dto.getProductId(), dto.getStoreLocation())
                .orElse(new StoreProductInventory());

        inventory.setProductId(dto.getProductId());
        inventory.setStoreLocation(dto.getStoreLocation());
        inventory.setStockQuantity(dto.getStockQuantity());
        inventory.setIsAvailable(dto.getIsAvailable() != null ? dto.getIsAvailable() : true);

        StoreProductInventory saved = inventoryRepository.save(inventory);
        return convertToDTO(saved, product.getName());
    }

    @Transactional(readOnly = true)
    public List<StoreInventoryDTO> getInventoryByProduct(Long productId) {
        log.info("Fetching inventory for product: {}", productId);
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + productId));

        return inventoryRepository.findByProductId(productId).stream()
                .map(inv -> convertToDTO(inv, product.getName()))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<StoreInventoryDTO> getInventoryByStore(String storeLocation) {
        log.info("Fetching inventory for store: {}", storeLocation);
        return inventoryRepository.findByStoreLocation(storeLocation).stream()
                .map(inv -> {
                    String productName = productRepository.findById(inv.getProductId())
                            .map(Product::getName)
                            .orElse("Unknown Product");
                    return convertToDTO(inv, productName);
                })
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public StoreInventoryDTO getInventoryByProductAndStore(Long productId, String storeLocation) {
        log.info("Fetching inventory for product {} at store {}", productId, storeLocation);
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + productId));

        StoreProductInventory inventory = inventoryRepository
                .findByProductIdAndStoreLocation(productId, storeLocation)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Inventory not found for product " + productId + " at store " + storeLocation));

        return convertToDTO(inventory, product.getName());
    }

    @Transactional(readOnly = true)
    public List<String> getStoresWithProduct(Long productId) {
        log.info("Finding stores with product: {}", productId);
        productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + productId));
        return inventoryRepository.findStoresWithProduct(productId);
    }

    @Transactional(readOnly = true)
    public boolean isProductAvailableAtStore(Long productId, String storeLocation) {
        return inventoryRepository.isProductAvailableAtStore(productId, storeLocation);
    }

    @Transactional
    public void updateStockQuantity(Long productId, String storeLocation, Integer quantity) {
        log.info("Updating stock for product {} at store {} to {}", productId, storeLocation, quantity);
        StoreProductInventory inventory = inventoryRepository
                .findByProductIdAndStoreLocation(productId, storeLocation)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Inventory not found for product " + productId + " at store " + storeLocation));

        inventory.setStockQuantity(quantity);
        inventoryRepository.save(inventory);
    }

    @Transactional
    public void decreaseStock(Long productId, String storeLocation, Integer quantity) {
        log.info("Decreasing stock for product {} at store {} by {}", productId, storeLocation, quantity);
        StoreProductInventory inventory = inventoryRepository
                .findByProductIdAndStoreLocation(productId, storeLocation)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Inventory not found for product " + productId + " at store " + storeLocation));

        if (!inventory.hasStock(quantity)) {
            throw new IllegalArgumentException("Insufficient stock at store " + storeLocation);
        }

        inventory.decreaseStock(quantity);
        inventoryRepository.save(inventory);
    }

    @Transactional
    public void increaseStock(Long productId, String storeLocation, Integer quantity) {
        log.info("Increasing stock for product {} at store {} by {}", productId, storeLocation, quantity);
        StoreProductInventory inventory = inventoryRepository
                .findByProductIdAndStoreLocation(productId, storeLocation)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Inventory not found for product " + productId + " at store " + storeLocation));

        inventory.increaseStock(quantity);
        inventoryRepository.save(inventory);
    }

    @Transactional(readOnly = true)
    public List<StoreInventoryDTO> getLowStockAtStore(String storeLocation, int threshold) {
        log.info("Fetching low stock items at store {} (threshold: {})", storeLocation, threshold);
        return inventoryRepository.findLowStockAtStore(storeLocation, threshold).stream()
                .map(inv -> {
                    String productName = productRepository.findById(inv.getProductId())
                            .map(Product::getName)
                            .orElse("Unknown Product");
                    return convertToDTO(inv, productName);
                })
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<String> getAllStoreLocations() {
        return inventoryRepository.findAllStoreLocations();
    }

    @Transactional
    public void deleteInventory(Long inventoryId) {
        log.info("Deleting inventory: {}", inventoryId);
        if (!inventoryRepository.existsById(inventoryId)) {
            throw new ResourceNotFoundException("Inventory not found with id: " + inventoryId);
        }
        inventoryRepository.deleteById(inventoryId);
    }

    private StoreInventoryDTO convertToDTO(StoreProductInventory inventory, String productName) {
        StoreInventoryDTO dto = new StoreInventoryDTO();
        dto.setInventoryId(inventory.getInventoryId());
        dto.setProductId(inventory.getProductId());
        dto.setProductName(productName);
        dto.setStoreLocation(inventory.getStoreLocation());
        dto.setStockQuantity(inventory.getStockQuantity());
        dto.setIsAvailable(inventory.getIsAvailable());
        dto.setCreatedAt(inventory.getCreatedAt());
        dto.setUpdatedAt(inventory.getUpdatedAt());
        return dto;
    }
}
