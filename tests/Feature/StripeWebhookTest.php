<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class StripeWebhookTest extends TestCase
{
    use RefreshDatabase;

    public function test_webhook_endpoint_accepts_post()
    {
        $response = $this->postJson('/api/stripe/webhook', [
            'type' => 'test.event',
            'data' => ['object' => ['id' => 'evt_test']]
        ]);

        $response->assertStatus(200);
        $response->assertJson(['received' => true]);
    }
}
