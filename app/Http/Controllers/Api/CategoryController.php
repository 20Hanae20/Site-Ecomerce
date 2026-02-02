<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class CategoryController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        // Admin can see all, clients only active ones
        if ($request->has('admin') && $request->user()?->isAdmin()) {
            return response()->json(Category::all(), 200);
        }

        return response()->json(Category::where('is_active', true)->get(), 200);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:categories,name',
            'description' => 'nullable|string',
            'parent_id' => 'nullable|exists:categories,id',
            'is_active' => 'nullable|boolean',
        ]);

        $validated['slug'] = Str::slug($validated['name']);
        
        $category = Category::create($validated);

        return response()->json([
            'message' => 'Catégorie créée avec succès',
            'category' => $category
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Category $category)
    {
        return response()->json($category);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Category $category)
    {
        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255|unique:categories,name,' . $category->id,
            'description' => 'nullable|string',
            'parent_id' => 'nullable|exists:categories,id',
            'is_active' => 'nullable|boolean',
        ]);

        if (isset($validated['name'])) {
            $validated['slug'] = Str::slug($validated['name']);
        }

        $category->update($validated);

        return response()->json([
            'message' => 'Catégorie mise à jour',
            'category' => $category
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Category $category)
    {
        // Check if has perfumes
        if ($category->perfumes()->count() > 0) {
            return response()->json([
                'message' => 'Impossible de supprimer une catégorie liée à des produits.'
            ], 400);
        }

        $category->delete();
        return response()->json(['message' => 'Catégorie supprimée']);
    }

    /**
     * Toggle activation status.
     */
    public function toggleActive(Category $category)
    {
        $category->is_active = !$category->is_active;
        $category->save();

        return response()->json([
            'message' => $category->is_active ? 'Catégorie activée' : 'Catégorie désactivée',
            'is_active' => $category->is_active
        ]);
    }
}
