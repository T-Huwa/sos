<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class InventoryAdjustment extends Model
{
    use HasFactory;

    protected $fillable = [
        'item_name',
        'adjustment_type',
        'quantity_change',
        'quantity_before',
        'quantity_after',
        'reason',
        'notes',
        'category',
        'location',
        'adjusted_by',
        'source_donation_id'
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the user who made the adjustment
     */
    public function adjustedBy()
    {
        return $this->belongsTo(User::class, 'adjusted_by');
    }

    /**
     * Get the source donation if this adjustment came from a donation
     */
    public function sourceDonation()
    {
        return $this->belongsTo(Donation::class, 'source_donation_id');
    }

    /**
     * Scope for filtering by adjustment type
     */
    public function scopeOfType($query, $type)
    {
        return $query->where('adjustment_type', $type);
    }

    /**
     * Scope for filtering by item name
     */
    public function scopeForItem($query, $itemName)
    {
        return $query->where('item_name', $itemName);
    }
}
