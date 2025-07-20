<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Donation extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id', 'checkout_ref', 'child_id', 'campaign_id', 'donation_type', 'amount', 'description', 'status', 'receipt_path',
        'is_anonymous', 'anonymous_name', 'anonymous_email', 'guest_name', 'guest_email'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }


    public function donor()
    {
        return $this->belongsTo(User::class);
    }

    public function child()
    {
        return $this->belongsTo(Child::class);
    }

    public function items()
    {
        return $this->hasMany(DonatedItem::class);
    }

    public function receipt()
    {
        return $this->hasOne(Receipt::class);
    }

    public function thankYouLetter()
    {
        return $this->hasOne(ThankYouLetter::class);
    }

    public function campaign()
    {
        return $this->belongsTo(DonationCampaign::class, 'campaign_id');
    }
}
