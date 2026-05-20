<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;
use App\Models\Tenant;

class ManageTenantLogos extends Command
{
    protected $signature = 'tenant:logos {action : list|delete|clear} {--tenant= : Tenant ID (required for delete)}';
    protected $description = 'Manage tenant logos in storage';

    public function handle()
    {
        $action = $this->argument('action');

        return match ($action) {
            'list' => $this->listLogos(),
            'delete' => $this->deleteLogo(),
            'clear' => $this->clearAll(),
            default => $this->error('Unknown action: '.$action) && 1,
        };
    }

    private function listLogos()
    {
        $dirs = Storage::directories('public/tenants');
        if (empty($dirs)) {
            $this->info('No tenant logos found.');
            return 0;
        }

        foreach ($dirs as $dir) {
            $tenantId = basename($dir);
            $files = Storage::files($dir);
            $this->line("Tenant {$tenantId}:");
            foreach ($files as $f) {
                $this->line("  - {$f}");
            }
        }

        return 0;
    }

    private function deleteLogo()
    {
        $id = $this->option('tenant');
        if (! $id) {
            $this->error('Please provide --tenant=ID');
            return 1;
        }

        $path = 'public/tenants/'.$id;
        if (! Storage::exists($path)) {
            $this->error('No files found for tenant '.$id);
            return 1;
        }

        $files = Storage::files($path);
        foreach ($files as $f) {
            Storage::delete($f);
            $this->line('Deleted: '.$f);
        }

        $this->info('Tenant logo files deleted for tenant '.$id);
        return 0;
    }

    private function clearAll()
    {
        $dirs = Storage::directories('public/tenants');
        foreach ($dirs as $dir) {
            $files = Storage::files($dir);
            foreach ($files as $f) {
                Storage::delete($f);
                $this->line('Deleted: '.$f);
            }
        }
        $this->info('All tenant logos deleted.');
        return 0;
    }
}
