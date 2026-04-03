<?php

namespace App\Controller;

use App\Entity\Media;
use App\Entity\User;
use App\Repository\MediaRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Validator\Validator\ValidatorInterface;

#[Route('/api/media')]
class MediaController extends AbstractController
{
    private const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
    private const ALLOWED_MIME_TYPES = [
        'image/jpeg',
        'image/png',
        'image/webp',
        'image/gif',
        'image/heic',
        'image/heic-sequence',
        'video/mp4',
        'video/webm',
        'video/quicktime',
    ];
    private const UPLOADS_DIR = '%kernel.project_dir%/../frontend/public/uploads';

    #[Route('', name: 'api_media_upload', methods: ['POST'])]
    #[IsGranted('ROLE_USER')]
    public function upload(
        Request $request,
        EntityManagerInterface $entityManager,
        ValidatorInterface $validator
    ): JsonResponse {
        /** @var User $user */
        $user = $this->getUser();

        // Get the uploaded file
        $uploadedFile = $request->files->get('file');

        if (!$uploadedFile) {
            return $this->json(['error' => 'No file provided'], 400);
        }

        // Validate file size
        if ($uploadedFile->getSize() > self::MAX_FILE_SIZE) {
            return $this->json(
                ['error' => sprintf('File too large. Max size: %s MB', self::MAX_FILE_SIZE / 1024 / 1024)],
                413
            );
        }

        // Validate MIME type (check actual MIME, not just extension)
        $mimeType = $uploadedFile->getMimeType();
        if (!in_array($mimeType, self::ALLOWED_MIME_TYPES, true)) {
            return $this->json(
                ['error' => 'Unsupported file type. Allowed: JPEG, PNG, WebP, GIF, HEIC, MP4, WebM, MOV'],
                415
            );
        }

        // Generate unique filename: {userId}-{timestamp}-{random}.{ext}
        $originalName = $uploadedFile->getClientOriginalName();
        $ext = pathinfo($originalName, PATHINFO_EXTENSION);
        $filename = sprintf(
            '%d-%d-%s.%s',
            $user->getId(),
            time(),
            bin2hex(random_bytes(8)),
            $ext
        );

        // Store file size before moving (the temp file will be deleted after move)
        $fileSize = $uploadedFile->getSize();

        // Move file to uploads directory
        $uploadsDir = $this->getParameter('kernel.project_dir') . '/public/uploads';
        if (!is_dir($uploadsDir)) {
            mkdir($uploadsDir, 0755, true);
        }

        try {
            $uploadedFile->move($uploadsDir, $filename);
        } catch (\Exception $e) {
            error_log('File upload error: ' . $e->getMessage());
            error_log('Upload directory: ' . $uploadsDir);
            error_log('Directory exists: ' . (is_dir($uploadsDir) ? 'yes' : 'no'));
            error_log('Directory writable: ' . (is_writable($uploadsDir) ? 'yes' : 'no'));
            return $this->json(['error' => 'Failed to save file: ' . $e->getMessage()], 500);
        }

        // Create Media entity
        $media = new Media();
        $media->setFilePath($filename);
        $media->setMediaType($mimeType);
        $media->setFileSize($fileSize);
        $media->setUser($user);
        // tweet_id is optional initially (will be set when creating tweet)

        // Validate entity
        $errors = $validator->validate($media);
        if (count($errors) > 0) {
            // Delete the uploaded file if validation fails
            @unlink($uploadsDir . '/' . $filename);

            $errorMessages = [];
            foreach ($errors as $error) {
                $errorMessages[] = $error->getMessage();
            }

            return $this->json(['errors' => $errorMessages], 400);
        }

        // Persist and flush
        $entityManager->persist($media);
        $entityManager->flush();

        // Return response
        return $this->json([
            'id' => $media->getId(),
            'media_type' => $media->getMediaType(),
            'file_url' => $media->getUrl(),
            'file_size' => $media->getFileSize(),
            'created_at' => $media->getCreatedAt()->format(\DateTimeInterface::ATOM),
        ], 201);
    }

    #[Route('/{id}', name: 'api_media_show', methods: ['GET'])]
    public function show(?Media $media): JsonResponse
    {
        if (!$media) {
            return $this->json(['error' => 'Media not found'], 404);
        }

        return $this->json([
            'id' => $media->getId(),
            'media_type' => $media->getMediaType(),
            'file_url' => $media->getUrl(),
            'file_size' => $media->getFileSize(),
            'created_at' => $media->getCreatedAt()->format(\DateTimeInterface::ATOM),
        ]);
    }

    #[Route('/{id}', name: 'api_media_delete', methods: ['DELETE'])]
    #[IsGranted('ROLE_USER')]
    public function delete(?Media $media, EntityManagerInterface $entityManager): JsonResponse
    {
        if (!$media) {
            return $this->json(['error' => 'Media not found'], 404);
        }

        /** @var User $user */
        $user = $this->getUser();

        // Verify ownership
        if ($media->getUser()->getId() !== $user->getId()) {
            return $this->json(['error' => 'Not authorized'], 403);
        }

        // Delete file from disk
        $filePath = $this->getParameter('kernel.project_dir') . '/public/uploads/' . $media->getFilePath();
        if (file_exists($filePath)) {
            @unlink($filePath);
        }

        // Delete database record
        $entityManager->remove($media);
        $entityManager->flush();

        return $this->json([], 204);
    }
}
