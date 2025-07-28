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
        Schema::create('inventory_adjustments', function (Blueprint $table) {
            $table->id();
            $table->string('item_name');
            $table->enum('adjustment_type', ['increase', 'decrease', 'new_item']);
            $table->integer('quantity_change'); // Positive for increase, negative for decrease
            $table->integer('quantity_before'); // Quantity before adjustment
            $table->integer('quantity_after'); // Quantity after adjustment
            $table->string('reason'); // Reason for adjustment
            $table->text('notes')->nullable(); // Additional notes
            $table->string('category')->nullable();
            $table->string('location')->nullable();
            $table->foreignId('adjusted_by')->constrained('users')->onDelete('cascade'); // User who made the adjustment
            $table->foreignId('source_donation_id')->nullable()->constrained('donations')->onDelete('set null'); // If from donation
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('inventory_adjustments');
    }
};
