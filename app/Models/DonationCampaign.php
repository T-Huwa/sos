<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class DonationCampaign extends Model
{
    use HasFactory;

    protected $fillable = [
        'message',
        'target_amount',
        'is_completed',
        'created_by'
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function images()
    {
        return $this->hasMany(CampaignImage::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function donations()
    {
        return $this->hasMany(Donation::class, 'campaign_id');
    }

    /**
     * Get the total amount raised for this campaign
     */
    public function getTotalRaisedAttribute()
    {
        return $this->donations()
            ->where('donation_type', 'money')
            ->where('status', 'received')
            ->sum('amount');
    }

    /**
     * Get the progress percentage
     */
    public function getProgressPercentageAttribute()
    {
        if (!$this->target_amount || $this->target_amount <= 0) {
            return 0;
        }

        return min(100, ($this->total_raised / $this->target_amount) * 100);
    }

    /**
     * Get the remaining amount needed
     */
    public function getRemainingAmountAttribute()
    {
        if (!$this->target_amount) {
            return 0;
        }

        return max(0, $this->target_amount - $this->total_raised);
    }

    /**
     * Check if the campaign goal is reached
     */
    public function getIsGoalReachedAttribute()
    {
        return $this->target_amount && $this->total_raised >= $this->target_amount;
    }
}
