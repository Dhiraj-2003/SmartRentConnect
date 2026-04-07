package com.smartrent.connect.smartrentconnect.service;

import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface CloudinaryService {

    String uploadFile(MultipartFile file, String folderPath);

    List<String> uploadMultipleFiles(List<MultipartFile> files, String folderPath);

//    void deleteFile(String publicId);

    String sanitizeTitle(String title);

    boolean isValidImageFile(MultipartFile file);

    boolean isValidDocumentFile(MultipartFile file);

    boolean isValidFileSize(MultipartFile file);
}
