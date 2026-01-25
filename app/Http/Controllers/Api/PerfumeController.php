<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Perfume;
use Illuminate\Http\Request;

class PerfumeController extends Controller
{
    protected const STORAGE_PATH = '/storage/';

    /**
     * Display a listing of the resource with advanced filtering.
     */
    public function index(Request $request)
    {
        $query = Perfume::with('category');

        // Access Control
        if ($request->has('admin') && $request->user()?->isAdmin()) {
            // Admin view: all products
        } else {
            // Client view: active products from active categories
            $query->where('is_active', true)
                  ->whereHas('category', function($q) {
                      $q->where('is_active', true);
                  });
        }

        // Filter by Category
        if ($request->has('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        // Search by name or description
        if ($request->has('q')) {
            $search = $request->q;
            $query->where(function($q) use ($search) {
                $q->where('name', 'LIKE', "%{$search}%")
                  ->orWhere('description', 'LIKE', "%{$search}%");
            });
        }

        // Filter by Price Range
        if ($request->has('min_price')) {
            $query->where('price', '>=', $request->min_price);
        }
        if ($request->has('max_price')) {
            $query->where('price', '<=', $request->max_price);
        }

        // Hide out of stock (optional)
        if ($request->boolean('in_stock_only')) {
            $query->where('stock', '>', 0);
        }

        // Sorting
        $sortBy = $request->get('sort_by', 'created_at');

        switch ($sortBy) {
            case 'price_asc':
                $query->orderBy('price', 'asc');
                break;
            case 'price_desc':
                $query->orderBy('price', 'desc');
                break;
            case 'popularity':
                $query->orderBy('views', 'desc');
                break;
            case 'best_sellers':
                $query->orderBy('sales_count', 'desc');
                break;
            case 'rating':
                $query->orderBy('rating', 'desc');
                break;
            default:
                $query->orderBy('created_at', 'desc');
                break;
        }

        return response()->json($query->paginate($request->get('per_page', 12)), 200);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'category_id' => 'nullable|exists:categories,id',
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'notes' => 'required|string',
            'price' => 'required|numeric',
            'image_url' => 'nullable|string',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'gallery_images.*' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'gallery_urls' => 'nullable|array',
            'gallery_urls.*' => 'url',
            'stock' => 'nullable|integer',
            'is_active' => 'nullable|boolean',
        ]);

        $gallery = $request->get('gallery_urls', []);

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('perfumes', 'public');
            $validated['image_url'] = self::STORAGE_PATH . $path;
        }

        if ($request->hasFile('gallery_images')) {
            foreach ($request->file('gallery_images') as $file) {
                $path = $file->store('perfumes/gallery', 'public');
                $gallery[] = self::STORAGE_PATH . $path;
            }
        }

        $validated['gallery'] = $gallery;

        $perfume = Perfume::create($validated);

        return response()->json([
            'message' => 'Parfum ajouté avec succès',
            'perfume' => $perfume
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Perfume $perfume)
    {
        // Increment views for popularity tracking
        $perfume->increment('views');

        // Load similar products (same category, different ID)
        $similar = Perfume::where('category_id', $perfume->category_id)
            ->where('id', '!=', $perfume->id)
            ->limit(4)
            ->get();

        return response()->json([
            'perfume' => $perfume->load('category'),
            'similar' => $similar
        ], 200);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Perfume $perfume)
    {
        $validated = $request->validate([
            'category_id' => 'nullable|exists:categories,id',
            'name' => 'sometimes|required|string|max:255',
            'description' => 'sometimes|required|string',
            'notes' => 'sometimes|required|string',
            'price' => 'sometimes|required|numeric',
            'image_url' => 'nullable|string',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'gallery_images.*' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'gallery_urls' => 'nullable|array',
            'gallery_urls.*' => 'url',
            'stock' => 'nullable|integer',
            'is_active' => 'nullable|boolean',
        ]);

        $gallery = $request->get('gallery_urls', $perfume->gallery ?? []);

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('perfumes', 'public');
            $validated['image_url'] = self::STORAGE_PATH . $path;
        }

        if ($request->hasFile('gallery_images')) {
            foreach ($request->file('gallery_images') as $file) {
                $path = $file->store('perfumes/gallery', 'public');
                $gallery[] = self::STORAGE_PATH . $path;
            }
        }

        $validated['gallery'] = $gallery;

        $perfume->update($validated);

        return response()->json([
            'message' => 'Parfum mis à jour avec succès',
            'perfume' => $perfume
        ], 200);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Perfume $perfume)
    {
        $perfume->delete();

        return response()->json([
            'message' => 'Parfum supprimé avec succès'
        ], 200);
    }
}
