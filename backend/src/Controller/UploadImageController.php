<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\String\Slugger\SluggerInterface;
use Symfony\Component\HttpFoundation\File\Exception\FileException;

class UploadImageController extends AbstractController
{
    #[Route('/api/upload_image', name: 'api_upload_image', methods: ['POST'])]
    public function upload(Request $request, SluggerInterface $slugger): JsonResponse
    {
        $file = $request->files->get('image');

        if (!$file) {
            return new JsonResponse(['error' => 'No image uploaded'], 400);
        }

        $originalFilename = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME);
        $safeFilename = $slugger->slug($originalFilename);
        $newFilename = $safeFilename.'-'.uniqid().'.'.$file->guessExtension();

        try {
            $file->move(
                $this->getParameter('kernel.project_dir').'/public/uploads/products',
                $newFilename
            );
        } catch (FileException $e) {
            return new JsonResponse(['error' => 'Failed to upload image'], 500);
        }

        return new JsonResponse([
            'url' => 'http://127.0.0.1:8000/uploads/products/'.$newFilename
        ]);
    }
}
