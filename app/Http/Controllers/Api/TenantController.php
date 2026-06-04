<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Tenant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class TenantController extends Controller
{
    /**
     * Get current tenant information (public - no auth required)
     */
    public function current(Request $request)
    {
        if (!tenant()) {
            return response()->json([
                'message' => 'No tenant identified for this domain',
                'tenant' => null,
            ], 404);
        }

        $tenant = tenant();

        return response()->json([
            'id' => $tenant->id,
            'data' => $tenant->data ?? [],
            'name' => $tenant->data['name'] ?? 'Unknown',
            'theme' => $tenant->data['theme'] ?? [
                'primary_color' => '#7f1d1d',
                'logo' => '/images/logo.png',
            ],
            'domain' => request()->getHost(),
        ], 200);
    }

    /**
     * Get tenant by domain (public API for frontend tenant discovery)
     */
    public function byDomain(Request $request)
    {
        $domain = $request->input('domain');

        if (!$domain) {
            $domain = request()->getHost();
        }

        $domainRecord = \Stancl\Tenancy\Database\Models\Domain::where('domain', $domain)->first();

        if (!$domainRecord) {
            return response()->json([
                'message' => 'Domain not found',
                'tenant' => null,
            ], 404);
        }

        $tenant = Tenant::find($domainRecord->tenant_id);

        if (!$tenant) {
            return response()->json([
                'message' => 'Tenant not found',
                'tenant' => null,
            ], 404);
        }

        return response()->json([
            'id' => $tenant->id,
            'data' => $tenant->data ?? [],
            'name' => $tenant->data['name'] ?? 'Unknown',
            'theme' => $tenant->data['theme'] ?? [
                'primary_color' => '#7f1d1d',
                'logo' => '/images/logo.png',
            ],
            'domain' => $domain,
        ], 200);
    }

    /**
     * Update tenant information (admin only)
     */
    public function update(Request $request)
    {
        if (!$request->user()?->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        if (!tenant()) {
            return response()->json(['message' => 'No tenant context'], 400);
        }

        $tenant = tenant();

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'theme.primary_color' => 'sometimes|string|regex:/^#[0-9A-F]{6}$/i',
            'theme.logo' => 'sometimes|url',
        ]);

        if (isset($validated['name'])) {
            $tenant->data = $tenant->data ?? [];
            $tenant->data['name'] = $validated['name'];
        }

        if (isset($validated['theme'])) {
            $tenant->data = $tenant->data ?? [];
            $tenant->data['theme'] = $tenant->data['theme'] ?? [];
            $tenant->data['theme'] = array_merge($tenant->data['theme'], $validated['theme']);
        }

        $tenant->save();

        return response()->json([
            'message' => 'Tenant updated successfully',
            'tenant' => [
                'id' => $tenant->id,
                'data' => $tenant->data,
            ],
        ], 200);
    }

    /**
     * Upload a logo for the tenant (admin only)
     */
    public function uploadLogo(Request $request)
    {
        if (!$request->user()?->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        if (! tenant()) {
            return response()->json(['message' => 'No tenant context'], 400);
        }

        $request->validate([
            'logo' => 'required|image|max:2048'
        ]);

        $tenant = tenant();

        $file = $request->file('logo');
        $ext = $file->getClientOriginalExtension();
        $path = $file->storeAs('public/tenants/'.$tenant->id, 'logo.'.Str::lower($ext));

        $url = Storage::url(str_replace('public/', '', $path));

        $tenant->data = $tenant->data ?? [];
        $tenant->data['theme'] = $tenant->data['theme'] ?? [];
        $tenant->data['theme']['logo'] = $url;
        $tenant->save();

        return response()->json(['message' => 'Logo uploaded', 'url' => $url]);
    }
}
