<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\HasMany;
use Stancl\Tenancy\Database\Models\Tenant as BaseTenant;
use Stancl\Tenancy\Database\Models\Domain;

// Define Tenant class with Cashier Billable trait when available.
if (trait_exists('\\Laravel\\Cashier\\Billable')) {
    class Tenant extends BaseTenant
    {
        protected $guarded = [];
        use \Laravel\Cashier\Billable;

        protected $casts = [
            'data' => 'array',
        ];

        public function domains(): HasMany
        {
            return $this->hasMany(Domain::class);
        }

        public function getAttribute($key)
        {
            if ($key === 'domains') {
                return $this->getRelationValue($key);
            }
            return parent::getAttribute($key);
        }

        public function getDataAttribute()
        {
            if (isset($this->dataEncoded) && $this->dataEncoded) {
                $raw = $this->attributes['data'] ?? [];
                if (is_string($raw)) {
                    $decoded = json_decode($raw, true);
                    return is_array($decoded) ? $decoded : [];
                }
                return is_array($raw) ? $raw : [];
            }

            $customColumns = ['id'];
            $data = [];
            foreach ($this->attributes as $key => $value) {
                if (! in_array($key, $customColumns) && $key !== 'data') {
                    $data[$key] = $value;
                }
            }
            return $data;
        }

        public function setDataAttribute($value)
        {
            $trace = debug_backtrace(DEBUG_BACKTRACE_IGNORE_ARGS, 5);
            $isEncoding = false;
            foreach ($trace as $step) {
                if (isset($step['function']) && $step['function'] === 'encodeAttributes') {
                    $isEncoding = true;
                    break;
                }
            }

            if ($isEncoding) {
                $this->attributes['data'] = $this->asJson($value);
            } else {
                if (is_array($value)) {
                    foreach ($value as $k => $v) {
                        $this->setAttribute($k, $v);
                    }
                }
            }
        }
    }
} else {
    class Tenant extends BaseTenant
    {
        protected $guarded = [];

        protected $casts = [
            'data' => 'array',
            'trial_ends_at' => 'datetime',
        ];

        public function domains(): HasMany
        {
            return $this->hasMany(Domain::class);
        }

        public function getAttribute($key)
        {
            if ($key === 'domains') {
                return $this->getRelationValue($key);
            }
            return parent::getAttribute($key);
        }

        public function getDataAttribute()
        {
            if (isset($this->dataEncoded) && $this->dataEncoded) {
                $raw = $this->attributes['data'] ?? [];
                if (is_string($raw)) {
                    $decoded = json_decode($raw, true);
                    return is_array($decoded) ? $decoded : [];
                }
                return is_array($raw) ? $raw : [];
            }

            $customColumns = ['id'];
            $data = [];
            foreach ($this->attributes as $key => $value) {
                if (! in_array($key, $customColumns) && $key !== 'data') {
                    $data[$key] = $value;
                }
            }
            return $data;
        }

        public function setDataAttribute($value)
        {
            $trace = debug_backtrace(DEBUG_BACKTRACE_IGNORE_ARGS, 5);
            $isEncoding = false;
            foreach ($trace as $step) {
                if (isset($step['function']) && $step['function'] === 'encodeAttributes') {
                    $isEncoding = true;
                    break;
                }
            }

            if ($isEncoding) {
                $this->attributes['data'] = $this->asJson($value);
            } else {
                if (is_array($value)) {
                    foreach ($value as $k => $v) {
                        $this->setAttribute($k, $v);
                    }
                }
            }
        }
    }
}
