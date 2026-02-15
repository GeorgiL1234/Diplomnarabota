package com.example.webshop.dto;

public class AddMessageRequest {

    private String senderEmail;
    private String content;

    public String getSenderEmail() {
        return senderEmail;
    }

    public void setSenderEmail(String senderEmail) {
        this.senderEmail = senderEmail;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }
}
