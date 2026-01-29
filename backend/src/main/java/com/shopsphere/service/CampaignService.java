package com.shopsphere.service;

import com.shopsphere.dto.CampaignDTO;
import com.shopsphere.dto.CampaignProductViewDTO;
import com.shopsphere.dto.CampaignReportDTO;
import com.shopsphere.dto.CreateCampaignRequest;
import com.shopsphere.dto.ProductDTO;
import com.shopsphere.entity.Campaign;
import com.shopsphere.entity.CampaignProduct;
import com.shopsphere.entity.Product;
import com.shopsphere.exception.ResourceNotFoundException;
import com.shopsphere.repository.OrderRepository;
import com.shopsphere.repository.CampaignProductRepository;
import com.shopsphere.repository.CampaignRepository;
import com.shopsphere.repository.ProductRepository;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class CampaignService {

    private final CampaignRepository campaignRepository;
    private final CampaignProductRepository campaignProductRepository;
    private final ProductRepository productRepository;
    private final ProductService productService;
    private final OrderRepository orderRepository;

    @Transactional(readOnly = true)
    public List<CampaignDTO> getActiveCampaigns() {
        LocalDate today = LocalDate.now();
        return campaignRepository.findActiveCampaigns(today).stream()
                .map(this::toDTO)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<CampaignDTO> getAllCampaigns() {
        return campaignRepository.findAll().stream()
                .map(this::toDTO)
                .toList();
    }

    @Transactional(readOnly = true)
    public CampaignDTO getCampaign(@NonNull Long id) {
        Campaign c = campaignRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Campaign not found with id: " + id));
        return toDTO(c);
    }

    @Transactional(readOnly = true)
    public List<CampaignProductViewDTO> getCampaignProducts(@NonNull Long campaignId) {
        Campaign campaign = campaignRepository.findById(campaignId)
                .orElseThrow(() -> new ResourceNotFoundException("Campaign not found with id: " + campaignId));
        if (!campaign.isActive()) {
            // still allow viewing, but frontend can decide
            log.info("Campaign {} is not active; returning products anyway", campaignId);
        }

        List<CampaignProduct> cps = campaignProductRepository.findByCampaignIdWithProduct(campaignId);
        return cps.stream().map(cp -> {
            ProductDTO p = productService.getProductById(cp.getProduct().getProductId());
            BigDecimal campaignPrice = applyPercentDiscount(p.getPrice(), cp.getDiscountPercent());
            return new CampaignProductViewDTO(p, cp.getDiscountPercent(), campaignPrice);
        }).toList();
    }

    @Transactional
    public CampaignDTO createCampaign(CreateCampaignRequest req) {
        Campaign c = new Campaign();
        c.setTitle(req.getTitle().trim());
        c.setBannerImageUrl(req.getBannerImageUrl());
        c.setStartDate(req.getStartDate());
        c.setEndDate(req.getEndDate());

        Campaign saved = campaignRepository.save(c);

        for (CreateCampaignRequest.CampaignProductInput p : req.getProducts()) {
            Product product = productRepository.findById(p.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + p.getProductId()));
            CampaignProduct cp = new CampaignProduct();
            cp.setCampaign(saved);
            cp.setProduct(product);
            cp.setDiscountPercent(p.getDiscountPercent());
            campaignProductRepository.save(cp);
        }

        return toDTO(saved);
    }

    @Transactional
    public CampaignDTO updateCampaign(@NonNull Long id, CreateCampaignRequest req) {
        Campaign c = campaignRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Campaign not found with id: " + id));
        
        c.setTitle(req.getTitle());
        c.setBannerImageUrl(req.getBannerImageUrl());
        c.setStartDate(req.getStartDate());
        c.setEndDate(req.getEndDate());

        Campaign saved = campaignRepository.save(c);

        // Remove existing campaign products
        campaignProductRepository.deleteByCampaign_CampaignId(id);
        
        // Add new campaign products
        for (CreateCampaignRequest.CampaignProductInput p : req.getProducts()) {
            Product product = productRepository.findById(p.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + p.getProductId()));
            CampaignProduct cp = new CampaignProduct();
            cp.setCampaign(saved);
            cp.setProduct(product);
            cp.setDiscountPercent(p.getDiscountPercent());
            campaignProductRepository.save(cp);
        }

        return toDTO(saved);
    }

    @Transactional
    public void deleteCampaign(@NonNull Long id) {
        Campaign c = campaignRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Campaign not found with id: " + id));
        
        // Remove campaign products first
        campaignProductRepository.deleteByCampaign_CampaignId(id);
        
        // Delete the campaign
        campaignRepository.delete(c);
    }

    @Transactional(readOnly = true)
    public CampaignReportDTO getReport(@NonNull Long campaignId) {
        Campaign c = campaignRepository.findById(campaignId)
                .orElseThrow(() -> new ResourceNotFoundException("Campaign not found with id: " + campaignId));

        var orders = orderRepository.findByCampaignId(campaignId);
        BigDecimal revenue = orders.stream()
                .map(o -> o.getTotalAmount() == null ? BigDecimal.ZERO : o.getTotalAmount())
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return new CampaignReportDTO(c.getCampaignId(), c.getTitle(), (long) orders.size(), revenue);
    }

    private CampaignDTO toDTO(Campaign c) {
        Integer productCount = campaignProductRepository.countByCampaign_CampaignId(c.getCampaignId());
        return new CampaignDTO(
                c.getCampaignId(),
                c.getTitle(),
                c.getBannerImageUrl(),
                c.getStartDate(),
                c.getEndDate(),
                c.isActive(),
                productCount
        );
    }

    private BigDecimal applyPercentDiscount(BigDecimal price, Integer percent) {
        if (price == null) return BigDecimal.ZERO;
        int p = percent == null ? 0 : percent;
        if (p <= 0) return price;
        BigDecimal discount = price.multiply(BigDecimal.valueOf(p)).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
        BigDecimal result = price.subtract(discount);
        return result.max(BigDecimal.ZERO);
    }
}

