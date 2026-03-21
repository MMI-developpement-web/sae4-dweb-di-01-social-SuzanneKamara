<?php

namespace App\EventSubscriber;

use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Event\RequestEvent;
use Symfony\Component\HttpKernel\Event\ResponseEvent;
use Symfony\Component\HttpKernel\KernelEvents;

class CorsSubscriber implements EventSubscriberInterface
{
    public static function getSubscribedEvents(): array
    {
        return [
            KernelEvents::REQUEST => ['onKernelRequest', 250],
            KernelEvents::RESPONSE => ['onKernelResponse', -1],
        ];
    }

    public function onKernelRequest(RequestEvent $event): void
    {
        $request = $event->getRequest();

        // Only apply CORS to /api routes
        if (!str_starts_with($request->getPathInfo(), '/api')) {
            return;
        }

        // Handle OPTIONS preflight requests immediately
        if ($request->getMethod() === 'OPTIONS') {
            $response = new Response();
            $response->setStatusCode(200);
            $this->addCorsHeaders($request, $response);
            $event->setResponse($response);
        }
    }

    public function onKernelResponse(ResponseEvent $event): void
    {
        $request = $event->getRequest();
        $response = $event->getResponse();

        // Only apply CORS to /api routes
        if (!str_starts_with($request->getPathInfo(), '/api')) {
            return;
        }

        $this->addCorsHeaders($request, $response);
    }

    private function addCorsHeaders($request, $response): void
    {
        // Get the origin from the request
        $origin = $request->headers->get('Origin');

        // Allow requests from any origin (adjust if you want to be more restrictive)
        if ($origin) {
            $response->headers->set('Access-Control-Allow-Origin', $origin);
        } else {
            $response->headers->set('Access-Control-Allow-Origin', '*');
        }

        $response->headers->set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
        $response->headers->set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
        $response->headers->set('Access-Control-Allow-Credentials', 'true');
        $response->headers->set('Access-Control-Max-Age', '3600');
    }
}
