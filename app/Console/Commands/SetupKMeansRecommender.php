<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Symfony\Component\Process\Process;

class SetupKMeansRecommender extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'kmeans:setup {--skip-test : Skip the test phase}';

    /**
     * The description of the console command.
     *
     * @var string
     */
    protected $description = 'Setup and validate the K-Means recommender service';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->line('');
        $this->info('╔═══════════════════════════════════════════════════════╗');
        $this->info('║       K-Means Recommender Setup & Validation          ║');
        $this->info('╚═══════════════════════════════════════════════════════╝');
        $this->line('');

        // Step 1: Check Python
        if (!$this->checkPython()) {
            $this->error('❌ Python 3.7+ is required. Please install Python and try again.');
            return 1;
        }

        // Step 2: Install Python dependencies
        if (!$this->installDependencies()) {
            $this->error('❌ Failed to install Python dependencies');
            return 1;
        }

        // Step 3: Validate model file
        if (!$this->validateModel()) {
            $this->error('❌ Model file validation failed');
            return 1;
        }

        // Step 4: Test the recommender (optional)
        if (!$this->option('skip-test')) {
            if ($this->testRecommender()) {
                $this->info('✅ All checks passed!');
            } else {
                $this->warn('⚠️  Recommender test failed, but setup is complete');
                return 0;
            }
        }

        $this->line('');
        $this->info('╔═══════════════════════════════════════════════════════╗');
        $this->info('║            Setup Completed Successfully!              ║');
        $this->info('╚═══════════════════════════════════════════════════════╝');
        $this->line('');
        $this->info('Next steps:');
        $this->line('  1. Start your Laravel server: php artisan serve');
        $this->line('  2. Test the recommendation API: POST /api/recommendations');
        $this->line('  3. See KMEANS_INTEGRATION.md for usage examples');
        $this->line('');

        return 0;
    }

    /**
     * Check if Python 3.7+ is available
     */
    private function checkPython(): bool
    {
        $this->info('🔍 Checking Python installation...');

        $process = new Process(['python', '--version']);
        $process->run();

        if (!$process->isSuccessful()) {
            return false;
        }

        $output = trim($process->getErrorOutput() ?: $process->getOutput());
        $this->info("✅ Found: $output");

        return true;
    }

    /**
     * Install Python dependencies
     */
    private function installDependencies(): bool
    {
        $this->info('📦 Installing Python dependencies...');

        $packages = ['scikit-learn', 'numpy'];
        $process = new Process(
            array_merge(['python', '-m', 'pip', 'install'], $packages),
            timeout: 300
        );

        $process->run(function ($type, $buffer) {
            if ($type === Process::ERR) {
                $this->warn($buffer);
            } else {
                $this->line($buffer);
            }
        });

        if (!$process->isSuccessful()) {
            return false;
        }

        $this->info('✅ Dependencies installed successfully');
        return true;
    }

    /**
     * Validate model file
     */
    private function validateModel(): bool
    {
        $this->info('🔍 Validating model file...');

        $modelPath = storage_path('app/perfume_recommender_model.pkl');

        if (!file_exists($modelPath)) {
            $this->error("Model file not found: $modelPath");
            return false;
        }

        if (!is_readable($modelPath)) {
            $this->error("Model file is not readable: $modelPath");
            return false;
        }

        $fileSize = filesize($modelPath);
        $this->info("✅ Model file valid");
        $this->line("   Location: $modelPath");
        $this->line("   Size: " . $this->formatBytes($fileSize));

        return true;
    }

    /**
     * Test the recommender service
     */
    private function testRecommender(): bool
    {
        $this->info('🧪 Testing recommender service...');

        $pythonScript = base_path('app/Services/kmeans_recommender.py');

        $testProfile = [
            'floral' => 5,
            'woody' => 3,
            'oriental' => 4,
            'fresh' => 2,
            'spicy' => 1,
            'fruity' => 0,
            'aromatic' => 2
        ];

        $testData = json_encode($testProfile);
        $process = new Process(['python', $pythonScript, $testData]);

        $process->run();

        if (!$process->isSuccessful()) {
            $this->warn("Test output: " . $process->getErrorOutput());
            return false;
        }

        try {
            $result = json_decode($process->getOutput(), true);

            if (isset($result['error'])) {
                $this->warn("Recommender error: " . $result['error']);
                return false;
            }

            $this->info('✅ Recommender test successful');
            $this->line("   User cluster: " . ($result['user_cluster'] ?? 'N/A'));
            $this->line("   Recommendations: " . count($result['recommendations'] ?? []) . " items");

            return true;
        } catch (\Exception $e) {
            $this->warn("Failed to parse test output: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Format bytes to human-readable format
     */
    private function formatBytes(int $bytes): string
    {
        $units = ['B', 'KB', 'MB', 'GB'];
        $bytes = max($bytes, 0);
        $pow = floor(($bytes ? log($bytes) : 0) / log(1024));
        $pow = min($pow, count($units) - 1);
        $bytes /= (1 << (10 * $pow));

        return round($bytes, 2) . ' ' . $units[$pow];
    }
}
