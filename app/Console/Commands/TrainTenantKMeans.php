<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\Process\Process;
use App\Models\Perfume;
use App\Models\Tenant;

class TrainTenantKMeans extends Command
{
    protected $signature = 'kmeans:train {tenant_id?} {--all : Train for all tenants}';

    protected $description = 'Train K-Means model for a tenant (stores model in storage/app/tenants/{id})';

    public function handle()
    {
        $tenantId = $this->argument('tenant_id');
        $trainAll = $this->option('all');

        $tenants = [];
        if ($trainAll) {
            $tenants = Tenant::all()->pluck('id')->toArray();
        } elseif ($tenantId) {
            $tenants = [(int) $tenantId];
        } else {
            $this->error('Provide a tenant_id or use --all');
            return 1;
        }

        foreach ($tenants as $tid) {
            $this->info("Training model for tenant: $tid");

            $perfumes = Perfume::where('tenant_id', $tid)->where('is_active', true)->get()->map(function($p) {
                return [
                    'id' => $p->id,
                    'name' => $p->name,
                    'features' => $p->getAttribute('features') ?? [0,0,0,0,0,0,0],
                ];
            })->toArray();

            if (empty($perfumes)) {
                $this->warn("No perfumes found for tenant $tid, skipping.");
                continue;
            }

            $tenantDir = storage_path('app/tenants/' . $tid);
            if (!is_dir($tenantDir)) {
                mkdir($tenantDir, 0755, true);
            }

            $perfumesPath = $tenantDir . '/perfumes.json';
            file_put_contents($perfumesPath, json_encode($perfumes));

            $python = 'python';
            $script = base_path('app/Services/train_kmeans.py');

            $process = new Process([$python, $script, '--tenant-id', (string)$tid, '--perfumes-json', $perfumesPath]);
            $process->setTimeout(300);
            $process->run(function ($type, $buffer) {
                echo $buffer;
            });

            if (!$process->isSuccessful()) {
                $this->error("Training failed for tenant $tid");
            } else {
                $this->info("Training completed for tenant $tid. Model stored in: $tenantDir/model.pkl");
            }
        }

        return 0;
    }
}
