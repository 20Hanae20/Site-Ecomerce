<?php

namespace Tests\Feature;

use App\Models\Promotion;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PromotionControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_apply_endpoint_returns_error_for_invalid_code(): void
    {
        $response = $this->postJson('/api/promotions/apply', [
            'code' => 'INVALID',
        ]);

        $response->assertStatus(422)
            ->assertJson([
                'message' => 'Code promo invalide ou expiré',
            ]);
    }

    public function test_apply_endpoint_accepts_valid_promotion_code(): void
    {
        $promotion = Promotion::create([
            'name' => 'Test Promo',
            'code' => 'SAVE10',
            'type' => 'fixed',
            'value' => 10.00,
            'is_active' => true,
            'start_date' => now()->subDay(),
            'end_date' => now()->addDay(),
        ]);

        $response = $this->postJson('/api/promotions/apply', [
            'code' => 'SAVE10',
        ]);

        $response->assertOk()
            ->assertJson([
                'message' => 'Code promo appliqué',
            ])
            ->assertJsonPath('promotion.code', $promotion->code);
    }
}
