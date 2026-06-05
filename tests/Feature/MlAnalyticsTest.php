<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Tenant;
use App\Models\Perfume;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Laravel\Sanctum\Sanctum;

class MlAnalyticsTest extends TestCase
{
    use RefreshDatabase;

    protected $tenant;
    protected $adminUser;

    protected function setUp(): void
    {
        parent::setUp();

        $this->tenant = Tenant::create([
            'name' => 'Test Tenant',
        ]);
        $this->tenant->domains()->create(['domain' => 'localhost']);
        tenancy()->initialize($this->tenant);

        $this->adminUser = User::create([
            'name' => 'Admin User',
            'email' => 'admin@test.com',
            'password' => bcrypt('password'),
            'role' => User::ROLE_ADMIN,
            'status' => User::STATUS_ACTIVE,
        ]);
    }

    public function test_ml_dashboard_endpoint_returns_data(): void
    {
        Sanctum::actingAs($this->adminUser);

        $response = $this->getJson('/api/admin/analytics/ml-dashboard');

        $response->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonStructure([
                'success',
                'data' => [
                    'kpi' => [
                        'total_recommendations',
                        'unique_users',
                        'conversion_rate',
                        'ml_metrics',
                    ],
                    'recommendation_trend',
                    'cluster_distribution',
                    'top_recommended',
                    'model_info',
                ]
            ]);
    }

    public function test_ml_test_endpoint_validates_input(): void
    {
        Sanctum::actingAs($this->adminUser);

        $response = $this->postJson('/api/admin/analytics/ml-test', [
            'model_name' => '', // invalid
        ]);

        $response->assertStatus(422);
    }

    public function test_ml_test_endpoint_performs_recommendation(): void
    {
        Sanctum::actingAs($this->adminUser);

        // Create a test perfume
        $perfume = Perfume::create([
            'name' => 'Test Perfume',
            'price' => 50.00,
            'rating_avg' => 4.5,
            'is_active' => true,
            'olfactory_family' => 'Floral',
            'description' => 'Test description',
            'notes' => 'Test notes',
        ]);

        $response = $this->postJson('/api/admin/analytics/ml-test', [
            'user_id' => $this->adminUser->id,
            'model_name' => 'hybrid',
            'top_n' => 5,
        ]);

        // Assert response status is 200
        $response->assertStatus(200);
    }

    public function test_ml_train_endpoint_triggers_training(): void
    {
        Sanctum::actingAs($this->adminUser);

        $response = $this->postJson('/api/admin/analytics/ml-train', [
            'model_name' => 'hybrid',
        ]);

        if ($response->status() !== 200) {
            $response->dump();
        }

        $response->assertOk()
            ->assertJsonPath('success', true);
    }
}
