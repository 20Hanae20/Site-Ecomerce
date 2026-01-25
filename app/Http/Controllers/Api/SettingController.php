<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use App\Models\Setting;

class SettingController extends Controller
{
    protected const UNAUTHORIZED_MSG = 'Non autorisé';

    /**
     * Get all settings grouped by group.
     */
    public function index(Request $request)
    {
        if (!$request->user()?->isAdmin()) {
            return response()->json(['message' => self::UNAUTHORIZED_MSG], 403);
        }

        return response()->json(Setting::all()->groupBy('group'));
    }

    /**
     * Bulk update settings.
     */
    public function update(Request $request)
    {
        if (!$request->user()?->isAdmin()) {
            return response()->json(['message' => self::UNAUTHORIZED_MSG], 403);
        }

        $validated = $request->validate([
            'settings' => 'required|array',
            'settings.*.key' => 'required|string|exists:settings,key',
            'settings.*.value' => 'nullable|string'
        ]);

        foreach ($validated['settings'] as $item) {
            Setting::where('key', $item['key'])->update(['value' => $item['value']]);
        }

        return response()->json(['message' => 'Paramètres mis à jour']);
    }

    /**
     * Get public settings (Site name, etc).
     */
    public function publicSettings()
    {
        $keys = ['site_name', 'contact_email', 'currency', 'shipping_fee', 'maintenance_mode'];
        return response()->json(Setting::whereIn('key', $keys)->pluck('value', 'key'));
    }
}
