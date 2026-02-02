<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class LogAdminAction
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        // Only log successful administrative mutations
        if ($request->user() && $request->user()->isAdmin() &&
            in_array($request->method(), ['POST', 'PUT', 'PATCH', 'DELETE']) &&
            $response->status() >= 200 && $response->status() < 300) {

            \App\Models\ActionLog::create([
                'user_id' => $request->user()->id,
                'action' => $request->method(),
                'target_type' => $request->path(),
                'details' => $request->except(['password', 'password_confirmation']),
                'ip_address' => $request->ip(),
            ]);
        }

        return $response;
    }
}
