<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Support\Facades\Auth;

class Inventory extends Model
{
    use HasFactory;

    protected $fillable = ['item_name', 'quantity', 'category', 'source_donation_id', 'location', 'threshold'];

    public function donation()
    {
        return $this->belongsTo(Donation::class, 'source_donation_id');
    }

    public function distributions()
    {
        return $this->hasMany(Distribution::class);
    }

    /**
     * Get all adjustments for this inventory item
     */
    public function adjustments()
    {
        return InventoryAdjustment::where('item_name', $this->item_name)
            ->where('category', $this->category)
            ->where('location', $this->location)
            ->orderBy('created_at', 'desc');
    }

    /**
     * Adjust inventory quantity with tracking
     */
    public function adjustQuantity($quantityChange, $reason, $notes = null, $adjustmentType = null, $sourceDonationId = null)
    {
        $oldQuantity = $this->quantity;
        $newQuantity = $oldQuantity + $quantityChange;

        // Determine adjustment type if not provided
        if (!$adjustmentType) {
            $adjustmentType = $quantityChange > 0 ? 'increase' : 'decrease';
        }

        // Create adjustment record
        InventoryAdjustment::create([
            'item_name' => $this->item_name,
            'adjustment_type' => $adjustmentType,
            'quantity_change' => $quantityChange,
            'quantity_before' => $oldQuantity,
            'quantity_after' => $newQuantity,
            'reason' => $reason,
            'notes' => $notes,
            'category' => $this->category,
            'location' => $this->location,
            'adjusted_by' => Auth::id(),
            'source_donation_id' => $sourceDonationId,
        ]);

        // Update inventory quantity
        $this->update(['quantity' => $newQuantity]);

        return $this;
    }

    /**
     * Get status based on threshold
     */
    public function getStatusAttribute()
    {
        if ($this->quantity <= 5) {
            return 'Critical';
        } elseif ($this->quantity <= ($this->threshold ?? 20)) {
            return 'Low';
        }
        return 'Good';
    }
}
