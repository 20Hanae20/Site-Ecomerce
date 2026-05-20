<?php

namespace App\Tenancy;

use Illuminate\Support\Facades\DB;
use Stancl\Tenancy\Contracts\UniqueIdentifierGenerator;

class IncrementalTenantIdGenerator implements UniqueIdentifierGenerator
{
    public static function generate($resource): string
    {
        $max = DB::table('tenants')->max('id');

        if ($max === null) {
            return '1';
        }

        return (string) ((int) $max + 1);
    }
}
