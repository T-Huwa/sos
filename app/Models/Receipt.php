<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Receipt extends Model
{
    use HasFactory;

    protected $fillable = ['donation_id', 'receipt_number', 'file_path', 'issued_at'];

    public function donation()
    {
        return $this->belongsTo(Donation::class);
    }
}
