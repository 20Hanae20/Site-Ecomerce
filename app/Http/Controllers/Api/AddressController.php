<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Address;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class AddressController extends Controller
{
    public function index(Request $request)
    {
        return response()->json($request->user()->addresses, 200);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'city' => 'required|string|max:255',
            'neighborhood' => 'required|string|max:255',
            'full_address' => 'required|string',
            'zip_code' => 'required|string|max:10',
            'country' => 'nullable|string|max:255',
            'is_default' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = $request->user();

        // If this is set as default, unset others
        if ($request->is_default) {
            Address::where('user_id', $user->id)->update(['is_default' => false]);
        }

        $address = $user->addresses()->create($request->all());

        return response()->json([
            'message' => 'Adresse ajoutée avec succès',
            'address' => $address
        ], 201);
    }

    public function update(Request $request, Address $address)
    {
        // Check ownership
        if ($address->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $validator = Validator::make($request->all(), [
            'city' => 'sometimes|required|string|max:255',
            'neighborhood' => 'sometimes|required|string|max:255',
            'full_address' => 'sometimes|required|string',
            'zip_code' => 'sometimes|required|string|max:10',
            'country' => 'sometimes|required|string|max:255',
            'is_default' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        if ($request->is_default) {
            Address::where('user_id', $request->user()->id)->update(['is_default' => false]);
        }

        $address->update($request->all());

        return response()->json([
            'message' => 'Adresse mise à jour avec succès',
            'address' => $address
        ], 200);
    }

    public function destroy(Request $request, Address $address)
    {
        // Check ownership
        if ($address->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        // Prevent deletion of default address if orders are pending (optional logic)
        // For now, just delete
        $address->delete();

        return response()->json([
            'message' => 'Adresse supprimée avec succès'
        ], 200);
    }
}
