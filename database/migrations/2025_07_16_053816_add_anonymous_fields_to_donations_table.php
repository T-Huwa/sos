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
        Schema::table('donations', function (Blueprint $table) {
            // Make user_id nullable for anonymous donations
            $table->foreignId('user_id')->nullable()->change();

            // Add anonymous donation fields
            $table->boolean('is_anonymous')->default(false);
            $table->string('anonymous_name')->nullable();
            $table->string('anonymous_email')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('donations', function (Blueprint $table) {
            $table->dropColumn(['is_anonymous', 'anonymous_name', 'anonymous_email']);
            $table->foreignId('user_id')->nullable(false)->change();
        });
    }
};
