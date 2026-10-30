package com.retail.assistant.dto.service;

import java.math.BigDecimal;

public class ServiceDto {
    private Long id;
    private String serviceCode;
    private String name;
    private String category;
    private String description;
    private Integer durationMinutes;
    private BigDecimal basePrice;
    private String petType;
    private Boolean isActive;

    public ServiceDto() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getServiceCode() { return serviceCode; }
    public void setServiceCode(String serviceCode) { this.serviceCode = serviceCode; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public Integer getDurationMinutes() { return durationMinutes; }
    public void setDurationMinutes(Integer durationMinutes) { this.durationMinutes = durationMinutes; }
    public BigDecimal getBasePrice() { return basePrice; }
    public void setBasePrice(BigDecimal basePrice) { this.basePrice = basePrice; }
    public String getPetType() { return petType; }
    public void setPetType(String petType) { this.petType = petType; }
    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }
}
