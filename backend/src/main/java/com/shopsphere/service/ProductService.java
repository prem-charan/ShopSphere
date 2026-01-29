package com.shopsphere.service;

import com.shopsphere.dto.ProductDTO;
import com.shopsphere.entity.Product;
import com.shopsphere.exception.ResourceNotFoundException;
import com.shopsphere.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProductService {

    private final ProductRepository productRepository;
    private final StoreInventoryService storeInventoryService;

    @Value("${shopsphere.inventory.low-stock-threshold:10}")
    private int lowStockThreshold;

    // Convert Entity to DTO
    private ProductDTO convertToDTO(Product product) {
        ProductDTO dto = new ProductDTO();
        dto.setProductId(product.getProductId());
        dto.setName(product.getName());
        dto.setCategory(product.getCategory());
        dto.setPrice(product.getPrice());
        dto.setStockQuantity(product.getStockQuantity());
        dto.setDescription(product.getDescription());
        dto.setSku(product.getSku());
        dto.setStoreLocation(product.getStoreLocation());
        dto.setImageUrl(product.getImageUrl());
        dto.setIsActive(product.getIsActive());
        dto.setIsLowStock(product.isLowStock(lowStockThreshold));
        dto.setCreatedAt(product.getCreatedAt());
        dto.setUpdatedAt(product.getUpdatedAt());
        return dto;
    }

    // Convert DTO to Entity
    private Product convertToEntity(ProductDTO dto) {
        Product product = new Product();
        product.setProductId(dto.getProductId());
        product.setName(dto.getName());
        product.setCategory(dto.getCategory());
        product.setPrice(dto.getPrice());
        product.setStockQuantity(dto.getStockQuantity());
        product.setDescription(dto.getDescription());
        product.setSku(dto.getSku());
        product.setStoreLocation(dto.getStoreLocation());
        product.setImageUrl(dto.getImageUrl());
        product.setIsActive(dto.getIsActive() != null ? dto.getIsActive() : true);
        return product;
    }

    // Get all products
    @Transactional(readOnly = true)
    public List<ProductDTO> getAllProducts() {
        log.info("Fetching all products");
        return productRepository.findAll()
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    // Get product by ID
    @Transactional(readOnly = true)
    public ProductDTO getProductById(Long id) {
        log.info("Fetching product with ID: {}", id);
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with ID: " + id));
        return convertToDTO(product);
    }

    // Create new product
    @Transactional
    public ProductDTO createProduct(ProductDTO productDTO) {
        log.info("Creating new product: {}", productDTO.getName());
        Product product = convertToEntity(productDTO);
        Product savedProduct = productRepository.save(product);
        log.info("Product created successfully with ID: {}", savedProduct.getProductId());
        
        // If initial store location is provided, create store inventory entry
        if (productDTO.getStoreLocation() != null && !productDTO.getStoreLocation().trim().isEmpty() 
                && productDTO.getStockQuantity() != null && productDTO.getStockQuantity() > 0) {
            log.info("Creating initial store inventory for product {} at store {}", 
                    savedProduct.getProductId(), productDTO.getStoreLocation());
            
            com.shopsphere.dto.StoreInventoryDTO inventoryDTO = new com.shopsphere.dto.StoreInventoryDTO();
            inventoryDTO.setProductId(savedProduct.getProductId());
            inventoryDTO.setStoreLocation(productDTO.getStoreLocation());
            inventoryDTO.setStockQuantity(productDTO.getStockQuantity());
            inventoryDTO.setIsAvailable(true);
            
            storeInventoryService.addOrUpdateStoreInventory(inventoryDTO);
            log.info("Initial store inventory created successfully");
        }
        
        return convertToDTO(savedProduct);
    }

    // Update product
    @Transactional
    public ProductDTO updateProduct(Long id, ProductDTO productDTO) {
        log.info("Updating product with ID: {}", id);
        Product existingProduct = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with ID: " + id));

        existingProduct.setName(productDTO.getName());
        existingProduct.setCategory(productDTO.getCategory());
        existingProduct.setPrice(productDTO.getPrice());
        existingProduct.setStockQuantity(productDTO.getStockQuantity());
        existingProduct.setDescription(productDTO.getDescription());
        existingProduct.setSku(productDTO.getSku());
        existingProduct.setStoreLocation(productDTO.getStoreLocation());
        existingProduct.setImageUrl(productDTO.getImageUrl());
        if (productDTO.getIsActive() != null) {
            existingProduct.setIsActive(productDTO.getIsActive());
        }

        Product updatedProduct = productRepository.save(existingProduct);
        log.info("Product updated successfully with ID: {}", updatedProduct.getProductId());
        return convertToDTO(updatedProduct);
    }

    // Delete product
    @Transactional
    public void deleteProduct(Long id) {
        log.info("Deleting product with ID: {}", id);
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with ID: " + id));
        productRepository.delete(product);
        log.info("Product deleted successfully with ID: {}", id);
    }

    // Get products by category
    @Transactional(readOnly = true)
    public List<ProductDTO> getProductsByCategory(String category) {
        log.info("Fetching products by category: {}", category);
        return productRepository.findByCategory(category)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    // Get low stock products
    @Transactional(readOnly = true)
    public List<ProductDTO> getLowStockProducts() {
        log.info("Fetching low stock products (threshold: {})", lowStockThreshold);
        return productRepository.findLowStockProducts(lowStockThreshold)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    // Search products by name
    @Transactional(readOnly = true)
    public List<ProductDTO> searchProductsByName(String name) {
        log.info("Searching products by name: {}", name);
        return productRepository.findByNameContainingIgnoreCase(name)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    // Get all categories
    @Transactional(readOnly = true)
    public List<String> getAllCategories() {
        log.info("Fetching all distinct categories");
        return productRepository.findAllDistinctCategories();
    }

    // Update stock quantity
    @Transactional
    public ProductDTO updateStockQuantity(Long id, Integer quantity) {
        log.info("Updating stock quantity for product ID: {} to {}", id, quantity);
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with ID: " + id));
        product.setStockQuantity(quantity);
        Product updatedProduct = productRepository.save(product);
        log.info("Stock quantity updated successfully for product ID: {}", id);
        return convertToDTO(updatedProduct);
    }

    // Get low stock count
    @Transactional(readOnly = true)
    public Long getLowStockCount() {
        log.info("Fetching low stock count");
        return productRepository.countLowStockProducts(lowStockThreshold);
    }

    // Get products available for a campaign
    @Transactional(readOnly = true)
    public List<ProductDTO> getProductsAvailableForCampaign(Optional<Long> campaignId) {
        log.info("Fetching products available for campaign: {}", campaignId.orElse(null));

        // 1. Get all products that are not in any *active* campaign.
        List<Product> availableProducts = productRepository.findProductsNotInAnyActiveCampaign(LocalDate.now());
        Map<Long, Product> productMap = availableProducts.stream()
                .collect(Collectors.toMap(Product::getProductId, p -> p));

        // 2. If editing a campaign, add its products to the list so they can be re-selected.
        campaignId.ifPresent(id -> {
            List<Product> productsInThisCampaign = productRepository.findProductsByCampaignId(id);
            productsInThisCampaign.forEach(p -> productMap.putIfAbsent(p.getProductId(), p));
        });

        return productMap.values().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
}
