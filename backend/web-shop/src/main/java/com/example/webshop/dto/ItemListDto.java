package com.example.webshop.dto;

/**
 * DTO за списък обяви – БЕЗ imageUrl, за да не претоварваме response (Render 512MB).
 * Детайлът се зарежда при клик чрез GET /items/{id}.
 */
public class ItemListDto {
    private Long id;
    private String title;
    private String description;
    private double price;
    private String ownerEmail;
    private String category;
    private String contactEmail;
    private String contactPhone;
    private Boolean isVip;
    private String paymentMethod;

    public ItemListDto() {}

    public static ItemListDto from(com.example.webshop.models.Item item) {
        ItemListDto dto = new ItemListDto();
        dto.setId(item.getId());
        dto.setTitle(item.getTitle());
        dto.setDescription(item.getDescription());
        dto.setPrice(item.getPrice());
        dto.setOwnerEmail(item.getOwnerEmail());
        dto.setCategory(item.getCategory());
        dto.setContactEmail(item.getContactEmail());
        dto.setContactPhone(item.getContactPhone());
        dto.setIsVip(item.getIsVip());
        dto.setPaymentMethod(item.getPaymentMethod());
        return dto;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public double getPrice() { return price; }
    public void setPrice(double price) { this.price = price; }
    public String getOwnerEmail() { return ownerEmail; }
    public void setOwnerEmail(String ownerEmail) { this.ownerEmail = ownerEmail; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public String getContactEmail() { return contactEmail; }
    public void setContactEmail(String contactEmail) { this.contactEmail = contactEmail; }
    public String getContactPhone() { return contactPhone; }
    public void setContactPhone(String contactPhone) { this.contactPhone = contactPhone; }
    public Boolean getIsVip() { return isVip; }
    public void setIsVip(Boolean isVip) { this.isVip = isVip; }
    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }
}
