<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Stancl\Tenancy\Middleware\InitializeTenancyByDomain;
use Stancl\Tenancy\Exceptions\TenantCouldNotBeIdentifiedOnDomainException;
use App\Models\Tenant;

class InitializeTenancyWithFallback extends InitializeTenancyByDomain
{
    public function handle($request, Closure $next)
    {
        try {
            return parent::handle($request, $next);
        } catch (TenantCouldNotBeIdentifiedOnDomainException $e) {
            $host = $request->getHost();
            if (app()->environment('local')) {
                Log::warning('Tenant could not be identified by domain in local environment. Falling back to first tenant.', [
                    'host' => $host,
                ]);

                $tenant = Tenant::first();
                if ($tenant) {
                    tenancy()->initialize($tenant);
                    return $next($request);
                }
            }

            Log::error('Tenant identification failed for domain', [
                'host' => $host,
            ]);

            throw $e;
        }
    }
}
