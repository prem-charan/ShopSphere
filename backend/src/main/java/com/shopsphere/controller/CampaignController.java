package com.shopsphere.controller;

import com.shopsphere.dto.CampaignDTO;
import com.shopsphere.dto.CampaignProductViewDTO;
import com.shopsphere.dto.CampaignReportDTO;
import com.shopsphere.dto.CreateCampaignRequest;
import com.shopsphere.service.CampaignService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/campaigns")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class CampaignController {

    private final CampaignService campaignService;

    // Public/homepage
    @GetMapping("/active")
    public ResponseEntity<List<CampaignDTO>> getActiveCampaigns() {
        log.info("GET /api/campaigns/active");
        return ResponseEntity.ok(campaignService.getActiveCampaigns());
    }

    @GetMapping("/{id}")
    public ResponseEntity<CampaignDTO> getCampaign(@PathVariable Long id) {
        log.info("GET /api/campaigns/{}", id);
        return ResponseEntity.ok(campaignService.getCampaign(id));
    }

    @GetMapping("/{id}/products")
    public ResponseEntity<List<CampaignProductViewDTO>> getCampaignProducts(@PathVariable Long id) {
        log.info("GET /api/campaigns/{}/products", id);
        return ResponseEntity.ok(campaignService.getCampaignProducts(id));
    }

    @GetMapping("/{id}/report")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CampaignReportDTO> getReport(@PathVariable Long id) {
        log.info("GET /api/campaigns/{}/report", id);
        return ResponseEntity.ok(campaignService.getReport(id));
    }

    // Admin
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<CampaignDTO>> getAllCampaigns() {
        log.info("GET /api/campaigns - get all campaigns");
        return ResponseEntity.ok(campaignService.getAllCampaigns());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CampaignDTO> createCampaign(@Valid @RequestBody CreateCampaignRequest request) {
        log.info("POST /api/campaigns - create campaign {}", request.getTitle());
        CampaignDTO created = campaignService.createCampaign(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CampaignDTO> updateCampaign(@PathVariable Long id, @Valid @RequestBody CreateCampaignRequest request) {
        log.info("PUT /api/campaigns/{} - update campaign {}", id, request.getTitle());
        CampaignDTO updated = campaignService.updateCampaign(id, request);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteCampaign(@PathVariable Long id) {
        log.info("DELETE /api/campaigns/{} - delete campaign", id);
        campaignService.deleteCampaign(id);
        return ResponseEntity.noContent().build();
    }
}

