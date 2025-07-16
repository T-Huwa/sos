<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Distribution extends Model
{
    use HasFactory;

    protected $fillable = ['inventory_id', 'quantity_distributed', 'distributed_to', 'distribution_date'];

    public function inventory()
    {
        return $this->belongsTo(Inventory::class);
    }
}
