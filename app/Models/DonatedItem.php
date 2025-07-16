<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class DonatedItem extends Model
{
    use HasFactory;

    protected $fillable = ['donation_id', 'item_name', 'quantity', 'estimated_value'];

    public function donation()
    {
        return $this->belongsTo(Donation::class);
    }
}
