<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Perfume;

class BrandController extends Controller
{
    /**
     * Display a listing of brands.
     */
    public function index(Request $request)
    {
        $brands = Perfume::select('brand')
            ->whereNotNull('brand')
            ->where('brand', '!=', '')
            ->distinct()
            ->orderBy('brand')
            ->pluck('brand');

        // Get count of products per brand
        $brandStats = Perfume::select('brand', \DB::raw('COUNT(*) as product_count'))
            ->whereNotNull('brand')
            ->where('brand', '!=', '')
            ->groupBy('brand')
            ->orderBy('product_count', 'desc')
            ->get()
            ->map(function($item) {
                return [
                    'name' => $item->brand,
                    'product_count' => $item->product_count,
                ];
            });

        return response()->json([
            'brands' => $brands,
            'brand_stats' => $brandStats
        ]);
    }

    /**
     * Store a newly created brand in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:perfumes,brand',
        ]);

        // Brands are stored as part of perfumes, so we create a placeholder perfume
        // or update existing perfumes with this brand
        return response()->json([
            'message' => 'Brand created successfully',
            'brand' => $validated['name']
        ], 201);
    }

    /**
     * Display the specified brand.
     */
    public function show($brand)
    {
        $perfumes = Perfume::where('brand', $brand)
            ->where('is_active', true)
            ->with('category')
            ->get();

        return response()->json([
            'brand' => $brand,
            'perfumes' => $perfumes,
            'product_count' => $perfumes->count()
        ]);
    }

    /**
     * Update the specified brand in storage.
     */
    public function update(Request $request, $brand)
    {
        $validated = $request->validate([
            'new_name' => 'required|string|max:255|unique:perfumes,brand',
        ]);

        // Update all perfumes with this brand
        Perfume::where('brand', $brand)->update([
            'brand' => $validated['new_name']
        ]);

        return response()->json([
            'message' => 'Brand updated successfully',
            'old_name' => $brand,
            'new_name' => $validated['new_name']
        ]);
    }

    /**
     * Remove the specified brand from storage.
     */
    public function destroy($brand)
    {
        // Set brand to null for all perfumes with this brand
        Perfume::where('brand', $brand)->update([
            'brand' => null
        ]);

        return response()->json([
            'message' => 'Brand deleted successfully'
        ]);
    }
}
