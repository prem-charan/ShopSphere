package com.shopsphere.controller;

import com.shopsphere.dto.SalesAnalyticsDTO;
import com.shopsphere.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "http://localhost:5173")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    /**
     * Get comprehensive sales analytics (Admin only)
     */
    @GetMapping("/sales")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<SalesAnalyticsDTO> getSalesAnalytics() {
        log.info("GET /api/analytics/sales - Admin fetching sales analytics");
        try {
            SalesAnalyticsDTO analytics = analyticsService.getComprehensiveAnalytics();
            return ResponseEntity.ok(analytics);
        } catch (Exception e) {
            log.error("Error fetching sales analytics: ", e);
            throw e;
        }
    }
}
