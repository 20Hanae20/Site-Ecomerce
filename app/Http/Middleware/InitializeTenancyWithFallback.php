<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
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
            if (in_array($host, ['localhost', '127.0.0.1'])) {
                $tenant = Tenant::first();
                if ($tenant) {
                    tenancy()->initialize($tenant);
                    return $next($request);
                }
            }
            throw $e;
        }
    }
}
