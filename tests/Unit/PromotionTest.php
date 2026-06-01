<?php

namespace Tests\Unit;

use App\Models\Promotion;
use Tests\TestCase;

class PromotionTest extends TestCase
{
    public function test_promotion_is_valid_when_active_and_within_dates(): void
    {
        $promotion = new Promotion([
            'is_active' => true,
            'start_date' => now()->subDay(),
            'end_date' => now()->addDay(),
        ]);

        $this->assertTrue($promotion->isValid());
    }

    public function test_promotion_is_invalid_when_expired(): void
    {
        $promotion = new Promotion([
            'is_active' => true,
            'start_date' => now()->subDays(10),
            'end_date' => now()->subDay(),
        ]);

        $this->assertFalse($promotion->isValid());
    }

    public function test_promotion_is_invalid_when_inactive(): void
    {
        $promotion = new Promotion([
            'is_active' => false,
            'start_date' => now()->subDay(),
            'end_date' => now()->addDay(),
        ]);

        $this->assertFalse($promotion->isValid());
    }
}
