package com.shopsphere.service;

import com.shopsphere.dto.SalesAnalyticsDTO;
import com.shopsphere.entity.Order;
import com.shopsphere.entity.OrderItem;
import com.shopsphere.entity.Product;
import com.shopsphere.repository.OrderItemRepository;
import com.shopsphere.repository.OrderRepository;
import com.shopsphere.repository.ProductRepository;
import com.shopsphere.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AnalyticsService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public SalesAnalyticsDTO getComprehensiveAnalytics() {
        log.info("Generating comprehensive sales analytics");

        SalesAnalyticsDTO analytics = new SalesAnalyticsDTO();

        // Get all orders (excluding cancelled for revenue)
        List<Order> allOrders = orderRepository.findAll();
        List<Order> completedOrders = allOrders.stream()
                .filter(o -> !o.getStatus().equals("CANCELLED"))
                .collect(Collectors.toList());

        // Calculate total revenue and orders
        BigDecimal totalRevenue = completedOrders.stream()
                .map(Order::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        analytics.setTotalRevenue(totalRevenue);
        analytics.setTotalOrders((long) completedOrders.size());

        // Calculate average order value
        if (!completedOrders.isEmpty()) {
            BigDecimal avgOrderValue = totalRevenue.divide(
                    BigDecimal.valueOf(completedOrders.size()),
                    2,
                    RoundingMode.HALF_UP
            );
            analytics.setAverageOrderValue(avgOrderValue);
        } else {
            analytics.setAverageOrderValue(BigDecimal.ZERO);
        }

        // Total customers (unique customer IDs with role CUSTOMER)
        Long totalCustomers = userRepository.countByRole("CUSTOMER");
        analytics.setTotalCustomers(totalCustomers);

        // Time-based metrics
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime startOfToday = now.toLocalDate().atStartOfDay();
        LocalDateTime startOfWeek = now.minusDays(7);
        LocalDateTime startOfMonth = now.minusDays(30);

        // Today's metrics
        List<Order> todayOrders = completedOrders.stream()
                .filter(o -> o.getCreatedAt().isAfter(startOfToday))
                .collect(Collectors.toList());
        analytics.setOrdersToday((long) todayOrders.size());
        analytics.setRevenueToday(
                todayOrders.stream()
                        .map(Order::getTotalAmount)
                        .reduce(BigDecimal.ZERO, BigDecimal::add)
        );

        // This week's metrics
        List<Order> weekOrders = completedOrders.stream()
                .filter(o -> o.getCreatedAt().isAfter(startOfWeek))
                .collect(Collectors.toList());
        analytics.setOrdersThisWeek((long) weekOrders.size());
        analytics.setRevenueThisWeek(
                weekOrders.stream()
                        .map(Order::getTotalAmount)
                        .reduce(BigDecimal.ZERO, BigDecimal::add)
        );

        // This month's metrics
        List<Order> monthOrders = completedOrders.stream()
                .filter(o -> o.getCreatedAt().isAfter(startOfMonth))
                .collect(Collectors.toList());
        analytics.setOrdersThisMonth((long) monthOrders.size());
        analytics.setRevenueThisMonth(
                monthOrders.stream()
                        .map(Order::getTotalAmount)
                        .reduce(BigDecimal.ZERO, BigDecimal::add)
        );

        // Growth percentages (comparing last 30 days to previous 30 days)
        LocalDateTime startOfPreviousMonth = now.minusDays(60);
        LocalDateTime endOfPreviousMonth = now.minusDays(30);
        
        List<Order> previousMonthOrders = completedOrders.stream()
                .filter(o -> o.getCreatedAt().isAfter(startOfPreviousMonth) 
                        && o.getCreatedAt().isBefore(endOfPreviousMonth))
                .collect(Collectors.toList());
        
        BigDecimal previousMonthRevenue = previousMonthOrders.stream()
                .map(Order::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        if (previousMonthRevenue.compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal growth = analytics.getRevenueThisMonth()
                    .subtract(previousMonthRevenue)
                    .divide(previousMonthRevenue, 4, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100));
            analytics.setRevenueGrowthPercentage(growth.doubleValue());
        } else {
            analytics.setRevenueGrowthPercentage(0.0);
        }

        long previousMonthOrderCount = previousMonthOrders.size();
        if (previousMonthOrderCount > 0) {
            double orderGrowth = ((double) (analytics.getOrdersThisMonth() - previousMonthOrderCount) 
                    / previousMonthOrderCount) * 100;
            analytics.setOrderGrowthPercentage(orderGrowth);
        } else {
            analytics.setOrderGrowthPercentage(0.0);
        }

        // Top selling products (last 30 days)
        List<SalesAnalyticsDTO.TopProductDTO> topProducts = getTopSellingProducts(30);
        analytics.setTopSellingProducts(topProducts);

        // Daily sales for last 7 days
        List<SalesAnalyticsDTO.DailySalesDTO> dailySales = getDailySales(7);
        analytics.setDailySales(dailySales);

        // Category sales
        List<SalesAnalyticsDTO.CategorySalesDTO> categorySales = getCategorySales();
        analytics.setCategorySales(categorySales);

        // Order status distribution
        SalesAnalyticsDTO.OrderStatusDistributionDTO statusDist = new SalesAnalyticsDTO.OrderStatusDistributionDTO();
        statusDist.setConfirmed(orderRepository.countByStatus("CONFIRMED"));
        statusDist.setShipped(orderRepository.countByStatus("SHIPPED"));
        statusDist.setDelivered(orderRepository.countByStatus("DELIVERED"));
        statusDist.setCancelled(orderRepository.countByStatus("CANCELLED"));
        analytics.setStatusDistribution(statusDist);

        log.info("Analytics generated successfully");
        return analytics;
    }

    private List<SalesAnalyticsDTO.TopProductDTO> getTopSellingProducts(int days) {
        LocalDateTime since = LocalDateTime.now().minusDays(days);
        
        // Get all order items from orders in the time period
        List<Order> recentOrders = orderRepository.findAll().stream()
                .filter(o -> o.getCreatedAt().isAfter(since))
                .filter(o -> !o.getStatus().equals("CANCELLED"))
                .collect(Collectors.toList());

        // Group by product and sum quantities
        Map<Long, ProductSales> productSalesMap = new HashMap<>();
        
        for (Order order : recentOrders) {
            for (OrderItem item : order.getOrderItems()) {
                ProductSales sales = productSalesMap.getOrDefault(
                        item.getProductId(),
                        new ProductSales(item.getProductId(), item.getProductName(), item.getProductSku())
                );
                sales.addSale(item.getQuantity(), item.getSubtotal());
                productSalesMap.put(item.getProductId(), sales);
            }
        }

        // Convert to DTO and sort by quantity
        return productSalesMap.values().stream()
                .map(ps -> new SalesAnalyticsDTO.TopProductDTO(
                        ps.productId,
                        ps.productName,
                        ps.productSku,
                        ps.totalQuantity,
                        ps.totalRevenue
                ))
                .sorted((a, b) -> b.getTotalQuantitySold().compareTo(a.getTotalQuantitySold()))
                .limit(5)
                .collect(Collectors.toList());
    }

    private List<SalesAnalyticsDTO.DailySalesDTO> getDailySales(int days) {
        LocalDateTime since = LocalDateTime.now().minusDays(days);
        
        List<Order> recentOrders = orderRepository.findAll().stream()
                .filter(o -> o.getCreatedAt().isAfter(since))
                .filter(o -> !o.getStatus().equals("CANCELLED"))
                .collect(Collectors.toList());

        // Group by date
        Map<LocalDate, DaySales> dailySalesMap = new LinkedHashMap<>();
        
        // Initialize all days
        for (int i = days - 1; i >= 0; i--) {
            LocalDate date = LocalDate.now().minusDays(i);
            dailySalesMap.put(date, new DaySales(date));
        }

        // Populate with actual sales
        for (Order order : recentOrders) {
            LocalDate orderDate = order.getCreatedAt().toLocalDate();
            DaySales daySales = dailySalesMap.get(orderDate);
            if (daySales != null) {
                daySales.addOrder(order.getTotalAmount());
            }
        }

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MMM dd");
        
        return dailySalesMap.values().stream()
                .map(ds -> new SalesAnalyticsDTO.DailySalesDTO(
                        ds.date.format(formatter),
                        ds.revenue,
                        ds.orderCount
                ))
                .collect(Collectors.toList());
    }

    private List<SalesAnalyticsDTO.CategorySalesDTO> getCategorySales() {
        List<Product> allProducts = productRepository.findAll();
        List<Order> allOrders = orderRepository.findAll().stream()
                .filter(o -> !o.getStatus().equals("CANCELLED"))
                .collect(Collectors.toList());

        Map<String, CategorySales> categorySalesMap = new HashMap<>();

        for (Order order : allOrders) {
            for (OrderItem item : order.getOrderItems()) {
                // Find product to get category
                Product product = allProducts.stream()
                        .filter(p -> p.getProductId().equals(item.getProductId()))
                        .findFirst()
                        .orElse(null);

                if (product != null) {
                    String category = product.getCategory() != null ? product.getCategory() : "Uncategorized";
                    CategorySales sales = categorySalesMap.getOrDefault(
                            category,
                            new CategorySales(category)
                    );
                    sales.addRevenue(item.getSubtotal());
                    sales.addProduct(product.getProductId());
                    categorySalesMap.put(category, sales);
                }
            }
        }

        return categorySalesMap.values().stream()
                .map(cs -> new SalesAnalyticsDTO.CategorySalesDTO(
                        cs.category,
                        cs.revenue,
                        (long) cs.uniqueProducts.size()
                ))
                .sorted((a, b) -> b.getRevenue().compareTo(a.getRevenue()))
                .collect(Collectors.toList());
    }

    // Helper classes
    private static class ProductSales {
        Long productId;
        String productName;
        String productSku;
        Long totalQuantity = 0L;
        BigDecimal totalRevenue = BigDecimal.ZERO;

        ProductSales(Long productId, String productName, String productSku) {
            this.productId = productId;
            this.productName = productName;
            this.productSku = productSku;
        }

        void addSale(Integer quantity, BigDecimal revenue) {
            this.totalQuantity += quantity;
            this.totalRevenue = this.totalRevenue.add(revenue);
        }
    }

    private static class DaySales {
        LocalDate date;
        BigDecimal revenue = BigDecimal.ZERO;
        Long orderCount = 0L;

        DaySales(LocalDate date) {
            this.date = date;
        }

        void addOrder(BigDecimal amount) {
            this.revenue = this.revenue.add(amount);
            this.orderCount++;
        }
    }

    private static class CategorySales {
        String category;
        BigDecimal revenue = BigDecimal.ZERO;
        Set<Long> uniqueProducts = new HashSet<>();

        CategorySales(String category) {
            this.category = category;
        }

        void addRevenue(BigDecimal amount) {
            this.revenue = this.revenue.add(amount);
        }

        void addProduct(Long productId) {
            this.uniqueProducts.add(productId);
        }
    }
}
