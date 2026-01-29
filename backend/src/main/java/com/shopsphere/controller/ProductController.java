package com.shopsphere.controller;

import com.shopsphere.dto.ApiResponse;
import com.shopsphere.dto.ProductDTO;
import com.shopsphere.service.ProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/products")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
@RequiredArgsConstructor
@Slf4j
public class ProductController {

    private final ProductService productService;

    // Get all products
    @GetMapping
    public ResponseEntity<ApiResponse<List<ProductDTO>>> getAllProducts() {
        log.info("GET /api/products - Fetching all products");
        List<ProductDTO> products = productService.getAllProducts();
        return ResponseEntity.ok(
            ApiResponse.success("Products retrieved successfully", products)
        );
    }

    // Get product by ID
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ProductDTO>> getProductById(@PathVariable Long id) {
        log.info("GET /api/products/{} - Fetching product by ID", id);
        ProductDTO product = productService.getProductById(id);
        return ResponseEntity.ok(
            ApiResponse.success("Product retrieved successfully", product)
        );
    }

    // Create new product
    @PostMapping
    public ResponseEntity<ApiResponse<ProductDTO>> createProduct(@Valid @RequestBody ProductDTO productDTO) {
        log.info("POST /api/products - Creating new product");
        ProductDTO createdProduct = productService.createProduct(productDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(
            ApiResponse.success("Product created successfully", createdProduct)
        );
    }

    // Update product
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ProductDTO>> updateProduct(
            @PathVariable Long id,
            @Valid @RequestBody ProductDTO productDTO) {
        log.info("PUT /api/products/{} - Updating product", id);
        ProductDTO updatedProduct = productService.updateProduct(id, productDTO);
        return ResponseEntity.ok(
            ApiResponse.success("Product updated successfully", updatedProduct)
        );
    }

    // Delete product
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteProduct(@PathVariable Long id) {
        log.info("DELETE /api/products/{} - Deleting product", id);
        productService.deleteProduct(id);
        return ResponseEntity.ok(
            ApiResponse.success("Product deleted successfully", null)
        );
    }

    // Get products by category
    @GetMapping("/category/{category}")
    public ResponseEntity<ApiResponse<List<ProductDTO>>> getProductsByCategory(@PathVariable String category) {
        log.info("GET /api/products/category/{} - Fetching products by category", category);
        List<ProductDTO> products = productService.getProductsByCategory(category);
        return ResponseEntity.ok(
            ApiResponse.success("Products retrieved successfully", products)
        );
    }

    // Get low stock products
    @GetMapping("/low-stock")
    public ResponseEntity<ApiResponse<List<ProductDTO>>> getLowStockProducts() {
        log.info("GET /api/products/low-stock - Fetching low stock products");
        List<ProductDTO> products = productService.getLowStockProducts();
        return ResponseEntity.ok(
            ApiResponse.success("Low stock products retrieved successfully", products)
        );
    }

    // Search products by name
    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<ProductDTO>>> searchProducts(@RequestParam String name) {
        log.info("GET /api/products/search?name={} - Searching products", name);
        List<ProductDTO> products = productService.searchProductsByName(name);
        return ResponseEntity.ok(
            ApiResponse.success("Products retrieved successfully", products)
        );
    }

    // Get all categories
    @GetMapping("/categories")
    public ResponseEntity<ApiResponse<List<String>>> getAllCategories() {
        log.info("GET /api/products/categories - Fetching all categories");
        List<String> categories = productService.getAllCategories();
        return ResponseEntity.ok(
            ApiResponse.success("Categories retrieved successfully", categories)
        );
    }

    // Update stock quantity
    @PatchMapping("/{id}/stock")
    public ResponseEntity<ApiResponse<ProductDTO>> updateStockQuantity(
            @PathVariable Long id,
            @RequestBody Map<String, Integer> request) {
        log.info("PATCH /api/products/{}/stock - Updating stock quantity", id);
        Integer quantity = request.get("quantity");
        ProductDTO updatedProduct = productService.updateStockQuantity(id, quantity);
        return ResponseEntity.ok(
            ApiResponse.success("Stock quantity updated successfully", updatedProduct)
        );
    }

    // Get low stock count
    @GetMapping("/low-stock/count")
    public ResponseEntity<ApiResponse<Long>> getLowStockCount() {
        log.info("GET /api/products/low-stock/count - Fetching low stock count");
        Long count = productService.getLowStockCount();
        return ResponseEntity.ok(
            ApiResponse.success("Low stock count retrieved successfully", count)
        );
    }

    // Get products available for campaigns
    @GetMapping("/available-for-campaign")
    public ResponseEntity<ApiResponse<List<ProductDTO>>> getProductsAvailableForCampaign(@RequestParam Optional<Long> campaignId) {
        log.info("GET /api/products/available-for-campaign?campaignId={} - Fetching products available for campaign", campaignId.orElse(null));
        List<ProductDTO> products = productService.getProductsAvailableForCampaign(campaignId);
        return ResponseEntity.ok(
            ApiResponse.success("Products available for campaigns retrieved successfully", products)
        );
    }
}
