<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

#[Route('/files')]
class FileController extends AbstractController
{
    #[Route('/{filename}', name: 'app_serve_file', methods: ['GET'])]
    public function serveFile(string $filename): Response
    {
        // Sanitize filename to prevent directory traversal
        if (preg_match('/\.\.|\x00/', $filename)) {
            return $this->json(['error' => 'Invalid filename'], 400);
        }

        $filePath = $this->getParameter('kernel.project_dir') . '/public/uploads/' . $filename;

        // Check if file exists
        if (!file_exists($filePath)) {
            return $this->json(['error' => 'File not found'], 404);
        }

        // Check if path is still within uploads directory (prevent directory traversal)
        $realPath = realpath($filePath);
        $uploadsDir = realpath($this->getParameter('kernel.project_dir') . '/public/uploads');

        if ($realPath === false || strpos($realPath, $uploadsDir) !== 0) {
            return $this->json(['error' => 'Invalid file path'], 400);
        }

        // Create response with proper MIME type
        $response = new BinaryFileResponse($realPath);
        $response->headers->set('Content-Disposition', 'inline');

        // Set cache headers for public files
        $response->setPublic();
        $response->setMaxAge(86400 * 30); // 30 days

        return $response;
    }
}
