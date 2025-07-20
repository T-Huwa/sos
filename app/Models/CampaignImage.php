<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class CampaignImage extends Model
{
    use HasFactory;

    protected $fillable = [
        'donation_campaign_id',
        'image_path',
        'original_name'
    ];

    public function campaign()
    {
        return $this->belongsTo(DonationCampaign::class, 'donation_campaign_id');
    }

    public function getImageUrlAttribute()
    {
        return asset('storage/' . $this->image_path);
    }
}
