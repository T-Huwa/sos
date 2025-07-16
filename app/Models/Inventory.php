<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Inventory extends Model
{
    use HasFactory;

    protected $fillable = ['item_name', 'quantity', 'category', 'source_donation_id', 'location'];

    public function donation()
    {
        return $this->belongsTo(Donation::class, 'source_donation_id');
    }

    public function distributions()
    {
        return $this->hasMany(Distribution::class);
    }
}
