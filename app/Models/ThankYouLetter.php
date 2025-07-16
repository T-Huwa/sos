<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class ThankYouLetter extends Model
{
    use HasFactory;

    protected $fillable = ['donation_id', 'file_path', 'sent_at'];

    public function donation()
    {
        return $this->belongsTo(Donation::class);
    }
}
