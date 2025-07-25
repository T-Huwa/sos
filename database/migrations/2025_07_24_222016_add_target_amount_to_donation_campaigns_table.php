<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('donation_campaigns', function (Blueprint $table) {
            $table->decimal('target_amount', 15, 2)->nullable()->after('message');
            $table->boolean('is_completed')->default(false)->after('target_amount');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('donation_campaigns', function (Blueprint $table) {
            $table->dropColumn(['target_amount', 'is_completed']);
        });
    }
};
