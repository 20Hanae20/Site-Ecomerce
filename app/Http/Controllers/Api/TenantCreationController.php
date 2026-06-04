<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Stancl\Tenancy\Database\Models\Domain;

class TenantCreationController extends Controller
{
    /**
     * Create a new tenant for a company
     * POST /tenant/create
     * 
     * This endpoint is NOT behind the tenant middleware
     * as it's the entry point for new company onboarding.
     * 
     * Creates:
     * 1. Tenant record with subscription data
     * 2. Domain for routing
     * 3. Admin user with temporary password
     */
    public function create(Request $request)
    {
        $validated = $request->validate([
            'company_name' => 'required|string|max:255',
            'contact_name' => 'required|string|max:255',
            'contact_email' => 'required|email|unique:users,email',
            'contact_phone' => 'required|string|max:20',
            'domain' => 'required|string|regex:/^[a-z0-9-]+$|unique:domains,domain',
            'logo_url' => 'nullable|url',
        ]);

        try {
            DB::beginTransaction();

            // Create Tenant
            $tenant = Tenant::create([
                'id' => (string) Str::uuid(),
                'data' => [
                    'name' => $validated['company_name'],
                    'contact_name' => $validated['contact_name'],
                    'contact_email' => $validated['contact_email'],
                    'contact_phone' => $validated['contact_phone'],
                    'subscription' => [
                        'plan' => 'free',
                        'status' => 'active',
                        'is_active' => true,
                        'features' => ['basic_catalog', 'reviews'],
                        'billing_provider' => 'stripe',
                        'stripe_customer_id' => null,
                        'stripe_price_id' => null,
                        'expires_at' => null,
                        'trial_ends_at' => null,
                        'created_at' => now()->toDateTimeString(),
                    ],
                    'theme' => [
                        'primary_color' => '#2563eb',
                        'logo' => $validated['logo_url'],
                    ],
                    'created_at' => now()->toDateTimeString(),
                ],
            ]);

            // Create Domain using relationship
            $tenant->domains()->create([
                'domain' => $validated['domain'] . '.aura-saas.com',
            ]);

            // Initialize tenancy context for user creation
            tenancy()->initialize($tenant);

            // Create admin user for contact
            $tempPassword = Str::random(16);
            $admin = User::create([
                'tenant_id' => $tenant->id,
                'name' => $validated['contact_name'],
                'first_name' => explode(' ', $validated['contact_name'])[0] ?? $validated['contact_name'],
                'last_name' => explode(' ', $validated['contact_name'])[1] ?? '',
                'email' => $validated['contact_email'],
                'phone' => $validated['contact_phone'],
                'password' => Hash::make($tempPassword),
                'role' => User::ROLE_ADMIN,
                'status' => User::STATUS_ACTIVE,
                'email_verified_at' => now(),
            ]);

            tenancy()->end();

            DB::commit();

            // Send welcome email with credentials (async queue in production)
            // Note: Email sending disabled for demo. Enable in production:
            // Mail::queue(new WelcomeTenantMail($admin, $tempPassword, $validated['domain']));

            \Illuminate\Support\Facades\Log::info('Tenant created successfully', [
                'tenant_id' => $tenant->id,
                'domain' => $validated['domain'],
                'admin_email' => $admin->email,
            ]);

            return response()->json([
                'message' => 'Tenant created successfully. Admin user created.',
                'tenant' => [
                    'id' => $tenant->id,
                    'name' => $validated['company_name'],
                    'domain' => $validated['domain'] . '.aura-saas.com',
                    'subscription' => $tenant->data['subscription'] ?? [],
                ],
                'admin' => [
                    'email' => $admin->email,
                    'note' => 'Check your email for login credentials',
                ],
                'next_step' => 'choose_plan',
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            tenancy()->end();

            \Illuminate\Support\Facades\Log::error('Tenant creation failed', [
                'message' => $e->getMessage(),
                'domain' => $validated['domain'] ?? null,
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'message' => 'Failed to create tenant',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error',
            ], 500);
        }
    }
}
