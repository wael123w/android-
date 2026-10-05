<?php
declare(strict_types=1);

class FileUploadService {
    private const ALLOWED_MIME = [
        'image/jpeg' => 'jpg',
        'image/png'  => 'png',
        'image/webp' => 'webp',
        'image/gif'  => 'gif',
        'application/pdf' => 'pdf'
    ];
    private const MAX_SIZE = 10 * 1024 * 1024; // 10MB

    public static function handleUpload(string $fileKey = 'file', string $subfolder = 'items'): array {
        if (!isset($_FILES[$fileKey]) || $_FILES[$fileKey]['error'] !== UPLOAD_ERR_OK) {
            return ['success' => false, 'error' => 'No file uploaded or upload error occurred'];
        }

        $file = $_FILES[$fileKey];
        if ($file['size'] > self::MAX_SIZE) {
            return ['success' => false, 'error' => 'File exceeds maximum size of 10MB'];
        }

        $finfo = new finfo(FILEINFO_MIME_TYPE);
        $mime = $finfo->file($file['tmp_name']);

        if (!array_key_exists($mime, self::ALLOWED_MIME)) {
            return ['success' => false, 'error' => 'Invalid file format. Allowed: JPG, PNG, WEBP, PDF'];
        }

        $ext = self::ALLOWED_MIME[$mime];
        $targetDir = __DIR__ . "/../uploads/{$subfolder}/";
        if (!is_dir($targetDir)) {
            mkdir($targetDir, 0755, true);
        }

        $filename = bin2hex(random_bytes(16)) . '.' . $ext;
        $targetPath = $targetDir . $filename;

        if (!move_uploaded_file($file['tmp_name'], $targetPath)) {
            return ['success' => false, 'error' => 'Failed to save file to server storage'];
        }

        $publicUrl = "/uploads/{$subfolder}/" . $filename;
        return ['success' => true, 'url' => $publicUrl, 'filename' => $filename];
    }
}