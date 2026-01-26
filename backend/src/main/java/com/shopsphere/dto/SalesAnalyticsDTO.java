package com.shopsphere.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SalesAnalyticsDTO {

    // Overview Stats
    private BigDecimal totalRevenue;
    private Long totalOrders;
    private BigDecimal averageOrderValue;
    private Long totalCustomers;
    
    // Recent Trends
    private BigDecimal revenueToday;
    private BigDecimal revenueThisWeek;
    private BigDecimal revenueThisMonth;
    private Long ordersToday;
    private Long ordersThisWeek;
    private Long ordersThisMonth;
    
    // Growth Metrics
    private Double revenueGrowthPercentage;
    private Double orderGrowthPercentage;
    
    // Top Performers
    private List<TopProductDTO> topSellingProducts;
    private List<DailySalesDTO> dailySales;
    private List<CategorySalesDTO> categorySales;
    
    // Status Distribution
    private OrderStatusDistributionDTO statusDistribution;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TopProductDTO {
        private Long productId;
        private String productName;
        private String productSku;
        private Long totalQuantitySold;
        private BigDecimal totalRevenue;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DailySalesDTO {
        private String date;
        private BigDecimal revenue;
        private Long orderCount;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CategorySalesDTO {
        private String category;
        private BigDecimal revenue;
        private Long productCount;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OrderStatusDistributionDTO {
        private Long confirmed;
        private Long shipped;
        private Long delivered;
        private Long cancelled;
    }
}
